'use strict';
const H=RewardHub,R=Reward,$=id=>document.getElementById(id);
let bundle=H.load(),cfg=R.load();
$('sharedBudget').value=bundle.sharedBudget;$('perOrderLimit').value=bundle.perOrderLimit;
function render(){
  $('catalogue').innerHTML=bundle.items.map(item=>{const edit=item.type==='first'?'index.html':(['cumulative','single'].includes(item.type)?'task-center.html':'channel-rewards.html')+'?edit='+encodeURIComponent(item.id);const award=item.type==='first'?'按注册时长×金额档位':item.rewardMode==='percent'?item.rate+'%':item.demoReward+' INR';return `<tr><td><input type="checkbox" data-select="${item.id}" ${bundle.selected.includes(item.id)?'checked':''} aria-label="选择${RewardHub.escape(item.name['zh-CN'])}"></td><td>${RewardHub.escape(item.name['zh-CN'])}</td><td>${item.source}</td><td>${award}</td><td><a href="${edit}">前往编辑</a></td></tr>`;}).join('');
  $('selection').textContent=`已选择 ${bundle.selected.length} / ${bundle.items.length} 项活动`;
  const event={amount:$('amount').value,priorDaily:$('priorDaily').value,channel:$('channel').value,registered:$('registered').value+'Z',paidAt:$('paidAt').value+'Z',first:$('first').checked};
  try{const errors=H.validate(bundle);if(errors.length)throw Error(errors.join('；'));const p=H.evaluate(cfg,bundle,event);
    $('preview').innerHTML=p.items.map(x=>`<p>${RewardHub.escape(x.name['zh-CN'])}：${x.state==='eligible'?R.money(x.reward)+' INR':x.state==='unknown'?'待核验':'未达本项条件'}</p>`).join('');
    $('total').textContent=`预计合计 ${R.money(p.total)} INR`;
    $('budgetRisk').textContent=p.overOrderLimit?'试算合计超过单笔预留上限；该笔不能建立新的奖励承诺。':p.overSharedBudget?'试算合计超过组合剩余预算；该笔不能建立新的奖励承诺。':'试算合计在已填预算内；还需核对各项领取次数与赠送上限。';
    $('errors').textContent='';$('save').disabled=false;
  }catch(e){$('preview').textContent='';$('total').textContent='';$('budgetRisk').textContent='';$('errors').textContent=e.message;$('save').disabled=true;}
}
document.addEventListener('change',e=>{if(e.target.dataset.select){bundle.selected=e.target.checked?[...new Set([...bundle.selected,e.target.dataset.select])]:bundle.selected.filter(x=>x!==e.target.dataset.select);render();}});
['amount','priorDaily','channel','registered','paidAt','first'].forEach(k=>$(k).addEventListener('input',render));
['sharedBudget','perOrderLimit'].forEach(k=>$(k).addEventListener('input',e=>{bundle[k]=e.target.value;render();}));
$('save').onclick=()=>{if(H.validate(bundle).length)return;bundle.revision++;try{localStorage.setItem(H.KEY,JSON.stringify(bundle));$('saved').textContent='已保存。各通道将显示所选的充值优惠。';}catch(e){$('saved').textContent='保存失败，请重试。';}};
render();
