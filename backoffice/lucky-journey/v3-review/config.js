/* Shared local configuration contract. No backend requests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));else root.LJConfig=factory(root.LuckyJourneyEngine);})(typeof window==='undefined'?globalThis:window,function(E){
  const key='lucky-journey-v3-review';
  const clone=x=>JSON.parse(JSON.stringify(x));
  function defaults(){return {...clone(E.DEFAULT_CONFIG),basic:{name:'好运探索季',nameMode:'system',start:'2026-09-15T00:00',end:'2026-09-29T00:00',repeat:false,ipLimit:0,deviceLimit:0,wallet:'bonus',wageringMultiple:1,layerMode:'all',segments:[],terminals:['h5','android','ios','pwa'],terminalCount:4},presentation:{marketing:false,layout:'compact',palette:'#178f77',icon:'🎁',showText:true,description:'获取抽奖次数，转满进度领取大奖。'}};}
  function merge(base,source){for(const k of Object.keys(base)){if(source?.[k]!==undefined){if(base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))merge(base[k],source[k]);else base[k]=clone(source[k]);}}return base;}
  function integerWeights(w){const keys=['coin','gem','star'], raw=keys.map(k=>Math.max(0,Number(w?.[k])||0)),sum=raw.reduce((a,b)=>a+b,0)||1;const scaled=raw.map(v=>v/sum*100), out=scaled.map(v=>Math.max(1,Math.floor(v)));while(out.reduce((a,b)=>a+b,0)>100){let i=out.indexOf(Math.max(...out));out[i]--;}while(out.reduce((a,b)=>a+b,0)<100){let i=scaled.map((v,j)=>v-out[j]).indexOf(Math.max(...scaled.map((v,j)=>v-out[j])));out[i]++;}return Object.fromEntries(keys.map((k,i)=>[k,out[i]]));}
  function normalize(source){const c=merge(defaults(),source||{});delete c.cohorts;delete c.matchedCohort;
    ['fast','mid','fine'].forEach(k=>c.prize[k].weights=integerWeights(c.prize[k].weights));c.presentation.layout='compact';c.sources.free.grantMode='auto_on_visit';c.sources.free.days=c.personalDays;c.sources.task.taskCount=c.tasks.filter(t=>t.enabled).length;
    c.tasks=c.tasks.map((task,i)=>({...defaults().tasks[i],...task}));
    c.basic.layerMode='all';c.basic.segments=[];
    ['start','end'].forEach(k=>{if(/^\d{4}-\d{2}-\d{2}$/.test(c.basic[k]))c.basic[k]+='T00:00';});
    c.basic.terminalCount=c.basic.terminals.length;return c;}
  function read(storage){try{const raw=JSON.parse(storage.getItem(key));return {config:normalize(raw?.config),savedAt:raw?.savedAt||null,version:raw?.version||null};}catch(e){return {config:defaults(),error:'已保存配置无法读取，已载入默认设置。'};}}
  function save(storage,config){const record={version:5,savedAt:new Date().toISOString(),config:normalize(config)};storage.setItem(key,JSON.stringify(record));return record;}
  function get(c,path){return path.split('.').reduce((v,k)=>v?.[k],c);}
  function set(c,path,value){const parts=path.split('.'),last=parts.pop();parts.reduce((v,k)=>v[k],c)[last]=value;}
  const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  return {key,clone,defaults,normalize,integerWeights,read,save,get,set,esc};
});
