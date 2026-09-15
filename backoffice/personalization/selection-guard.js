/* Selection-time constraints. The resolver remains the final internal save guard. */
(()=>{'use strict';let api,lastGood;
const copy=x=>JSON.parse(JSON.stringify(x));
function reason(result){if(api.state.theme!=="NG"){for(const [id,row] of Object.entries(api.state.draft)){const design=row.extra?.design;if(design?.mode==="SET"&&!NGDesign.availableStyleIndices(api.state.theme,id).includes(Number(design.value)))return "此样式不属于当前主题";}}const bad=result.items.find(x=>(x.outcome==='Block'||x.outcome==='Auto-resolve')&&!(x.id==='theme'&&x.reasons.every(r=>/工作值已过期|预览已过期|当前模拟 Live/.test(r))));if(bad)return bad.reasons?.join('；')||bad.label;for(const auth of ['loggedOutCaps','loggedInCaps'])for(const [name,v] of Object.entries(result[auth]||{}))if(v.ok===false)return (api.state.uiLocale==='en'?'This would remove an entry: ':'此选择会移除功能入口：')+name;return '';}
function evaluate(mutate){const s=api.state,old=s.draft,theme=s.theme,acks=s.acks,install=s.preview.installEnabled;s.draft=copy(old);s.acks={auto:{},review:{}};try{mutate(s);return reason(api.resolveAll());}finally{s.draft=old;s.theme=theme;s.acks=acks;s.preview.installEnabled=install;}}
function completeAlternate(spec){
 const original=copy(spec.navSlot||{}),scopes=spec.authScope==='both'?['loggedOut','loggedIn']:[spec.authScope];
 const choices=auth=>scopes.includes(auth)?api.state.draft.bottomNav.value[auth].map((_,i)=>String(i)):[original[auth]??''];
 for(const out of choices('loggedOut'))for(const inside of choices('loggedIn')){
   spec.navSlot={loggedOut:out,loggedIn:inside};
   const result=api.resolveAll();
   if(!reason(result))return true;
 }
 spec.navSlot=original;return false;
}
function mutation(el,value){const d=el.dataset,a=d.action||d.studio||d.current,id=d.id,checked=value===undefined?el.checked:value;
 if(a==='set-value')return s=>{const [key,auth]=id.split('.'),row=s.draft[key],v=decodeURIComponent(d.value);row.mode=v==='关闭'&&api.byId[key].supportsOff?'OFF':'SET';row.sourceTheme=s.theme;if(key==='topDownloadBar'&&(v==='关闭'||row.mode==='OFF'))s.preview.installEnabled=false;if(key==='topStatusBar')row.value[auth]=v;else if(key==='alternateButton'){row.value||={target:'客服',authScope:'both',navSlot:{loggedOut:'',loggedIn:''}};row.value.placement=v;if(v==='底部导航自选槽位')completeAlternate(row.value);}else row.value=v;};
 if(a==='set-mode')return s=>{s.draft[id].mode=d.mode;if(d.mode==='INHERIT')s.draft[id].value=api.themeDefaultFor(id,s.theme);};
 if(['header-visible','visibility'].includes(a))return s=>{const r=s.draft[id];r.mode=checked?'SET':'OFF';if(checked)r.value=(api.enableValueFor||api.themeDefaultFor)(id,s.theme);else{r.value=null;if(id==='topDownloadBar')s.preview.installEnabled=false;}};
 if(['header-reset','reset-style'].includes(a))return ()=>api.resetObject(id);
 if(a==='style')return s=>{const row=s.draft[id],n=Number(d.style);if(['gameLayout','gameGridStyle'].includes(id)){row.mode='SET';row.value=NGDesign.names[n-1];}else row.extra.design={mode:'SET',value:n,sourceTheme:s.theme};};
 if(a==='home-quick'||a==='home-promotions')return s=>{s.draft.gameLayout.extra.home||={};s.draft.gameLayout.extra.home[a==='home-quick'?'quick':'promotions']=checked;};
 if(a==='replacement-enabled')return s=>{s.draft.bottomNav.extra.appReplacementEnabled||={};s.draft.bottomNav.extra.appReplacementEnabled[d.auth]=checked;};
 if(a==='alt-enabled')return s=>{const r=s.draft.alternateButton;r.mode=checked?'SET':'OFF';r.value||={placement:'浮动收折',target:'客服',authScope:'both',navSlot:{loggedOut:'',loggedIn:''}};};
 if(a==='choose'&&d.auth)return s=>{const r=s.draft.bottomNav;if(d.slot==='replacement'){r.extra.appReplacement||={};r.extra.appReplacement[d.auth]=d.value;}else{r.mode='SET';r.value[d.auth][Number(d.slot)]=d.value;}};
 if(['alt-capability','alt-auth','alt-slot'].includes(a))return s=>{const r=s.draft.alternateButton;r.mode='SET';r.value||={placement:'浮动收折',target:'客服',authScope:'both',navSlot:{loggedOut:'',loggedIn:''}};if(a==='alt-capability')r.value.target=value??el.value;if(a==='alt-auth'){r.value.authScope=value??el.value;if(r.value.placement==='底部导航自选槽位')completeAlternate(r.value);}if(a==='alt-slot')r.value.navSlot[d.auth]=value??el.value;};
 return null;
}
function scoped(){const s=api.state;for(const [id,row] of Object.entries(s.draft)){if(row.mode==='SET')row.sourceTheme=s.theme;if(row.extra?.design?.mode==='SET'&&row.extra.design.sourceTheme!==s.theme)delete row.extra.design;}}
function beforeRender(){scoped();const s=api.state,serialized=JSON.stringify({theme:s.theme,draft:s.draft});if(lastGood&&serialized===lastGood.serialized)return;const why=reason(api.resolveAll());if(why&&lastGood){s.theme=lastGood.theme;s.draft=copy(lastGood.draft);s.ui.fallbackMessage=(s.uiLocale==='en'?'Original settings kept. ':'已保留原设置。')+why;}else if(!why)lastGood={theme:s.theme,draft:copy(s.draft),serialized};}
function decorate(container=document){container.querySelectorAll('[data-guard-disabled]').forEach(el=>{el.disabled=false;delete el.dataset.guardDisabled;el.removeAttribute('title')});container.querySelectorAll('button[data-action],button[data-studio],button[data-current],input[type=checkbox],select[data-action]').forEach(el=>{if(el.disabled)return;if(el.tagName==='SELECT'){for(const o of el.options){const m=mutation(el,o.value);if(m){const why=evaluate(m);o.disabled=!!why;o.title=why;}}return;}const m=mutation(el,el.type==='checkbox'?!el.checked:undefined);if(!m)return;const why=evaluate(m);if(why){el.disabled=true;el.dataset.guardDisabled='true';el.title=(api.state.uiLocale==='en'?'Unavailable: ':'无法选择：')+why;el.closest('label')?.setAttribute('title',el.title);}});}
function attach(a){api=a;for(const type of ['click','change'])document.addEventListener(type,e=>{const el=e.target.closest('[data-action],[data-studio],[data-current]');if(!el||type==='click'&&el.tagName!=='BUTTON'||type==='change'&&el.tagName==='BUTTON')return;const m=mutation(el);if(!m)return;const why=evaluate(m);if(why){e.preventDefault();e.stopImmediatePropagation();if(el.type==='checkbox')el.checked=!el.checked;api.state.ui.fallbackMessage=(api.state.uiLocale==='en'?'Unavailable: ':'无法选择：')+why;api.renderAll();}},true);}
window.NGSelectionGuard={attach,beforeRender,decorate,evaluate,reason,completeAlternate};
})();
