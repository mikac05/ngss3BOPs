# ngss3BOPs agent instructions

Interactive NGSS3 back-office and player HTML lives in this clone. Do not write prototypes into the knowledge-base repo `NGSS3` or `Documents/Prototype/ngss3BOPs`. Do not checkout, merge, or push Pages `main` / `origin/main` unless the user explicitly publishes.

## Task routing pilot

For `LJ-V3-REVIEW` or an exact `backoffice/lucky-journey/v3-review/` artifact, use the shared NGSS3 router with the approved local repo map: `python <NGSS3_ROOT>/tools/agent_context.py --repo-map <LOCAL_MAP> route --task LJ-V3-REVIEW`. Its task/checkpoint live in this repo under `tasks/LJ-V3-REVIEW/`; shared facts and policy remain in NGSS3. Setup and handoff are in NGSS3 `agent-system/README.md` and `agent-system/HANDOFF-CONTRACT.md`. If NGSS3 is unavailable, report the missing dependency rather than use stale native memory. No product changes or publication are authorized by a packet.

An ambiguous continue request needs task selection. Preserve existing staged, unstaged and untracked work. A historical auto-approval marker is not new authorization. This pilot does not modify the product pages or install host settings; other tasks retain their existing contracts.

## Copy (Sepia)

Before writing player-facing, operator helper, empty-state, toast, hub, or demo phrases:

1. Load `.agents/skills/sepia/SKILL.md` (write for new copy; refactor for sentences this run already owns). Never recreate a whole page just to de-AI.
2. If the string is Chinese, also load `.agents/skills/sepia/references/languages/zh.md`.
3. Use the professional route. Do not enable Hemingway or fiction voice.
4. Keep canonical product labels unchanged: 活动中心, 充值, 钱包, 首页, 活动, VIP, 我的, 抽奖次数, 好友助力, 做任务, 进度条, 转盘开奖, 容易完成, 预算, 谢谢参与, 现金, 积分, 点数, ON/OFF 关闭, INHERIT/SET/OFF. English gloss on first use still applies. Formal/legal/compliance copy does not get 嘛.

See `.agents/rules/sepia-prototype-copy.md` and `COPY-VOICE.md`. This does not authorize rewriting existing HTML outside the current page.

## Task hygiene and worktrees

- For substantial work, inspect Git status and start `python -X utf8 tools/agent_hygiene.py start --task "<task>"`. Keep one acknowledged writer and one active run per checkout; never force over another active run.
- Worktrees of this repository are valid prototype workspaces. Use a separate worktree for an independent substantial prototype or concurrent implementation; continue an existing feature in its current task/worktree. Verify the starting revision and required files before editing. Refer to NGSS3 through an explicit local repo map, not an assumed sibling path.
- Keep scratch files in the returned `.agent/tmp/<run-id>/`. `.agent/` is ignored runtime; `.agents/` contains shared skills. Finished prototypes, source specifications and task checkpoints belong in their canonical directories, never only in scratch storage.
- Track local services with `spawn` and disposable containers with `container-run` when practical; use distinct preview ports for concurrent worktrees. Live Windows processes require manual cleanup because the helper cannot verify their creation identity. See [recovery policy](docs/agent/RECOVERY.md).
- Keep large raw logs and host reports cold. Promote only stable, reusable, non-obvious, actionable guidance into an existing canonical file, then record `promote <path> --reason "..."`. No automatic personal-memory updates or task history in these instructions.
- Verify changed behavior before `end --summary "<result>"`; report unresolved resources. Prototype changes need browser interaction/layout checks as well as relevant automated checks. Preserve final work before removing a worktree; `end` only cleans registered run resources.
- For major cleanup or unfamiliar state, run `audit`. After crashes inspect `reap` before `--apply`. Never broadly clean unknown files or kill unverified processes. Read [policies and ownership](docs/agent/INDEX.md) on demand.
- Keep credentials, authenticated sessions, live member identifiers, native settings and raw provider captures out of Git and public artifacts. `.codex/` model settings stay local. Do not commit, push, publish, or mutate live systems without explicit authorization. Root Pages `main` remains publication-controlled.
- Hygiene is a local resource ledger; it does not select a product task, grant writer ownership, replace NGSS3 HANDOFF/CONTINUE, or turn prototype behavior into production evidence.
