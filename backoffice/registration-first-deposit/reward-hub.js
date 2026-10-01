(function(root){
  'use strict';
  const KEY='ngss3.deposit-reward-bundle.launch';
  const defaults={schemaVersion:1,revision:1,sharedBudget:'100000',perOrderLimit:'250',selected:['registration-first-deposit'],items:[
    {id:'registration-first-deposit',name:{'zh-CN':'首充成长阶梯','zh-TW':'首充成長階梯',en:'First deposit milestones',bn:'প্রথম ডিপোজিট বোনাস'},source:'活动中心 · 充值活动',type:'first',demoReward:null},
    {id:'daily-cumulative',name:{'zh-CN':'每日累计充值','zh-TW':'每日累計充值',en:'Daily deposit total'},source:'活动中心 · 充值活动',type:'cumulative',threshold:'1000',demoReward:'10',wallet:'彩金钱包',wager:'1'},
    {id:'daily-single',name:{'zh-CN':'每日单笔充值','zh-TW':'每日單筆充值',en:'Single deposit task'},source:'活动中心 · 充值活动',type:'single',threshold:'500',demoReward:'5',wallet:'彩金钱包',wager:'1'},
    {id:'third-party-gift',name:{'zh-CN':'三方支付充值赠送','zh-TW':'三方支付充值贈送',en:'Payment channel reward'},source:'活动中心 · 充值活动',type:'channel',threshold:'100',maxAmount:'5000',rewardMode:'percent',rate:'2',dailyCap:'100',dailyCount:'1',demoReward:'20',wallet:'彩金钱包',wager:'1'},
    {id:'recommended-amount',name:{'zh-CN':'通道推荐金额加赠','zh-TW':'通道推薦金額加贈',en:'Recommended amount reward'},source:'活动中心 · 充值活动',type:'recommended',threshold:'1000',rewardMode:'fixed',rate:'1',dailyCap:'100',dailyCount:'1',demoReward:'8',wallet:'彩金钱包',wager:'1'}]};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const escape=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  function cleanBasic(b={}){const out=clone(b);for(const key of ['memberMode','memberLevels','validMode','validFirst','validDeposit','validTurnover','validCount','marketing'])delete out[key];return out;}
  function validate(b){if(!b||b.schemaVersion!==1||!Number.isInteger(b.revision)||b.revision<1||!Array.isArray(b.selected)||!Array.isArray(b.items))return ['活动组合配置无效'];const ids=b.items.map(x=>x.id);if(new Set(ids).size!==ids.length||new Set(b.selected).size!==b.selected.length||b.selected.some(id=>!ids.includes(id)))return ['活动选择包含不存在或重复的项目'];try{if(b.memberGiftCap!==undefined&&Reward.minor(b.memberGiftCap)<=0)return ['单用户赠送上限须为正数'];if(Reward.minor(b.sharedBudget)<=0||Reward.minor(b.perOrderLimit)<=0)return ['组合预算和单笔预留上限须为正数'];}catch(e){return [e.message];}return [];}
  function load(){try{const b=JSON.parse(localStorage.getItem(KEY));if(b){b.sharedBudget??=defaults.sharedBudget;b.perOrderLimit??=defaults.perOrderLimit;if(!validate(b).length){b.items=b.items.map(item=>{item={...item,basic:cleanBasic(item.basic)};delete item.members;if(item.firstConfig)item.firstConfig={...item.firstConfig,basic:cleanBasic(item.firstConfig.basic)};const canonical=defaults.items.find(x=>x.id===item.id);return canonical?{...canonical,...item,name:item.name||canonical.name,source:canonical.source,type:canonical.type}:item;});return b;}}}catch(_){}return clone(defaults);}
  function qualifyingPrior(item,event){
    if(event.qualifyingPrior&&Object.prototype.hasOwnProperty.call(event.qualifyingPrior,item.id))return Reward.minor(event.qualifyingPrior[item.id]);
    const c=item.conditions,at=+new Date(event.paidAt);let start=-Infinity;
    if(c.window==='day'){const day=new Date(at);day.setHours(0,0,0,0);start=+day;}
    if(c.window==='rolling7')start=at-7*86400000;
    if(c.window==='activity')start=+new Date(item.activatedAt||item.basic?.startAt);
    if(!Array.isArray(event.deposits))return c.window==='day'&&event.priorDaily!==undefined?Reward.minor(event.priorDaily):null;
    return event.deposits.filter(d=>d.status==='success'&&d.id!==event.orderId&&+new Date(d.paidAt)>=start&&+new Date(d.paidAt)<at&&(!item.channels?.length||item.channels.includes(d.channelId))&&(!item.method||item.method==='all'||item.method===d.channel||item.method==='bank'&&d.channel==='other'||item.method==='other'&&d.channel!=='third')).reduce((sum,d)=>sum+Reward.minor(d.amount),0);
  }
  function evaluate(cfg,bundle,event){const out=[];let total=0,unknown=0;const a=Reward.minor(event.amount);for(const item of bundle.items){if(!bundle.selected.includes(item.id))continue;let state='eligible',reason='',reward=null;
    const at=+new Date(event.paidAt),actualChannel=event.channelId||(event.channel==='third'?'third-a':event.channel==='virtual'?'virtual':'bank');
    if(item.basic?.periodMode!=='always'&&(item.basic?.startAt&&at<+new Date(item.basic.startAt)||item.basic?.endAt&&at>=+new Date(item.basic.endAt))){state='inactive';reason='period';}
    else if(item.channels?.length&&!item.channels.includes(actualChannel)){state='ineligible';reason='channel';}
    else if(item.method&&item.method!=='all'&&item.method!==event.channel&&!(item.method==='bank'&&event.channel==='other')&&!(item.method==='other'&&event.channel!=='third')){state='ineligible';reason='payment-method';}
    else if(item.type==='first'){const r=Reward.calculate(item.id==='registration-first-deposit'?cfg:(item.firstConfig||cfg),{first:event.first,registered:event.registered,paidAt:event.paidAt,amount:event.amount});state=r.state;reward=r.reward??null;reason=r.reason||'';}
    else if(!item.conditions&&item.type==='cumulative'&&(Reward.minor(event.priorDaily||'0')>=Reward.minor(item.threshold||'1000')||Reward.minor(event.priorDaily||'0')+a<Reward.minor(item.threshold||'1000'))){state='ineligible';reason='daily-target';}
    else if(!item.conditions&&item.type==='single'&&a<Reward.minor(item.threshold||'500')){state='ineligible';reason='demo-single-target';}
    else if(!item.conditions&&item.type==='channel'&&(event.channel!=='third'||(!item.ranges?.length&&(a<Reward.minor(item.threshold||'100')||(item.maxAmount&&a>=Reward.minor(item.maxAmount)))))){state='ineligible';reason='demo-channel';}
    else if(!item.conditions&&item.type==='recommended'&&(event.channel!=='third'||a!==Reward.minor(item.threshold||'1000'))){state='ineligible';reason='demo-recommended';}
    if(item.conditions&&state==='eligible'){
      const c=item.conditions;
      if(c.mode==='exact'&&a!==Reward.minor(item.threshold)||!item.ranges?.length&&['single','both'].includes(c.mode)&&a<Reward.minor(item.threshold)){state='ineligible';reason='single-target';}
      if(state==='eligible'&&['cumulative','both'].includes(c.mode)){
        const prior=qualifyingPrior(item,event),target=Reward.minor(c.minimum);
        if(prior===null){state='unknown';unknown++;reason='deposit-history';}
        else if(prior>=target||prior+a<target){state='ineligible';reason='cumulative-target';}
      }
    }
    if(item.type!=='first'&&state==='eligible'&&item.ranges?.length){const row=item.ranges.find(r=>a>=Reward.minor(r.min)&&(!r.max||a<=Reward.minor(r.max)));if(!row){state='ineligible';reason='amount-range';}else reward=row.type==='percent'?Number(BigInt(a)*BigInt(Reward.minor(row.value))/10000n):Reward.minor(row.value);}
    if(item.type!=='first'&&state==='eligible'&&reward===null)reward=item.rewardMode==='percent'?Number(BigInt(a)*BigInt(Reward.minor(item.rate||'0'))/10000n):Reward.minor(item.demoReward);
    if(state==='eligible'&&item.claimLimit){const period=item.countPeriod==='total'?'lifetimeCount':'count';if(Number(event.rewardHistory?.[item.id]?.[period]||0)>=Number(item.claimLimit)){state='ineligible';reward=null;reason='claim-limit';}}
    if(state==='eligible'&&item.dailyCap){const paid=Reward.minor(event.rewardHistory?.[item.id]?.paid||'0'),count=Number(event.rewardHistory?.[item.id]?.count||0);if(paid>=Reward.minor(item.dailyCap)||(!item.claimLimit&&count>=Number(item.dailyCount))){state='ineligible';reward=null;reason='daily-limit';}else reward=Math.min(reward,Reward.minor(item.dailyCap)-paid);}
    if(state==='eligible'&&item.cap){const remaining=Reward.minor(item.cap)-Reward.minor(event.rewardHistory?.[item.id]?.totalPaid||'0');if(remaining<=0){state='ineligible';reward=null;reason='member-cap';}else reward=Math.min(reward,remaining);}
    if(state==='eligible'&&item.budget&&reward>Reward.minor(event.activityBudgetRemaining?.[item.id]??item.budget)){state='budget';reward=null;reason='activity-budget';}
    if(event.unknown&&state==='eligible'){state='unknown';reward=null;unknown++;}
    if(state==='eligible'&&reward!==null)total+=reward;
    let cash=null,bonus=null;if(state==='eligible'&&reward!==null){const targetWallet=item.type==='first'?((item.id==='registration-first-deposit'?cfg:(item.firstConfig||cfg)).wallet==='cash'?'现金钱包':'彩金钱包'):item.wallet;const split=targetWallet==='现金和彩金钱包';cash=split?Number(BigInt(reward)*BigInt(Math.round(Number(item.cashShare||50)*100))/10000n):targetWallet==='现金钱包'?reward:0;bonus=reward-cash;}
    out.push({id:item.id,name:item.name,state,reason,reward,cash,bonus});
  }return {items:out,total,unknown,overOrderLimit:total>Reward.minor(bundle.perOrderLimit),overSharedBudget:total>Reward.minor(bundle.sharedBudget)};}
  const api={cleanBasic,KEY,defaults,clone,escape,validate,load,evaluate,qualifyingPrior};root.RewardHub=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
