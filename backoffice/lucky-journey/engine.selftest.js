const assert = require('node:assert/strict');
const engine = require('./engine.js');

console.log('Running Lucky Journey V3 engine selftest...');

const {
  DEFAULT_CONFIG,
  allocatePhaseSpins,
  phaseOf,
  progressCurve,
  progressAt,
  progressGain,
  guaranteedTicketSupply,
  phasePrizeStats,
  playCostStats,
  completionProbability,
  suggestTargetSpins,
  drawMockPrize,
  evaluatePublishStatus
} = engine;

// 1. Phase spins allocation
const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
const phases = allocatePhaseSpins(cfg.targetSpins, cfg.phaseShares);
assert.equal(phases.fast + phases.mid + phases.fine, cfg.targetSpins - 1, 'Phase spins sum must equal T - 1');
assert.ok(phases.fast >= 1 && phases.mid >= 1 && phases.fine >= 1, 'Post-first phases each get at least 1 spin');

// Check phaseOf for all spins
assert.equal(phaseOf(1, cfg.targetSpins, cfg.phaseShares), 'fast', 'Spin 1 is always fast');
for (let k = 1; k <= cfg.targetSpins; k++) {
  const ph = phaseOf(k, cfg.targetSpins, cfg.phaseShares);
  assert.ok(['fast', 'mid', 'fine'].includes(ph), `Spin ${k} phase must be valid`);
}

// 2. Deterministic progress curve
const curve = progressCurve(cfg.targetSpins, cfg.firstSpinPct, cfg.curveGamma);
assert.equal(curve[0], 0, 'P(0) must be 0');
assert.equal(curve[1], cfg.firstSpinPct, `P(1) must be ${cfg.firstSpinPct}`);
assert.equal(curve[curve.length - 1], 100, 'P(T) must be 100');
for (let i = 1; i < curve.length; i++) {
  assert.ok(curve[i] > curve[i - 1], `Curve must be strictly monotonic at step ${i}: ${curve[i]} > ${curve[i-1]}`);
}

// 3. Ticket supply calculations
const supply = guaranteedTicketSupply(cfg);
assert.equal(supply.nonSocial, 12, 'Default nonSocial supply is 7+5=12');
assert.equal(supply.all, 17, 'Default all supply is 7+5+5=17');
assert.ok(supply.all >= cfg.targetSpins, 'All tickets >= targetSpins');

// 4. Phase prize stats & absolute probabilities
for (const p of ['fast', 'mid', 'fine']) {
  const stat = phasePrizeStats(cfg, p);
  const cfgP = cfg.prize[p];
  assert.equal(stat.nativePct, 100 - cfgP.thanksPct - cfgP.upgradePct, `${p} nativePct must equal 100 - thanks - upgrade`);
  assert.ok(stat.ev >= 0, `${p} EV must be >= 0`);
  assert.ok(stat.max >= stat.ev, `${p} max cash equivalent must be >= EV`);
}

// 5. Play cost & hard reserve
const cost = playCostStats(cfg, cfg.targetSpins);
assert.ok(cost.hardReserve >= cost.expected, 'Hard reserve must be >= expected cost');
// Standard T=12, finishPrize=5, max cash equiv per spin = 1 => 12 * 1 + 5 = 17
assert.equal(cost.hardReserve, 17, 'Standard player hard reserve must equal 17');
assert.ok(cost.expected > 5 && cost.expected < 10, `Expected cost should be ~7.86, got ${cost.expected}`);

// 6. Completion probability simulation
const p = completionProbability(cfg, cfg.targetSpins);
assert.ok(p >= 0 && p <= 1, 'Completion probability must be between 0 and 1');
assert.ok(p > 0.5, `Expected high completion probability for default, got ${p}`);

// 7. Suggest target spins
const suggested = suggestTargetSpins(cfg, 0.70);
assert.ok(suggested >= 4 && suggested <= 30, 'Suggested spins must be in valid range');

// 8. Mock prize draw
let sawCash = false;
let sawCredit = false;
let sawPoint = false;
let sawThanks = false;
for (let i = 0; i < 500; i++) {
  const dFast = drawMockPrize(cfg, 'fast');
  const dMid = drawMockPrize(cfg, 'mid');
  const dFine = drawMockPrize(cfg, 'fine');
  if (dFast.type === 'cash') sawCash = true;
  if (dMid.type === 'credit') sawCredit = true;
  if (dFine.type === 'point') sawPoint = true;
  if (dFast.type === 'none' || dMid.type === 'none' || dFine.type === 'none') sawThanks = true;
}
assert.ok(sawCash && sawCredit && sawPoint && sawThanks, 'Mock prize draws must produce all prize types');

// 9. Publish evaluation
const pub = evaluatePublishStatus(cfg);
assert.ok(pub.canPublish, 'Default config should have canPublish === true');
assert.equal(pub.red.length, 0, 'Default config should have 0 red lights');
assert.ok(pub.greenSummary.length > 20, 'Green summary should be non-empty');

console.log('ALL TESTS PASSED!');
console.log('Sample outputs:');
console.log('- Phase allocation (T=12):', phases);
console.log('- Curve points:', curve);
console.log('- Ticket supply:', supply);
console.log('- Play cost stats:', cost);
console.log('- Completion probability:', (p * 100).toFixed(2) + '%');
console.log('- Green summary:', pub.greenSummary);
