# Sepia for prototype / demo copy

Always-on. Applies even if the session never calls `skill_view`.

Before writing player-facing, demo, or operator helper sentences (empty states, i-tips, toasts, hub blurbs, English glosses):

1. Load `.agents/skills/sepia/SKILL.md`.
2. If the string is Chinese, also load `.agents/skills/sepia/references/languages/zh.md`.
3. Use the professional route. Do not enable Hemingway or fiction voice.
4. Keep canonical product labels unchanged: 活动中心, 充值, 钱包, 首页, 活动, VIP, 我的, 抽奖次数, 好友助力, 做任务, 进度条, 转盘开奖, 容易完成, 预算, 谢谢参与, 现金, 积分, 点数, ON/OFF 关闭, INHERIT/SET/OFF. English gloss on first use still applies.
5. Operation: write for new copy; refactor for sentences on a page this run already owns. Never recreate a whole page just to de-AI.
6. 3–5 moves, leave slack. Formal/legal/compliance copy does not get 嘛.

Workspace pin: repo-root `COPY-VOICE.md`. Do not rewrite existing HTML outside the current page. Do not mix with dirty `backoffice/personalization/` work.
