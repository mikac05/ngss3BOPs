'use strict';
const H=RewardHub,R=Reward,$=id=>document.getElementById(id);
let bundle=DepositCatalogue.load(),cfg=R.load();
const trialNow=new Date(),trialRegistered=new Date(trialNow);trialRegistered.setMonth(trialRegistered.getMonth()-8);const localTime=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);$('paidAt').value=localTime(trialNow);$('registered').value=localTime(trialRegistered);
$('memberGiftCap').value=bundle.memberGiftCap;$('sharedBudget').value=bundle.sharedBudget;$('perOrderLimit').value=bundle.perOrderLimit;
function render(){
  $('catalogue').innerHTML=bundle.items.filter(item=>bundle.selected.includes(item.id)).map(item=>{const edit='index.html?tab=deposit&edit='+encodeURIComponent(item.id);const award=RewardHub.escape(DepositCatalogue.summary(item));return `<tr><td>${DepositCatalogue.status(item,bundle)}</td><td>${RewardHub.escape(item.name['zh-CN'])}</td><td>${item.source}</td><td>${award}</td><td><a href="${edit}">前往编辑</a></td></tr>`;}).join('');
  $('selection').textContent=`已启用 ${bundle.selected.length} 项活动`;
  const event={amount:$('amount').value,priorDaily:$('priorDaily').value,channel:$('channel').value,registered:$('registered').value,paidAt:$('paidAt').value,first:$('first').checked};
  try{const errors=[...H.validate(bundle),...bundle.items.filter(x=>bundle.selected.includes(x.id)).flatMap(x=>DepositCatalogue.errors(x).map(e=>x.name['zh-CN']+'：'+e))];if(errors.length)throw Error(errors.join('；'));const p=H.evaluate(cfg,bundle,event);
    $('preview').innerHTML=p.items.map(x=>`<p>${RewardHub.escape(x.name['zh-CN'])}：${x.state==='eligible'?R.money(x.reward)+' INR':x.state==='unknown'?'待核验':'未达本项条件'}</p>`).join('');
    $('total').textContent=`预计合计 ${R.money(p.total)} INR`;
    $('budgetRisk').textContent=p.overOrderLimit?'试算合计超过单笔预留上限；该笔不能建立新的奖励承诺。':p.overSharedBudget?'试算合计超过组合剩余预算；该笔不能建立新的奖励承诺。':'试算合计在已填预算内；还需核对各项领取次数与赠送上限。';
    $('errors').textContent='';$('save').disabled=false;
  }catch(e){$('preview').textContent='';$('total').textContent='';$('budgetRisk').textContent='';$('errors').textContent=e.message;$('save').disabled=true;}
}
['amount','priorDaily','channel','registered','paidAt','first'].forEach(k=>$(k).addEventListener('input',render));
['sharedBudget','perOrderLimit','memberGiftCap'].forEach(k=>$(k).addEventListener('input',e=>{bundle[k]=e.target.value;render();}));
$('save').onclick=()=>{const latest=DepositCatalogue.load();for(const key of ['sharedBudget','perOrderLimit','memberGiftCap'])latest[key]=bundle[key];bundle=latest;if(H.validate(bundle).length||bundle.items.some(x=>bundle.selected.includes(x.id)&&DepositCatalogue.errors(x).length))return;bundle.revision++;try{localStorage.setItem(H.KEY,JSON.stringify(bundle));$('saved').textContent='已保存。组合预算已更新，活动启用状态保持不变。';}catch(e){$('saved').textContent='保存失败，请重试。';}};
render();

window.addEventListener('storage',e=>{if(e.key===H.KEY){const limits=Object.fromEntries(['sharedBudget','perOrderLimit','memberGiftCap'].map(k=>[k,$(k).value]));bundle=DepositCatalogue.load();Object.assign(bundle,limits);render();}});
