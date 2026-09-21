# Agent Documentation Index

Read documents on demand; this directory is intentionally not auto-loaded in full.

- `OPERATING_RULES.md` — future-task lifecycle, resource ownership, verification, and promotion rules.
- `CONTEXT_AND_STATE.md` — what belongs in hot context, project docs, cold history, and task-local storage.
- `RECOVERY.md` — normal teardown, crash recovery, and safe cleanup boundaries.

Project-specific architecture, commands, ADRs, and runbooks should remain in the repository's existing canonical documentation. Link to them from the root `AGENTS.md` rather than copying them into agent instructions.

## ngss3BOPs integration

Based on Agent Hygiene Implementation Pack 2026-09-21.1, using the hardened
helper and regression tests from the NGSS3 integration. The two repositories
keep matching helper/test files; when changing cleanup behavior, review both
copies and run their tests. This avoids a runtime dependency on a sibling path.

```text
python -X utf8 -m unittest discover -s tools -p test_agent_hygiene.py
```

The hygiene CI workflow runs these tests only; it does not deploy a site.

- `backoffice/`, `client/`, their owning specifications and `tasks/` remain
  durable prototype state. Existing nested instructions apply only to their
  subtree. Do not replace product specifications with agent summaries.
- NGSS3 remains the owner of shared knowledge, governance and the scoped router.
  Root `AGENTS.md` describes the explicit local repository-map dependency.
  For worktrees, resolve their actual paths; do not assume two sibling folders.
- `.agents/` remains shared skills/rules; `.agent/` is ignored local run state.
  Existing provider result files are cold historical evidence, not permission
  or startup instructions. Leave unclassified captures in place pending review.
- `.codex/` is ignored host configuration. This installation uses Sol/medium
  daily defaults with three Terra helper definitions; explicit session settings
  may override defaults. Configure fresh worktrees/hosts deliberately without
  copying authentication or the `.agent/` runtime ledger. Availability of helpers
  does not require parallel agents for every task.
- Independent feature work may use a worktree and a `codex/<feature>` branch.
  Verify its base contains the needed source and hygiene files. Keep one writer
  per checkout, including any shared NGSS3 files referenced by several tasks.
- Preserve reviewed source/checkpoints before retiring a worktree. `end` does
  not merge, commit, publish or remove a worktree. Git integration remains a
  separately authorized step.
- The README documents Pages publication from `main`. Follow the existing
  publication boundary: review the exact public artifact set before release;
  do not copy internal NGSS3 documents or local runtime state into it. No remote
  publishing configuration is established or changed by this integration.
