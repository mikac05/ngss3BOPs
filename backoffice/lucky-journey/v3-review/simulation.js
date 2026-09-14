/* Local scenario model. This does not implement or contact production services. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'),require('./config.js'));else root.LJSimulation=factory(root.LuckyJourneyEngine,root.LJConfig);})(typeof window==='undefined'?globalThis:window,function(E,C){
  const money=v=>Math.round(v*100)/100||0;
  class Simulation {
    constructor(config){this.config=C.normalize(config);this.day=0;this.campaignOpen=true;this.risk=false;this.network='normal';this.payout='posted';this.outcome='random';this.sequence=0;this.playNumber=0;this.freeDates=new Set();this.friends=new Set();this.requestCache=new Map();this.spent=this.config.budget.actualSpent;this.reserved=this.config.budget.outstandingReserve;this.joined=this.config.budget.joinedCount;this.pending=[];this.events=[];this.play=this.empty();}
    empty(){return {status:'unjoined',k:0,progress:0,progressUnits:0,collectibles:{coin:0,gem:0,star:0},tickets:0,rewards:{cash:0,credit:0,point:0},granted:{free:0,task:0,assist:0},tasks:[],records:[],reserve:0};}
    log(text){this.events.unshift({day:this.day+1,text});this.events=this.events.slice(0,60);}
    available(){return money(this.config.budget.total-this.spent-this.reserved);}
    active(){this.expire();return this.play.status==='active';}
    expire(){if(this.play.status==='active'&&(this.day>=this.play.endsDay||(!this.campaignOpen&&this.play.cfg.budget.afterEnd==='cut'))){this.close(!this.campaignOpen&&this.play.cfg.budget.afterEnd==='cut'?'campaign_cut':'expired');}}
    close(status){this.reserved=Math.max(0,money(this.reserved-this.play.reserve));this.play.reserve=0;this.play.status=status;this.play.tickets=0;this.log(status==='expired'?'个人有效期结束，释放剩余预留。':'活动截断，释放剩余预留。');}
    join(){this.expire();if(this.play.status==='active')return {ok:false,message:'已参加本局。'};
      if(this.play.status!=='unjoined'&&!this.config.basic.repeat)return {ok:false,message:'本活动不可重复参加。'};
      if(!this.campaignOpen)return {ok:false,message:'活动已结束。'};
      if(this.risk)return {ok:false,message:'暂时无法参加，请联系客服。'};
      const cfg=C.clone(this.config),check=E.evaluatePublishStatus(cfg),cost=E.playCostStats(cfg);
      if(check.red.some(r=>!r.includes('余额')))return {ok:false,message:'配置检查未通过，请先修正设置。'};
      if(this.available()<cost.hardReserve||(cfg.budget.maxParticipants>0&&this.joined>=cfg.budget.maxParticipants))return {ok:false,message:'本期名额已满。'};
      const supply=E.guaranteedTicketSupply(cfg);
      const freeRemaining=cfg.sources.free.enabled?Math.min(cfg.sources.free.cap,cfg.sources.free.ticketsPerDay*(cfg.personalDays-(this.freeDates.has(this.day)?1:0))):0;
      const assistRemaining=cfg.sources.assist.enabled?(cfg.sources.assist.ticketsPerFriend>0?cfg.sources.assist.cap:0):0;
      if(freeRemaining+supply.task+assistRemaining<cfg.targetSpins)return {ok:false,message:'本次可领取次数不足，暂时无法参加。'};
      this.playNumber++;this.play={...this.empty(),status:'active',cfg,startsDay:this.day,endsDay:this.day+cfg.personalDays,id:'play-'+this.playNumber,plan:E.progressPlan(cfg),reserve:cost.hardReserve};this.joined++;this.reserved=money(this.reserved+cost.hardReserve);this.log('参加本局，预留 '+cost.hardReserve.toFixed(2)+'。');
      if(cfg.sources.free.enabled&&cfg.sources.free.grantMode==='auto_on_visit')this.grant('free');return {ok:true,message:'已参加活动。'};
    }
    grant(type,id,qualified=true){if(!this.active())return {ok:false,message:'当前无法领取。'};if(this.risk)return {ok:false,message:'领取暂不可用，请联系客服。'};
      const cfg=this.play.cfg,source=cfg.sources[type];if(!source.enabled)return {ok:false,message:'该来源未开启。'};
      let quantity,key;
      if(type==='free'){if(this.freeDates.has(this.day))return {ok:false,message:'今日已领取。'};quantity=source.ticketsPerDay;key=this.day;}
      else if(type==='task'){const task=cfg.tasks[id];if(!task?.enabled)return {ok:false,message:'该任务未开启。'};if(this.play.tasks.includes(id))return {ok:false,message:'本局已领取该任务奖励。'};quantity=source.ticketsPerTask;key=id;}
      else {if(!id)return {ok:false,message:'请选择好友事件。'};if(!qualified)return {ok:false,message:source.depositRequired?'好友尚未完成充值。':'好友不符合助力条件。'};if(this.friends.has(id))return {ok:false,message:'该好友已助力。'};quantity=source.ticketsPerFriend;key=id;}
      quantity=Math.max(0,Math.min(quantity,source.cap-this.play.granted[type]));if(!quantity)return {ok:false,message:'本局领取次数已达上限。'};
      if(type==='free')this.freeDates.add(key);else if(type==='task')this.play.tasks.push(key);else this.friends.add(key);
      this.play.granted[type]+=quantity;this.play.tickets+=quantity;this.log(({free:'每日免费',task:'任务完成',assist:'好友助力'})[type]+'：+'+quantity+' 次。');return {ok:true,message:'已获得 '+quantity+' 次抽奖次数。'};
    }
    nextDay(){this.day++;this.expire();this.log('进入模拟第 '+(this.day+1)+' 天。');if(this.active()&&this.play.cfg.sources.free.grantMode==='auto_on_visit')this.grant('free');return {ok:true,message:this.play.status==='expired'?'本局已到期。':'已进入下一天。'};}
    endCampaign(){this.campaignOpen=false;this.expire();this.log('活动结束，不再接受新参加。');return {ok:true,message:'活动已结束。'};}
    spin(requestId){if(this.requestCache.has(requestId))return {ok:true,replayed:true,record:this.requestCache.get(requestId),message:'已恢复原开奖结果。'};
      if(!this.active())return {ok:false,message:'本局不可继续转动。'};
      if(this.play.tickets<=0)return {ok:false,message:'抽奖次数不足。'};
      if(this.network==='fail'){this.network='normal';this.log('请求发送失败，未扣次数。');return {ok:false,message:'网络异常，请重试。',retry:true};}
      const p=this.play,cfg=p.cfg,k=p.k+1,phase=E.phaseOf(k,cfg.targetSpins,cfg.phaseShares),odds=cfg.prize[phase];
      if(k>1&&k<cfg.targetSpins&&this.outcome==='thanks'&&odds.thanksPct===0)return {ok:false,message:'当前阶段谢谢参与比例为 0。'};
      if(k>1&&k<cfg.targetSpins&&this.outcome==='native'&&odds.thanksPct===100)return {ok:false,message:'当前阶段中奖比例为 0。'};
      const prize=E.drawProgress(cfg,k,p.progressUnits,Math.random,this.outcome,p.plan);
      p.k=k;p.progressUnits+=prize.gainUnits;p.progress=p.progressUnits/10000;p.tickets--;
      if(prize.type!=='none')p.collectibles[prize.type]+=prize.amount;
      const completed=p.progressUnits===1000000,finish=completed?cfg.prize.finishPrize:0,actual=finish;
      if(completed){this.reserved=Math.max(0,money(this.reserved-p.reserve));p.reserve=0;}
      const payoutStatus=finish?this.payout:'not_applicable';
      const record={requestId,spinId:p.id+'-spin-'+k,k,phase,progress:p.progress,progressUnits:p.progressUnits,prize,finish,completed,payoutStatus,actual,released:0};
      Object.defineProperty(record,'rewardWallet',{value:p.rewards,enumerable:false});
      if(finish&&this.payout==='pending'){this.pending.push(record);this.reserved=money(this.reserved+actual);}else if(finish)this.post(record);
      if(completed){p.status='completed';p.tickets=0;this.reserved=Math.max(0,money(this.reserved-p.reserve));p.reserve=0;}
      p.records.push(record);this.requestCache.set(requestId,record);this.log('第 '+k+' 转：'+prize.label+(finish?'；转满解锁 '+finish:'')+(finish&&this.payout==='pending'?'，派奖处理中。':'。'));
      if(this.network==='lost'){this.network='normal';this.log('结果已保存，响应丢失。');return {ok:false,message:'结果确认中，请恢复连接。',retry:true,saved:true};}
      return {ok:true,record,message:prize.label};
    }
    post(record){if(record.posted)return;record.posted=true;record.payoutStatus='posted';this.spent=money(this.spent+record.actual);const wallet=record.rewardWallet;wallet.cash=money(wallet.cash+record.finish);}
    retryPayout(){const pending=this.pending;pending.forEach(r=>{this.reserved=Math.max(0,money(this.reserved-r.actual));this.post(r);});this.pending=[];this.log('已完成 '+pending.length+' 笔待派奖记录。');return {ok:true,message:'待派奖记录已处理。'};}
  }
  function resultCopy(record){const labels={coin:'金币',gem:'宝石',star:'星钻'},amount=record.prize.amount.toLocaleString('en-US',{maximumFractionDigits:4});
    if(record.completed)return {title:'转满解锁！',amount:record.finish.toFixed(2)+' 现金',message:record.payoutStatus==='pending'?'进度已满，奖金正在发放。':'进度已满，奖金已发放。',progress:'100% 完成',kind:'complete'};
    const title=record.prize.type==='star'?(record.prize.amount>=1000?'星钻大丰收！':'星钻亮起来了！'):record.prize.type==='gem'?'宝石闪耀登场！':'金币惊喜到手！';
    return {title,amount:amount+' '+labels[record.prize.type],message:'已加入探索进度，继续收集解锁奖金。',progress:'本次 +'+(record.prize.gainUnits/10000).toFixed(4)+'% · 当前 '+record.progress.toFixed(4)+'%',kind:record.prize.type};
  }
  return {Simulation,resultCopy};
});
