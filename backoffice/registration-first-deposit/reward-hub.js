(function(root){
  'use strict';
  const KEY='ngss3.deposit-reward-bundle.launch';
  const defaults={schemaVersion:1,revision:1,sharedBudget:'100000',perOrderLimit:'250',selected:['registration-first-deposit'],items:[
    {id:'registration-first-deposit',name:{'zh-CN':'首充成长阶梯','zh-TW':'首充成長階梯',en:'First deposit milestones'},source:'活动中心 · 首次充值',type:'first',demoReward:null},
    {id:'daily-cumulative',name:{'zh-CN':'每日累计充值','zh-TW':'每日累計充值',en:'Daily deposit total'},source:'任务中心 · 每日任务',type:'cumulative',threshold:'1000',demoReward:'10',wallet:'彩金钱包',wager:'1'},
    {id:'daily-single',name:{'zh-CN':'每日单笔充值','zh-TW':'每日單筆充值',en:'Single deposit task'},source:'任务中心 · 每日任务',type:'single',threshold:'500',demoReward:'5',wallet:'彩金钱包',wager:'1'},
    {id:'third-party-gift',name:{'zh-CN':'三方支付充值赠送','zh-TW':'三方支付充值贈送',en:'Payment channel reward'},source:'活动中心 · 充值奖励',type:'channel',threshold:'100',maxAmount:'5000',rewardMode:'percent',rate:'2',dailyCap:'100',dailyCount:'1',demoReward:'20',wallet:'彩金钱包',wager:'1'},
    {id:'recommended-amount',name:{'zh-CN':'通道推荐金额加赠','zh-TW':'通道推薦金額加贈',en:'Recommended amount reward'},source:'活动中心 · 充值奖励',type:'recommended',threshold:'1000',rewardMode:'fixed',rate:'1',dailyCap:'100',dailyCount:'1',demoReward:'8',wallet:'彩金钱包',wager:'1'}]};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const escape=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  function validate(b){if(!b||b.schemaVersion!==1||!Number.isInteger(b.revision)||b.revision<1||!Array.isArray(b.selected)||!Array.isArray(b.items))return ['活动组合配置无效'];const ids=b.items.map(x=>x.id);if(new Set(ids).size!==ids.length||new Set(b.selected).size!==b.selected.length||b.selected.some(id=>!ids.includes(id)))return ['活动选择包含不存在或重复的项目'];try{if(Reward.minor(b.sharedBudget)<=0||Reward.minor(b.perOrderLimit)<=0)return ['组合预算和单笔预留上限须为正数'];}catch(e){return [e.message];}return [];}
  function load(){try{const b=JSON.parse(localStorage.getItem(KEY));if(b){b.sharedBudget??=defaults.sharedBudget;b.perOrderLimit??=defaults.perOrderLimit;if(!validate(b).length){b.items=b.items.map(item=>{const canonical=defaults.items.find(x=>x.id===item.id);return canonical?{...canonical,...item,name:item.name||canonical.name,source:canonical.source,type:canonical.type}:item;});return b;}}}catch(_){}return clone(defaults);}
  function evaluate(cfg,bundle,event){const out=[];let total=0,unknown=0;const a=Reward.minor(event.amount);for(const item of bundle.items){if(!bundle.selected.includes(item.id))continue;let state='eligible',reason='',reward=null;
    if(item.type==='first'){const r=Reward.calculate(cfg,{first:event.first,registered:event.registered,paidAt:event.paidAt,amount:event.amount});state=r.state;reward=r.reward??null;reason=r.reason||'';}
    else if(item.method&&item.method!=='all'&&item.method!==event.channel){state='ineligible';reason='payment-method';}
    else if(item.members&&item.members!=='all'&&item.members!==event.memberLevel){state=event.memberLevel?'ineligible':'unknown';reason='member-level';if(state==='unknown')unknown++;}
    else if(item.type==='cumulative'&&(Reward.minor(event.priorDaily||'0')>=Reward.minor(item.threshold||'1000')||Reward.minor(event.priorDaily||'0')+a<Reward.minor(item.threshold||'1000'))){state='ineligible';reason='daily-target';}
    else if(item.type==='single'&&a<Reward.minor(item.threshold||'500')){state='ineligible';reason='demo-single-target';}
    else if(item.type==='channel'&&(event.channel!=='third'||a<Reward.minor(item.threshold||'100')||(item.maxAmount&&a>=Reward.minor(item.maxAmount)))){state='ineligible';reason='demo-channel';}
    else if(item.type==='recommended'&&(event.channel!=='third'||a!==Reward.minor(item.threshold||'1000'))){state='ineligible';reason='demo-recommended';}
    if(item.type!=='first'&&state==='eligible')reward=item.rewardMode==='percent'?Number(BigInt(a)*BigInt(Reward.minor(item.rate||'0'))/10000n):Reward.minor(item.demoReward);
    if(state==='eligible'&&item.dailyCap){const paid=Reward.minor(event.rewardHistory?.[item.id]?.paid||'0'),count=Number(event.rewardHistory?.[item.id]?.count||0);if(paid>=Reward.minor(item.dailyCap)||count>=Number(item.dailyCount)){state='ineligible';reward=null;reason='daily-limit';}else reward=Math.min(reward,Reward.minor(item.dailyCap)-paid);}
    if(event.unknown&&state==='eligible'){state='unknown';reward=null;unknown++;}
    if(state==='eligible'&&reward!==null)total+=reward;
    out.push({id:item.id,name:item.name,state,reason,reward});
  }return {items:out,total,unknown,overOrderLimit:total>Reward.minor(bundle.perOrderLimit),overSharedBudget:total>Reward.minor(bundle.sharedBudget)};}
  const api={KEY,defaults,clone,escape,validate,load,evaluate};root.RewardHub=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
