/**
 * Lucky Journey (好运探索季) V3 Engine
 * Non-module / UMD: works in browsers without type="module" (window.LuckyJourneyEngine)
 * and in Node.js via require / module.exports.
 *
 * Product source: docs/IMPROVED-BACKOFFICE.md, docs/IMPROVED-SPIN-ENGINE.md
 * Executable math ported from _v3-spec/src/engine.js
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LuckyJourneyEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_CONFIG = {
    personalDays: 7,
    firstSpinPct: 90,
    targetSpins: 12,
    curveGamma: 1.8,
    phaseShares: { fast: 40, mid: 35, fine: 25 },
    sources: {
      free: { enabled: true, ticketsPerDay: 1, days: 7, cap: 7, grantMode: 'auto_on_visit' },
      task: { enabled: true, ticketsPerTask: 1, taskCount: 5, cap: 5 },
      assist: { enabled: true, ticketsPerFriend: 1, friendCap: 5, cap: 5, depositRequired: false, allowPromotionDoubleReward: true }
    },
    tasks: [
      { id: 'play_cat', type: 'play_category', name: '游玩指定类型', category: 'slot', count: 5, enabled: true },
      { id: 'dep_c', type: 'deposit_count', name: '充值次数', count: 1, enabled: true },
      { id: 'dep_a', type: 'deposit_amount', name: '充值金额', amount: 100, enabled: true },
      { id: 'bet_c', type: 'bet_count', name: '下注次数', count: 10, enabled: true },
      { id: 'bet_a', type: 'bet_amount', name: '下注金额', amount: 50, enabled: true }
    ],
    prize: {
      sizeWeights: [60, 30, 10], // 小, 中, 大
      finishPrize: 5,
      fast: { thanksPct: 20, upgradePct: 8, amounts: [0.18, 0.5, 1] },
      mid: { thanksPct: 25, upgradePct: 10, amounts: [18, 50, 100] },
      fine: { thanksPct: 30, upgradePct: 8, amounts: [50, 100, 200] }
    },
    cohorts: [
      { id: 'standard', name: '标准玩家', enabled: true, vipMin: 1, depositMin: 0, targetSpins: 12, upgradeAddPct: 0, targetCompletionRate: 70 },
      { id: 'vip4_dep200', name: 'VIP4+ 且充值≥200', enabled: true, vipMin: 4, depositMin: 200, targetSpins: 10, upgradeAddPct: 2, targetCompletionRate: 85 },
      { id: 'vip7_dep2000', name: 'VIP7+ 且充值≥2000', enabled: true, vipMin: 7, depositMin: 2000, targetSpins: 8, upgradeAddPct: 5, targetCompletionRate: 95 }
    ],
    budget: {
      total: 50000,
      actualSpent: 0,
      maxParticipants: 800,
      joinMode: 'click', // click | auto
      afterEnd: 'finish' // finish | cut
    },
    nonSocialGuaranteed: true,
    assumptions: {
      dailyVisitProb: 0.90,
      taskCompletionProb: 0.90,
      assistLambda: 1.5
    }
  };

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function normalizePhaseShares(shares) {
    var raw = [Number(shares.fast) || 0, Number(shares.mid) || 0, Number(shares.fine) || 0];
    var total = raw.reduce(function (a, b) { return a + b; }, 0) || 1;
    var norm = raw.map(function (v) { return (v / total) * 100; });
    return { fast: norm[0], mid: norm[1], fine: norm[2] };
  }

  /**
   * Phase spins allocation via Hamilton (Largest Remainder) method.
   * Total allocated for post-first spins is exactly (targetSpins - 1).
   * Fast, mid, and fine each get at least 1 spin when targetSpins >= 4.
   */
  function allocatePhaseSpins(targetSpins, shares) {
    var T = Math.max(4, Math.floor(targetSpins));
    var rest = T - 1;
    var normalized = normalizePhaseShares(shares);
    var keys = ['fast', 'mid', 'fine'];
    var base = { fast: 1, mid: 1, fine: 1 };
    var remaining = rest - 3;
    if (remaining <= 0) return base;

    var quotas = keys.map(function (k) { return remaining * normalized[k] / 100; });
    var floors = quotas.map(Math.floor);
    keys.forEach(function (k, i) { base[k] += floors[i]; });

    var left = remaining - floors.reduce(function (a, b) { return a + b; }, 0);
    var order = quotas.map(function (q, i) {
      return { i: i, frac: q - floors[i] };
    }).sort(function (a, b) {
      return (b.frac - a.frac) || (a.i - b.i);
    });

    for (var j = 0; j < left; j++) {
      base[keys[order[j].i]] += 1;
    }
    return base;
  }

  /**
   * Identifies the phase for spin k (1-indexed).
   * k=1 is always fast.
   */
  function phaseOf(k, targetSpins, shares) {
    if (k <= 1) return 'fast';
    var n = allocatePhaseSpins(targetSpins, shares);
    if (k <= 1 + n.fast) return 'fast';
    if (k <= 1 + n.fast + n.mid) return 'mid';
    return 'fine';
  }

  /**
   * Deterministic progress curve function:
   * P(0) = 0
   * P(1) = F
   * P(T) = 100
   * for 1 < k < T:
   *   q = (k - 1) / (T - 1)
   *   P(k) = F + (100 - F) * (1 - (1 - q)^gamma)
   */
  function progressAt(k, targetSpins, firstSpinPct, gamma) {
    var T = Math.max(4, Math.floor(targetSpins));
    var F = clamp(Number(firstSpinPct), 50, 99);
    var g = clamp(Number(gamma), 1, 3);
    if (k <= 0) return 0;
    if (k === 1) return F;
    if (k >= T) return 100;
    var q = (k - 1) / (T - 1);
    var afterFirst = 1 - Math.pow(1 - q, g);
    return F + (100 - F) * afterFirst;
  }

  function progressCurve(targetSpins, firstSpinPct, gamma) {
    var T = Math.max(4, Math.floor(targetSpins));
    var curve = [];
    for (var k = 0; k <= T; k++) {
      curve.push(Number(progressAt(k, T, firstSpinPct, gamma).toFixed(4)));
    }
    return curve;
  }

  function progressGain(k, targetSpins, firstSpinPct, gamma) {
    return Number((progressAt(k, targetSpins, firstSpinPct, gamma) - progressAt(k - 1, targetSpins, firstSpinPct, gamma)).toFixed(4));
  }

  /**
   * Guaranteed and maximum ticket supply from configured sources.
   */
  function guaranteedTicketSupply(cfg) {
    var s = cfg.sources;
    var free = s.free.enabled ? Math.min(s.free.ticketsPerDay * (s.free.days || cfg.personalDays || 7), s.free.cap) : 0;
    var task = s.task.enabled ? Math.min(s.task.ticketsPerTask * (s.task.taskCount || 5), s.task.cap) : 0;
    var assist = s.assist.enabled ? Math.min(s.assist.ticketsPerFriend * s.assist.friendCap, s.assist.cap) : 0;
    return {
      free: free,
      task: task,
      assist: assist,
      nonSocial: free + task,
      all: free + task + assist
    };
  }

  function weightedMean(values, weights) {
    var total = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
    return values.reduce(function (sum, v, i) { return sum + v * weights[i]; }, 0) / total;
  }

  function cashEquivalent(type, amount) {
    if (type === 'cash') return amount;
    if (type === 'credit') return amount / 100;
    if (type === 'point') return amount / 10000;
    return 0;
  }

  /**
   * Phase statistics: nativePct, expected cash equivalent per spin, max cash equivalent.
   * Absolute odds: thanksPct + upgradePct + nativePct = 100%.
   */
  function phasePrizeStats(cfg, phase) {
    var p = cfg.prize[phase];
    var w = cfg.prize.sizeWeights;
    var nativeType = phase === 'fast' ? 'cash' : phase === 'mid' ? 'credit' : 'point';
    var nativeMean = cashEquivalent(nativeType, weightedMean(p.amounts, w));
    var upgradeMean;
    var upgradeMax;

    if (phase === 'fast') {
      // 快砍越级 = 本段大档现金
      upgradeMean = Math.max.apply(Math, p.amounts);
      upgradeMax = upgradeMean;
    } else if (phase === 'mid') {
      // 中段越级 = 快砍现金 (小/中/大权重)
      var fa = cfg.prize.fast.amounts;
      upgradeMean = weightedMean(fa, w);
      upgradeMax = Math.max.apply(Math, fa);
    } else {
      // 细砍越级 = 中段积分 (小/中/大权重)
      var ma = cfg.prize.mid.amounts;
      upgradeMean = cashEquivalent('credit', weightedMean(ma, w));
      upgradeMax = cashEquivalent('credit', Math.max.apply(Math, ma));
    }

    var nativeMax = cashEquivalent(nativeType, Math.max.apply(Math, p.amounts));
    var nativePct = Math.max(0, 100 - p.thanksPct - p.upgradePct);
    var ev = (nativePct / 100) * nativeMean + (p.upgradePct / 100) * upgradeMean;
    var max = Math.max(nativeMax, upgradeMax);

    return {
      nativePct: nativePct,
      ev: ev,
      max: max,
      nativeMean: nativeMean,
      upgradeMean: upgradeMean,
      nativeMax: nativeMax,
      upgradeMax: upgradeMax
    };
  }

  /**
   * Cost statistics for a single Play:
   * expected: finishPrize + sum(ev of each spin up to targetSpins)
   * hardReserve: finishPrize + sum(max cash equivalent of each spin up to targetSpins)
   * Note: uses effective T, not ticket cap!
   */
  function playCostStats(cfg, targetSpins) {
    var T = targetSpins || cfg.targetSpins;
    var expected = cfg.prize.finishPrize;
    var hardReserve = cfg.prize.finishPrize;
    var counts = { fast: 0, mid: 0, fine: 0 };

    for (var k = 1; k <= T; k++) {
      var phase = phaseOf(k, T, cfg.phaseShares);
      counts[phase] += 1;
      var stat = phasePrizeStats(cfg, phase);
      expected += stat.ev;
      hardReserve += stat.max;
    }

    return {
      expected: Number(expected.toFixed(4)),
      hardReserve: Number(hardReserve.toFixed(2)),
      counts: counts
    };
  }

  function poissonPmf(k, lambda) {
    var fact = 1;
    for (var i = 2; i <= k; i++) fact *= i;
    return Math.exp(-lambda) * Math.pow(lambda, k) / fact;
  }

  function addMass(dist, tickets, p) {
    var next = new Map();
    dist.forEach(function (prob, sum) {
      next.set(sum, (next.get(sum) || 0) + prob * (1 - p));
      next.set(sum + tickets, (next.get(sum + tickets) || 0) + prob * p);
    });
    return next;
  }

  /**
   * Operational completion probability estimate:
   * Discrete convolution across daily free visits, task milestones, and assist Poisson distribution.
   */
  function completionProbability(cfg, targetSpins) {
    var T = targetSpins || cfg.targetSpins;
    var a = cfg.assumptions;
    var dist = new Map([[0, 1]]);

    if (cfg.sources.free.enabled) {
      var freeDays = cfg.sources.free.days || cfg.personalDays || 7;
      for (var d = 0; d < freeDays; d++) {
        dist = addMass(dist, cfg.sources.free.ticketsPerDay, a.dailyVisitProb);
      }
    }

    if (cfg.sources.task.enabled) {
      var taskCount = cfg.sources.task.taskCount || 5;
      for (var i = 0; i < taskCount; i++) {
        dist = addMass(dist, cfg.sources.task.ticketsPerTask, a.taskCompletionProb);
      }
    }

    if (cfg.sources.assist.enabled) {
      var capFriends = cfg.sources.assist.friendCap || 5;
      var assistDist = new Map();
      var used = 0;
      for (var k = 0; k < capFriends; k++) {
        var p = poissonPmf(k, a.assistLambda);
        assistDist.set(k * cfg.sources.assist.ticketsPerFriend, p);
        used += p;
      }
      assistDist.set(capFriends * cfg.sources.assist.ticketsPerFriend, Math.max(0, 1 - used));

      var merged = new Map();
      dist.forEach(function (p1, base) {
        assistDist.forEach(function (p2, extra) {
          var cappedExtra = Math.min(extra, cfg.sources.assist.cap);
          var totalTickets = base + cappedExtra;
          merged.set(totalTickets, (merged.get(totalTickets) || 0) + p1 * p2);
        });
      });
      dist = merged;
    }

    var prob = 0;
    dist.forEach(function (pVal, tickets) {
      if (tickets >= T) prob += pVal;
    });

    return clamp(prob, 0, 1);
  }

  /**
   * Inverse helper: given a desired completion rate, suggests the best target spins T (4-30).
   */
  function suggestTargetSpins(cfg, desiredRate) {
    var desired = clamp(desiredRate, 0.01, 0.999);
    var best = 4;
    for (var t = 4; t <= 30; t++) {
      if (completionProbability(cfg, t) >= desired) best = t;
      else break;
    }
    return best;
  }

  /**
   * Prototype-only mock prize drawing (simulates server-side CSPRNG).
   * Production must replace this with a POST /spin server API response!
   */
  function drawMockPrize(cfg, phase, rng) {
    var r = rng || Math.random;
    var p = cfg.prize[phase];
    var u = r() * 100;
    if (u < p.thanksPct) {
      return { type: 'none', amount: 0, label: '谢谢参与', upgraded: false };
    }

    var upgrade = u < (p.thanksPct + p.upgradePct);
    var weights = cfg.prize.sizeWeights;
    var pickSize = function () {
      var x = r() * 100;
      if (x < weights[0]) return 0;
      if (x < weights[0] + weights[1]) return 1;
      return 2;
    };
    var i = pickSize();

    if (upgrade) {
      if (phase === 'fast') {
        var amountFast = Math.max.apply(Math, cfg.prize.fast.amounts);
        return { type: 'cash', amount: amountFast, label: '现金 ' + amountFast, upgraded: true, size: 'big' };
      }
      if (phase === 'mid') {
        var amountMid = cfg.prize.fast.amounts[i];
        return { type: 'cash', amount: amountMid, label: '现金 ' + amountMid, upgraded: true, size: i === 0 ? 'small' : i === 1 ? 'mid' : 'big' };
      }
      var amountFine = cfg.prize.mid.amounts[i];
      return { type: 'credit', amount: amountFine, label: '积分 ' + amountFine, upgraded: true, size: i === 0 ? 'small' : i === 1 ? 'mid' : 'big' };
    }

    var sizeName = i === 0 ? 'small' : i === 1 ? 'mid' : 'big';
    if (phase === 'fast') {
      return { type: 'cash', amount: p.amounts[i], label: '现金 ' + p.amounts[i], upgraded: false, size: sizeName };
    }
    if (phase === 'mid') {
      return { type: 'credit', amount: p.amounts[i], label: '积分 ' + p.amounts[i], upgraded: false, size: sizeName };
    }
    return { type: 'point', amount: p.amounts[i], label: '点数 ' + p.amounts[i], upgraded: false, size: sizeName };
  }

  /**
   * Evaluates Red / Yellow / Green publish checks from IMPROVED-BACKOFFICE §8.
   */
  function evaluatePublishStatus(cfg) {
    var red = [];
    var yellow = [];

    // 1. Sources check
    var supply = guaranteedTicketSupply(cfg);
    if (!cfg.sources.free.enabled && !cfg.sources.task.enabled && !cfg.sources.assist.enabled) {
      red.push('没有次数来源');
    }
    if (supply.all <= 0) {
      red.push('次数合计是 0');
    }

    // 2. Cohorts vs supply
    var activeCohorts = (cfg.cohorts || []).filter(function (c) { return c.enabled; });
    var maxEffectiveT = Math.max.apply(Math, [cfg.targetSpins].concat(activeCohorts.map(function (c) { return c.targetSpins; })));
    if (supply.all < maxEffectiveT) {
      red.push('次数最多 ' + supply.all + '，不够最高档转满 ' + maxEffectiveT);
    }

    // 3. Curve params
    if (cfg.firstSpinPct >= 100 || cfg.firstSpinPct < 50) {
      red.push('第一转要在 50%～99%');
    }
    if (cfg.targetSpins < 4) {
      red.push('转满次数不能少于 4');
    }
    activeCohorts.forEach(function (c) {
      if (c.targetSpins < 4) {
        red.push(c.name + ' 转满次数少于 4');
      }
    });

    // 4. Phase shares
    ['fast', 'mid', 'fine'].forEach(function (ph) {
      var p = cfg.prize[ph];
      if (p.thanksPct + p.upgradePct > 100) {
        red.push(ph + '：谢谢+越级超过 100');
      }
      p.amounts.forEach(function (a) {
        if (typeof a !== 'number' || isNaN(a) || a <= 0) {
          red.push(ph + ' 金额不对');
        }
      });
    });

    if (typeof cfg.prize.finishPrize !== 'number' || isNaN(cfg.prize.finishPrize) || cfg.prize.finishPrize < 0) {
      red.push('转满大奖金额不对');
    }

    // 5. Budget checks
    var costStats = playCostStats(cfg, cfg.targetSpins);
    var actualSpent = Number(cfg.budget.actualSpent) || 0;
    var totalBudget = Number(cfg.budget.total) || 0;

    if (totalBudget < (actualSpent + costStats.hardReserve)) {
      red.push('预算不够预留一人');
    }

    if (cfg.budget.joinMode === 'auto') {
      if (!cfg.budget.maxParticipants || (cfg.budget.maxParticipants * costStats.hardReserve > totalBudget)) {
        red.push('打开即参加要设人数上限，而且预算要盖得住');
      }
    }

    // Yellow checks
    // Y1. Non-social path check
    if (supply.nonSocial < cfg.targetSpins) {
      if (cfg.nonSocialGuaranteed) {
        red.push('开了「不拉人也能满」，但免费+任务只有 ' + supply.nonSocial + '，不够 ' + cfg.targetSpins);
      } else {
        yellow.push('不拉人只有 ' + supply.nonSocial + ' 次，不够转满 ' + cfg.targetSpins);
      }
    }

    // Y2. Completion rate deviation
    var simRate = completionProbability(cfg, cfg.targetSpins);
    var targetRate = (activeCohorts[0] && activeCohorts[0].targetCompletionRate) ? activeCohorts[0].targetCompletionRate / 100 : 0.70;
    if (Math.abs(simRate - targetRate) > 0.10) {
      yellow.push('目标满 ' + Math.round(targetRate * 100) + '%，预估 ' + Math.round(simRate * 100) + '%，差超过 10 点');
    }

    // Y3. Tail pacing
    var penultimate = progressAt(cfg.targetSpins - 1, cfg.targetSpins, cfg.firstSpinPct, cfg.curveGamma);
    if (penultimate < 99) {
      yellow.push('倒数第 2 转才 ' + penultimate.toFixed(1) + '%，收尾偏慢');
    }
    var minGain = progressGain(cfg.targetSpins - 1, cfg.targetSpins, cfg.firstSpinPct, cfg.curveGamma);
    if (minGain < 0.05) {
      yellow.push('倒数第 2 转只加 ' + minGain.toFixed(2) + '%，太细');
    }

    // Y4. Assist predominance
    if (supply.assist > supply.free && supply.assist > supply.task) {
      yellow.push('次数主要靠助力');
    }

    // Y5. Assist deposit threshold
    if (cfg.sources.assist.enabled && cfg.sources.assist.depositRequired) {
      yellow.push('助力要充值，前台必须写明');
    }

    // Y6. Ratio of reserve to expected
    if (costStats.hardReserve / (costStats.expected || 1) > 2.8) {
      yellow.push('每人预留比平均成本高很多，名额会偏紧');
    }

    // Y7. Auto join mode
    if (cfg.budget.joinMode === 'auto') {
      yellow.push('打开即参加，名额容易一下子占满');
    }

    var isGreen = red.length === 0 && yellow.length === 0;
    var canPublish = red.length === 0;

    // Build one-sentence green summary
    var safeNewUsers = Math.max(0, Math.floor((totalBudget - actualSpent) / costStats.hardReserve));
    var summaryParts = [];
    activeCohorts.forEach(function (c) {
      summaryParts.push(c.name + ' 需要 ' + c.targetSpins + ' 次');
    });

    var greenSummary = (cfg.personalDays || 7) + ' 天不拉人最多 ' + supply.nonSocial + ' 次，转满要 ' + cfg.targetSpins + ' 次。预估能满 ' + Math.round(simRate * 100) + '%。平均约 ' + costStats.expected + ' 元，最多预留 ' + costStats.hardReserve + '。还能接 ' + safeNewUsers + ' 人。';

    return {
      canPublish: canPublish,
      isGreen: isGreen,
      red: red,
      yellow: yellow,
      greenSummary: greenSummary,
      costStats: costStats,
      supply: supply,
      simRate: simRate,
      safeNewUsers: safeNewUsers
    };
  }

  return {
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    clamp: clamp,
    normalizePhaseShares: normalizePhaseShares,
    allocatePhaseSpins: allocatePhaseSpins,
    phaseOf: phaseOf,
    progressAt: progressAt,
    progressCurve: progressCurve,
    progressGain: progressGain,
    guaranteedTicketSupply: guaranteedTicketSupply,
    cashEquivalent: cashEquivalent,
    phasePrizeStats: phasePrizeStats,
    playCostStats: playCostStats,
    completionProbability: completionProbability,
    suggestTargetSpins: suggestTargetSpins,
    drawMockPrize: drawMockPrize,
    evaluatePublishStatus: evaluatePublishStatus
  };
}));
