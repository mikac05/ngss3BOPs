'use strict';
const RH=RewardHub, RM=Reward, $=id=>document.getElementById(id);
const group=document.body.dataset.group;
let bundle=RH.load();
const allowed=group==='task'?['daily-cumulative','daily-single']:['third-party-gift','recommended-amount'];
function item(id){return bundle.items.find(x=>x.id===id);}
function options(){return allowed.map(id=>`<option value="${id}">${item(id).name['zh-CN']}</option>`).join('');}
function award(x){return x.rewardMode==='percent'?`${x.rate}%`:`${x.demoReward} INR`;}
function renderList(){
  $('rows').innerHTML=allowed.map(id=>{const x=item(id);return `<tr><td>${RewardHub.escape(x.name['zh-CN'])}</td><td>${group==='task'?'每日任务':'充值奖励'}</td><td>${RewardHub.escape(x.threshold)} INR</td><td>${RewardHub.escape(award(x))}</td><td>${RewardHub.escape(x.wallet)}</td><td>${bundle.selected.includes(id)?'已选用':'未选用'}</td><td><button type="button" data-edit="${id}">修改</button></td></tr>`;}).join('');
}
function renderEditor(id){
  const x=item(id);$('editor').hidden=false;$('editorTitle').textContent=`修改${group==='task'?'每日任务':'活动'} · ${x.name['zh-CN']}`;
  if(group==='activity')ChannelBasic.mount(x);
  $('editType').innerHTML=options();$('editType').value=id;$('editName').value=x.name['zh-CN'];$('threshold').value=x.threshold;$('reward').value=x.demoReward;$('wallet').value=x.wallet;$('wager').value=x.wager;
  if(group==='activity'){$('rewardMode').value=x.rewardMode||'fixed';$('rate').value=x.rate||'0';$('maxAmount').value=x.maxAmount||'';$('maxAmountRow').hidden=x.type!=='channel';$('dailyCap').value=x.dailyCap||'';$('dailyCount').value=x.dailyCount||'';showMode();ChannelBasic.update({});}
  $('thresholdLabel').textContent=x.type==='cumulative'?'累计金额 ≥':x.type==='single'?'单笔金额 ≥':x.type==='channel'?'充值金额 ≥':'通道推荐金额 =';
  if(group==='task'){$('taskMembers').value=x.members||'all';$('taskMethod').value=x.method||'all';$('taskPoints').value=x.points||'0';}
  $('timeNote').textContent=x.type==='cumulative'?'按租户日切累计成功充值；达到门槛后，每日领取一次。':x.type==='single'?'每笔成功订单分别核验，同一笔订单不重复发奖。':x.type==='channel'?'区间含下限、不含上限；奖励按充值成功金额计算，每日限额及次数分别生效。':'金额须等于当前通道推荐金额；可与三方支付充值赠送独立叠加。';
  $('editor').scrollIntoView({block:'start',behavior:'smooth'});
}
document.addEventListener('click',e=>{const id=e.target.dataset.edit;if(id)renderEditor(id);});
$('editType').addEventListener('change',e=>renderEditor(e.target.value));
function showMode(){if(group!=='activity')return;const percent=$('rewardMode').value==='percent';$('rateRow').hidden=!percent;$('fixedRow').hidden=percent;}
if(group==='activity'){$('rewardMode').addEventListener('change',showMode);['rewardMode','threshold','maxAmount','rate','reward','dailyCap','dailyCount','wallet','wager'].forEach(id=>$(id).addEventListener('input',()=>ChannelBasic.update({rewardMode:$('rewardMode').value,threshold:$('threshold').value,maxAmount:$('maxAmount').value,rate:$('rate').value,demoReward:$('reward').value,dailyCap:$('dailyCap').value,dailyCount:$('dailyCount').value,wallet:$('wallet').value,wager:$('wager').value})));}
$('cancelEdit').onclick=()=>{$('editor').hidden=true;$('editStatus').textContent='';};
$('saveEdit').onclick=()=>{
  const x=item($('editType').value);try{
    if(RM.minor($('threshold').value)<=0||RM.minor($('reward').value)<0)throw Error('门槛须大于0，固定奖励不可为负数。');
    if(!Number.isInteger(Number($('wager').value))||Number($('wager').value)<0)throw Error('打码倍数须为非负整数。');
    if($('wallet').value==='现金钱包'&&$('wager').value.trim()==='')throw Error('现金钱包必须填写打码倍数。');
    if(group==='activity'){
      const max=$('maxAmount').value.trim();if(x.type==='channel'&&max&&RM.minor(max)<=RM.minor($('threshold').value))throw Error('区间上限须大于下限。');
      if(RM.minor($('rate').value)<0||RM.minor($('rate').value)>10000)throw Error('奖励比例须在0%至100%之间。');
      if(RM.minor($('dailyCap').value)<=0||!Number.isInteger(Number($('dailyCount').value))||Number($('dailyCount').value)<=0)throw Error('每日金额和次数上限须大于0。');
      Object.assign(x,ChannelBasic.read());x.rewardMode=$('rewardMode').value;x.rate=$('rate').value;x.maxAmount=x.type==='channel'?max:'';x.dailyCap=$('dailyCap').value;x.dailyCount=$('dailyCount').value;
    }
    if(group==='task'){if(!Number.isInteger(Number($('taskPoints').value))||Number($('taskPoints').value)<0)throw Error('活跃度须为非负整数。');x.members=$('taskMembers').value;x.method=$('taskMethod').value;x.points=$('taskPoints').value;}
    x.threshold=$('threshold').value;x.demoReward=$('reward').value;x.wallet=$('wallet').value;x.wager=$('wager').value;
    bundle.revision++;localStorage.setItem(RH.KEY,JSON.stringify(bundle));renderList();$('editStatus').textContent='已保存。充值优惠总览将显示最新规则。';
  }catch(err){$('editStatus').textContent=err.message;}
};
renderList();const initial=new URLSearchParams(location.search).get('edit');if(allowed.includes(initial))renderEditor(initial);
