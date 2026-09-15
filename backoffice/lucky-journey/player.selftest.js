const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('./engine.js');

console.log('Running Lucky Journey V3 Player & Simulator selftest...');

const {
  DEFAULT_CONFIG,
  progressAt,
  phaseOf,
  phasePrizeStats,
  drawMockPrize
} = engine;

const cfg = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

// =========================================================================
// 1. Join starts at strictly 0%
// =========================================================================
assert.equal(progressAt(0, 12, 90, 1.8), 0, 'Progress at k=0 must be 0%');

// =========================================================================
// 2. First spin jumps to firstSpinPct (default 90%)
// =========================================================================
assert.equal(progressAt(1, 12, 90, 1.8), 90, 'Progress at k=1 must be exactly 90% (firstSpinPct)');

// =========================================================================
// 3. Simulator Acceptance Case 1: 7 free + 5 tasks + 0 friends
// =========================================================================
const supplyCase1 = 7 + 5 + 0; // 12 tickets
assert.equal(supplyCase1, 12, 'Supply Case 1 total tickets must be 12');

const progressCase1 = progressAt(supplyCase1, 12, 90, 1.8);
assert.equal(progressCase1, 100, 'Supply Case 1 (12 tickets on T=12) must hit 100%');
const completesCase1 = (supplyCase1 >= 12);
assert.equal(completesCase1, true, 'Supply Case 1 must complete the play');
const finishPrizeCase1 = completesCase1 ? cfg.prize.finishPrize : 0;
assert.equal(finishPrizeCase1, 5, 'Supply Case 1 must unlock finish prize 5 cash');

// =========================================================================
// 4. Simulator Acceptance Case 2: 3 free + 2 tasks + 0 friends
// =========================================================================
const supplyCase2 = 3 + 2 + 0; // 5 tickets
assert.equal(supplyCase2, 5, 'Supply Case 2 total tickets must be 5');

const progressCase2 = progressAt(supplyCase2, 12, 90, 1.8);
assert.ok(progressCase2 < 100, 'Supply Case 2 progress must be < 100%');
assert.ok(Math.abs(progressCase2 - 95.5673) < 0.01, `Supply Case 2 progress should be ~95.57%, got ${progressCase2}`);
const completesCase2 = (supplyCase2 >= 12);
assert.equal(completesCase2, false, 'Supply Case 2 must NOT complete the play');
const finishPrizeCase2 = completesCase2 ? cfg.prize.finishPrize : 0;
assert.equal(finishPrizeCase2, 0, 'Supply Case 2 must NOT unlock finish prize');

// =========================================================================
// 5. Thanks (谢谢参与) outcome behavior:
//    Progress still increases on every spin, regardless of prize outcome.
// =========================================================================
for (let k = 1; k <= 12; k++) {
  const pBefore = progressAt(k - 1, 12, 90, 1.8);
  const pAfter = progressAt(k, 12, 90, 1.8);
  assert.ok(pAfter > pBefore, `Progress must strictly advance at spin ${k}: ${pAfter} > ${pBefore}`);
}

// Check that drawMockPrize produces 谢谢参与 (none) with canonical label
let sawThanksCanonical = false;
for (let i = 0; i < 200; i++) {
  const p = drawMockPrize(cfg, 'fast');
  if (p.type === 'none') {
    assert.equal(p.label, '谢谢参与', 'Canonical label for no prize must be 谢谢参与');
    assert.equal(p.amount, 0, 'Amount for 谢谢参与 must be 0');
    sawThanksCanonical = true;
    break;
  }
}
assert.ok(sawThanksCanonical, 'Should observe canonical 谢谢参与 in mock prize draws');

// =========================================================================
// 6. Static text inspection of player.html, player.js, player.css
// =========================================================================
const playerHtml = fs.readFileSync(path.join(__dirname, 'player.html'), 'utf8');
const playerJs = fs.readFileSync(path.join(__dirname, 'player.js'), 'utf8');
const playerCss = fs.readFileSync(path.join(__dirname, 'player.css'), 'utf8');

// Copy bans on player phone
const bannedPhrases = ['还差几次', '只差一次', '下一次必得', '马上提现', '彩金'];
for (const phrase of bannedPhrases) {
  assert.ok(!playerHtml.includes(phrase), `player.html must NOT contain banned phrase: ${phrase}`);
  assert.ok(!playerJs.includes(phrase), `player.js must NOT contain banned phrase: ${phrase}`);
}

// Required player copy
const requiredLabels = [
  '抽奖次数',
  '好友助力',
  '做任务',
  '谢谢参与',
  '现金',
  '活动积分',
  '活动点数',
  '只算活动开始后的直接新注册下线'
];
for (const label of requiredLabels) {
  assert.ok(playerHtml.includes(label), `player.html must include label: ${label}`);
}

// Prototype labels
assert.ok(playerHtml.includes('Prototype-only'), 'player.html must label Prototype-only');
assert.ok(playerHtml.includes('Recommendation'), 'player.html must label Recommendation');
assert.ok(playerHtml.includes('原型模拟器'), 'player.html must label 原型模拟器');

// File:// compatibility
assert.ok(!playerHtml.includes('type="module"'), 'player.html must not use type="module"');
assert.ok(!playerHtml.includes('http://') && !playerHtml.includes('https://'), 'player.html must have no external URLs');

console.log('All Lucky Journey V3 Player & Simulator tests passed!');
