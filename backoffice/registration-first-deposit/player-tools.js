(function(){
 'use strict';
 const q=new URLSearchParams(location.search),button=document.createElement('button'),dialog=document.createElement('dialog');
 button.type='button';button.className='player-tools-toggle';button.textContent='开发工具';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','playerTools');
 dialog.id='playerTools';dialog.className='player-tools-dialog';dialog.setAttribute('aria-labelledby','playerToolsTitle');
 dialog.innerHTML='<div class="tools-heading"><h2 id="playerToolsTitle">开发工具</h2><button type="button" id="closePlayerTools" aria-label="关闭开发工具">×</button></div><form method="get"><label>显示语言<select name="lang"><option value="zh-CN">简体中文</option><option value="zh-TW">繁體中文</option><option value="en">English</option><option value="bn">বাংলা</option></select></label><label>玩家状态<select name="scenario"></select></label><label>活动可用余额<input name="budget" type="number" min="0" step="0.01" placeholder="留空使用活动预算"></label><input type="hidden" name="amount"><p>仅调整当前预览，不修改活动设置。余额不会显示在玩家页面。</p><button type="submit">应用预览</button></form>';
 document.body.append(button,dialog);
 const form=dialog.querySelector('form');form.action=location.pathname;
 ParticipationStates.keys.forEach(key=>{const o=document.createElement('option');o.value=key==='available'?'new':key;o.textContent=ParticipationStates.get(key).title;form.elements.scenario.append(o);});
 button.onclick=()=>{form.elements.lang.value=document.documentElement.lang;form.elements.scenario.value=q.get('scenario')||'new';form.elements.budget.value=q.get('budget')||'';form.elements.amount.value=document.getElementById('amountInput').value;dialog.showModal();};
 dialog.querySelector('#closePlayerTools').onclick=()=>dialog.close();
})();
