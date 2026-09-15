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
