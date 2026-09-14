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
    targetSpins: 12,
    firstSpinPct: 90,
    phaseShares: { fast: 40, mid: 35, fine: 25 },
    sources: {
      free: { enabled: true, ticketsPerDay: 1, days: 7, cap: 7, grantMode: 'auto_on_visit' },
      task: { enabled: true, ticketsPerTask: 1, taskCount: 5, cap: 5 },
      assist: { enabled: true, ticketsPerFriend: 1, cap: 5, depositRequired: false, allowPromotionDoubleReward: true }
    },
    tasks: [
      { id: 'play_cat', type: 'play_category', name: '游玩指定类型', gameCategory: 'slot', threshold: 5, enabled: true },
      { id: 'dep_c', type: 'deposit_count', name: '充值次数', threshold: 1, enabled: true },
      { id: 'dep_a', type: 'deposit_amount', name: '充值金额', threshold: 100, enabled: true },
      { id: 'bet_c', type: 'bet_count', name: '下注次数', threshold: 10, enabled: true },
      { id: 'bet_a', type: 'bet_amount', name: '下注金额', threshold: 50, enabled: true }
    ],
    prize: {
      finishPrize: 5,
      fast: { thanksPct: 20, weights: {coin:70, gem:25, star:5} },
      mid: { thanksPct: 25, weights: {coin:20, gem:60, star:20} },
      fine: { thanksPct: 30, weights: {coin:5, gem:25, star:70} }
    },
    budget: {
      total: 50000,
      actualSpent: 0,
      outstandingReserve: 0,
      joinedCount: 0,
      maxParticipants: 800,
      joinMode: 'click', // click | auto
      afterEnd: 'finish' // finish | cut
    },
    assumptions: {
      dailyVisitProb: 0.90,
      taskCompletionProb: 0.90,
      assistLambda: 1.5
    }
  };


  const PHASES=['fast','mid','fine'];
  const UNITS={fast:{type:'coin',label:'金币',denominator:100,scale:10000},mid:{type:'gem',label:'宝石',denominator:10000,scale:100},fine:{type:'star',label:'星钻',denominator:1000000,scale:1}};
  function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
  function normalizePhaseShares(s){const sum=PHASES.reduce((n,k)=>n+Math.max(0,Number(s[k])||0),0)||1;return Object.fromEntries(PHASES.map(k=>[k,Math.max(0,Number(s[k])||0)/sum*100]));}
  // Allocate T minus the first attempt; reserve at least one attempt per stage.
  function allocatePhaseSpins(T,shares){T=clamp(Math.floor(T)||4,4,30);const n=normalizePhaseShares(shares),left=T-4,result={fast:1,mid:1,fine:1};const q=PHASES.map(k=>left*n[k]/100);PHASES.forEach((k,i)=>result[k]+=Math.floor(q[i]));const order=q.map((v,i)=>({i,f:v-Math.floor(v)})).sort((a,b)=>b.f-a.f||a.i-b.i);const remaining=T-1-PHASES.reduce((v,k)=>v+result[k],0);for(let i=0;i<remaining;i++)result[PHASES[order[i].i]]++;return result;}
  function phaseOf(k,T,shares){const n=allocatePhaseSpins(T,shares);return k<=1+n.fast?'fast':k<=1+n.fast+n.mid?'mid':'fine';}
  // After the guaranteed first attempt, pacing applies to remaining progress.
  // Returned collectible amount is authoritative; progress only adds amount * unit scale.
  const ITEMS={coin:{label:'金币',scale:10000,denominator:100},gem:{label:'宝石',scale:100,denominator:10000},star:{label:'星钻',scale:1,denominator:1000000}};
  function progressPlan(cfg){const n=allocatePhaseSpins(cfg.targetSpins,cfg.phaseShares),first=Math.round(cfg.firstSpinPct*10000),remaining=1000000-first;
    return Array.from({length:cfg.targetSpins},(_,i)=>{const k=i+1,phase=phaseOf(k,cfg.targetSpins,cfg.phaseShares);if(k===1)return {phase,target:first};if(k===cfg.targetSpins)return {phase,target:1000000};const start=phase==='fast'?1:phase==='mid'?1+n.fast:1+n.fast+n.mid,low=phase==='fast'?first:phase==='mid'?first+remaining*.9:first+remaining*.999,high=phase==='fast'?first+remaining*.9:phase==='mid'?first+remaining*.999:1000000,t=(k-start)/n[phase];return {phase,target:Math.min(999999,Math.floor(low+(high-low)*(1-(1-t)*(1-t))))};});
  }
  function drawProgress(cfg,k,units=0,rng=Math.random,outcome='random',plan){
    const row=(plan||progressPlan(cfg))[k-1],phase=row.phase,final=k===cfg.targetSpins;
    if(k>1&&!final&&(outcome==='thanks'||outcome==='random'&&rng()*100<cfg.prize[phase].thanksPct))return {type:'none',amount:0,label:'谢谢参与',gainUnits:0,denominator:1,final:false};
    const weights=cfg.prize[phase].weights;let type=outcome in ITEMS?outcome:null;
    if(!type){let r=rng()*100;type=r<weights.coin?'coin':r<weights.coin+weights.gem?'gem':'star';}
    const unit=ITEMS[type],gain=Math.max(0,row.target-units),amount=gain/unit.scale;
    return {type,amount,label:unit.label+' '+amount.toLocaleString('en-US',{maximumFractionDigits:4}),gainUnits:gain,denominator:unit.denominator,final};
  }
  function progressPreview(cfg){let units=0;const plan=progressPlan(cfg);return [{k:0,progress:0}].concat(Array.from({length:cfg.targetSpins},(_,i)=>{const prize=drawProgress(cfg,i+1,units,()=>.99,'native',plan);units+=prize.gainUnits;return {k:i+1,phase:phaseOf(i+1,cfg.targetSpins,cfg.phaseShares),progress:units/10000,prize};}));}
  function guaranteedTicketSupply(cfg){const {free:f,task:t,assist:a}=cfg.sources;const free=f.enabled?Math.min(f.ticketsPerDay*cfg.personalDays,f.cap):0,task=t.enabled?Math.min(t.ticketsPerTask*(cfg.tasks?cfg.tasks.filter(t=>t.enabled).length:t.taskCount),t.cap):0,assist=a.enabled&&a.ticketsPerFriend>0?a.cap:0;return {free,task,assist,nonSocial:free+task,all:free+task+assist};}
  function playCostStats(cfg){return {expected:Number((completionProbability(cfg,cfg.targetSpins)*cfg.prize.finishPrize).toFixed(4)),hardReserve:cfg.prize.finishPrize,counts:allocatePhaseSpins(cfg.targetSpins,cfg.phaseShares)};}
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
    var T = targetSpins ?? cfg.targetSpins;
    var dist = new Map([[0,1]]);
    function merge(part) {
      var next=new Map();
      dist.forEach((a,x)=>part.forEach((b,y)=>next.set(Math.min(T,x+y),(next.get(Math.min(T,x+y))||0)+a*b)));
      dist=next;
    }
    function binomial(n,tickets,prob,cap) {
      cap=Math.min(cap,T);
      var d=new Map([[0,1]]);
      for(var i=0;i<Math.min(100,Math.max(0,n));i++) {const next=new Map();d.forEach((mass,value)=>{const win=Math.min(cap,value+tickets);next.set(value,(next.get(value)||0)+mass*(1-clamp(prob,0,1)));next.set(win,(next.get(win)||0)+mass*clamp(prob,0,1));});d=next;}
      var capped=new Map(); d.forEach((p,k)=>capped.set(Math.min(k,cap),(capped.get(Math.min(k,cap))||0)+p));
      return capped;
    }
    var f=cfg.sources.free,t=cfg.sources.task,a=cfg.sources.assist,h=cfg.assumptions;
    if(f.enabled)merge(binomial(f.days??cfg.personalDays,f.ticketsPerDay,h.dailyVisitProb,f.cap));
    if(t.enabled)merge(binomial(t.taskCount??5,t.ticketsPerTask,h.taskCompletionProb,t.cap));
    if(a.enabled){
      var d=new Map(),used=0,previous=0;
      for(var k=0;k<Math.ceil(Math.min(T,a.cap) / Math.max(1,a.ticketsPerFriend));k++){
        var p=k===0?Math.exp(-h.assistLambda):previous*h.assistLambda/k;previous=p;var amount=Math.min(k*a.ticketsPerFriend,a.cap,T);
        d.set(amount,(d.get(amount)||0)+p);used+=p;
      }
      var amount=Math.min(Math.ceil(Math.min(T,a.cap) / Math.max(1,a.ticketsPerFriend))*a.ticketsPerFriend,a.cap);
      d.set(amount,(d.get(amount)||0)+Math.max(0,1-used));merge(d);
    }
    var result=0;dist.forEach((p,k)=>{if(k>=T)result+=p;});return clamp(result,0,1);
  }

  function availableSlots(cfg,T) {
    var available=Math.round(cfg.budget.total*100)-Math.round(cfg.budget.actualSpent*100)-Math.round((cfg.budget.outstandingReserve||0)*100);
    var hard=Math.round(cfg.prize.finishPrize*100);
    var slots=hard>0?Math.max(0,Math.floor(available/hard)):0;
    if(cfg.budget.maxParticipants>0)slots=Math.min(slots,Math.max(0,cfg.budget.maxParticipants-(cfg.budget.joinedCount||0)));
    return slots;
  }


  function evaluatePublishStatus(cfg){const red=[],yellow=[],supply=guaranteedTicketSupply(cfg);
    function range(v,min,max,label,integer=false){if(!Number.isFinite(v)||v<min||v>max||integer&&!Number.isInteger(v))red.push(label+'须为 '+min+'–'+max+(integer?' 的整数':''));}
    range(cfg.firstSpinPct,1,95,'第一转进度',true);range(cfg.targetSpins,4,30,'解锁总次数',true);range(cfg.personalDays,1,30,'可玩天数',true);range(cfg.prize.finishPrize,.01,1e9,'转满解锁金额');
    if(Number.isFinite(cfg.prize.finishPrize)&&Math.abs(cfg.prize.finishPrize*100-Math.round(cfg.prize.finishPrize*100))>1e-6)red.push('转满解锁金额最多两位小数');
    PHASES.forEach(k=>{range(cfg.phaseShares[k],0,100,'阶段占比');range(cfg.prize[k].thanksPct,0,100,'谢谢参与比例');Object.values(cfg.prize[k].weights).forEach(v=>range(v,0,100,'道具概率'));if(Math.abs(Object.values(cfg.prize[k].weights).reduce((a,b)=>a+b,0)-100)>.001)red.push('道具概率合计须为 100%');});
    if(Math.abs(PHASES.reduce((v,k)=>v+cfg.phaseShares[k],0)-100)>.001)red.push('阶段占比合计须为 100%');
    ['total','actualSpent','outstandingReserve'].forEach(k=>range(cfg.budget[k],0,1e12,'预算金额'));
    range(cfg.budget.maxParticipants,0,1e7,'参加人数上限',true);range(cfg.budget.joinedCount,0,1e7,'已参加人数',true);
    ['free','task','assist'].forEach(k=>{const s=cfg.sources[k];if(s.enabled)Object.values(s).filter(v=>typeof v==='number').forEach(v=>range(v,0,1000,'来源次数',true));});
    range(cfg.assumptions.dailyVisitProb,0,1,'每日回访率');range(cfg.assumptions.taskCompletionProb,0,1,'任务完成率');range(cfg.assumptions.assistLambda,0,50,'预计合格好友数');
    if(supply.all<cfg.targetSpins)yellow.push('全部来源仅 '+supply.all+' 次，少于解锁总次数 '+cfg.targetSpins+' 次');
    if(supply.nonSocial<cfg.targetSpins)yellow.push('免费＋任务共 '+supply.nonSocial+' 次，需好友助力补足 '+(cfg.targetSpins-supply.nonSocial)+' 次');
    if(Math.round(cfg.budget.total*100)-Math.round(cfg.budget.actualSpent*100)-Math.round(cfg.budget.outstandingReserve*100)<Math.round(cfg.prize.finishPrize*100))red.push('余额不足以预留一笔转满解锁奖励');
    if(cfg.budget.joinMode==='auto'&&!cfg.budget.maxParticipants)red.push('打开即参加须设置参加人数上限');
    if(cfg.sources.assist.enabled&&cfg.sources.assist.depositRequired)yellow.push('好友助力需要充值，玩家端须显示条件');
    if(cfg.basic){if(!cfg.basic.name.trim())red.push('请填写活动名称');if(!cfg.basic.start||!cfg.basic.end||cfg.basic.start>=cfg.basic.end)red.push('活动开始时间须早于结束时间');if(!cfg.basic.terminalCount)red.push('至少选择一个申领终端');['ipLimit','deviceLimit','wageringMultiple'].forEach(k=>range(cfg.basic[k],0,1e6,'基本资料限制',true));if(cfg.basic.repeat)yellow.push('重复参加不重复发放同日免费或同一好友助力');}
    (cfg.tasks||[]).filter(t=>t.enabled&&cfg.sources.task.enabled).forEach(t=>range(t.threshold,.01,1e9,'任务门槛',t.type.endsWith('_count')||t.type==='play_category'));
    const simRate=completionProbability(cfg,cfg.targetSpins),costStats={expected:Number((simRate*cfg.prize.finishPrize).toFixed(4)),hardReserve:cfg.prize.finishPrize,counts:allocatePhaseSpins(cfg.targetSpins,cfg.phaseShares)},safeNewUsers=availableSlots(cfg);
    return {red,yellow,canPublish:!red.length,isGreen:!red.length&&!yellow.length,simRate,costStats,supply,safeNewUsers,greenSummary:'完成发放 '+cfg.prize.finishPrize+'，未完成不发奖。'};
  }
  return {DEFAULT_CONFIG,UNITS,clamp,normalizePhaseShares,allocatePhaseSpins,phaseOf,drawProgress,progressPlan,progressPreview,guaranteedTicketSupply,playCostStats,completionProbability,availableSlots,evaluatePublishStatus};
}));
