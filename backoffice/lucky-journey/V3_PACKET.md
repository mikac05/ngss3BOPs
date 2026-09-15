# Packet v1 — LJ-V3-BO — 好运探索季 V3 后台原型 + 说明页

- **packet_version:** 1
- **root_task_id:** LJ-V3-2026-09-11
- **assigned_profile:** gemini-worker (AGY Gemini work; controller may boot on another provider)
- **model/effort:** `agy-gemini --mode work --effort high --unsafe-auto-approve`
- **agy_marker:** `C:/Users/NGSS/.config/hermes-routing/allow-agy-autonomous-writes` (HA-003). Do **not** block for marker-in-repo, worktree, FIGMA_API_KEY, or Hermes `mcp install figma`.
- **workspace:** `C:/Users/NGSS/Documents/ngss3BOPs` (`workspace_kind=dir`, live dirty checkout)
- **file_ownership:** only `backoffice/lucky-journey/**` plus a *minimal* hub-card edit on `index.html` if safe
- **retry_limit:** 1 transient; else escalate
- **quota_snapshot:** mode=`auto`; gemini=no-block; grok=no-block; gpt=no-block (read 2026-09-11)

## Objective

Rebuild the 好运探索季 backoffice as a **V3** interactive HTML prototype that matches NGSS 活动中心 **Element Plus** chrome (MAH `standard-shell`), and add a bilingual-capable **说明页** for operators + developers covering rules, mechanism, and how to configure. Label **Prototype-only / Recommendation**. New activity type beside live `幸运转盘`; do not replace it.

## Source of truth (already copied)

Read in this order before writing HTML:

1. `backoffice/lucky-journey/_v3-spec/AGENTS.md`
2. `backoffice/lucky-journey/_v3-spec/docs/00-EXECUTIVE-REVIEW.md`
3. `backoffice/lucky-journey/_v3-spec/docs/IMPROVED-BACKOFFICE.md` (IA + 7 steps)
4. `backoffice/lucky-journey/_v3-spec/docs/IMPROVED-SPIN-ENGINE.md`
5. `backoffice/lucky-journey/_v3-spec/docs/PLAYER-UX-SPEC.md` (for 说明页, not a full player SPA)
6. `backoffice/lucky-journey/_v3-spec/src/engine.js` — **executable math**; do not rewrite formulas
7. `backoffice/lucky-journey/_v3-spec/COMPLETE-SPEC.md` if a section is missing from the splits
8. Visual chrome clone: `backoffice/multiplier-apex-hunt/index.html` (`standard-shell`, `--el-*` tokens, dark default + light toggle)
9. G3 backup (do not extend): `backoffice/lucky-journey/_archive/g3-index.html`

Original zip remains at `C:/Users/NGSS/Downloads/lucky-journey-v3/` (outside git). Do not vendor the V3 Vite/module SPA (`src/main.js`) into the hub.

## Deliverables

1. `backoffice/lucky-journey/index.html` — V3 7-step 活动中心 setup (file:// capable)
2. `backoffice/lucky-journey/engine.js` — port of `_v3-spec/src/engine.js` as a **non-module** script (`window.LuckyJourneyEngine` or IIFE). Same math. file:// must work; no `type=module` required for the admin page.
3. `backoffice/lucky-journey/guide.html` — 说明页（运营 + 开发）. Must link to `index.html`. `index.html` topbar must link back to `guide.html`.
4. Optional tiny CSS/JS siblings in the same folder if it keeps `index.html` maintainable. No npm, no Vite, no third-party CDN if it breaks file://.
5. Do **not** git checkout / merge / push `main` or `origin/main`. Do **not** commit. Do **not** touch `backoffice/personalization/**`.

## Hub card (hotspot)

`C:/Users/NGSS/Documents/ngss3BOPs/index.html` is already dirty on `dev/customize-theme-refine` and a concurrent Sepia card may also touch copy. Prefer **not** editing the hub. If you must, only update the existing 好运探索季 card (href already `./backoffice/lucky-journey/index.html`) to mention V3 + 说明页, or add a second card to `guide.html`. Comment `hotspot: index.html` if you touch it.

## Chrome / IA (non-negotiable)

- **Upper half:** clone MAH `standard-shell` 新增活动 fields: 活动类型=`好运探索季`, 系统自带/自定义名称, 活动时间, 可玩天数, 可重复参加, 活动结束后 (default **允许做完本次**), 同注册IP/设备上限 (`0`=unlimited), 参与会员层级, 派奖钱包, 现金时打码倍率, 申领终端, 营销活动, 排版/背景/图标, 宣传图与是否展示文字, 宣传简介. 怎么参加 default **点击参加**; auto-join only in 高级 + budget warning.
- **Lower half 7 steps** (Chinese titles):
  1. 体验目标 — firstSpinPct 90, standard T 12, γ 1.8; readonly curve P(k)
  2. 奖励阶段 — 快砍/中段/细砍 **spin shares only** (40/35/25); one `phaseOf`; Hamilton remainder; first spin always fast
  3. 抽奖次数 — free / task / assist with V3 event units (not the old 每日次数 column for all three); left switch greys the row; 游玩指定类型 is **radio**
  4. 转盘开奖 — absolute thanks/upgrade/native=100; no per-slot odds table; types 谢谢参与 / 现金 / 积分 / 点数 (never `彩金` as a type)
  5. 分层完成 — effective T not 进度倍率; VIP+deposit rows; 越级加成; 目标完成率 is planning estimate
  6. 预算与反作弊 — hard reserve per Play; available = total - spent - outstandingReserve
  7. 仿真与发布 — red/yellow/green lights + one-sentence green summary
- Sticky inspector ~400px: 你正在调 + 变化看这里; player bars at **0%** and **第一转**; ticket supply non-social vs all; cohort completion estimates; budget; enablement lights. **Never** show remaining-spin ETA / 还差几次 on player or inspector.
- Default **dark** like live tenant admin; keep a light toggle (Element Plus `--el-*` + MAH tokens).
- Every tunable field: hover **i** tip = 改什么 / 玩家会怎样 / 不要踩什么.
- Sepia: `skill_view(name='sepia')` then `references/languages/zh.md` for new Chinese helper/empty/toast copy. Venue = operator helper. Keep canonical labels.

## Mechanism invariants (stamp; do not rediscover)

- Progress is **deterministic** from snapshotted curve; only prizes use server RNG (prototype may mock).
- P(0)=0; P(1)=F; P(T)=100; for 1<k<T: `P(k)=F+(100-F)*(1-(1-q)^γ)` with `q=(k-1)/(T-1)`.
- Final allowed spin hits exactly 100%; no legal spin after complete.
- Assist grants **tickets only**; activity-start-after **direct new-registered** official downlines; same downline once per activity (not per Play).
- Daily free unique key: `member + activity + tenantDate` (not playId).
- Tasks count only behavior after that Play `joinedAt`.
- Budget pressure stops **new joins** only; never mutate in-flight curve/odds/prizes.
- Completion rate % is a **planning estimate**, never a hidden per-player win/lose draw. Executable control is `effectiveTargetSpins`.
- `maxTicketsAll < max(effectiveT)` → red, cannot publish. `maxTicketsNonSocial < standardT` → yellow (red if 非社交保证 on).
- Prototype mock spin is demo-only; 说明页 must say production = POST /spin, server saves SpinRecord, client animates, requestId + rewardGrantId idempotent.

## 说明页 (`guide.html`) requirements

Single HTML, Element Plus-adjacent, dark default, file://.

Audience sections:

1. **给管理员 / 运营** — what the activity is; player loop (click join → tickets → spin → bar 0% then first-spin jump → finish prize at 100%); what each of the 7 steps changes; how to publish (red/yellow/green); templates are one-shot writes not a third ruleset; 前台不显示 T.
2. **给开发** — objects (Activity, Play snapshot, tickets, SpinRecord); one-transaction spin; phaseOf uniqueness; reserve formula; event scopes; idempotency; adapters not invented platform APIs; “do not calculate rewards on the client in production”.
3. Situation table: join-after-end, concurrent spin, disconnect, mop-up last spin, assist=tickets-only, budget full, repeat Play.
4. Prominent CTA: 「打开后台原型」→ `index.html`.
5. Evidence labels: Prototype-only / Recommendation. Not Current Spec.

## Non-goals

- Do not implement a full player SPA (V3 `src/main.js`). Inspector + optional compact phone mock in step 7 is enough.
- Do not overwrite KB files in `C:/Users/NGSS/Documents/NGSS3`.
- Do not push GitHub Pages `main`.
- Do not invent palettes / Figma harvest (this is Element Plus clone of MAH).
- Do not edit personalization or checkout another branch.

## Acceptance criteria

- file:// open of `index.html` and `guide.html` works (no ES modules required).
- Upper form matches MAH standard-shell field set; lower is 7 V3 steps; inspector live-updates from engine.js.
- Changing firstSpinPct / T / γ redraws P(k); T-th point is 100%.
- Phase shares stay 100%; one `phaseOf` used for inspector, prize preview, and reserve.
- Ticket switches grey rows; 游玩指定类型 is radio.
- No second prize-odds table; thanks+upgrade+native display as absolute %.
- Cohort table uses effective T; first spin % shared.
- Publish lights implement the red/yellow lists from IMPROVED-BACKOFFICE §8.
- guide.html covers ops setup + dev mechanism and links both ways.
- `python -m http.server` optional extra check; file:// is the bar.
- Label Prototype-only in both pages.

## Verification

1. Port/adapt `_v3-spec/src/engine.test.js` assertions into a small `engine.selftest.js` or inline console checks; run with `node` if possible (strip ESM or keep a node-runnable copy). At least: default curve P(12)=100, P(1)=90, phase spins sum T, nativePct=100-thanks-upgrade, hardReserve uses effective T not ticket cap.
2. Open HTML and confirm step nav, inspector width ~400px, dark default, light toggle.
3. Do not claim live 活动中心 behavior; this is Recommendation.

## Risk triggers

Prototype-only HTML; no production deploy. Reviewer still checks: no invented live APIs as Current; no 彩金 type; no remaining-spin player copy; file:// breakage.

## Handoff format

```
summary: <1-3 sentences>
metadata:
  changed_files: [...]
  tests_run: [...]
  decisions: [...]
  findings: [...]
  file_urls:
    - file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/lucky-journey/guide.html
    - file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/lucky-journey/index.html
```
