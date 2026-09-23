/* Shared local configuration contract. No backend requests. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./engine.js'));else root.LJConfig=factory(root.LuckyJourneyEngine);})(typeof window==='undefined'?globalThis:window,function(E){
  const key='lucky-journey-v3-review';
  const clone=x=>JSON.parse(JSON.stringify(x));

  const DEFAULT_WHEEL_IMAGES = {
    thanks: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='%23262d3d' stroke='%234a5568' stroke-width='2'/><text x='32' y='40' font-size='28' text-anchor='middle'>🎁</text></svg>",
    coin: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='%23d35400' stroke='%23ffbd4a' stroke-width='2'/><circle cx='32' cy='32' r='22' fill='%23f39c12'/><text x='32' y='41' font-size='26' text-anchor='middle' font-weight='bold' fill='%23fff'>💰</text></svg>",
    gem: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='%236c3483' stroke='%23af7ac5' stroke-width='2'/><polygon points='32,10 50,26 32,54 14,26' fill='%239b59b6'/><text x='32' y='38' font-size='24' text-anchor='middle'>💎</text></svg>",
    star: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='%23117864' stroke='%2348c9b0' stroke-width='2'/><polygon points='32,8 39,23 55,25 43,37 46,53 32,45 18,53 21,37 9,25 25,23' fill='%231abc9c'/><text x='32' y='39' font-size='22' text-anchor='middle' fill='%23fff'>⭐</text></svg>"
  };

  const DEFAULT_WHEEL_NAMES = {
    thanks: '谢谢参与',
    coin: '金币',
    gem: '宝石',
    star: '星钻'
  };

  const DEFAULT_FLOAT_ICONS = [
    { id: 'lucky_ticket', label: '奖券', src: './assets/float-icons/lucky_ticket.png' },
    { id: 'lucky_chest', label: '宝箱', src: './assets/float-icons/lucky_chest.png' },
    { id: 'lucky_bag', label: '礼包', src: './assets/float-icons/lucky_bag.png' },
    { id: 'lucky_chip', label: '筹码', src: './assets/float-icons/lucky_chip.png' },
    { id: 'lucky_map', label: '藏宝图', src: './assets/float-icons/lucky_map.png' },
    { id: 'lucky_wheel', label: '转盘', src: './assets/float-icons/lucky_wheel.png' }
  ];

  function defaults(){
    return {
      ...clone(E.DEFAULT_CONFIG),
      firstSpinMin: 88,
      firstSpinMax: 94,
      firstSpinPct: 90,
      basic: {
        name: '好运探索季',
        nameMode: 'system',
        start: '2026-09-15T00:00',
        end: '2026-09-29T00:00',
        repeat: false,
        ipLimit: 0,
        deviceLimit: 0,
        wallet: 'cash',
        wageringMultiple: 1,
        claimMode: 'auto',
        layerMode: 'all',
        segments: [],
        terminals: ['h5','android','ios','pwa'],
        terminalCount: 4
      },
      presentation: {
        marketing: false,
        layout: 'compact',
        palette: '#178f77',
        icon: '🎁',
        floatIcon: 'lucky_wheel',
        showText: true,
        description: '获取抽奖次数，转满进度领取大奖。',
        wheelImages: { ...DEFAULT_WHEEL_IMAGES },
        wheelNames: { ...DEFAULT_WHEEL_NAMES }
      }
    };
  }

  function merge(base,source){
    for(const k of Object.keys(base)){
      if(source?.[k]!==undefined){
        if(base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))merge(base[k],source[k]);
        else base[k]=clone(source[k]);
      }
    }
    return base;
  }

  function integerWeights(w){
    const keys=['coin','gem','star'], raw=keys.map(k=>Math.max(0,Number(w?.[k])||0)),sum=raw.reduce((a,b)=>a+b,0)||1;
    const scaled=raw.map(v=>v/sum*100), out=scaled.map(v=>Math.max(1,Math.floor(v)));
    while(out.reduce((a,b)=>a+b,0)>100){let i=out.indexOf(Math.max(...out));out[i]--;}
    while(out.reduce((a,b)=>a+b,0)<100){let i=scaled.map((v,j)=>v-out[j]).indexOf(Math.max(...scaled.map((v,j)=>v-out[j])));out[i]++;}
    return Object.fromEntries(keys.map((k,i)=>[k,out[i]]));
  }

  function normalize(source){
    const c=merge(defaults(),source||{});
    delete c.cohorts;delete c.matchedCohort;
    if(c.budget){delete c.budget.maxParticipants;delete c.budget.joinMode;}

    // Normalize first-spin range
    if(Number.isFinite(source?.firstSpinPct)&&(source?.firstSpinMin===undefined||source.firstSpinPct!==Math.round(((source.firstSpinMin||88)+(source.firstSpinMax||94))/2))){
      c.firstSpinPct=Math.max(6,Math.min(94,Math.round(source.firstSpinPct)));
      c.firstSpinMin=Math.max(1,c.firstSpinPct-3);
      c.firstSpinMax=Math.min(99,c.firstSpinPct+3);
    }else{
      if(!Number.isFinite(c.firstSpinMin))c.firstSpinMin=88;
      if(!Number.isFinite(c.firstSpinMax))c.firstSpinMax=94;
      c.firstSpinMin=Math.max(1,Math.min(98,Math.round(c.firstSpinMin)));
      c.firstSpinMax=Math.max(c.firstSpinMin,Math.min(99,Math.round(c.firstSpinMax)));
      c.firstSpinPct=Math.round((c.firstSpinMin+c.firstSpinMax)/2);
    }

    ['fast','mid','fine'].forEach(k=>c.prize[k].weights=integerWeights(c.prize[k].weights));
    c.presentation.layout='compact';
    if(!DEFAULT_FLOAT_ICONS.some(item=>item.id===c.presentation.floatIcon))c.presentation.floatIcon='lucky_wheel';
    c.presentation.wheelImages={...DEFAULT_WHEEL_IMAGES,...(source?.presentation?.wheelImages||c.presentation?.wheelImages||{})};
    const rawNames = source?.presentation?.wheelNames || c.presentation?.wheelNames || {};
    c.presentation.wheelNames = Object.fromEntries(
      ['thanks','coin','gem','star'].map(k => {
        const val = typeof rawNames[k] === 'string' ? rawNames[k].trim().slice(0, 6) : '';
        return [k, val || DEFAULT_WHEEL_NAMES[k]];
      })
    );
    c.basic.wallet='cash';
    c.basic.claimMode=['auto','manual'].includes(c.basic?.claimMode)?c.basic.claimMode:'auto';

    c.sources.free.grantMode='auto_on_visit';
    c.sources.free.days=c.personalDays;
    c.tasks = defaults().tasks.map((dTask, i) => {
      const found = (c.tasks || []).find(t => t.id === dTask.id) || (c.tasks || [])[i] || {};
      return {...dTask, ...found};
    });
    c.sources.task.taskCount = c.tasks.filter(t=>t.enabled).length;
    c.basic.layerMode='all';c.basic.segments=[];
    ['start','end'].forEach(k=>{if(/^\d{4}-\d{2}-\d{2}$/.test(c.basic[k]))c.basic[k]+='T00:00';});
    c.basic.terminalCount=c.basic.terminals.length;
    return c;
  }

  function read(storage){
    try{
      const raw=JSON.parse(storage.getItem(key));
      return {config:normalize(raw?.config),savedAt:raw?.savedAt||null,version:raw?.version||null};
    }catch(e){
      return {config:defaults(),error:'已保存配置无法读取，已载入默认设置。'};
    }
  }

  function save(storage,config){
    const record={version:7,savedAt:new Date().toISOString(),config:normalize(config)};
    storage.setItem(key,JSON.stringify(record));
    return record;
  }

  function get(c,path){return path.split('.').reduce((v,k)=>v?.[k],c);}
  function set(c,path,value){const parts=path.split('.'),last=parts.pop();parts.reduce((v,k)=>v[k],c)[last]=value;}
  const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  return {key,clone,defaults,normalize,integerWeights,read,save,get,set,esc,DEFAULT_WHEEL_IMAGES,DEFAULT_WHEEL_NAMES,DEFAULT_FLOAT_ICONS};
});
