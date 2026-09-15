const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

console.log('Starting Headless Edge CDP verification for player.html...');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const playerFileUrl = 'file:///' + path.resolve(__dirname, 'player.html').replace(/\\/g, '/');

const port = 9333;
const edgeProc = spawn(edgePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  playerFileUrl
]);

edgeProc.on('error', (err) => {
  console.error('Failed to spawn Edge:', err);
  process.exit(1);
});

function cleanup() {
  try {
    edgeProc.kill('SIGKILL');
  } catch (e) {}
}
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 0;
    this.callbacks = new Map();
    this.events = [];
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  ready() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve();
      this.ws.onopen = () => resolve();
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = ++this.msgId;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      console.error('Eval exception:', JSON.stringify(res.exceptionDetails, null, 2));
      throw new Error(res.exceptionDetails.text || 'Eval error');
    }
    return res.result ? res.result.value : undefined;
  }
}

async function run() {
  let targets = null;
  for (let i = 0; i < 25; i++) {
    await wait(300);
    try {
      targets = await getJson(`http://127.0.0.1:${port}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  if (!targets || !targets[0]) {
    throw new Error('Edge CDP target not found');
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await cdp.ready();
  console.log('Connected to CDP!');

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // Wait for document to settle
  await wait(500);

  // Check 1: Verify Initial Page State
  console.log('--- TEST 1: Initial Player State ---');
  const initPct = await cdp.eval('document.getElementById("phoneProgressPct").textContent.trim()');
  const initBtnText = await cdp.eval('document.getElementById("btnMainSpin").textContent.trim()');
  const initTickets = await cdp.eval('document.getElementById("phoneTicketCount").textContent.trim()');
  console.log(`Initial: progress=${initPct}, button="${initBtnText}", tickets=${initTickets}`);
  assert.equal(initPct, '0.00%', 'Initial progress on phone must be 0.00%');
  assert.ok(initBtnText.includes('参加活动') && initBtnText.includes('0%'), 'Initial CTA must be 参加活动 (真实 0%)');
  assert.equal(initTickets, '0', 'Initial tickets must be 0 before joining');

  // Check 2: Click to Join Activity
  console.log('--- TEST 2: Join Activity at 0% ---');
  await cdp.eval('document.getElementById("btnMainSpin").click()');
  await wait(200);

  const afterJoinPct = await cdp.eval('document.getElementById("phoneProgressPct").textContent.trim()');
  const afterJoinBtn = await cdp.eval('document.getElementById("btnMainSpin").textContent.trim()');
  const afterJoinTickets = await cdp.eval('document.getElementById("phoneTicketCount").textContent.trim()');
  console.log(`After Join: progress=${afterJoinPct}, button="${afterJoinBtn}", tickets=${afterJoinTickets}`);
  assert.equal(afterJoinPct, '0.00%', 'Progress immediately after joining remains 0.00%');
  assert.ok(afterJoinBtn.includes('转一次'), 'After joining, button changes to 转一次');
  assert.equal(afterJoinTickets, '1', 'Initial daily free ticket granted (tickets=1)');

  // Check 3: Turn on Reduced Motion and Click to Spin Once (First Spin)
  console.log('--- TEST 3: First Spin (0% -> 90%) ---');
  await cdp.eval('document.getElementById("motionToggleBtn").click()'); // Switch to reduced motion for instant test
  await wait(100);

  await cdp.eval('document.getElementById("btnMainSpin").click()');
  await wait(800); // Wait for wheel rotation and result presentation

  const afterFirstSpinPct = await cdp.eval('document.getElementById("phoneProgressPct").textContent.trim()');
  const modalActive = await cdp.eval('document.getElementById("hypeModalOverlay").classList.contains("active")');
  const modalPunch = await cdp.eval('document.getElementById("hypePunchline").textContent.trim()');
  console.log(`After First Spin: progress=${afterFirstSpinPct}, modalActive=${modalActive}, punchline="${modalPunch}"`);
  assert.equal(afterFirstSpinPct, '90.00%', 'First spin must advance progress to exactly 90.00%');
  assert.equal(modalActive, true, 'Prize hype modal must open after spin');
  assert.ok(modalPunch.includes('进度大幅提升'), 'Punchline should highlight 进度大幅提升');

  // Close modal
  await cdp.eval('document.getElementById("hypeConfirmBtn").click()');
  await wait(200);

  // Check 4: Simulator Acceptance Case 1
  // 7 free + 5 tasks + 0 friends → 12 tickets → completes at 100% on standard T
  console.log('--- TEST 4: Simulator Acceptance Case 1 (12 tickets -> 100% Complete) ---');
  await cdp.eval('document.getElementById("btnPresetA").click()');
  await wait(200);

  const simOutTicketsA = await cdp.eval('document.getElementById("simOutTickets").textContent.trim()');
  const simOutProgressA = await cdp.eval('document.getElementById("simOutProgress").textContent.trim()');
  const simOutCompleteA = await cdp.eval('document.getElementById("simOutComplete").textContent.trim()');
  const simOutFinishPrizeA = await cdp.eval('document.getElementById("simOutFinishPrize").textContent.trim()');
  console.log(`Preset A: tickets=${simOutTicketsA}, progress=${simOutProgressA}, complete="${simOutCompleteA}", finishPrize="${simOutFinishPrizeA}"`);
  assert.equal(simOutTicketsA, '12 次', 'Preset A total tickets must be 12 次');
  assert.equal(simOutProgressA, '100.00%', 'Preset A final progress must be 100.00%');
  assert.ok(simOutCompleteA.includes('已完成') && simOutCompleteA.includes('100%'), 'Preset A must show 已完成 (100%)');
  assert.ok(simOutFinishPrizeA.includes('5.00') && simOutFinishPrizeA.includes('现金'), 'Preset A finish prize must be 5.00 现金');

  // Check 5: Simulator Acceptance Case 2
  // 3 free + 2 tasks + 0 friends → 5 tickets → not complete; show final % < 100, no finish prize
  console.log('--- TEST 5: Simulator Acceptance Case 2 (5 tickets -> 95.57% Not Complete) ---');
  await cdp.eval('document.getElementById("btnPresetB").click()');
  await wait(200);

  const simOutTicketsB = await cdp.eval('document.getElementById("simOutTickets").textContent.trim()');
  const simOutProgressB = await cdp.eval('document.getElementById("simOutProgress").textContent.trim()');
  const simOutCompleteB = await cdp.eval('document.getElementById("simOutComplete").textContent.trim()');
  const simOutFinishPrizeB = await cdp.eval('document.getElementById("simOutFinishPrize").textContent.trim()');
  console.log(`Preset B: tickets=${simOutTicketsB}, progress=${simOutProgressB}, complete="${simOutCompleteB}", finishPrize="${simOutFinishPrizeB}"`);
  assert.equal(simOutTicketsB, '5 次', 'Preset B total tickets must be 5 次');
  assert.equal(simOutProgressB, '95.57%', 'Preset B final progress must be 95.57%');
  assert.ok(simOutCompleteB.includes('未完成'), 'Preset B must show 未完成');
  assert.ok(simOutFinishPrizeB.includes('未解锁'), 'Preset B finish prize must be 未解锁');

  // Check 6: Sync Supply to Phone & Auto Play to 100% Completion
  console.log('--- TEST 6: Auto Play to 100% Completion ---');
  await cdp.eval('document.getElementById("btnPresetA").click()'); // 12 tickets
  await wait(100);
  await cdp.eval('document.getElementById("btnSimSync").click()'); // Sync 12 tickets to phone
  await wait(200);

  const syncedTickets = await cdp.eval('document.getElementById("phoneTicketCount").textContent.trim()');
  console.log(`Synced Tickets to phone: ${syncedTickets}`);

  // Auto spin until completion
  console.log('Auto spinning...');
  for (let s = 0; s < 15; s++) {
    const isCompleted = await cdp.eval('window.LuckyJourneyPlayer.MockServer.play.status === "completed"');
    if (isCompleted) break;
    const avail = await cdp.eval('window.LuckyJourneyPlayer.MockServer.play.ticketsAvailable');
    if (avail <= 0) break;
    await cdp.eval('window.LuckyJourneyPlayer.executeSpin()');
    await wait(350);
    await cdp.eval('window.LuckyJourneyPlayer.closeHypeModal()');
    await wait(100);
  }

  const finalProgress = await cdp.eval('document.getElementById("phoneProgressPct").textContent.trim()');
  const finalBtnText = await cdp.eval('document.getElementById("btnMainSpin").textContent.trim()');
  const finalCash = await cdp.eval('document.getElementById("walletCashVal").textContent.trim()');
  console.log(`Final Run: progress=${finalProgress}, button="${finalBtnText}", cashWallet="${finalCash}"`);
  assert.equal(finalProgress, '100.00%', 'Final progress on phone must reach 100.00%');
  assert.ok(finalBtnText.includes('本局已完成'), 'Button should be locked and state 本局已完成');

  console.log('ALL HEADLESS EDGE CDP VERIFICATIONS PASSED SUCCESSFULLY!');
  try {
    await cdp.send('Browser.close');
    cdp.ws.close();
  } catch (e) {}
  await wait(300);
  process.exit(0);
}

run().catch((err) => {
  console.error('Test failed with error:', err);
  cleanup();
  process.exit(1);
});
