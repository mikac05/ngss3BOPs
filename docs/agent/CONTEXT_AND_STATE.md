# Context and State Policy

## The four layers

Use four layers instead of one growing pile of agent context.

### 1. Hot context

What the current model receives automatically or repeatedly: root agent instructions, current conversation, active task facts.

Keep this small and high-signal. Anything here spends attention/tokens repeatedly.

### 2. On-demand project knowledge

Architecture docs, ADRs, API contracts, runbooks, tests, source code. These are durable but should be loaded only when relevant.

The root instruction file should point to these sources rather than duplicating them.

### 3. Cold searchable history

Old sessions, completed run manifests, archived logs, previous investigation evidence. Retention is useful for forensics/recall, but it should not be auto-loaded.

### 4. Disposable task state

`.agent/` contains run manifests, temp files, logs, and audit reports. It is not a source of truth and should be gitignored.

## Context budget rules

- Root `AGENTS.md`: target <= ~6 KB; keep only rules/navigation needed on most tasks.
- Nested agent instruction files: use only when a subtree truly requires different rules.
- Raw tool output: if > ~8 KB or > ~200 lines, save it and retain only the conclusion plus path/reference in live context.
- Task handoff: aim for <= ~250 words unless the task itself needs a longer durable report.
- Project docs may be long because they are on-demand; give them clear headings and links so agents can retrieve only the needed section.

These are engineering targets, not protocol limits. The point is to keep repeatedly injected text much smaller than the model's maximum context window.

## Do not let history become policy automatically

A fact observed once should not become permanent instructions merely because it appeared in a successful task.

Use this promotion ladder:

`raw output -> task-local evidence -> short task conclusion -> canonical project doc/test/code -> global agent memory (rare)`

Each upward move requires stronger evidence that the information remains useful.

## Instruction-surface hygiene

Different agents may load different files. Avoid maintaining parallel full copies of the same rules.

Preferred shared setup for Codex + Hermes:
- use a concise root `AGENTS.md` as the common project contract;
- keep Hermes-only `.hermes.md` absent unless you genuinely need Hermes-specific behavior, because Hermes gives it priority over `AGENTS.md`;
- keep `CLAUDE.md`/Cursor rules only for tool-specific differences, not duplicates of project-wide rules;
- periodically run `agent_hygiene.py audit` to see the main instruction surfaces and sizes.

## Durable knowledge belongs near the thing it describes

Examples:
- build commands -> contributor/development docs;
- architectural decisions -> ADR/architecture docs;
- subsystem-specific invariant -> subsystem doc or nested `AGENTS.md` if agents need it on nearly every edit there;
- executable expectations -> tests/lints whenever possible.

Prefer machine-verifiable constraints over prose reminders.

## Prototype evidence and cross-repository ownership

NGSS3 owns shared reviewed product evidence and governance; ngss3BOPs owns
interactive prototype implementations and their local task checkpoints.
Preserve the distinction between user-confirmed rules, documented requirements,
live observations, planned work, recommendations, open questions and
prototype-only behavior. Mock data or a working UI does not establish backend
APIs, eligibility, wallet rules, permissions or production guarantees.

Use the selected task's specification and source pointers. Keep `.agent/`
run manifests and audit reports local and cold. A history file, provider result
or approval marker never chooses today's task or authorizes publication.

## Repository organization assessment

**Recommendation (2026-09-21): keep ngss3BOPs as a separate repository.**
This assessment does not authorize a repository migration or publication.

NGSS3 owns knowledge, evidence and governance; ngss3BOPs owns interactive
prototypes and the documented Pages release path. The scoped router already
connects selected tasks through explicit repository maps and source revisions.
The separation keeps release review independent from internal knowledge changes.
Its cost is coordinating two revisions and maintaining shared helper copies;
use task checkpoints and the same tested helper revision to manage that cost.

A Git branch points to a commit and therefore a version of a repository tree.
A permanent prototype branch would create a parallel line of history, not a
component that stays present beside the knowledge base. Shared rules would still
need merging or copying between those histories. Use feature branches and
worktrees inside ngss3BOPs for independent prototype work instead.
See [Git's branch model](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell).

If specification/prototype changes later require frequent atomic commits, and
their access and maintenance requirements align, reassess a **single repository
with separate directories on the same development branch**. Such a migration
would need history preservation, source/router path updates, validation changes
and an explicit deployment artifact containing only approved public files.
GitHub Pages can publish a selected branch/folder or a custom workflow artifact;
merging repositories does not itself establish a safe publishing boundary.
See [Pages publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

No branch reorganization, history import, remote change or Pages setting change
was performed as part of hygiene installation.
