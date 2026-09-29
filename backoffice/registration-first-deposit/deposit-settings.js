'use strict';
const bundle=RewardHub.load();
const channels=[
  {id:'third-a',method:'在线充值',name:'三方通道 A',limit:'100–50,000 INR',kind:'third'},
  {id:'third-b',method:'在线充值',name:'三方通道 B',limit:'500–20,000 INR',kind:'third'},
  {id:'bank',method:'银行卡充值',name:'银行卡通道',limit:'100–30,000 INR',kind:'other'},
  {id:'virtual',method:'虚拟币充值',name:'虚拟币通道',limit:'100–50,000 INR',kind:'other'}
];
const get=id=>bundle.items.find(x=>x.id===id);
const active=x=>bundle.selected.includes(x.id);
const edit=x=>x.type==='first'?'index.html':(['cumulative','single'].includes(x.type)?'task-center.html':'channel-rewards.html')+'?edit='+encodeURIComponent(x.id);
function relevant(x,ch){return !['channel','recommended'].includes(x.type)||ch.kind==='third';}
function summary(x){
  if(x.type==='first')return '注册时长 × 首充金额档位；首次成功充值只奖励一次';
  if(x.type==='cumulative')return `每日累计充值满 ${RewardHub.escape(x.threshold)} INR，奖励 ${x.demoReward} INR`;
  if(x.type==='single')return `单笔充值满 ${RewardHub.escape(x.threshold)} INR，奖励 ${x.demoReward} INR`;
  if(x.type==='channel')return `本三方通道充值 ${RewardHub.escape(x.threshold)}–${x.maxAmount||'以上'} INR，赠送 ${x.rewardMode==='percent'?x.rate+'%':x.demoReward+' INR'}；每日上限 ${x.dailyCap} INR／${x.dailyCount} 次`;
  return `本通道推荐金额 ${RewardHub.escape(x.threshold)} INR，加赠 ${x.rewardMode==='percent'?x.rate+'%':x.demoReward+' INR'}；每日上限 ${x.dailyCap} INR／${x.dailyCount} 次`;
}
function detail(ch){
  document.getElementById('detailTitle').textContent=ch.name+' · 充值优惠详情';
  document.getElementById('channelNote').textContent=`${ch.method} · 单笔限额 ${ch.limit}。适用优惠来自活动中心与任务中心；未启用项目仍列出供核对。`;
  document.getElementById('promotionRows').innerHTML=bundle.items.filter(x=>relevant(x,ch)).map(x=>`<tr><td>${RewardHub.escape(x.name['zh-CN'])}</td><td>${RewardHub.escape(summary(x))}</td><td>${x.source}</td><td>${active(x)?'已选用':'未选用'}</td><td><a href="${edit(x)}">前往配置</a></td></tr>`).join('');
}
document.getElementById('channelRows').innerHTML=channels.map(ch=>{
  const gifts=bundle.items.filter(x=>relevant(x,ch)&&active(x));
  const third=ch.kind==='third';
  return `<tr><td>${ch.method}</td><td>${ch.name}</td><td>${ch.limit}</td><td>${third?(active(get('third-party-gift'))?'活动中心已配置':'未选用'):'不适用'}</td><td>${third?(active(get('recommended-amount'))?get('recommended-amount').threshold+' INR':'未选用'):'不适用'}</td><td>${gifts.length} 项</td><td><button type="button" data-channel="${ch.id}">查看优惠</button></td></tr>`;
}).join('');
document.addEventListener('click',e=>{const ch=channels.find(x=>x.id===e.target.dataset.channel);if(ch){detail(ch);document.getElementById('detailTitle').scrollIntoView({block:'start',behavior:'smooth'});}});
detail(channels[0]);
