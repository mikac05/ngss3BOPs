# Recovery and Cleanup Policy

The cleanup system has two paths.

## Normal close

`python tools/agent_hygiene.py end --summary "..."`

Resources are disposed in reverse registration order. The helper only automatically cleans resources it can attribute to the run:

- task-local paths underneath `.agent/tmp/<run-id>/`;
- processes launched by `agent_hygiene.py spawn`, after PID/command verification;
- Docker/Podman containers launched by `container-run`, after ownership-label verification.

Anything it cannot verify is marked `review` rather than destroyed.

Shared NGSS3/ngss3BOPs safety adaptations: on Windows, live processes are reported for manual
review; the helper cannot verify their creation identity and will not terminate
them. Linux cleanup requires the original command and process creation identity.
Other platforms without that evidence also refuse termination. Prefer short
foreground commands when automatic teardown is unavailable. A process already
confirmed exited needs no termination. Never put credentials in command arguments
or captured logs; use the approved environment/secret store.

`end` closes the run but may report unresolved resources. Inspect the manifest
and verify those resources individually; a closed status is not proof that all
resources were removed. `prune` retains any run with unresolved resources.
`promote` records a decision only: it does not move files, exempt scratch files
from cleanup, update personal memory, stage, commit, or publish anything.

## Crash/orphan recovery

Inspect stale runs first:

`python tools/agent_hygiene.py reap --older-than-hours 12`

This is a dry run. After reviewing candidates:

`python tools/agent_hygiene.py reap --older-than-hours 12 --apply`

Do not make the age threshold too short for legitimate long-running tasks.

## Old run metadata

Run metadata itself is disposable cold history. Preview pruning:

`python tools/agent_hygiene.py prune --older-than-days 30`

Apply only after review:

`python tools/agent_hygiene.py prune --older-than-days 30 --apply`

## What this helper intentionally does not clean

It will not automatically delete:

- arbitrary untracked files;
- source files or docs;
- build/cache directories outside its own run temp tree;
- unknown processes;
- containers without the expected ownership label;
- remote resources, branches, pushes, deployments, cloud objects, databases;
- anything merely because it is old or large.

Those need an explicit domain-aware policy. This is a feature: cleanup safety is more important than aggressive reclamation.

## If cleanup cannot restore the exact physical state

Aim to restore the **observable project/runtime contract**, not necessarily every allocator counter, timestamp, cache byte, or historical log. Cold history may remain as long as it is not treated as live state or injected into future reasoning.
