(() => {
  'use strict';
  const E=LuckyJourneyEngine,C=LJConfig,$=s=>document.querySelector(s),esc=C.esc;
  let cfg=C.defaults(),dirty=false;
  const tip=text=>`<button type="button" class="tip" aria-label="${esc(text)}" data-tip="${esc(text)}">i</button>`;
  function field(label,path,{min=0,max=1000000,step=1,unit='',hint='',type='number',options=null,subHint='',disabled=false}={}){
    const val=C.get(cfg,path),id='f-'+path.replaceAll('.','-');
    let control=options?`<select id="${id}" data-path="${path}" ${disabled?'disabled':''}>${options.map(([v,t])=>`<option value="${v}" ${v===val?'selected':''}>${t}</option>`).join('')}</select>`:`<input id="${id}" data-path="${path}" type="${type}" value="${esc(val)}" ${type==='number'?`min="${min}" max="${max}" step="${step}"`:''} ${disabled?'disabled':''}>`;
    return `<div class="field"><label for="${id}">${label}${hint?tip(hint):''}</label><div class="control">${control}${unit?`<span class="unit">${unit}</span>`:''}</div>${subHint?`<small class="inline-hint range-note">${subHint}</small>`:''}</div>`;
  }
  function toggle(label,path,hint=''){return `<label class="toggle"><input type="checkbox" role="switch" data-path="${path}" ${C.get(cfg,path)?'checked':''}><span class="switch"></span><span>${label}</span>${hint?tip(hint):''}</label>`;}
  function section(id,n,title,body,extra=''){return `<section id="${id}" class="panel"><header class="panel-head"><h2>${n?`<span class="step">${n}</span>`:""}${title}</h2><div class="panel-actions">${extra}<button class="collapse icon-button" aria-expanded="true" aria-label="收起${title}" type="button">⌃</button></div></header><div class="panel-body">${body}</div></section>`;}

  const imgLabels = {thanks:'谢谢参与',coin:'金币',gem:'宝石',star:'星钻'};

  function build(){
    let basic=`<div class="basic-grid"><div class="form-grid">${field('活动类型','type',{options:[['lucky','好运探索季']]})}<div class="field"><label for="f-basic-name">活动名称</label><div class="control"><select id="nameMode" data-path="basic.nameMode" aria-label="名称方式"><option value="system">系统自带</option><option value="custom">自定义</option></select><input id="f-basic-name" data-path="basic.name" value="${esc(cfg.basic.name)}" readonly></div></div>${field('开始时间','basic.start',{type:'datetime-local'})}${field('结束时间','basic.end',{type:'datetime-local',hint:'活动时间按租户时区计算。结束后不再接受新参加。'})}${field('可玩天数','personalDays',{min:1,max:30,unit:'天',hint:'每次参加的个人有效期；从参加时间起计算。'})}${field('活动结束后','budget.afterEnd',{options:[['finish','允许做完本次'],['cut','截断']],hint:'允许做完本次：已参加会员仍可获取次数并转动，直到个人有效期结束。'})}${field('同注册IP上限','basic.ipLimit',{hint:'同一注册 IP 可参加的账号数；0 为不限。'})}${field('同注册设备上限','basic.deviceLimit',{hint:'同一注册设备可参加的账号数；0 为不限。'})}${field('派奖钱包','basic.wallet',{options:[['cash','现金钱包 (锁定)']],disabled:true,unit:'锁定',hint:'本活动派奖钱包锁定为现金钱包，达标后奖金派发至现金钱包。'})}${field('活动预算','budget.total',{min:0,max:1e12,step:.01,unit:'现金',hint:'每位会员参加时预留一笔转满解锁奖金；预算不足只停止新参加。'})}${field('领取方式','basic.claimMode',{options:[['auto','自动派发'],['manual','手动领取']],hint:'转满解锁奖金达标后的派发机制：自动派发至钱包，或由玩家在界面手动点击领取。'})}<div id="wagerField">${field('打码倍数','basic.wageringMultiple',{unit:'倍',hint:'仅设置本活动现金奖励的打码要求，出款仍受平台其他条件约束。'})}</div><div class="span-2 inline-options">${toggle('可重复参加','basic.repeat','上一局完成或到期后可再次参加；活动结束后不可开新局。')}</div><div class="field span-2"><label>申领终端</label><div class="inline-options" id="terminals">${[['h5','H5领取'],['android','Android APP领取'],['ios','IOS APP领取'],['pwa','PWA']].map(([v,t])=>`<label class="check"><input type="checkbox" data-terminal="${v}" ${cfg.basic.terminals.includes(v)?'checked':''}>${t}</label>`).join('')}</div></div></div><div class="display-settings"><div class="subhead"><h3>活动展示</h3>${toggle('营销活动','presentation.marketing')}</div><div class="form-grid">${field('图标','presentation.icon',{options:[['🎁','奖品'],['🎰','赌场'],['🎉','节日'],['⚑','活动']]})}</div><div class="field"><label>背景</label><div class="swatches">${[['#178f77','绿色'],['#b14353','红色'],['#ae822f','黄色'],['#7355ad','紫色'],['#3678b9','蓝色']].map(([v,t])=>`<button class="swatch" type="button" data-color="${v}" aria-label="${t}" aria-pressed="${cfg.presentation.palette===v}" style="--swatch:${v}"></button>`).join('')}</div></div><div id="banner" class="banner"><div><b id="bannerTitle"></b><p id="bannerCopy"></p></div><span id="bannerIcon"></span></div><div class="display-footer">${toggle('显示文字','presentation.showText')}</div><div class="field"><label for="promoDesc">宣传简介</label><textarea id="promoDesc" data-path="presentation.description" rows="3">${esc(cfg.presentation.description)}</textarea></div></div></div>`;

    const sourceFields={free:field('每日发放','sources.free.ticketsPerDay',{max:100,unit:'次'})+field('本局上限','sources.free.cap',{max:1000,unit:'次'}),task:field('每项任务','sources.task.ticketsPerTask',{max:100,unit:'次'})+field('本局上限','sources.task.cap',{max:1000,unit:'次'}),assist:field('每名好友','sources.assist.ticketsPerFriend',{max:100,unit:'次'})+field('本局上限','sources.assist.cap',{max:1000,unit:'次'})};
    let sources=['free','assist','task'].map((k,i)=>`<div class="source" id="source-${k}"><div class="subhead">${toggle(['每日免费','好友助力','做任务'][i],`sources.${k}.enabled`,['同一会员、同一活动按租户日领取；同日开新局不重领。','合格好友人数不限，每名好友在同一活动只贡献一次，累计次数受每局上限控制。','每项任务每局只发一次；只统计参加后的新增有效行为。'][i])}<output id="supply-${k}"></output></div><div class="source-body"><div class="form-grid three">${sourceFields[k]}</div>${k==='task'?`<div class="task-list">${cfg.tasks.map((t,j)=>`<div class="task-row">${toggle(t.name,`tasks.${j}.enabled`)}<span class="task-type">${t.type==='deposit_amount'?'累计充值':'累计有效投注'}</span>${field('达标条件',`tasks.${j}.threshold`,{min:.01,max:1e9,step:.01,unit:'金额',hint:t.type.includes('deposit')?'仅计算成功充值金额。':'仅计算已结算且非 VOID 的有效投注金额。'})}</div>`).join('')}</div>`:''}${k==='assist'?`<div class="inline-options divided">${toggle('需要充值','sources.assist.depositRequired','合格好友须完成成功充值，仅注册不发次数。')}${field('最低充值金额','sources.assist.minDeposit',{min:.01,max:1e9,step:.01,unit:'金额',hint:'好友注册后成功充值累计达到该金额，才符合充值助力条件。'})}${toggle('与推广同时发奖','sources.assist.allowPromotionDoubleReward')}</div>`:''}</div></div>`).join('');

    const wheelImgsHtml = `<div class="wheel-images-box"><div class="subhead"><h3>转盘奖项配置（名称与素材）</h3><span class="muted">可自订奖品名称（限 1~6 字以适配转盘盘面扇区）并自选上传素材图示</span></div><div class="wheel-images-grid">${['thanks','coin','gem','star'].map(k=>`<div class="wheel-image-card"><div class="wheel-image-thumb"><img id="wheel-thumb-${k}" src="${esc(cfg.presentation.wheelImages[k])}" alt="${esc(cfg.presentation?.wheelNames?.[k]||imgLabels[k])}"></div><div class="wheel-image-meta"><div class="wheel-name-box"><label class="wheel-name-label" for="wheel-name-${k}">奖品名称</label><div class="wheel-name-control"><input id="wheel-name-${k}" type="text" class="wheel-name-input" data-path="presentation.wheelNames.${k}" value="${esc(cfg.presentation?.wheelNames?.[k]||imgLabels[k])}" maxlength="6" placeholder="${imgLabels[k]}" aria-label="${imgLabels[k]}名称"><span class="wheel-name-limit">限6字</span></div></div><div class="wheel-image-actions"><label class="button button-sm upload-label">上传图片<input type="file" accept="image/*" data-upload-wheel="${k}" hidden></label><button type="button" class="button button-sm text-btn" data-reset-wheel="${k}">恢复默认</button></div></div></div>`).join('')}</div></div>`;

    const firstSpinRangeHtml = `<div class="field range-field"><label for="f-firstSpinMin">首转进度区间${tip('第一转保证达到的随机进度区间，第一转将在该设定区间内随机生成初始进度')}</label><div class="control range-selector"><input id="f-firstSpinMin" data-path="firstSpinMin" type="number" min="1" max="98" step="1" value="${cfg.firstSpinMin}" aria-label="首转最低进度"><span class="range-sep">～</span><input id="f-firstSpinMax" data-path="firstSpinMax" type="number" min="1" max="99" step="1" value="${cfg.firstSpinMax}" aria-label="首转最高进度"><span class="unit">%</span></div><div class="range-slider-wrap"><div class="range-track-bg"><div class="range-track-fill" id="firstSpinFill"></div></div><input type="range" class="range-slider-thumb thumb-min" id="rangeThumbMin" min="1" max="99" step="1" value="${cfg.firstSpinMin}" aria-label="调整首转最低进度"><input type="range" class="range-slider-thumb thumb-max" id="rangeThumbMax" min="1" max="99" step="1" value="${cfg.firstSpinMax}" aria-label="调整首转最高进度"></div></div>`;

    let prizes=`<div class="unlock-hero"><div class="unlock-title"><span class="unlock-icon">♜</span><div><h3>转满解锁</h3><span class="muted">进度满 100% 发放一次</span></div></div><div class="form-grid">${field('奖金金额','prize.finishPrize',{min:.01,max:1e9,step:.01,unit:'现金',hint:'本局唯一奖金。未完成不发奖；金币、宝石和星钻只用于增加进度。'})}${firstSpinRangeHtml}${field('解锁总次数','targetSpins',{min:4,max:30,unit:'次',hint:'设定范围：4~30 次。谢谢参与消耗一次、不加进度。第 N 次必定抽中道具补满剩余进度，不再抽谢谢参与。',subHint:'设定范围：4～30 次'})}</div></div>${wheelImgsHtml}<div class="phase-grid" hidden style="display:none">${['fast','mid','fine'].map((k,i)=>`<article class="phase phase-${k}"><div class="subhead"><h3>${['快砍','中段','细砍'][i]}</h3></div><div class="unit-rate">${tip('金币 / 100、宝石 / 10,000、星钻 / 1,000,000 换算进度。三阶段均可抽到三种道具。')} 三种道具均可抽中</div>${field('次数占比',`phaseShares.${k}`,{max:100,step:.01,unit:'%',hint:'扣除第一转后分配阶段，每阶段至少一次；调整相邻阶段，合计 100%。'})}<output class="phase-allocation" id="phase-${k}"></output>${field('谢谢参与',`prize.${k}.thanksPct`,{max:100,step:.1,unit:'%',hint:'仅扣除抽奖次数，不增加进度；第一转与最后一转不适用。'})}<div class="read-row"><span>中奖比例</span><output id="native-${k}"></output></div><div class="item-odds"><label>道具分配${tip("中奖后的条件概率，每项最低 1%、按 1% 调整，合计 100%；不改变进度增量。")}</label><div class="item-slider" data-phase="${k}"></div></div></article>`).join('')}</div><details class="advanced" open><summary>进度预览${tip('系统采用自适应心流算法生成全中奖路径。首转高落点锚定，中段悬念微步逼近，末转保底补满 100%。')}</summary><div class="chart-box"><div class="subhead"><span>全中奖路径与刺激衰减曲线</span><output id="curveSummary"></output></div><svg id="curve" viewBox="0 0 720 150" role="img" aria-label="进度曲线"></svg></div></details>`;

    $('#sections').innerHTML=section('basic',null,'基本资料',basic)+section('prizes',1,'转盘开奖与进度设置',prizes)+section('tickets',2,'抽奖次数',sources);
    document.querySelectorAll('.phase').forEach(box=>{const fields=box.querySelectorAll('.field');const share=document.createElement('div');share.className='phase-inline';fields[0].before(share);share.append(fields[0],box.querySelector('.phase-allocation'));const odds=document.createElement('div');odds.className='phase-inline';fields[1].before(odds);odds.append(fields[1],box.querySelector('.read-row'));});
    $('[data-path="type"]').disabled=true;
    document.querySelectorAll('.collapse').forEach(b=>b.onclick=()=>{const body=b.closest('.panel').querySelector('.panel-body');body.hidden=!body.hidden;b.setAttribute('aria-expanded',String(!body.hidden));b.textContent=body.hidden?'⌄':'⌃';});
    render();
  }

  function updateField(el){const path=el.dataset.path;if(!path)return;let value=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;
    if(el.type==='number'&&el.value==='')value=NaN;
    if(path==='basic.wallet')value='cash';
    if(path.startsWith('presentation.wheelNames.'))value=String(value||'').slice(0,6);
    C.set(cfg,path,value);
    if(path==='firstSpinMin'||path==='firstSpinMax'){
      cfg.firstSpinPct=Math.round(((cfg.firstSpinMin||88)+(cfg.firstSpinMax||94))/2);
    }
    if(path.startsWith('phaseShares.')&&Number.isFinite(value)){
      const key=path.split('.')[1],neighbor=key==='mid'?'fine':'mid',fixed=key==='fast'?'fine':'fast',limit=100-cfg.phaseShares[fixed];
      cfg.phaseShares[key]=Math.round(Math.max(0,Math.min(limit,value))*100)/100;cfg.phaseShares[neighbor]=Math.round((limit-cfg.phaseShares[key])*100)/100;
      Object.entries(cfg.phaseShares).forEach(([k,v])=>$(`[data-path="phaseShares.${k}"]`).value=v);
    }
    cfg.sources.free.days=cfg.personalDays;cfg.sources.task.taskCount=cfg.tasks.filter(t=>t.enabled).length;
    if(path==='basic.nameMode'&&value==='system'){cfg.basic.name='好运探索季';$('[data-path="basic.name"]').value=cfg.basic.name;}
    dirty=true;render();
  }

  function render(){
    const good=Number.isInteger(cfg.targetSpins)&&cfg.targetSpins>=4&&cfg.targetSpins<=30;
    const supply=E.guaranteedTicketSupply(cfg),cost=E.playCostStats(cfg,cfg.targetSpins),fmt=(n,d=2)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'—';
    $('#saveState').textContent=dirty?'未保存':'已保存';$('#saveState').dataset.state=dirty?'dirty':'saved';
    cfg.basic.wallet='cash';const walletSelect=$('[data-path="basic.wallet"]');if(walletSelect)walletSelect.value='cash';$('#wagerField').hidden=false;$('[data-path="basic.name"]').readOnly=cfg.basic.nameMode==='system';$('#nameMode').value=cfg.basic.nameMode;
    ['free','task','assist'].forEach(k=>{const box=$('#source-'+k);box.classList.toggle('off',!cfg.sources[k].enabled);box.querySelector('.source-body').querySelectorAll('input,select').forEach(e=>e.disabled=!cfg.sources[k].enabled);$('#supply-'+k).textContent=fmt(supply[k],0)+' 次 / 局';});
    const depositInput=$('[data-path="sources.assist.minDeposit"]');if(depositInput){depositInput.disabled=!cfg.sources.assist.enabled||!cfg.sources.assist.depositRequired;depositInput.closest('.field').hidden=!cfg.sources.assist.depositRequired;}
    cfg.tasks.forEach((t,i)=>{['threshold','gameCategory','minBet'].forEach(key=>{const input=$(`[data-path="tasks.${i}.${key}"]`);if(input)input.disabled=!cfg.sources.task.enabled||!t.enabled;});});
    $('#banner').style.background=cfg.presentation.palette;$('#banner').dataset.layout=cfg.presentation.layout;$('#bannerTitle').textContent=cfg.basic.name;$('#bannerCopy').textContent=cfg.presentation.description;$('#bannerIcon').textContent=cfg.presentation.icon;$('#bannerTitle').parentElement.hidden=!cfg.presentation.showText;
    const T=good?cfg.targetSpins:12,preview=E.progressPreview({...cfg,targetSpins:T}),pts=preview.map(r=>`${34+r.k/T*650},${116-r.progress*.94}`);
    $('#curve').innerHTML=good?`<path d="M34 22H684 M34 69H684 M34 116H684" class="grid-line"/><polyline points="${pts.join(' ')}"/><text x="6" y="26">100</text><text x="16" y="120">0</text>${[0,1,Math.floor(T/2),T].map(k=>`<text x="${34+k/T*650}" y="142" text-anchor="middle">${k} 次</text>`).join('')}`:'';
    $('#curveSummary').textContent=good?`首转 ${cfg.firstSpinMin}%–${cfg.firstSpinMax}% · 最刺激自适应衰减 · 第 ${T} 次补满 100%`:'请检查解锁总次数';
    const alloc=E.allocatePhaseSpins(T,cfg.phaseShares);let start=2;['fast','mid','fine'].forEach(k=>{const pa=$('#phase-'+k);if(pa)pa.textContent=`${alloc[k]} 次`;start+=alloc[k];const nt=$('#native-'+k);if(nt)nt.textContent=fmt(100-cfg.prize[k].thanksPct)+'%';});
    $('#sideProgress').textContent=fmt(cfg.prize.finishPrize)+' 现金';$('#sideBar').style.width='100%';$('#sideTarget').textContent=fmt(cfg.targetSpins,0)+' 次';$('#sideDays').textContent=fmt(cfg.personalDays,0)+' 天';
    const check=E.evaluatePublishStatus(cfg);$('#settingChecks').innerHTML=check.red.map(x=>`<li class="danger">${esc(x)}</li>`).join('')+check.yellow.map(x=>`<li class="warning">${esc(x)}</li>`).join('')||'<li class="good">配置检查通过</li>';
    for(const [id,v] of Object.entries({sideFree:supply.free,sideTask:supply.task,sideAssist:supply.assist,sideNonSocial:supply.nonSocial,sideAll:supply.all}))$('#'+id).textContent=fmt(v,0)+' 次';
    $('#ticketShortfall').hidden=supply.all>=cfg.targetSpins;$('#ticketShortfall').textContent=`全部来源少 ${cfg.targetSpins-supply.all} 次，无法达到解锁总次数。`;
    $('#sideBudget').textContent=fmt(cfg.budget.total);$('#sideAvailable').textContent=fmt(cfg.budget.total-cfg.budget.actualSpent-cfg.budget.outstandingReserve);$('#sideForecast').textContent=fmt(E.availableSlots(cfg)*cost.expected);
    $('#sideExpected').textContent=fmt(cost.expected);$('#sideReserve').textContent=fmt(cost.hardReserve);$('#sideSlots').textContent=fmt(E.availableSlots(cfg,cfg.targetSpins),0)+' 人';
    ['thanks','coin','gem','star'].forEach(k=>{
      const el=$('#wheel-thumb-'+k);if(el&&cfg.presentation?.wheelImages?.[k])el.src=cfg.presentation.wheelImages[k];
      const nameInput=$('#wheel-name-'+k);if(nameInput&&cfg.presentation?.wheelNames?.[k])nameInput.value=cfg.presentation.wheelNames[k];
    });
    const minV=Number(cfg.firstSpinMin||88),maxV=Number(cfg.firstSpinMax||94);
    const fill=$('#firstSpinFill'),thMin=$('#rangeThumbMin'),thMax=$('#rangeThumbMax');
    if(fill){fill.style.left=minV+'%';fill.style.width=Math.max(0,maxV-minV)+'%';}
    if(thMin)thMin.value=minV;
    if(thMax)thMax.value=maxV;
    document.dispatchEvent(new CustomEvent('lj-render',{detail:cfg}));
    document.querySelectorAll('input[type=number]').forEach(el=>el.setAttribute('aria-invalid',String(!el.disabled&&!el.checkValidity())));
  }

  function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,3000);}
  function save(){try{C.save(localStorage,cfg);dirty=false;render();toast('设置已保存。');return true;}catch(e){toast('保存失败，请导出配置。');return false;}}
  $('#sections').addEventListener('input',e=>{
    if(e.target.id==='rangeThumbMin'||e.target.id==='rangeThumbMax'){
      let minV=Number($('#rangeThumbMin').value),maxV=Number($('#rangeThumbMax').value);
      if(minV>=maxV){
        if(e.target.id==='rangeThumbMin')minV=Math.max(1,maxV-1);
        else maxV=Math.min(99,minV+1);
      }
      cfg.firstSpinMin=minV;
      cfg.firstSpinMax=maxV;
      cfg.firstSpinPct=Math.round((minV+maxV)/2);
      const minIn=$('[data-path="firstSpinMin"]'),maxIn=$('[data-path="firstSpinMax"]');
      if(minIn)minIn.value=minV;
      if(maxIn)maxIn.value=maxV;
      dirty=true;render();return;
    }
    if(e.target.dataset.path)updateField(e.target);
  });
  $('#sections').addEventListener('change',e=>{
    if(e.target.dataset.terminal){cfg.basic.terminals=Array.from(document.querySelectorAll('[data-terminal]:checked')).map(e=>e.dataset.terminal);cfg.basic.terminalCount=cfg.basic.terminals.length;dirty=true;render();}
    if(e.target.dataset.uploadWheel){
      const k=e.target.dataset.uploadWheel,file=e.target.files?.[0];
      if(file){
        const reader=new FileReader();
        reader.onload=ev=>{
          cfg.presentation.wheelImages[k]=ev.target.result;
          const thumb=$('#wheel-thumb-'+k);if(thumb)thumb.src=ev.target.result;
          dirty=true;render();toast('已更新【'+imgLabels[k]+'】转盘图片。');
        };
        reader.readAsDataURL(file);
      }
    }
  });
  $('#sections').addEventListener('click',e=>{
    const b=e.target.closest('[data-color]');if(b){cfg.presentation.palette=b.dataset.color;document.querySelectorAll('[data-color]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));dirty=true;render();}
    if(e.target.dataset.resetWheel){
      const k=e.target.dataset.resetWheel;
      cfg.presentation.wheelImages[k]=C.DEFAULT_WHEEL_IMAGES[k];
      const thumb=$('#wheel-thumb-'+k);if(thumb)thumb.src=C.DEFAULT_WHEEL_IMAGES[k];
      dirty=true;render();toast('已恢复【'+imgLabels[k]+'】默认图片。');
    }
  });
  $('#saveBtn').onclick=save;
  $('#playerLink').onclick=e=>{if(!save())e.preventDefault();};
  $('#restoreBtn').onclick=()=>{if(dirty&&!confirm('读取已保存设置并替换当前修改？'))return;const record=C.read(localStorage);cfg=record.config;dirty=false;build();toast(record.error||'已读取设置。');};
  $('#resetBtn').onclick=()=>{if(!confirm('还原默认设置？'))return;cfg=C.defaults();dirty=true;build();};
  $('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({version:7,config:C.normalize(cfg)},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lucky-journey-config.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('#themeBtn').onclick=()=>document.documentElement.classList.toggle('light');
  document.querySelectorAll('.section-nav a').forEach(a=>a.onclick=()=>{const section=$(a.hash);if(section){section.querySelector('.panel-body').hidden=false;const b=section.querySelector('.collapse');b.setAttribute('aria-expanded','true');b.textContent='⌃';}});
  document.addEventListener('lj-refresh',render);
  document.addEventListener('lj-weights',e=>{const {phase,bounds}=e.detail;cfg.prize[phase].weights=C.integerWeights({coin:bounds[0],gem:bounds[1]-bounds[0],star:100-bounds[1]});dirty=true;render();});
  document.addEventListener('lj-shares',e=>{const a=e.detail;cfg.phaseShares={fast:a[0],mid:a[1]-a[0],fine:100-a[1]};Object.entries(cfg.phaseShares).forEach(([k,v])=>{const input=$(`[data-path="phaseShares.${k}"]`);if(input)input.value=v;});dirty=true;render();});
  const record=C.read(localStorage);cfg=record.config;dirty=!record.savedAt;build();if(record.error)toast(record.error);
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.section-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-100px 0px -60% 0px'});document.querySelectorAll('.panel').forEach(s=>observer.observe(s));
})();
