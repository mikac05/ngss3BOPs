# Packet v1 — LJ-V3-PLAYER — 好运探索季 V3 玩家前台 + 模拟器

- **packet_version:** 1
- **root_task_id:** LJ-V3-PLAYER-2026-09-11
- **assigned_profile:** gemini-worker
- **Gemini execution:** AGY is the Gemini runtime. Hermes controller boot model may not be Gemini.
- **Required:** `C:/Users/NGSS/.local/bin/agy-gemini --mode work --effort high --unsafe-auto-approve --workdir C:/Users/NGSS/Documents/ngss3BOPs --prompt-file C:/Users/NGSS/Documents/ngss3BOPs/backoffice/lucky-journey/PLAYER_PACKET.md --timeout 20m`
- **agy_marker:** `C:/Users/NGSS/.config/hermes-routing/allow-agy-autonomous-writes` (HA-003)
- **quota_snapshot:** mode=`auto`; gemini=no-block; grok=no-block; gpt=no-block
- **file_ownership:** `backoffice/lucky-journey/**` only (plus tiny two-way links from existing `guide.html` / `index.html` topbar)
- **Do NOT** pin or `skill_view` `ngss3-html-prototypes` (E21: unknown skill crashes gemini-worker in ~37s)
- **Do NOT** touch `backoffice/personalization/**`, hub root `index.html` if avoidable, checkout/merge/push `main`, or commit

## Objective

Ship a **game-like player frontend** (phone) for 好运探索季 V3, plus a **prototype simulator** so ops/devs can set daily-free / tasks / friends and see spin count + whether that path completes. Prototype-only / Recommendation.

## Read first

1. This packet
2. `_v3-spec/docs/PLAYER-UX-SPEC.md`
3. `_v3-spec/docs/IMPROVED-SPIN-ENGINE.md` (animation protocol: mock POST then animate saved result)
4. Existing `engine.js` — reuse, do not rewrite curve / phaseOf / playCostStats
5. Existing `index.html` + `guide.html` for labels and two-way links
6. Do not extend `_archive/g3-index.html` or `v3-review/`

## Deliverables

1. `backoffice/lucky-journey/player.html` — file:// (no `type=module`, no CDN that breaks file://). Load `engine.js` as a classic script.
2. Optional `player.css` / `player.js` siblings in the same folder if it keeps HTML maintainable.
3. Links: `guide.html` and admin `index.html` topbar → player; player → guide + admin.
4. Label Prototype-only on the player chrome and on the simulator.

## Player chrome (must feel like a game)

Phone frame (~390×844). Dark festive activity look (not Element Plus admin). Energy compass / equal decorative sectors — **not** a probability pie.

Flow:

1. Join CTA at **真实 0%**. Never pre-show 90%.
2. Ticket count + 转一次.
3. After mock spin returns: lock button → full spin animation → then apply progress + prize.
4. First successful spin animates 0% → firstSpinPct (default 90%) with “进度大幅提升”. Never “再转一次就一定完成” / 还差几次 / 只差一次 / 下一次必得 / 马上提现 / fake winner tickers.
5. At 100%: stop spin button, finish-prize celebration, leftover tickets 本局已结束.

Prize hype (user request): **every cash / 活动积分 / 活动点数 win feels like a strong hit** (particle burst, stamp, punchy one-liner). **谢谢参与** (canonical label; user said 谢谢惠顾 — do not invent a new type) is the exception: softer miss, still honest, progress still advances. Do not mock the player.

Copy: player-facing 简体 product UI. Keep labels 抽奖次数 / 好友助力 / 做任务 / 谢谢参与 / 现金 / 活动积分 / 活动点数. Never prize type `彩金`. Assist copy: 只算活动开始后的直接新注册下线; assist grants tickets only (toast `获得 +N 次抽奖次数`, bar does not jump).

`prefers-reduced-motion`: shorten/skip wheel, still apply the saved result.

Prototype mock: in-page Mock Server using `LuckyJourneyEngine` (same math as admin). Comment that production must POST /spin, save SpinRecord, animate only the returned record.

## Simulator (required)

A clearly labeled **原型模拟器** panel (not mixed into player chrome as if the member sees T).

Inputs:

- 每日免费：已领天数 or tickets already granted (integers; cap from engine sources.free)
- 已完成任务项数 (0–enabled taskCount)
- 合格好友人数 (0–friendCap)

Outputs (update live):

- 本局可得抽奖次数 (free + task + assist after caps)
- 模拟走完这些次数后的 **最终进度 %**
- **是否完成本局** (progress hits 100%)
- 累计现金当量 / 活动积分 / 活动点数 / 是否拿到转满大奖
- Optional “一键按此供给自动转完” that plays or fast-forwards using the mock engine

**Never show remaining-spin ETA on the player phone.** Simulator may mention T only inside the simulator panel, with text that T is not shown to members.

Default cohort = standard T=12. Optional cohort picker in simulator only (VIP4 T=10, VIP7 T=8) — still do not print T on the phone.

## Non-goals

- Do not rebuild the 7-step admin.
- Do not rewrite engine math.
- Do not implement a real backend.
- Do not push Pages main.

## Acceptance

- file:// `player.html` works.
- Join starts at 0%; first spin jumps to ~90% with animation.
- Simulator: 7 free + 5 tasks + 0 friends → 12 tickets → completes at 100% on standard T.
- Simulator: 3 free + 2 tasks + 0 friends → 5 tickets → not complete; show final % < 100, no finish prize.
- Thanks outcome: progress still increases; hype is muted vs cash/credit/point.
- No 还差几次 / 只差一次 on the phone.
- `node backoffice/lucky-journey/engine.selftest.js` still PASS.

## Handoff

summary + metadata.changed_files + tests_run + file_urls to player.html
