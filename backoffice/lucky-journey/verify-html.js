const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Verifying HTML files and constraints...');

const indexPath = path.join(__dirname, 'index.html');
const guidePath = path.join(__dirname, 'guide.html');
const enginePath = path.join(__dirname, 'engine.js');

assert.ok(fs.existsSync(indexPath), 'index.html must exist');
assert.ok(fs.existsSync(guidePath), 'guide.html must exist');
assert.ok(fs.existsSync(enginePath), 'engine.js must exist');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const guideHtml = fs.readFileSync(guidePath, 'utf8');

// 1. file:// capable check: No type="module", no external CDNs
assert.ok(!indexHtml.includes('type="module"'), 'index.html must not use type="module"');
assert.ok(!guideHtml.includes('type="module"'), 'guide.html must not use type="module"');
assert.ok(!indexHtml.includes('http://') && !indexHtml.includes('https://'), 'index.html must have no external CDN/http links');
assert.ok(!guideHtml.includes('http://') && !guideHtml.includes('https://'), 'guide.html must have no external CDN/http links');

// 2. Links between index and guide
assert.ok(indexHtml.includes('guide.html'), 'index.html must link to guide.html');
assert.ok(guideHtml.includes('index.html'), 'guide.html must link to index.html');

// 3. Prototype-only / Recommendation labels
assert.ok(indexHtml.includes('Prototype-only'), 'index.html must label Prototype-only');
assert.ok(indexHtml.includes('Recommendation'), 'index.html must label Recommendation');
assert.ok(guideHtml.includes('Prototype-only'), 'guide.html must label Prototype-only');
assert.ok(guideHtml.includes('Recommendation'), 'guide.html must label Recommendation');

// 4. No remaining-spin player copy
assert.ok(!indexHtml.includes('还差几次'), 'index.html must never show 还差几次');
assert.ok(!indexHtml.includes('还差') || indexHtml.includes('还差一点') || indexHtml.includes('差 '), 'Only generic or math allowed');

// 5. No 彩金 as a prize type
assert.ok(!indexHtml.includes('type="bonus"') && !indexHtml.includes("type: 'bonus'"), 'Prize type must never be bonus/彩金');

// 6. Upper form MAH standard-shell fields
const requiredFields = [
  '好运探索季',
  '系统自带',
  '自定义',
  '活动时间',
  '可玩天数',
  '可重复参加',
  '允许做完本次',
  '同注册IP上限',
  '同注册设备上限',
  '参与会员层级',
  '派奖钱包',
  '打码倍率',
  '申领终端',
  '营销活动',
  '选择排版',
  '选择背景',
  '选择图标',
  '宣传图预览',
  '宣传简介',
  '点击参加'
];
for (const f of requiredFields) {
  assert.ok(indexHtml.includes(f), `index.html must include field: ${f}`);
}

// 7. Lower half 7 steps
const requiredSteps = [
  '体验目标',
  '奖励阶段',
  '抽奖次数',
  '转盘开奖',
  '分层完成',
  '预算与反作弊',
  '仿真与发布'
];
for (const s of requiredSteps) {
  assert.ok(indexHtml.includes(s), `index.html must include 7 steps title: ${s}`);
}

// 8. Guide sections
assert.ok(guideHtml.includes('管理员') || guideHtml.includes('运营'), 'guide.html must have ops section');
assert.ok(guideHtml.includes('开发'), 'guide.html must have dev section');
assert.ok(guideHtml.includes('S01') && guideHtml.includes('S40'), 'guide.html must have S01 to S40 situations table');

// 9. Player HTML checks
const playerPath = path.join(__dirname, 'player.html');
assert.ok(fs.existsSync(playerPath), 'player.html must exist');
const playerHtml = fs.readFileSync(playerPath, 'utf8');

assert.ok(!playerHtml.includes('type="module"'), 'player.html must not use type="module"');
assert.ok(!playerHtml.includes('http://') && !playerHtml.includes('https://'), 'player.html must have no external CDN/http links');
assert.ok(playerHtml.includes('engine.js'), 'player.html must load engine.js as classic script');

// Two-way links
assert.ok(playerHtml.includes('index.html'), 'player.html must link to index.html');
assert.ok(playerHtml.includes('guide.html'), 'player.html must link to guide.html');
assert.ok(indexHtml.includes('player.html'), 'index.html must link to player.html');
assert.ok(guideHtml.includes('player.html'), 'guide.html must link to player.html');

// Prototype & Recommendation labels
assert.ok(playerHtml.includes('Prototype-only'), 'player.html must label Prototype-only');
assert.ok(playerHtml.includes('Recommendation'), 'player.html must label Recommendation');

// Copy bans on player phone
assert.ok(!playerHtml.includes('还差几次'), 'player.html must never show 还差几次');
assert.ok(!playerHtml.includes('只差一次'), 'player.html must never show 只差一次');
assert.ok(!playerHtml.includes('下一次必得'), 'player.html must never show 下一次必得');
assert.ok(!playerHtml.includes('马上提现'), 'player.html must never show 马上提现');
assert.ok(!playerHtml.includes('彩金'), 'player.html must never use 彩金');

// Required player copy & labels
assert.ok(playerHtml.includes('抽奖次数'), 'player.html must include 抽奖次数');
assert.ok(playerHtml.includes('好友助力'), 'player.html must include 好友助力');
assert.ok(playerHtml.includes('做任务'), 'player.html must include 做任务');
assert.ok(playerHtml.includes('谢谢参与'), 'player.html must include 谢谢参与');
assert.ok(playerHtml.includes('现金'), 'player.html must include 现金');
assert.ok(playerHtml.includes('活动积分'), 'player.html must include 活动积分');
assert.ok(playerHtml.includes('活动点数'), 'player.html must include 活动点数');
assert.ok(playerHtml.includes('原型模拟器'), 'player.html must include 原型模拟器');
assert.ok(playerHtml.includes('只算活动开始后的直接新注册下线'), 'player.html must include correct assist copy');

console.log('All HTML checks passed successfully!');
