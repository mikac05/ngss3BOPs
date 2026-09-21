# Future Task Operating Rules

The target is simple: after hundreds of agent tasks, the repository and runtime should reflect the **current desired project**, not the accumulated history of every prior task.

## 1. Task lifecycle

Every substantial task follows this lifecycle:

Use `python -X utf8` on Windows. Read-only questions need no run. A run is a
resource ledger, not permission, task selection or writer ownership. Use one
writer/run per checkout, including worktrees, and do not use `start --force` to
bypass another task. Read-only reviewers share the owning task's scope without
starting or closing its run. Root `AGENTS.md` owns product routing and release
restrictions.

1. **Orient** — inspect Git status and relevant instructions; do not assume a clean tree.
2. **Scope** — define the task outcome and identify only the files/services needed.
3. **Start a run** — create a task-scoped resource ledger with `tools/agent_hygiene.py start`.
4. **Work** — all task-local effects are either tracked for cleanup or deliberately promoted.
5. **Verify** — run tests/static checks appropriate to the changed surface.
6. **Promote** — move only stable reusable knowledge/artifacts into durable project state.
7. **Close** — run tracked cleanup and leave a short handoff.

Do not carry a live task session forever just because it is convenient. A new independent objective should normally start a new agent conversation/session.

## 2. State lifetimes

Classify new state before creating it.

### Run-scoped — disposable

Examples: scratch scripts, browser downloads, raw logs, screenshots used for debugging, temp DBs, dev servers, one-off containers, generated probes, intermediate patches.

Rules:
- Prefer `.agent/tmp/<run-id>/`.
- Do not reference these paths from durable source/docs.
- Register long-running resources so `end` can dispose them.
- Delete/reap after the task.

### Project-scoped — durable

Examples: product source, tests, migrations, architecture docs, ADRs, reusable project scripts, committed fixtures, stable runbooks.

Rules:
- Must have a reason to exist after the current task.
- Must live in the repository's canonical structure, not `.agent/`.
- Update existing canonical docs before adding a new document with overlapping purpose.
- If generated, document how to regenerate rather than preserving arbitrary generated copies.

### Agent/user-scoped — rare

Examples: stable personal preferences or environment facts that apply across projects.

Rules:
- Do not put project facts here when they belong in the repo.
- Do not store raw task history.
- Consolidate/replace obsolete entries instead of accumulating variants.
- Update personal memory only when the user explicitly requests it. Recording
  a promotion does not authorize or perform a native memory update.

## 3. Resource discipline

### Reversible acquisitions

Processes, containers, temporary directories, test servers, temporary credentials/files, and registrations should be treated as acquisitions with disposers.

Preferred pattern:

`acquire -> immediately register disposer -> continue work`

Avoid:

`acquire many things -> hope cleanup happens at the end`

### Irreversible or externally visible actions

Examples: push, deploy, publish, send message, charge/refund, destructive remote mutation, irreversible schema/data operation.

These are not normal cleanup candidates. Delay them to an explicit commit point, use staging/dry-run where available, and use a documented compensation/rollback mechanism when the external system supports one.

## 4. Repository safety

- Never erase pre-existing user changes.
- Never use `git reset --hard`, `git checkout -- .`, `git clean -fdx`, or equivalent as housekeeping unless the user explicitly requested that exact destructive operation and its scope is understood.
- Unknown untracked files are **unknown**, not garbage.
- Generated cache directories may be reported/cleaned only when their role is well-established and rebuilding is safe.
- Prefer a branch/worktree for large migrations so the complete structural change is reviewable.

## 5. Context discipline

- Keep root `AGENTS.md` a short operating contract and navigation page; target roughly <= 6 KB when possible.
- Do not paste large logs into durable instructions. If output is more than roughly 200 lines or 8 KB, store it as cold evidence and summarize the relevant result.
- Do not create per-task committed `NOTES.md`, `SUMMARY.md`, `TODO_AGENT.md`, or similar files unless the task specifically requires a durable document.
- Avoid duplicated rules across `AGENTS.md`, `.hermes.md`, `CLAUDE.md`, Cursor rules, and skills. Understand which surface actually loads for each agent.
- Archive/searchable history is fine; the problem is automatically injecting it into every future task.

## 6. Knowledge promotion test

Before adding durable agent-facing knowledge, all of these should usually be true:

- **Stable** — unlikely to become false after this task/branch.
- **Reusable** — likely to matter for multiple future tasks.
- **Non-obvious** — costly or risky to rediscover.
- **Actionable** — changes how an agent should work.
- **Canonical** — there is a clear place/source of truth for it.

If a new note conflicts with an old one, replace/consolidate the old guidance instead of keeping both.

Good promotions:
- canonical build/test command that is easy to run incorrectly;
- architectural invariant;
- required data migration ordering;
- durable repository convention;
- repeatable multi-step operational procedure.

Bad promotions:
- temporary port/PID/path;
- today's failed attempt history;
- raw stack trace;
- one-time test data;
- information easily found in package/framework docs;
- a duplicate summary of an existing source-of-truth document.

## 7. Dependency discipline

Agents should make dependencies explicit instead of relying on ambient state:

- identify required services/tools/config before using them;
- prefer project-local declared dependencies over globally installed magic;
- if a required provider disappears or changes, revalidate dependents rather than continuing with stale assumptions;
- avoid hidden coupling through global temp files, background daemons, shell state, or agent memory.

## 8. Verification contract

For every implementation task:

- verify the actual changed behavior, not just syntax;
- run focused tests first and broader checks when risk justifies them;
- report checks not run and why;
- do not declare cleanup successful if a tracked resource is left in `review` state;
- final handoff should be concise enough that a fresh agent can continue without replaying the entire conversation.

## 9. Recommended final handoff format

Keep it short:

- **Changed:** 1–4 bullets.
- **Verified:** commands/checks and result.
- **Remaining:** only real risks, decisions, or manual cleanup.

Raw command transcripts belong in task-local logs, not the handoff.
