export const DEFAULT_CONFIG = {
  personalDays: 7,
  firstSpinPct: 90,
  targetSpins: 12,
  curveGamma: 1.8,
  phaseShares: { fast: 40, mid: 35, fine: 25 },
  sources: {
    free: { enabled: true, ticketsPerDay: 1, days: 7, cap: 7 },
    task: { enabled: true, ticketsPerTask: 1, taskCount: 5, cap: 5 },
    assist: { enabled: true, ticketsPerFriend: 1, friendCap: 5, cap: 5 }
  },
  prize: {
    sizeWeights: [60, 30, 10],
    finishPrize: 5,
    fast: { thanksPct: 20, upgradePct: 8, amounts: [0.18, 0.5, 1] },
    mid: { thanksPct: 25, upgradePct: 10, amounts: [18, 50, 100] },
    fine: { thanksPct: 30, upgradePct: 8, amounts: [50, 100, 200] }
  },
  assumptions: {
    dailyVisitProb: 0.90,
    taskCompletionProb: 0.90,
    assistLambda: 1.5
  }
};

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function normalizePhaseShares(shares) {
  const raw = [Number(shares.fast) || 0, Number(shares.mid) || 0, Number(shares.fine) || 0];
  const total = raw.reduce((a, b) => a + b, 0) || 1;
  const norm = raw.map(v => (v / total) * 100);
  return { fast: norm[0], mid: norm[1], fine: norm[2] };
}

export function allocatePhaseSpins(targetSpins, shares) {
  const T = Math.max(4, Math.floor(targetSpins));
  const rest = T - 1;
  const normalized = normalizePhaseShares(shares);
  const keys = ['fast', 'mid', 'fine'];
  // Each post-first phase gets at least one spin; distribute the remaining via Hamilton method.
  const base = { fast: 1, mid: 1, fine: 1 };
  let remaining = rest - 3;
  if (remaining <= 0) return base;
  const quotas = keys.map(k => remaining * normalized[k] / 100);
  const floors = quotas.map(Math.floor);
  keys.forEach((k, i) => { base[k] += floors[i]; });
  let left = remaining - floors.reduce((a, b) => a + b, 0);
  const order = quotas.map((q, i) => ({ i, frac: q - floors[i] })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let j = 0; j < left; j++) base[keys[order[j].i]] += 1;
  return base;
}

export function phaseOf(k, targetSpins, shares) {
  if (k <= 1) return 'fast';
  const n = allocatePhaseSpins(targetSpins, shares);
  if (k <= 1 + n.fast) return 'fast';
  if (k <= 1 + n.fast + n.mid) return 'mid';
  return 'fine';
}

export function progressAt(k, targetSpins, firstSpinPct, gamma) {
  const T = Math.max(4, Math.floor(targetSpins));
  const F = clamp(Number(firstSpinPct), 50, 99);
  const g = clamp(Number(gamma), 1, 3);
  if (k <= 0) return 0;
  if (k === 1) return F;
  if (k >= T) return 100;
  const q = (k - 1) / (T - 1);
  const afterFirst = 1 - Math.pow(1 - q, g);
  return F + (100 - F) * afterFirst;
}

export function progressCurve(targetSpins, firstSpinPct, gamma) {
  const T = Math.max(4, Math.floor(targetSpins));
  return Array.from({ length: T + 1 }, (_, k) => Number(progressAt(k, T, firstSpinPct, gamma).toFixed(4)));
}

export function progressGain(k, targetSpins, firstSpinPct, gamma) {
  return Number((progressAt(k, targetSpins, firstSpinPct, gamma) - progressAt(k - 1, targetSpins, firstSpinPct, gamma)).toFixed(4));
}

export function guaranteedTicketSupply(cfg) {
  const s = cfg.sources;
  const free = s.free.enabled ? Math.min(s.free.ticketsPerDay * s.free.days, s.free.cap) : 0;
  const task = s.task.enabled ? Math.min(s.task.ticketsPerTask * s.task.taskCount, s.task.cap) : 0;
  const assist = s.assist.enabled ? Math.min(s.assist.ticketsPerFriend * s.assist.friendCap, s.assist.cap) : 0;
  return { free, task, assist, nonSocial: free + task, all: free + task + assist };
}

function weightedMean(values, weights) {
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  return values.reduce((sum, v, i) => sum + v * weights[i], 0) / total;
}

function cashEquivalent(type, amount) {
  if (type === 'cash') return amount;
  if (type === 'credit') return amount / 100;
  if (type === 'point') return amount / 10000;
  return 0;
}

export function phasePrizeStats(cfg, phase) {
  const p = cfg.prize[phase];
  const w = cfg.prize.sizeWeights;
  const nativeType = phase === 'fast' ? 'cash' : phase === 'mid' ? 'credit' : 'point';
  const nativeMean = cashEquivalent(nativeType, weightedMean(p.amounts, w));
  let upgradeMean;
  let upgradeMax;
  if (phase === 'fast') {
    upgradeMean = Math.max(...p.amounts);
    upgradeMax = upgradeMean;
  } else if (phase === 'mid') {
    const a = cfg.prize.fast.amounts;
    upgradeMean = weightedMean(a, w);
    upgradeMax = Math.max(...a);
  } else {
    const a = cfg.prize.mid.amounts;
    upgradeMean = cashEquivalent('credit', weightedMean(a, w));
    upgradeMax = cashEquivalent('credit', Math.max(...a));
  }
  const nativeMax = cashEquivalent(nativeType, Math.max(...p.amounts));
  const nativePct = Math.max(0, 100 - p.thanksPct - p.upgradePct);
  const ev = (nativePct / 100) * nativeMean + (p.upgradePct / 100) * upgradeMean;
  const max = Math.max(nativeMax, upgradeMax);
  return { nativePct, ev, max };
}

export function playCostStats(cfg, targetSpins = cfg.targetSpins) {
  let expected = cfg.prize.finishPrize;
  let hardReserve = cfg.prize.finishPrize;
  const counts = { fast: 0, mid: 0, fine: 0 };
  for (let k = 1; k <= targetSpins; k++) {
    const phase = phaseOf(k, targetSpins, cfg.phaseShares);
    counts[phase] += 1;
    const stat = phasePrizeStats(cfg, phase);
    expected += stat.ev;
    hardReserve += stat.max;
  }
  return { expected, hardReserve, counts };
}

function poissonPmf(k, lambda) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return Math.exp(-lambda) * Math.pow(lambda, k) / fact;
}

function addMass(dist, tickets, p) {
  const next = new Map();
  for (const [sum, prob] of dist.entries()) {
    next.set(sum, (next.get(sum) || 0) + prob * (1 - p));
    next.set(sum + tickets, (next.get(sum + tickets) || 0) + prob * p);
  }
  return next;
}

export function completionProbability(cfg, targetSpins = cfg.targetSpins) {
  const a = cfg.assumptions;
  let dist = new Map([[0, 1]]);
  if (cfg.sources.free.enabled) {
    for (let d = 0; d < cfg.sources.free.days; d++) {
      dist = addMass(dist, cfg.sources.free.ticketsPerDay, a.dailyVisitProb);
    }
  }
  if (cfg.sources.task.enabled) {
    for (let i = 0; i < cfg.sources.task.taskCount; i++) {
      dist = addMass(dist, cfg.sources.task.ticketsPerTask, a.taskCompletionProb);
    }
  }
  if (cfg.sources.assist.enabled) {
    const capFriends = cfg.sources.assist.friendCap;
    const assistDist = new Map();
    let used = 0;
    for (let k = 0; k < capFriends; k++) {
      const p = poissonPmf(k, a.assistLambda);
      assistDist.set(k * cfg.sources.assist.ticketsPerFriend, p);
      used += p;
    }
    assistDist.set(capFriends * cfg.sources.assist.ticketsPerFriend, Math.max(0, 1 - used));
    const merged = new Map();
    for (const [base, p1] of dist.entries()) {
      for (const [extra, p2] of assistDist.entries()) {
        const cappedExtra = Math.min(extra, cfg.sources.assist.cap);
        merged.set(base + cappedExtra, (merged.get(base + cappedExtra) || 0) + p1 * p2);
      }
    }
    dist = merged;
  }
  let p = 0;
  for (const [tickets, prob] of dist.entries()) if (tickets >= targetSpins) p += prob;
  return clamp(p, 0, 1);
}

export function suggestTargetSpins(cfg, desiredRate) {
  const desired = clamp(desiredRate, 0.01, 0.999);
  let best = 4;
  for (let t = 4; t <= 30; t++) {
    if (completionProbability(cfg, t) >= desired) best = t;
    else break;
  }
  return best;
}

export function drawMockPrize(cfg, phase, rng = Math.random) {
  const p = cfg.prize[phase];
  const u = rng() * 100;
  if (u < p.thanksPct) return { type: 'none', amount: 0, label: '谢谢参与' };
  const upgrade = u < p.thanksPct + p.upgradePct;
  const weights = cfg.prize.sizeWeights;
  const pickSize = () => {
    const x = rng() * 100;
    if (x < weights[0]) return 0;
    if (x < weights[0] + weights[1]) return 1;
    return 2;
  };
  const i = pickSize();
  if (upgrade) {
    if (phase === 'fast') {
      const amount = Math.max(...cfg.prize.fast.amounts);
      return { type: 'cash', amount, label: `现金 ${amount}` };
    }
    if (phase === 'mid') {
      const amount = cfg.prize.fast.amounts[i];
      return { type: 'cash', amount, label: `现金 ${amount}` };
    }
    const amount = cfg.prize.mid.amounts[i];
    return { type: 'credit', amount, label: `积分 ${amount}` };
  }
  if (phase === 'fast') return { type: 'cash', amount: p.amounts[i], label: `现金 ${p.amounts[i]}` };
  if (phase === 'mid') return { type: 'credit', amount: p.amounts[i], label: `积分 ${p.amounts[i]}` };
  return { type: 'point', amount: p.amounts[i], label: `点数 ${p.amounts[i]}` };
}
