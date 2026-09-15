/**
 * Lucky Journey (好运探索季) V3 - Player Frontend & Prototype Simulator
 *
 * PROTOTYPE MOCK NOTICE:
 * In production, the browser MUST POST /spin(requestId) to a real backend server,
 * which will execute the atomic database transaction, save the SpinRecord,
 * and return the saved record. The frontend MUST ONLY animate the returned record.
 * The client MUST NEVER generate prizes or compute progress locally in production.
 */

(function () {
  'use strict';

  if (!window.LuckyJourneyEngine) {
    console.error('LuckyJourneyEngine not found. Make sure engine.js is loaded first.');
    return;
  }

  var engine = window.LuckyJourneyEngine;
  var cfg = JSON.parse(JSON.stringify(engine.DEFAULT_CONFIG));

  // =========================================================================
  // 1. In-Page Mock Server (Using LuckyJourneyEngine)
  // =========================================================================

  var MockServer = {
    // Current server-side play state for the prototype session
    play: {
      playId: 'play_v3_' + Date.now(),
      status: 'unjoined', // 'unjoined' | 'active' | 'completed'
      cohortId: 'standard',
      effectiveTargetSpins: 12,
      upgradeAddPct: 0,
      ticketsAvailable: 0,
      spinIndex: 0,
      progressBp: 0, // 0..10000
      finishPrizePosted: false,
      rewards: {
        cash: 0,
        credit: 0,
        point: 0,
        finishPrize: 0
      },
      sources: {
        freeDaysClaimed: 0,
        tasksCompleted: [false, false, false, false, false],
        friendAssists: 0
      },
      records: []
    },

    resetPlay: function (cohortId) {
      var cId = cohortId || this.play.cohortId || 'standard';
      var cohort = cfg.cohorts.find(function (c) { return c.id === cId; }) || cfg.cohorts[0];
      this.play = {
        playId: 'play_v3_' + Date.now(),
        status: 'unjoined',
        cohortId: cohort.id,
        effectiveTargetSpins: cohort.targetSpins,
        upgradeAddPct: cohort.upgradeAddPct || 0,
        ticketsAvailable: 0,
        spinIndex: 0,
        progressBp: 0,
        finishPrizePosted: false,
        rewards: { cash: 0, credit: 0, point: 0, finishPrize: 0 },
        sources: {
          freeDaysClaimed: 0,
          tasksCompleted: [false, false, false, false, false],
          friendAssists: 0
        },
        records: []
      };
      return this.play;
    },

    joinPlay: function () {
      if (this.play.status !== 'unjoined') return this.play;
      this.play.status = 'active';
      this.play.progressBp = 0; // Starts at strictly 0%
      // Grant initial 1 daily free ticket upon joining
      if (this.play.sources.freeDaysClaimed === 0) {
        this.play.sources.freeDaysClaimed = 1;
        this.play.ticketsAvailable += 1;
      }
      return this.play;
    },

    grantTickets: function (type, qty) {
      if (this.play.status === 'unjoined') {
        this.joinPlay();
      }
      if (this.play.status === 'completed') {
        return { success: false, msg: '本局已结束' };
      }
      this.play.ticketsAvailable += qty;
      return { success: true, tickets: this.play.ticketsAvailable };
    },

    /**
     * Mock POST /spin(requestId) API endpoint
     */
    spin: function (requestId) {
      var play = this.play;

      if (play.status !== 'active') {
        return { error: '活动尚未参加或已结束' };
      }
      if (play.ticketsAvailable < 1) {
        return { error: '抽奖次数不足' };
      }
      if (play.spinIndex >= play.effectiveTargetSpins || play.progressBp >= 10000) {
        return { error: '本局已完成全部探索' };
      }

      var k = play.spinIndex + 1;
      var T = play.effectiveTargetSpins;
      var phase = engine.phaseOf(k, T, cfg.phaseShares);

      // Deterministic progress calculation
      var progressBeforeBp = play.progressBp;
      var progressAfterPct = engine.progressAt(k, T, cfg.firstSpinPct, cfg.curveGamma);
      var progressAfterBp = Math.round(progressAfterPct * 100);
      if (k >= T) progressAfterBp = 10000;
      var gainBp = Math.max(0, progressAfterBp - progressBeforeBp);

      // Server-side prize draw
      var prize = engine.drawMockPrize(cfg, phase);

      // Apply cohort upgradeAddPct bonus if standard RNG didn't upgrade
      if (!prize.upgraded && play.upgradeAddPct > 0 && prize.type !== 'none') {
        if (Math.random() * 100 < play.upgradeAddPct) {
          // Trigger upgrade
          if (phase === 'fast') {
            prize = { type: 'cash', amount: Math.max.apply(Math, cfg.prize.fast.amounts), label: '现金 ' + Math.max.apply(Math, cfg.prize.fast.amounts), upgraded: true, size: 'big' };
          } else if (phase === 'mid') {
            prize = { type: 'cash', amount: cfg.prize.fast.amounts[1], label: '现金 ' + cfg.prize.fast.amounts[1], upgraded: true, size: 'mid' };
          } else {
            prize = { type: 'credit', amount: cfg.prize.mid.amounts[1], label: '积分 ' + cfg.prize.mid.amounts[1], upgraded: true, size: 'mid' };
          }
        }
      }

      // Check completion
      var completed = (k >= T || progressAfterBp >= 10000);
      var finishPrizeAmount = 0;
      if (completed && !play.finishPrizePosted) {
        finishPrizeAmount = cfg.prize.finishPrize;
        play.finishPrizePosted = true;
        play.rewards.finishPrize = finishPrizeAmount;
        play.rewards.cash += finishPrizeAmount;
        play.status = 'completed';
      }

      // Decrement ticket & update state
      play.ticketsAvailable -= 1;
      play.spinIndex = k;
      play.progressBp = progressAfterBp;

      // Credit winnings
      if (prize.type === 'cash') play.rewards.cash += prize.amount;
      else if (prize.type === 'credit') play.rewards.credit += prize.amount;
      else if (prize.type === 'point') play.rewards.point += prize.amount;

      var record = {
        spinId: 'spin_' + Date.now() + '_' + k,
        requestId: requestId,
        k: k,
        phase: phase,
        progressBeforeBp: progressBeforeBp,
        progressAfterBp: progressAfterBp,
        progressBeforePct: Number((progressBeforeBp / 100).toFixed(2)),
        progressAfterPct: Number((progressAfterBp / 100).toFixed(2)),
        gainBp: gainBp,
        gainPct: Number((gainBp / 100).toFixed(2)),
        prize: prize,
        completed: completed,
        finishPrizeAmount: finishPrizeAmount
      };

      play.records.push(record);
      return { success: true, record: record, play: play };
    }
  };

  // =========================================================================
  // 2. Wheel & Compass Sector Definitions (8 equal sectors, 45° each)
  // =========================================================================

  var SECTORS = [
    { index: 0, type: 'cash', label: '现金', icon: '💰', centerAngle: 22.5 },
    { index: 1, type: 'none', label: '谢谢参与', icon: '🎁', centerAngle: 67.5 },
    { index: 2, type: 'credit', label: '活动积分', icon: '💎', centerAngle: 112.5 },
    { index: 3, type: 'none', label: '谢谢参与', icon: '🎁', centerAngle: 157.5 },
    { index: 4, type: 'point', label: '活动点数', icon: '⭐', centerAngle: 202.5 },
    { index: 5, type: 'cash', label: '现金', icon: '💰', centerAngle: 247.5 },
    { index: 6, type: 'credit', label: '活动积分', icon: '💎', centerAngle: 292.5 },
    { index: 7, type: 'none', label: '谢谢参与', icon: '🎁', centerAngle: 337.5 }
  ];

  var currentWheelAngle = 0;
  var isSpinning = false;
  var isAutoPlaying = false;
  var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 3. Canvas Particle Burst System (Hype Hit Effect)
  // =========================================================================

  var canvas = document.getElementById('particleCanvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var animFrameId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function spawnParticles(type, x, y) {
    if (isReducedMotion || !ctx) return;
    var count = type === 'finish' ? 120 : type === 'cash' ? 70 : 45;
    var colors = {
      cash: ['#f5b041', '#f39c12', '#ffd166', '#fff'],
      credit: ['#af7ac5', '#9b59b6', '#d2b4de', '#fff'],
      point: ['#48c9b0', '#1abc9c', '#a3e4d7', '#fff'],
      finish: ['#ffd166', '#f39c12', '#2ecc71', '#e74c3c', '#fff']
    }[type] || ['#ffd166', '#fff'];

    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 8 + 2;
      particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015
      });
    }

    if (!animFrameId) renderParticles();
  }

  function renderParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(renderParticles);
    } else {
      animFrameId = null;
    }
  }

  // =========================================================================
  // 4. UI Toast & Audio/Hype Triggers
  // =========================================================================

  function showToast(msg) {
    var toast = document.getElementById('phoneToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  // =========================================================================
  // 5. Phone View Controller
  // =========================================================================

  function updatePhoneView() {
    var play = MockServer.play;
    var progressPct = (play.progressBp / 100).toFixed(2);

    // 1. Progress Display
    var fillEl = document.getElementById('phoneProgressFill');
    var pctEl = document.getElementById('phoneProgressPct');
    var hintEl = document.getElementById('phoneProgressHint');

    if (fillEl) fillEl.style.width = progressPct + '%';
    if (pctEl) pctEl.textContent = progressPct + '%';

    if (hintEl) {
      if (play.status === 'unjoined') {
        hintEl.textContent = '开始探索，第一次转动会大幅推进进度。';
      } else if (play.progressBp === 0) {
        hintEl.textContent = '开始探索，第一次转动会大幅推进进度。';
      } else if (play.progressBp >= 10000) {
        hintEl.textContent = '探索完成！终点奖励已发放。';
      } else if (play.progressBp >= 9800) {
        hintEl.textContent = '已经非常接近终点，继续完成活动任务获取抽奖次数。';
      } else if (play.spinIndex === 1) {
        hintEl.textContent = '进度大幅提升！继续获取抽奖次数推进探索。';
      } else {
        hintEl.textContent = '已完成 ' + progressPct + '%，继续获取抽奖次数推进探索。';
      }
    }

    // 2. Ticket Count Pill
    var ticketCountEl = document.getElementById('phoneTicketCount');
    if (ticketCountEl) ticketCountEl.textContent = play.ticketsAvailable;

    // 3. Main Action Button
    var spinBtn = document.getElementById('btnMainSpin');
    if (spinBtn) {
      if (play.status === 'unjoined') {
        spinBtn.textContent = '🌟 参加活动 (真实 0%)';
        spinBtn.disabled = false;
        spinBtn.classList.remove('is-completed');
      } else if (play.status === 'completed') {
        spinBtn.textContent = '🏆 本局已完成 (终点大奖已发放)';
        spinBtn.disabled = true;
        spinBtn.classList.add('is-completed');
      } else if (play.ticketsAvailable > 0) {
        spinBtn.textContent = '🎯 转一次 (消耗 1 次)';
        spinBtn.disabled = isSpinning;
        spinBtn.classList.remove('is-completed');
      } else {
        spinBtn.textContent = '获取抽奖次数';
        spinBtn.disabled = false;
        spinBtn.classList.remove('is-completed');
      }
    }

    // 4. Wallet Balances
    var cashEl = document.getElementById('walletCashVal');
    var creditEl = document.getElementById('walletCreditVal');
    var pointEl = document.getElementById('walletPointVal');
    if (cashEl) cashEl.textContent = '¥' + play.rewards.cash.toFixed(2);
    if (creditEl) creditEl.textContent = play.rewards.credit;
    if (pointEl) pointEl.textContent = play.rewards.point;

    // 5. Source Buttons States
    var freeBtn = document.getElementById('btnDailyFree');
    if (freeBtn) {
      if (play.sources.freeDaysClaimed >= 1) {
        freeBtn.textContent = '今日已领 (1/1)';
        freeBtn.disabled = true;
        freeBtn.classList.add('done');
      } else {
        freeBtn.textContent = '免费领取 (+1 次)';
        freeBtn.disabled = false;
        freeBtn.classList.remove('done');
      }
    }

    // Tasks Status
    for (var i = 0; i < 5; i++) {
      var taskBtn = document.getElementById('btnTask_' + i);
      if (taskBtn) {
        if (play.sources.tasksCompleted[i]) {
          taskBtn.textContent = '已完成';
          taskBtn.disabled = true;
          taskBtn.classList.add('done');
        } else {
          taskBtn.textContent = '模拟完成 (+1 次)';
          taskBtn.disabled = play.status === 'completed';
          taskBtn.classList.remove('done');
        }
      }
    }

    // Assist Status
    var assistCountEl = document.getElementById('assistFriendCount');
    var assistBtn = document.getElementById('btnFriendAssist');
    if (assistCountEl) assistCountEl.textContent = play.sources.friendAssists + '/5';
    if (assistBtn) {
      if (play.sources.friendAssists >= 5) {
        assistBtn.textContent = '已达上限 (5/5)';
        assistBtn.disabled = true;
        assistBtn.classList.add('done');
      } else {
        assistBtn.textContent = '邀请好友助力 (+1 次)';
        assistBtn.disabled = play.status === 'completed';
        assistBtn.classList.remove('done');
      }
    }
  }

  // =========================================================================
  // 6. Wheel Animation & Spin Execution
  // =========================================================================

  function executeSpin() {
    if (isSpinning) return;
    var play = MockServer.play;

    if (play.status === 'unjoined') {
      MockServer.joinPlay();
      updatePhoneView();
      showToast('🎉 成功参加活动！获得 1 次免费探索机会');
      return;
    }

    if (play.status === 'completed') {
      showToast('本局已完成全部探索！');
      return;
    }

    if (play.ticketsAvailable < 1) {
      showToast('抽奖次数不足，请通过下方任务或好友助力获取！');
      var tasksCard = document.getElementById('ticketTasksCard');
      if (tasksCard) tasksCard.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    isSpinning = true;
    updatePhoneView();

    // 1. Mock Server API call
    var requestId = 'req_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    var res = MockServer.spin(requestId);
    if (!res.success) {
      isSpinning = false;
      showToast(res.error || '开奖失败');
      updatePhoneView();
      return;
    }

    var record = res.record;

    // 2. Select Sector to Land On
    var candidates = SECTORS.filter(function (s) { return s.type === record.prize.type; });
    var targetSector = candidates[Math.floor(Math.random() * candidates.length)] || SECTORS[0];

    // Compute wheel rotation so target sector center is at the top pointer (0°)
    var baseOffset = (360 - targetSector.centerAngle) % 360;
    var currentMod = currentWheelAngle % 360;
    var diff = (baseOffset - currentMod + 360) % 360;
    var numTurns = isReducedMotion ? 1 : 6;
    currentWheelAngle += (numTurns * 360) + diff;

    var disc = document.getElementById('compassDisc');
    if (disc) {
      disc.style.transform = 'rotate(' + currentWheelAngle + 'deg)';
    }

    // 3. Wait for wheel animation to stop, then present hype & prize
    var animDuration = isReducedMotion ? 250 : 3600;

    setTimeout(function () {
      isSpinning = false;
      updatePhoneView();

      // Hype Presentation
      presentSpinResult(record);

      // Trigger simulator sync
      updateSimulatorOutputs();
    }, animDuration);
  }

  // =========================================================================
  // 7. Prize Hype Presentation (Strong Hit vs Soft Miss)
  // =========================================================================

  function presentSpinResult(record) {
    var modal = document.getElementById('hypeModalOverlay');
    var card = document.getElementById('hypeCard');
    var stamp = document.getElementById('hypeStamp');
    var prizeDisp = document.getElementById('hypePrizeDisplay');
    var punchEl = document.getElementById('hypePunchline');
    var deltaEl = document.getElementById('hypeProgressDelta');
    var confirmBtn = document.getElementById('hypeConfirmBtn');

    if (!modal || !card) return;

    // Clear previous classes
    card.className = 'hype-card';
    stamp.className = 'hype-stamp';

    var prize = record.prize;
    var isFirstSpin = (record.k === 1);
    var isCompleted = record.completed;

    if (isCompleted) {
      // 100% Grand Finale Celebration
      card.classList.add('completed');
      stamp.classList.add('finish');
      stamp.textContent = '探索大圆满';
      prizeDisp.textContent = '🎉 达成 100% 终点！';
      punchEl.textContent = '恭喜探索圆满完成！已发放终点大奖 ¥' + cfg.prize.finishPrize.toFixed(2) + ' 现金！';
      deltaEl.textContent = '最终进度：100.00% · 本局已结束';
      confirmBtn.textContent = '开启下一轮 (重新从 0% 开始)';
      confirmBtn.onclick = function () {
        closeHypeModal();
        MockServer.resetPlay();
        updatePhoneView();
        updateSimulatorOutputs();
        showToast('已重置，下一轮探索开始！');
      };
      spawnParticles('finish');
    } else if (prize.type === 'none') {
      // 谢谢参与: Softer miss, honest, progress still advances!
      card.classList.add('thanks');
      stamp.classList.add('thanks');
      stamp.textContent = '谢谢参与';
      prizeDisp.textContent = '谢谢参与';
      if (isFirstSpin) {
        punchEl.textContent = '首发大捷！进度大幅提升至 ' + record.progressAfterPct + '%！虽未中额外奖品，但探索进度仍在继续向前推进！';
      } else {
        punchEl.textContent = '虽未中额外奖品，但探索进度仍在继续向前推进！';
      }
      deltaEl.textContent = '本转进度提升 +' + record.gainPct + '% (当前 ' + record.progressAfterPct + '%)';
      confirmBtn.textContent = '继续探索';
      confirmBtn.onclick = closeHypeModal;
    } else {
      // Cash / Credit / Point: Strong Hype Hit!
      var typeClass = prize.type; // 'cash' | 'credit' | 'point'
      card.classList.add(typeClass);
      stamp.classList.add(typeClass);

      var hitTitle = prize.type === 'cash' ? '命中现金！' : prize.type === 'credit' ? '获得积分！' : '获得点数！';
      if (prize.upgraded) hitTitle = '⚡ 越级暴击！' + hitTitle;
      stamp.textContent = hitTitle;

      prizeDisp.textContent = prize.label;

      if (isFirstSpin) {
        punchEl.textContent = '首发大捷！进度大幅提升至 ' + record.progressAfterPct + '%！';
      } else if (prize.upgraded) {
        punchEl.textContent = '触发阶段加成！越级斩获丰厚奖励！已存入活动账户！';
      } else {
        punchEl.textContent = '好运连连！奖励已存入活动钱包，探索继续推进！';
      }

      deltaEl.textContent = '本转进度提升 +' + record.gainPct + '% (当前 ' + record.progressAfterPct + '%)';
      confirmBtn.textContent = '开心收下';
      confirmBtn.onclick = closeHypeModal;

      spawnParticles(typeClass);
    }

    modal.classList.add('active');
  }

  function closeHypeModal() {
    var modal = document.getElementById('hypeModalOverlay');
    if (modal) modal.classList.remove('active');
  }

  // =========================================================================
  // 8. Prototype Simulator Controller (Ops / Dev Only)
  // =========================================================================

  function getSimulatorInputs() {
    var freeInput = document.getElementById('simSliderFree');
    var taskInput = document.getElementById('simSliderTask');
    var assistInput = document.getElementById('simSliderAssist');

    var freeDays = parseInt(freeInput ? freeInput.value : 7, 10) || 0;
    var taskCount = parseInt(taskInput ? taskInput.value : 5, 10) || 0;
    var assistCount = parseInt(assistInput ? assistInput.value : 0, 10) || 0;

    return {
      freeDays: Math.min(freeDays, cfg.sources.free.cap),
      taskCount: Math.min(taskCount, cfg.sources.task.cap),
      assistCount: Math.min(assistCount, cfg.sources.assist.friendCap)
    };
  }

  function updateSimulatorOutputs() {
    var inputs = getSimulatorInputs();
    var currentCohortId = MockServer.play.cohortId || 'standard';
    var cohort = cfg.cohorts.find(function (c) { return c.id === currentCohortId; }) || cfg.cohorts[0];
    var T = cohort.targetSpins;

    // Display slider values
    var valFree = document.getElementById('simValFree');
    var valTask = document.getElementById('simValTask');
    var valAssist = document.getElementById('simValAssist');
    if (valFree) valFree.textContent = inputs.freeDays + ' 天 (' + inputs.freeDays + ' 次)';
    if (valTask) valTask.textContent = inputs.taskCount + ' 项 (' + inputs.taskCount + ' 次)';
    if (valAssist) valAssist.textContent = inputs.assistCount + ' 人 (' + inputs.assistCount + ' 次)';

    // Total tickets from this supply
    var totalTickets = inputs.freeDays + inputs.taskCount + inputs.assistCount;

    // Calculate final % if all totalTickets are played
    var simulatedFinalPct = engine.progressAt(totalTickets, T, cfg.firstSpinPct, cfg.curveGamma);
    var isComplete = (totalTickets >= T || simulatedFinalPct >= 100);

    // Calculate expected cash equivalent across spins up to totalTickets
    var effectiveSpins = Math.min(totalTickets, T);
    var evSum = 0;
    var counts = { fast: 0, mid: 0, fine: 0 };
    for (var k = 1; k <= effectiveSpins; k++) {
      var ph = engine.phaseOf(k, T, cfg.phaseShares);
      counts[ph] += 1;
      var stat = engine.phasePrizeStats(cfg, ph);
      evSum += stat.ev;
    }
    if (isComplete) {
      evSum += cfg.prize.finishPrize;
    }

    // Expected credit & point calculations
    var w = cfg.prize.sizeWeights;
    var wTotal = w.reduce(function (a, b) { return a + b; }, 0) || 1;
    var midMeanCredit = cfg.prize.mid.amounts.reduce(function (s, v, i) { return s + v * w[i]; }, 0) / wTotal;
    var fineMeanPoint = cfg.prize.fine.amounts.reduce(function (s, v, i) { return s + v * w[i]; }, 0) / wTotal;
    var midNativePct = Math.max(0, 100 - cfg.prize.mid.thanksPct - cfg.prize.mid.upgradePct);
    var fineNativePct = Math.max(0, 100 - cfg.prize.fine.thanksPct - cfg.prize.fine.upgradePct);
    var fineUpgradePct = cfg.prize.fine.upgradePct;

    var creditExp = Math.round(counts.mid * (midNativePct / 100 * midMeanCredit) + counts.fine * (fineUpgradePct / 100 * midMeanCredit));
    var pointExp = Math.round(counts.fine * (fineNativePct / 100 * fineMeanPoint));

    // Update Simulator Output elements
    var outTickets = document.getElementById('simOutTickets');
    var outProgress = document.getElementById('simOutProgress');
    var outComplete = document.getElementById('simOutComplete');
    var outFinishPrize = document.getElementById('simOutFinishPrize');
    var outEv = document.getElementById('simOutEv');
    var outCredit = document.getElementById('simOutCredit');
    var outPoint = document.getElementById('simOutPoint');
    var outPhaseDist = document.getElementById('simOutPhaseDist');

    if (outTickets) outTickets.textContent = totalTickets + ' 次';
    if (outProgress) outProgress.textContent = simulatedFinalPct.toFixed(2) + '%';

    var completeBox = document.getElementById('metricBoxComplete');
    if (outComplete && completeBox) {
      if (isComplete) {
        outComplete.textContent = '✅ 已完成 (100%)';
        completeBox.className = 'metric-box status-pass';
      } else {
        outComplete.textContent = '❌ 未完成 (' + simulatedFinalPct.toFixed(1) + '%)';
        completeBox.className = 'metric-box status-fail';
      }
    }

    if (outFinishPrize) {
      outFinishPrize.textContent = isComplete ? '¥' + cfg.prize.finishPrize.toFixed(2) + ' 现金' : '未解锁 (¥0.00)';
    }
    if (outEv) {
      outEv.textContent = '¥' + evSum.toFixed(2);
    }
    if (outCredit) {
      outCredit.textContent = creditExp + ' 分';
    }
    if (outPoint) {
      outPoint.textContent = pointExp.toLocaleString() + ' 点';
    }
    if (outPhaseDist) {
      outPhaseDist.textContent = counts.fast + '快 / ' + counts.mid + '中 / ' + counts.fine + '细';
    }
  }

  function setSimulatorPreset(free, tasks, assists) {
    var freeInput = document.getElementById('simSliderFree');
    var taskInput = document.getElementById('simSliderTask');
    var assistInput = document.getElementById('simSliderAssist');

    if (freeInput) freeInput.value = free;
    if (taskInput) taskInput.value = tasks;
    if (assistInput) assistInput.value = assists;

    updateSimulatorOutputs();
  }

  function syncSupplyToPhone() {
    var inputs = getSimulatorInputs();
    var play = MockServer.play;

    if (play.status === 'unjoined') {
      MockServer.joinPlay();
    }

    play.sources.freeDaysClaimed = inputs.freeDays;
    for (var i = 0; i < 5; i++) {
      play.sources.tasksCompleted[i] = (i < inputs.taskCount);
    }
    play.sources.friendAssists = inputs.assistCount;

    // Remaining tickets = total supplied - already used
    var totalSupplied = inputs.freeDays + inputs.taskCount + inputs.assistCount;
    play.ticketsAvailable = Math.max(0, totalSupplied - play.spinIndex);

    updatePhoneView();
    showToast('已同步供给：当前可用 ' + play.ticketsAvailable + ' 次抽奖');
  }

  function autoPlayWithSupply() {
    if (isAutoPlaying || isSpinning) return;
    isAutoPlaying = true;

    syncSupplyToPhone();
    var play = MockServer.play;

    function step() {
      if (play.status === 'completed' || play.ticketsAvailable <= 0) {
        isAutoPlaying = false;
        showToast('自动转动完成！');
        return;
      }

      // Trigger one spin with fast turnaround
      executeSpin();

      // Auto close hype modal after brief display during auto play
      setTimeout(function () {
        closeHypeModal();
        if (isAutoPlaying && play.ticketsAvailable > 0 && play.status !== 'completed') {
          setTimeout(step, 400);
        } else {
          isAutoPlaying = false;
        }
      }, isReducedMotion ? 400 : 3800);
    }

    step();
  }

  // =========================================================================
  // 9. Event Listeners & Initialization
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    // Topbar & Nav actions
    var resetBtn = document.getElementById('topbarResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        MockServer.resetPlay();
        updatePhoneView();
        updateSimulatorOutputs();
        showToast('前台与模拟器状态已全部重置！');
      });
    }

    var motionToggle = document.getElementById('motionToggleBtn');
    if (motionToggle) {
      motionToggle.addEventListener('click', function () {
        isReducedMotion = !isReducedMotion;
        document.body.classList.toggle('reduced-motion', isReducedMotion);
        motionToggle.textContent = isReducedMotion ? '⚡ 动效已极速' : '🎬 动效正常';
        showToast(isReducedMotion ? '已开启极速动效模式' : '已恢复标准转盘动效');
      });
    }

    // Phone Main Action Button
    var spinBtn = document.getElementById('btnMainSpin');
    if (spinBtn) {
      spinBtn.addEventListener('click', function () {
        executeSpin();
      });
    }

    // Modal close on overlay click
    var modalOverlay = document.getElementById('hypeModalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeHypeModal();
      });
    }

    // Ticket Source Buttons
    var freeBtn = document.getElementById('btnDailyFree');
    if (freeBtn) {
      freeBtn.addEventListener('click', function () {
        if (MockServer.play.sources.freeDaysClaimed < 1) {
          MockServer.play.sources.freeDaysClaimed += 1;
          MockServer.grantTickets('free', 1);
          updatePhoneView();
          showToast('获得 +1 次抽奖次数 (每日免费)');
          updateSimulatorOutputs();
        }
      });
    }

    // Task Buttons
    for (var i = 0; i < 5; i++) {
      (function (taskIndex) {
        var btn = document.getElementById('btnTask_' + taskIndex);
        if (btn) {
          btn.addEventListener('click', function () {
            if (!MockServer.play.sources.tasksCompleted[taskIndex]) {
              MockServer.play.sources.tasksCompleted[taskIndex] = true;
              MockServer.grantTickets('task', 1);
              updatePhoneView();
              showToast('获得 +1 次抽奖次数 (任务完成)');
              updateSimulatorOutputs();
            }
          });
        }
      })(i);
    }

    // Assist Button
    var assistBtn = document.getElementById('btnFriendAssist');
    if (assistBtn) {
      assistBtn.addEventListener('click', function () {
        if (MockServer.play.sources.friendAssists < 5) {
          MockServer.play.sources.friendAssists += 1;
          MockServer.grantTickets('assist', 1);
          updatePhoneView();
          showToast('获得 +1 次抽奖次数 (好友助力)');
          updateSimulatorOutputs();
        }
      });
    }

    // Simulator Cohort Segment Buttons
    var cohortButtons = document.querySelectorAll('.cohort-btn');
    cohortButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        cohortButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cId = btn.getAttribute('data-cohort');
        MockServer.resetPlay(cId);
        updatePhoneView();
        updateSimulatorOutputs();

        var descEl = document.getElementById('simCohortDesc');
        if (descEl) {
          var cObj = cfg.cohorts.find(function (c) { return c.id === cId; });
          descEl.textContent = '当前层级目标转数 T = ' + cObj.targetSpins + '（注意：T 不在玩家手机端展示）';
        }
        showToast('已切换玩家层级：' + (cId === 'standard' ? '标准玩家 (T=12)' : cId === 'vip4_dep200' ? 'VIP4 (T=10)' : 'VIP7 (T=8)'));
      });
    });

    // Simulator Range Sliders
    ['simSliderFree', 'simSliderTask', 'simSliderAssist'].forEach(function (id) {
      var slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener('input', updateSimulatorOutputs);
      }
    });

    // Preset Buttons
    var presetA = document.getElementById('btnPresetA');
    if (presetA) presetA.addEventListener('click', function () { setSimulatorPreset(7, 5, 0); });

    var presetB = document.getElementById('btnPresetB');
    if (presetB) presetB.addEventListener('click', function () { setSimulatorPreset(3, 2, 0); });

    var presetC = document.getElementById('btnPresetC');
    if (presetC) presetC.addEventListener('click', function () { setSimulatorPreset(7, 5, 5); });

    // Simulator Action Buttons
    var btnSync = document.getElementById('btnSimSync');
    if (btnSync) btnSync.addEventListener('click', syncSupplyToPhone);

    var btnAuto = document.getElementById('btnSimAuto');
    if (btnAuto) btnAuto.addEventListener('click', autoPlayWithSupply);

    var btnReset = document.getElementById('btnSimReset');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        MockServer.resetPlay();
        updatePhoneView();
        updateSimulatorOutputs();
        showToast('前台已重置为真实 0% 未参加状态');
      });
    }

    // Initial render
    MockServer.resetPlay('standard');
    updatePhoneView();
    updateSimulatorOutputs();
  });

  // Expose for testing & dev console inspection
  window.LuckyJourneyPlayer = {
    MockServer: MockServer,
    executeSpin: executeSpin,
    closeHypeModal: closeHypeModal,
    updatePhoneView: updatePhoneView,
    updateSimulatorOutputs: updateSimulatorOutputs
  };

})();
