#!/usr/bin/env python3
"""Small, dependency-free task hygiene helper for coding agents.

Design goals:
- Treat task-local resources as owned by a run.
- Cleanup only resources that this tool created or can positively verify.
- Keep temporary/run state under .agent/, which should be gitignored.
- Never run broad destructive repository cleaners.

This is intentionally conservative. If ownership cannot be verified, cleanup is skipped and
reported for manual review.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import platform
import re
import shlex
import shutil
import signal
import subprocess
import sys
import time
import uuid
from typing import Any

VERSION = 1
STATE_DIR = ".agent"
RUNS_DIR = "runs"
TMP_DIR = "tmp"
REPORTS_DIR = "reports"
CURRENT_FILE = "current"


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def parse_iso(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def run_cmd(args: list[str], cwd: Path | None = None, check: bool = False) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=str(cwd) if cwd else None,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=check,
    )


def project_root(start: Path | None = None) -> Path:
    start = (start or Path.cwd()).resolve()
    result = run_cmd(["git", "rev-parse", "--show-toplevel"], cwd=start)
    if result.returncode == 0 and result.stdout.strip():
        return Path(result.stdout.strip()).resolve()
    return start


def state_root(root: Path) -> Path:
    return root / STATE_DIR


def ensure_state(root: Path) -> None:
    base = state_root(root)
    for name in (RUNS_DIR, TMP_DIR, REPORTS_DIR):
        (base / name).mkdir(parents=True, exist_ok=True)


def current_run_id(root: Path) -> str | None:
    p = state_root(root) / CURRENT_FILE
    if not p.exists():
        return None
    value = p.read_text(encoding="utf-8").strip()
    return value or None


def run_dir(root: Path, run_id: str) -> Path:
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", run_id):
        raise SystemExit("invalid run id")
    return state_root(root) / RUNS_DIR / run_id


def manifest_path(root: Path, run_id: str) -> Path:
    return run_dir(root, run_id) / "manifest.json"


def load_manifest(root: Path, run_id: str) -> dict[str, Any]:
    p = manifest_path(root, run_id)
    if not p.exists():
        raise SystemExit(f"run manifest not found: {p}")
    manifest = json.loads(p.read_text(encoding="utf-8"))
    if manifest.get("run_id") != run_id:
        raise SystemExit("run manifest identity mismatch")
    return manifest


def save_manifest(root: Path, manifest: dict[str, Any]) -> None:
    manifest["updated_at"] = now_iso()
    p = manifest_path(root, manifest["run_id"])
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(tmp, p)


def append_event(manifest: dict[str, Any], kind: str, message: str, **extra: Any) -> None:
    event: dict[str, Any] = {"at": now_iso(), "kind": kind, "message": message}
    if extra:
        event.update(extra)
    manifest.setdefault("events", []).append(event)


def resolve_run(root: Path, explicit: str | None) -> tuple[str, dict[str, Any]]:
    rid = explicit or current_run_id(root)
    if not rid:
        raise SystemExit("no active run; start one with: agent_hygiene.py start --task '...' ")
    return rid, load_manifest(root, rid)


def require_active(manifest: dict[str, Any]) -> None:
    if manifest.get("status") != "active":
        raise SystemExit("run is not active; start a new run")


def rel_or_abs(root: Path, path: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(path.resolve())


def safe_name(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip()).strip("-.")
    return value[:80] or "item"


def cmd_signature(pid: int) -> str | None:
    proc = Path(f"/proc/{pid}/cmdline")
    if proc.exists():
        try:
            raw = proc.read_bytes().replace(b"\x00", b" ").decode("utf-8", "replace").strip()
            return raw or None
        except OSError:
            pass
    if os.name != "nt":
        result = run_cmd(["ps", "-p", str(pid), "-o", "command="])
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    return None


def process_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if os.name == "nt":
        # os.kill(pid, 0) is not a non-destructive probe on Windows.
        import ctypes
        from ctypes import wintypes
        kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        kernel.OpenProcess.restype = wintypes.HANDLE
        kernel.GetExitCodeProcess.argtypes = [wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD)]
        kernel.GetExitCodeProcess.restype = wintypes.BOOL
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel.CloseHandle.restype = wintypes.BOOL
        handle = kernel.OpenProcess(0x1000, False, pid)  # query only
        if not handle:
            return ctypes.get_last_error() != 87  # unknown/access denied stays reviewable
        try:
            code = wintypes.DWORD()
            return not kernel.GetExitCodeProcess(handle, ctypes.byref(code)) or code.value == 259
        finally:
            kernel.CloseHandle(handle)
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False


def process_matches(resource: dict[str, Any]) -> tuple[bool, str]:
    pid = int(resource["pid"])
    if not process_alive(pid):
        return False, "process already exited"
    if os.name == "nt":
        return False, "Windows process ownership cannot be verified; manual review required"
    expected = resource.get("cmd_signature")
    current = cmd_signature(pid)
    if not expected or not current or expected != current:
        return False, "could not verify exact PID command"
    expected_birth = resource.get("process_birth")
    if not expected_birth or expected_birth != process_birth(pid):
        return False, "could not verify PID creation identity"
    return True, "verified command and creation identity"


def process_birth(pid: int) -> str | None:
    """Linux creation identity protects against PID reuse; fail closed elsewhere."""
    try:
        stat = Path(f"/proc/{pid}/stat").read_text()
        boot = Path("/proc/sys/kernel/random/boot_id").read_text().strip()
        return boot + ":" + stat.rsplit(")", 1)[1].split()[19]
    except (OSError, IndexError):
        return None


def cleanup_process(resource: dict[str, Any]) -> tuple[str, str]:
    if resource.get("created_by") != "agent_hygiene.spawn":
        return "skipped", "process was not launched by agent_hygiene.spawn"
    ok, detail = process_matches(resource)
    if not ok:
        if detail == "process already exited":
            return "clean", detail
        return "review", detail
    pid = int(resource["pid"])
    try:
        if os.name != "nt" and resource.get("pgid"):
            os.killpg(int(resource["pgid"]), signal.SIGTERM)
        else:
            os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        return "clean", "process exited before termination"
    except Exception as exc:  # conservative: report instead of escalating blindly
        return "review", f"SIGTERM failed: {exc}"

    deadline = time.time() + 4.0
    while time.time() < deadline:
        if not process_alive(pid):
            return "clean", "terminated"
        time.sleep(0.1)

    # Escalate only after re-verifying ownership.
    ok, detail2 = process_matches(resource)
    if not ok:
        return "review", f"still alive but ownership re-check failed: {detail2}"
    try:
        if os.name != "nt" and resource.get("pgid"):
            os.killpg(int(resource["pgid"]), signal.SIGKILL)
        else:
            os.kill(pid, signal.SIGKILL)
        return "clean", "terminated with SIGKILL after grace period"
    except Exception as exc:
        return "review", f"SIGKILL failed: {exc}"


def cleanup_temp_path(root: Path, run_id: str, resource: dict[str, Any]) -> tuple[str, str]:
    run_dir(root, run_id)  # validate before computing cleanup boundaries
    p = Path(resource["path"])
    if not p.is_absolute():
        p = root / p
    p = p.resolve()
    lexical = root / STATE_DIR / TMP_DIR / run_id
    allowed = lexical.resolve()
    if allowed != root.resolve() / STATE_DIR / TMP_DIR / run_id:
        return "review", "run temp root redirects outside its expected location"
    if resource.get("run_id") != run_id or resource.get("created_by") not in {
        "agent_hygiene.start", "agent_hygiene.temp"
    }:
        return "review", "temp path ownership not verified"
    try:
        p.relative_to(allowed)
    except ValueError:
        return "review", f"refusing to delete path outside run temp root: {p}"
    if p == allowed:
        # The root temp directory is safe because the tool created it for this run.
        pass
    if not p.exists():
        return "clean", "path already absent"
    try:
        if p.is_symlink() or p.is_file():
            p.unlink()
        else:
            shutil.rmtree(p)
        return "clean", f"removed {p}"
    except Exception as exc:
        return "review", f"failed to remove {p}: {exc}"


def inspect_container(runtime: str, container_id: str) -> tuple[bool, str, str | None]:
    if shutil.which(runtime) is None:
        return False, f"{runtime} not installed", None
    result = run_cmd([runtime, "inspect", container_id, "--format", '{{ index .Config.Labels "agent.hygiene.run" }}'])
    if result.returncode != 0:
        return False, result.stderr.strip() or "container inspect failed", None
    return True, "ok", result.stdout.strip()


def cleanup_container(resource: dict[str, Any]) -> tuple[str, str]:
    runtime = resource.get("runtime", "docker")
    cid = resource["container_id"]
    ok, detail, label = inspect_container(runtime, cid)
    if not ok:
        if "No such" in detail or "not found" in detail.lower():
            return "clean", "container already absent"
        return "review", detail
    expected_run = resource.get("run_id")
    if label != expected_run:
        return "review", f"container ownership label mismatch: expected {expected_run!r}, got {label!r}"
    result = run_cmd([runtime, "rm", "-f", cid])
    if result.returncode == 0:
        return "clean", f"removed container {cid}"
    return "review", result.stderr.strip() or "container removal failed"


def cleanup_resources(root: Path, manifest: dict[str, Any]) -> list[dict[str, str]]:
    rid = manifest["run_id"]
    results: list[dict[str, str]] = []
    for resource in reversed(manifest.get("resources", [])):
        if resource.get("cleanup_status") == "clean":
            continue
        rtype = resource.get("type")
        if rtype == "process":
            status, detail = cleanup_process(resource)
        elif rtype == "temp_path":
            status, detail = cleanup_temp_path(root, rid, resource)
        elif rtype == "container":
            status, detail = cleanup_container(resource)
        else:
            status, detail = "review", f"unknown resource type {rtype!r}; no cleanup attempted"
        resource["cleanup_status"] = status
        resource["cleanup_detail"] = detail
        resource["cleanup_at"] = now_iso()
        results.append({"resource": resource.get("id", rtype or "unknown"), "status": status, "detail": detail})
    save_manifest(root, manifest)
    return results


def update_gitignore(root: Path) -> None:
    p = root / ".gitignore"
    marker = "# Agent hygiene runtime (task-local, never source of truth)"
    entry = ".agent/"
    current = p.read_text(encoding="utf-8") if p.exists() else ""
    if entry in {line.strip() for line in current.splitlines()}:
        return
    block = f"\n{marker}\n{entry}\n"
    p.write_text(current.rstrip() + block, encoding="utf-8")


def cmd_init(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    ensure_state(root)
    if args.update_gitignore:
        update_gitignore(root)
    print(root)
    print(f"initialized {state_root(root)}")


def cmd_start(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    ensure_state(root)
    existing = current_run_id(root)
    if existing:
        try:
            old = load_manifest(root, existing)
        except SystemExit:
            old = None
        if old and old.get("status") == "active" and not args.force:
            raise SystemExit(
                f"active run already exists: {existing}. End it first or use --force only after reviewing it."
            )
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    rid = f"{stamp}-{uuid.uuid4().hex[:6]}"
    rdir = run_dir(root, rid)
    rdir.mkdir(parents=True, exist_ok=False)
    temp = state_root(root) / TMP_DIR / rid
    temp.mkdir(parents=True, exist_ok=False)
    manifest: dict[str, Any] = {
        "version": VERSION,
        "run_id": rid,
        "task": args.task,
        "status": "active",
        "project_root": str(root),
        "started_at": now_iso(),
        "updated_at": now_iso(),
        "resources": [],
        "promotions": [],
        "events": [],
        "host": {"platform": platform.platform(), "python": sys.version.split()[0]},
    }
    temp_resource = {
        "id": "run-temp-root",
        "type": "temp_path",
        "path": rel_or_abs(root, temp),
        "run_id": rid,
        "created_by": "agent_hygiene.start",
        "created_at": now_iso(),
        "cleanup_status": "pending",
    }
    manifest["resources"].append(temp_resource)
    append_event(manifest, "start", args.task)
    save_manifest(root, manifest)
    (state_root(root) / CURRENT_FILE).write_text(rid + "\n", encoding="utf-8")
    summary = rdir / "SUMMARY.md"
    summary.write_text(
        f"# Run {rid}\n\nTask: {args.task}\n\n"
        "## Durable result\n\n"
        "Fill this only with the minimal handoff needed to understand what changed. "
        "Do not paste raw logs.\n",
        encoding="utf-8",
    )
    print(rid)
    print(f"temp={temp}")


def cmd_temp(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    rid, manifest = resolve_run(root, args.run)
    require_active(manifest)
    base = state_root(root) / TMP_DIR / rid
    name = safe_name(args.name or uuid.uuid4().hex[:8])
    p = base / name
    if args.file:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.touch(exist_ok=False)
    else:
        p.mkdir(parents=True, exist_ok=False)
    resource = {
        "id": f"temp-{uuid.uuid4().hex[:8]}",
        "type": "temp_path",
        "path": rel_or_abs(root, p),
        "run_id": rid,
        "created_by": "agent_hygiene.temp",
        "created_at": now_iso(),
        "cleanup_status": "pending",
    }
    manifest["resources"].append(resource)
    append_event(manifest, "resource", f"created temp {'file' if args.file else 'directory'} {p}")
    save_manifest(root, manifest)
    print(p)


def cmd_spawn(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    rid, manifest = resolve_run(root, args.run)
    require_active(manifest)
    if not args.command:
        raise SystemExit("spawn requires a command after --")
    command = args.command
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        raise SystemExit("spawn requires a command after --")
    cwd = Path(args.cwd).resolve() if args.cwd else root
    logs = run_dir(root, rid) / "logs"
    logs.mkdir(parents=True, exist_ok=True)
    name = safe_name(args.name or Path(command[0]).name)
    log_path = logs / f"{name}.log"
    log_fh = open(log_path, "ab", buffering=0)
    kwargs: dict[str, Any] = {
        "cwd": str(cwd),
        "stdout": log_fh,
        "stderr": subprocess.STDOUT,
        "stdin": subprocess.DEVNULL,
    }
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
    else:
        kwargs["start_new_session"] = True
    try:
        proc = subprocess.Popen(command, **kwargs)
    except Exception:
        log_fh.close()
        raise
    time.sleep(0.15)
    log_fh.close()
    sig = cmd_signature(proc.pid)
    pgid = None
    if os.name != "nt":
        try:
            pgid = os.getpgid(proc.pid)
        except OSError:
            pass
    resource = {
        "id": f"process-{uuid.uuid4().hex[:8]}",
        "type": "process",
        "pid": proc.pid,
        "pgid": pgid,
        "command": command,
        "cwd": str(cwd),
        "cmd_signature": sig,
        "process_birth": process_birth(proc.pid),
        "log": rel_or_abs(root, log_path),
        "run_id": rid,
        "created_by": "agent_hygiene.spawn",
        "created_at": now_iso(),
        "cleanup_status": "pending",
    }
    manifest["resources"].append(resource)
    append_event(manifest, "resource", f"spawned {shlex.join(command)}", pid=proc.pid)
    save_manifest(root, manifest)
    print(proc.pid)
    print(f"log={log_path}")


def cmd_container_run(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    rid, manifest = resolve_run(root, args.run)
    require_active(manifest)
    runtime = args.runtime
    if shutil.which(runtime) is None:
        raise SystemExit(f"{runtime} not installed")
    extra = args.container_args
    if extra and extra[0] == "--":
        extra = extra[1:]
    if not extra:
        raise SystemExit("container-run requires docker/podman run arguments after --")
    command = [runtime, "run", "-d", "--label", f"agent.hygiene.run={rid}", *extra]
    result = run_cmd(command, cwd=root)
    if result.returncode != 0:
        raise SystemExit(result.stderr.strip() or "container run failed")
    cid = result.stdout.strip().splitlines()[-1]
    resource = {
        "id": f"container-{uuid.uuid4().hex[:8]}",
        "type": "container",
        "container_id": cid,
        "runtime": runtime,
        "run_id": rid,
        "created_by": "agent_hygiene.container-run",
        "created_at": now_iso(),
        "cleanup_status": "pending",
    }
    manifest["resources"].append(resource)
    append_event(manifest, "resource", f"started {runtime} container {cid}")
    save_manifest(root, manifest)
    print(cid)


def cmd_promote(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    rid, manifest = resolve_run(root, args.run)
    p = Path(args.path)
    if not p.is_absolute():
        p = root / p
    p = p.resolve()
    if not p.is_relative_to(root.resolve()) or p.is_relative_to(state_root(root).resolve()) or not p.exists():
        raise SystemExit("promotion must name an existing durable project path outside .agent")
    record = {
        "path": rel_or_abs(root, p),
        "reason": args.reason,
        "at": now_iso(),
    }
    manifest.setdefault("promotions", []).append(record)
    append_event(manifest, "promote", f"promoted {record['path']}: {args.reason}")
    save_manifest(root, manifest)
    print(record["path"])


def cmd_note(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    _, manifest = resolve_run(root, args.run)
    append_event(manifest, "note", args.message)
    save_manifest(root, manifest)


def clear_current_if(root: Path, rid: str) -> None:
    p = state_root(root) / CURRENT_FILE
    if p.exists() and p.read_text(encoding="utf-8").strip() == rid:
        p.unlink()


def cmd_end(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    rid, manifest = resolve_run(root, args.run)
    if manifest.get("status") != "active":
        print(f"run {rid} already {manifest.get('status')}")
        clear_current_if(root, rid)
        return
    if args.summary:
        summary_path = run_dir(root, rid) / "SUMMARY.md"
        summary_path.write_text(
            f"# Run {rid}\n\nTask: {manifest.get('task','')}\n\n## Durable result\n\n{args.summary.strip()}\n",
            encoding="utf-8",
        )
    results = cleanup_resources(root, manifest)
    manifest["status"] = "ended"
    manifest["ended_at"] = now_iso()
    append_event(manifest, "end", "run ended")
    save_manifest(root, manifest)
    clear_current_if(root, rid)
    for item in results:
        print(f"{item['status']:>7}  {item['resource']}: {item['detail']}")
    review = [r for r in results if r["status"] == "review"]
    if review:
        print(f"WARNING: {len(review)} resource(s) need manual review", file=sys.stderr)


def iter_manifests(root: Path):
    ensure_state(root)
    for p in sorted((state_root(root) / RUNS_DIR).glob("*/manifest.json")):
        try:
            yield p, load_manifest(root, p.parent.name)
        except (Exception, SystemExit) as exc:
            yield p, {"status": "corrupt", "error": str(exc), "run_id": p.parent.name}


def cmd_reap(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=args.older_than_hours)
    candidates: list[tuple[Path, dict[str, Any]]] = []
    for p, manifest in iter_manifests(root):
        if manifest.get("status") != "active":
            continue
        started = parse_iso(manifest.get("started_at", manifest.get("updated_at")))
        if started <= cutoff:
            candidates.append((p, manifest))
    if not candidates:
        print("no stale active runs")
        return
    for _, manifest in candidates:
        rid = manifest["run_id"]
        print(f"candidate {rid} started={manifest.get('started_at')} task={manifest.get('task')}")
        if not args.apply:
            continue
        results = cleanup_resources(root, manifest)
        manifest["status"] = "recovered"
        manifest["ended_at"] = now_iso()
        append_event(manifest, "reap", "stale active run recovered")
        save_manifest(root, manifest)
        clear_current_if(root, rid)
        for item in results:
            print(f"  {item['status']:>7} {item['resource']}: {item['detail']}")
    if not args.apply:
        print("dry run only; add --apply to perform verified cleanup")


def dir_size(path: Path, limit_files: int = 200000) -> int:
    total = 0
    count = 0
    try:
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d != ".git"]
            for name in files:
                count += 1
                if count > limit_files:
                    return total
                try:
                    total += (Path(root) / name).stat().st_size
                except OSError:
                    pass
    except OSError:
        pass
    return total


def fmt_size(num: int) -> str:
    value = float(num)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if value < 1024 or unit == "TB":
            return f"{value:.1f}{unit}"
        value /= 1024
    return str(num)


def discover_instruction_files(root: Path) -> list[tuple[Path, int]]:
    candidates = [
        root / "AGENTS.md",
        root / "AGENTS.override.md",
        root / ".hermes.md",
        root / "HERMES.md",
        root / "CLAUDE.md",
        root / ".cursorrules",
    ]
    cursor_dir = root / ".cursor" / "rules"
    if cursor_dir.exists():
        candidates.extend(sorted(cursor_dir.glob("*.mdc")))
    out: list[tuple[Path, int]] = []
    for p in candidates:
        if p.exists() and p.is_file():
            try:
                out.append((p, p.stat().st_size))
            except OSError:
                pass
    return out


def git_status(root: Path) -> list[str]:
    result = run_cmd(["git", "status", "--porcelain=v1", "--untracked-files=all"], cwd=root)
    if result.returncode != 0:
        return []
    return result.stdout.splitlines()


def cmd_audit(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    ensure_state(root)
    lines: list[str] = []
    lines.append(f"# Agent hygiene audit\n\nGenerated: {now_iso()}\n")
    lines.append("## Instruction surfaces\n")
    inst = discover_instruction_files(root)
    if not inst:
        lines.append("- No common root instruction files found.\n")
    else:
        for p, size in inst:
            rel = rel_or_abs(root, p)
            flag = " — review: large auto-loaded context" if size > args.instruction_warn_bytes else ""
            lines.append(f"- `{rel}` — {fmt_size(size)}{flag}\n")
        if len(inst) > 1:
            lines.append("\nMultiple instruction surfaces exist. Verify precedence and remove duplicated rules.\n")

    lines.append("\n## Working tree\n")
    status = git_status(root)
    if status:
        lines.append(f"- {len(status)} changed/untracked path(s) reported by Git.\n")
        for item in status[:80]:
            lines.append(f"  - `{item}`\n")
        if len(status) > 80:
            lines.append(f"  - ... {len(status)-80} more\n")
    else:
        lines.append("- No changes reported by Git, or this is not a Git repository.\n")

    lines.append("\n## Common generated/cache directories\n")
    generated = [
        "node_modules", "dist", "build", "coverage", ".next", ".nuxt", ".turbo",
        ".pytest_cache", ".mypy_cache", ".ruff_cache", ".tox", ".venv", "target",
        STATE_DIR,
    ]
    found = False
    for name in generated:
        p = root / name
        if p.exists() and p.is_dir():
            found = True
            lines.append(f"- `{name}/` — approximately {fmt_size(dir_size(p))}\n")
    if not found:
        lines.append("- None of the common generated directories were found at repository root.\n")

    lines.append("\n## Active task runs\n")
    active = []
    for _, manifest in iter_manifests(root):
        if manifest.get("status") == "active":
            active.append(manifest)
    if not active:
        lines.append("- None.\n")
    else:
        for m in active:
            lines.append(f"- `{m.get('run_id')}` — {m.get('started_at')} — {m.get('task')}\n")

    lines.append("\n## Interpretation\n")
    lines.append(
        "This report is intentionally non-destructive. Treat known rebuildable caches separately from "
        "source, durable documentation, and unknown untracked files. Unknown items should be classified "
        "before any deletion.\n"
    )
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    report = state_root(root) / REPORTS_DIR / f"audit-{stamp}.md"
    report.write_text("".join(lines), encoding="utf-8")
    print(report)


def cmd_status(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    ensure_state(root)
    current = current_run_id(root)
    print(f"project={root}")
    print(f"current={current or '-'}")
    for _, manifest in iter_manifests(root):
        print(
            f"{manifest.get('run_id')}  {manifest.get('status')}  "
            f"{manifest.get('started_at','-')}  {manifest.get('task','')}"
        )


def cmd_prune(args: argparse.Namespace) -> None:
    root = project_root(Path(args.root) if args.root else None)
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=args.older_than_days)
    candidates: list[Path] = []
    for p, manifest in iter_manifests(root):
        if manifest.get("status") not in {"ended", "recovered"}:
            continue
        if any(r.get("cleanup_status") != "clean" for r in manifest.get("resources", [])):
            print(f"review: retaining unresolved run {manifest.get('run_id')}")
            continue
        ended_raw = manifest.get("ended_at") or manifest.get("updated_at") or manifest.get("started_at")
        if ended_raw and parse_iso(ended_raw) <= cutoff:
            candidates.append(p.parent)
    for d in candidates:
        print(d)
        if args.apply:
            expected = root.resolve() / STATE_DIR / RUNS_DIR / d.name
            if d.resolve() != expected:
                print("review: refusing redirected run directory")
                continue
            shutil.rmtree(d, ignore_errors=False)
    if candidates and not args.apply:
        print("dry run only; add --apply to remove old run metadata")
    elif not candidates:
        print("no old ended runs to prune")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--root", help="project root (defaults to git root / cwd)")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("init", help="create .agent runtime directories")
    s.add_argument("--update-gitignore", action="store_true", help="append .agent/ to .gitignore")
    s.set_defaults(func=cmd_init)

    s = sub.add_parser("start", help="start a task-scoped run")
    s.add_argument("--task", required=True)
    s.add_argument("--force", action="store_true", help="replace current pointer even if another run is active")
    s.set_defaults(func=cmd_start)

    s = sub.add_parser("temp", help="create tracked task-local temp file/directory")
    s.add_argument("--run")
    s.add_argument("--name")
    s.add_argument("--file", action="store_true")
    s.set_defaults(func=cmd_temp)

    s = sub.add_parser("spawn", help="start a long-running process and register its disposer")
    s.add_argument("--run")
    s.add_argument("--name")
    s.add_argument("--cwd")
    s.add_argument("command", nargs=argparse.REMAINDER)
    s.set_defaults(func=cmd_spawn)

    s = sub.add_parser("container-run", help="start a labeled Docker/Podman container for this run")
    s.add_argument("--run")
    s.add_argument("--runtime", choices=["docker", "podman"], default="docker")
    s.add_argument("container_args", nargs=argparse.REMAINDER)
    s.set_defaults(func=cmd_container_run)

    s = sub.add_parser("promote", help="record that an artifact/decision was intentionally made durable")
    s.add_argument("--run")
    s.add_argument("path")
    s.add_argument("--reason", required=True)
    s.set_defaults(func=cmd_promote)

    s = sub.add_parser("note", help="add a small run event/note")
    s.add_argument("--run")
    s.add_argument("message")
    s.set_defaults(func=cmd_note)

    s = sub.add_parser("end", help="cleanup verified run-owned resources and close the run")
    s.add_argument("--run")
    s.add_argument("--summary", help="short durable-result summary; raw logs do not belong here")
    s.set_defaults(func=cmd_end)

    s = sub.add_parser("reap", help="find stale active runs; dry-run unless --apply")
    s.add_argument("--older-than-hours", type=float, default=12.0)
    s.add_argument("--apply", action="store_true")
    s.set_defaults(func=cmd_reap)

    s = sub.add_parser("audit", help="write a non-destructive clutter/context audit")
    s.add_argument("--instruction-warn-bytes", type=int, default=12000)
    s.set_defaults(func=cmd_audit)

    s = sub.add_parser("status", help="show recorded runs")
    s.set_defaults(func=cmd_status)

    s = sub.add_parser("prune", help="remove old ended run metadata; dry-run unless --apply")
    s.add_argument("--older-than-days", type=int, default=30)
    s.add_argument("--apply", action="store_true")
    s.set_defaults(func=cmd_prune)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
