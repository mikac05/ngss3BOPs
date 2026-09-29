'use strict';
// The fields below mirror the existing activity-center form. Reward calculations remain in engine.js.
const startDay=new Date();startDay.setHours(0,0,0,0);const endDay=new Date(startDay);endDay.setFullYear(endDay.getFullYear()+1);const localDate=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
const basicDefaults={startAt:localDate(startDay),endAt:localDate(endDay),ipLimit:0,deviceLimit:0,memberMode:'all',memberLevels:[],validMode:'any',validFirst:0,validDeposit:0,validTurnover:0,validCount:0,terminals:['h5','android','ios','pwa'],nameMode:'system',introMode:'system',rulesMode:'system',rulesText:{'zh-CN':'','zh-TW':'',en:''},marketing:false,layout:'自定义',background:'绿色',icon:'奖品',showText:'show',activityIntro:''};
cfg.basic={...basicDefaults,...cfg.basic,rulesText:{...basicDefaults.rulesText,...cfg.basic?.rulesText}};
const basicIds=['startAt','endAt','ipLimit','deviceLimit','validFirst','validDeposit','validTurnover','validCount','marketing','layout','background','icon','activityIntro'];
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value;}
function refreshBasic(){
  const b=cfg.basic;
  for(const name of ['nameMode','introMode','rulesMode','memberMode','validMode','showText'])document.querySelector(`input[name="${name}"][value="${b[name]}"]`)?.click();
  basicIds.forEach(id=>{const el=document.getElementById(id);el[el.type==='checkbox'?'checked':'value']=b[id];});
  document.querySelectorAll('.terminal').forEach(el=>el.checked=b.terminals.includes(el.value));
  document.getElementById('memberLevels').hidden=b.memberMode!=='specified';
  [...document.getElementById('memberLevels').options].forEach(o=>o.selected=b.memberLevels.includes(o.value));
  syncBasicLocale();
}
function syncBasicLocale(){
  const b=cfg.basic,l=document.getElementById('locale').value;
  document.getElementById('name').readOnly=b.nameMode==='system';
  document.getElementById('intro').readOnly=b.introMode==='system';
  document.getElementById('customRules').hidden=b.rulesMode!=='custom';
  document.getElementById('previewRules').hidden=b.rulesMode==='custom';
  document.getElementById('customRules').value=b.rulesText[l]||'';
  document.getElementById('previewRules').textContent=Copy.rules(cfg,l);
  document.getElementById('previewIcon').textContent=({'奖品':'🎁','赌场':'🎰','节日':'🎉','游戏':'🎮','活动':'🏁','美女':'✦','体育':'⚽','游戏图标':'🎯','浮窗图标':'✧'})[b.icon]||'🎁';
  document.querySelector('.banner-preview').style.background=({'绿色':'#14554b','红色':'#632d37','黄色':'#695220','紫色':'#49376d','暗银':'#383d4a','橘色':'#714129','蓝色':'#234c70'})[b.background];
  document.getElementById('previewName').hidden=b.showText==='hide';document.getElementById('previewIntro').hidden=b.showText==='hide';
}
basicIds.forEach(id=>document.getElementById(id).addEventListener('input',e=>{cfg.basic[id]=e.target.type==='checkbox'?e.target.checked:e.target.value;syncBasicLocale();}));
for(const name of ['nameMode','introMode','rulesMode','memberMode','validMode','showText'])document.querySelectorAll(`input[name="${name}"]`).forEach(el=>el.addEventListener('change',()=>{cfg.basic[name]=selected(name);if((name==='nameMode'||name==='introMode')&&cfg.basic[name]==='system'){const key=name==='nameMode'?'name':'intro';for(const l of ['zh-CN','zh-TW','en'])cfg.texts[l][key]=Reward.defaults.texts[l][key];document.getElementById(key).value=cfg.texts[document.getElementById('locale').value][key];previews();}document.getElementById('memberLevels').hidden=cfg.basic.memberMode!=='specified';syncBasicLocale();}));
document.querySelectorAll('.terminal').forEach(el=>el.addEventListener('change',()=>{cfg.basic.terminals=[...document.querySelectorAll('.terminal:checked')].map(x=>x.value);}));
document.getElementById('memberLevels').addEventListener('change',e=>cfg.basic.memberLevels=[...e.target.selectedOptions].map(x=>x.value));
document.getElementById('customRules').addEventListener('input',e=>cfg.basic.rulesText[document.getElementById('locale').value]=e.target.value);
document.getElementById('locale').addEventListener('change',syncBasicLocale);
const rewardDraw=draw;draw=function(){rewardDraw();cfg.basic={...basicDefaults,...cfg.basic,rulesText:{...basicDefaults.rulesText,...cfg.basic?.rulesText}};refreshBasic();};
document.getElementById('save').addEventListener('click',e=>{const b=cfg.basic,errors=[];if(!b.startAt||!b.endAt)errors.push('请填写活动开始和结束时间');else if(b.endAt<=b.startAt)errors.push('活动结束时间须晚于开始时间');for(const id of ['ipLimit','deviceLimit','validFirst','validDeposit','validTurnover','validCount'])if(!Number.isFinite(Number(b[id]))||Number(b[id])<0)errors.push(id+' 须为非负数');if(b.memberMode==='specified'&&!b.memberLevels.length)errors.push('请选择参与会员层级');if(!b.terminals.length)errors.push('请选择活动申领终端');if(b.rulesMode==='custom'&&['zh-CN','zh-TW','en'].some(l=>!b.rulesText[l]?.trim()))errors.push('自定义规则说明须提供三个语系');if(errors.length){e.stopImmediatePropagation();document.getElementById('errors').textContent=errors.join('\n');}},true);
refreshBasic();
