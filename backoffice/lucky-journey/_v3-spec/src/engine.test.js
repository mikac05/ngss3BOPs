import assert from 'node:assert/strict';
import {
  DEFAULT_CONFIG,
  allocatePhaseSpins,
  progressCurve,
  guaranteedTicketSupply,
  phasePrizeStats,
  playCostStats,
  completionProbability
} from './engine.js';

const cfg = structuredClone(DEFAULT_CONFIG);
const phases = allocatePhaseSpins(cfg.targetSpins, cfg.phaseShares);
assert.equal(phases.fast + phases.mid + phases.fine, cfg.targetSpins - 1);
assert.ok(phases.fast >= 1 && phases.mid >= 1 && phases.fine >= 1);

const curve = progressCurve(cfg.targetSpins, cfg.firstSpinPct, cfg.curveGamma);
assert.equal(curve[0], 0);
assert.equal(curve[1], cfg.firstSpinPct);
assert.equal(curve.at(-1), 100);
for (let i = 1; i < curve.length; i++) assert.ok(curve[i] > curve[i - 1]);

const supply = guaranteedTicketSupply(cfg);
assert.equal(supply.nonSocial, 12);
assert.ok(supply.all >= cfg.targetSpins);

for (const p of ['fast', 'mid', 'fine']) {
  const stat = phasePrizeStats(cfg, p);
  assert.ok(stat.nativePct >= 0);
  assert.ok(stat.ev >= 0);
  assert.ok(stat.max >= stat.ev);
}

const cost = playCostStats(cfg);
assert.ok(cost.hardReserve >= cost.expected);
const p = completionProbability(cfg);
assert.ok(p >= 0 && p <= 1);

console.log(JSON.stringify({ phases, curve, supply, cost, completionProbability: p }, null, 2));
