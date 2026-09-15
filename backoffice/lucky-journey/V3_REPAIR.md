# Packet v1 — LJ-V3-REPAIR-HIGH

You are Gemini implementing this repair in the workspace. File ownership: `backoffice/lucky-journey/**` only.

- Do NOT touch `backoffice/personalization/**`, hub `index.html`, checkout/merge/push `main`, or commit.
- Do NOT rewrite `engine.js` curve / `phaseOf` / Hamilton / `playCostStats` formulas. Math already matches `_v3-spec/src/engine.js`.

## HIGH-1 — task checkboxes vs ticket supply vs publish lights

**Where:** `backoffice/lucky-journey/index.html` `syncFromInputs` / `updateTaskSettings`; `engine.js` `DEFAULT_CONFIG.sources.task.taskCount`.

**Verified (file:// dump-dom after JS):**
- Checked: `#taskPlayOn`, `#taskDepCOn`, `#taskBetCOn`
- Unchecked: `#taskDepAOn`, `#taskBetAOn`
- `#enabledTaskCountLabel` still `5`
- `#inspTaskSupply` = `5 次`; `#inspNonSocialSupply` = `12 次`
- `#inspPublishStatusBadge` = green 允许发布
- `updateTaskSettings()` exists but is never called on init; supply uses `taskCount: 5` not enabled checkboxes.

**Trigger:** open index.html; do not touch task rows. Optionally then toggle any task checkbox → count becomes 3, cap=3, nonSocial=10 < T=12 with 非社交保证 → sudden red.

**Failure:** publish lights and 非社交保证 are lying. Spec: cap/supply from enabled tasks.

**Smallest fix:**
1. Default: check all 5 task rows so they match recommended T=12 + 非社交保证 + `taskCount/cap=5`.
2. Call `updateTaskSettings()` at end of initial bind (and after reset) so label/supply/cap always equal checked count.
3. Keep deriving `state.sources.task.taskCount` and `cap` from enabled checkboxes going forward.

## HIGH-2 — joinMode never reaches publish eval

**Where:** `index.html` joinMode radios (~1309) vs `syncFromInputs` (~1859) vs `triggerPublish` (~2103).

**Verified:** only `.input, .prize-prob-in` get `input` listeners. `name="joinMode"` radios have no `change` listener. `triggerPublish` calls `evaluatePublishStatus(state)` without re-reading the DOM, so `state.budget.joinMode` stays `'click'`.

**Trigger:** select 打开即参加, click 发布活动配置 / 保存并开启活动. Auto-join red (IMPROVED-BACKOFFICE §8.1) and yellow never appear.

**Smallest fix:** bind `change` on `joinMode` and `afterEnd` radios to `syncFromInputs`. Call `syncFromInputs()` at the start of `triggerPublish` / topbar publish.

## HIGH-3 — cohort table destroys itself while typing

**Where:** `recalcAndRender` → `renderCohortRows()` (`tbody.innerHTML = ''`).

**Trigger:** type a two-digit 有效转数 T (or name) in 分层完成. Each `oninput` rebuilds the row; focus lost after one character.

**Failure:** operators cannot actually set effective T, which is the Step 5 control.

**Smallest fix:** do not rebuild the whole tbody on every keystroke. Patch the simulated-rate cell, or skip `renderCohortRows` when `document.activeElement` is inside `#cohortsTable`. Rebuild only on add/remove/toggle.

## Out of scope this card (MEDIUM, do not boil the ocean)

- Step-7 sim label `第 k / T 转` exposes T (inspector 0%/第一转 is already correct)
- Budget ledger uses `maxParticipants * hardReserve` as 在玩中未结
- Share number inputs not rewritten to sum 100 (engine already normalizes)
- `upgradeAddPct` not applied in prize math (source engine has no cohorts)
- Guide `POST /api/lucky-journey/spin` path (keep Recommendation label)
- 派奖钱包 彩金钱包 is MAH wallet, leave it

## Verify before you finish

1. `node backoffice/lucky-journey/engine.selftest.js` still PASS (P(1)=90, P(12)=100, hardReserve 17).
2. `node backoffice/lucky-journey/verify-html.js` still PASS.
3. file:// index.html: 5 tasks checked, label=5, nonSocial=12, green; uncheck 2 tasks → label=3, supply drops, 非社交保证 red.
4. Toggle 打开即参加 then 发布 without touching other fields → auto-join warning/red.
5. Type `10` in a cohort T cell without losing focus.
6. Do not add 还差几次; do not add prize-type 彩金; 游玩指定类型 stays radio.

Implement the three HIGH fixes in `backoffice/lucky-journey/**` only. Report changed files and test output.
