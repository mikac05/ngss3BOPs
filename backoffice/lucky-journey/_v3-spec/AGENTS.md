# AGENTS.md — Lucky Journey V3

This repository is a product + algorithm prototype. Treat `docs/` as the product source of truth and `src/engine.js` as the executable math reference.

## Non-negotiable product invariants

1. This is a new `好运探索季` activity type. It does not replace the existing `幸运转盘`.
2. Production clients never calculate rewards. Browser-side drawing in this repository is a Mock Server for prototype demonstration only.
3. Progress is deterministic from the snapshotted curve. Reward drawing is server-random and cannot change progress.
4. A Play starts at 0%. The first successful spin moves to `firstSpinPct`; all cohorts share the same first-spin progress.
5. Every eligible cohort must be mathematically capable of reaching 100% with the configured maximum ticket supply.
6. `effectiveTargetSpins` is the executable difficulty control. Completion-rate percentages are planning estimates, never a hidden per-player win/lose draw.
7. The final allowed spin reaches exactly 100%. There is no legal spin after completion.
8. Friend assist only grants tickets. It never directly changes progress.
9. Do not add a second editable wheel-sector probability table. Prize probabilities come only from phase settings.
10. Budget pressure may stop new joins but may not alter existing players' curve, probabilities, prize table, or finish prize.
11. Idempotency is required for spin requests, ticket grants, and reward posting.
12. Do not infer or invent existing platform APIs, permissions, wallet precision, or ledger event names. Keep integration adapters explicit.

## Engineering workflow

Before changing behavior:

1. Read `docs/00-EXECUTIVE-REVIEW.md`.
2. Read the relevant product spec in `docs/`.
3. Run `npm test`.
4. If product behavior changes, update `docs/DECISION-LOG.md` first.
5. Update or add tests in `src/engine.test.js`.
6. Run `npm test && npm run build` before finishing.

## Prototype boundaries

- `src/engine.js`: pure calculations and Mock Server drawing helpers.
- `src/main.js`: prototype UI only.
- Production should replace `drawMockPrize()` usage with an API client returning a server-saved `SpinRecord`.
- Keep the front-end animation decoupled from probability calculations.
