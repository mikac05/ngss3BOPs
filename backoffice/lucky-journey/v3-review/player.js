(() => {
  'use strict';
  const E=LuckyJourneyEngine,C=LJConfig,{Simulation,resultCopy}=LJSimulation,$=s=>document.querySelector(s),esc=C.esc;
  let config=C.read(localStorage).config,sim=new Simulation(config),busy=false,request=null,angle=0,phoneFrozen=null,generation=0;
  const label={unjoined:'尚未参加',active:'进行中',completed:'已完成',expired:'已到期',campaign_cut:'活动已结束'};
  const phaseLabel={fast:'快砍',mid:'中段',fine:'细砍'};
  const money=x=>Number(x).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  function msg(message){$('#phoneToast').textContent=message;$('#phoneToast').hidden=false;clearTimeout(msg.timer);msg.timer=setTimeout(()=>$('#phoneToast').hidden=true,2800);}
  $('.phone').append($('#prizePopup'));const shownResults=new Set();let popupReturn=null;
  function closePrize(){if($('#prizePopup').hidden)return;$('#prizePopup').hidden=true;if(popupReturn?.isConnected)popupReturn.focus();}
  function showPrize(record){
    if(!record||record.prize.type==='none'||shownResults.has(record.spinId))return;
    shownResults.add(record.spinId);
    const names=config.presentation?.wheelNames||C.DEFAULT_WHEEL_NAMES;
    const copy=resultCopy(record,names);
    popupReturn=document.activeElement;
    $('#prizeTitle').textContent=copy.title;
    $('#prizeAmount').textContent=copy.amount;
    $('#prizeMessage').textContent=copy.message;
    $('#prizeProgress').textContent=copy.progress;
    $('#prizePopup').dataset.kind=copy.kind;
    const imgs=config.presentation?.wheelImages||C.DEFAULT_WHEEL_IMAGES;
    const iconEl=$('#prizeIcon');
    iconEl.textContent='';
    if(imgs[copy.kind]){
      const imgEl=document.createElement('img');
      imgEl.src=imgs[copy.kind];
      imgEl.style.width='56px';
      imgEl.style.height='56px';
      imgEl.style.objectFit='contain';
      imgEl.alt=names[copy.kind]||'';
      iconEl.appendChild(imgEl);
    }else{
      iconEl.textContent=({coin:'◉',gem:'◆',star:'✦',complete:'♜'})[copy.kind]||'✦';
    }
    $('#prizePopup').hidden=false;$('#prizeClose').focus();
  }
  $('#prizeClose').onclick=closePrize;
  document.addEventListener('keydown',e=>{if(!$('#prizePopup').hidden){if(e.key==='Escape')closePrize();if(e.key==='Tab'){e.preventDefault();$('#prizeClose').focus();}}});
  function handle(result){if(result?.message&&!result?.record)msg(result.message);render();showPrize(result?.record);}

  function updateWheelContent(){
    const imgs=config.presentation?.wheelImages||C.DEFAULT_WHEEL_IMAGES;
    const names=config.presentation?.wheelNames||C.DEFAULT_WHEEL_NAMES;
    const imgMapping=[imgs.coin,imgs.thanks,imgs.gem,imgs.thanks,imgs.star,imgs.coin,imgs.gem,imgs.thanks];
    const nameMapping=[names.coin||'金币',names.thanks||'谢谢参与',names.gem||'宝石',names.thanks||'谢谢参与',names.star||'星钻',names.coin||'金币',names.gem||'宝石',names.thanks||'谢谢参与'];
    for(let i=0;i<8;i++){
      const el=$('#wheel-img-'+i);
      if(el)el.setAttribute('href',imgMapping[i]);
      const tel=$('#wheel-text-'+i);
      if(tel){
        const txt=nameMapping[i];
        tel.textContent=txt;
        if(txt.length>4){
          tel.setAttribute('font-size','8.5');
          tel.setAttribute('letter-spacing','-0.5px');
        }else{
          tel.setAttribute('font-size','10');
          tel.removeAttribute('letter-spacing');
        }
      }
    }
    if($('#wallet-label-coin'))$('#wallet-label-coin').textContent=names.coin||'金币';
    if($('#wallet-label-gem'))$('#wallet-label-gem').textContent=names.gem||'宝石';
    if($('#wallet-label-star'))$('#wallet-label-star').textContent=names.star||'星钻';
  }
  const updateWheelImages=updateWheelContent;

  function render(){
    const p=phoneFrozen||sim.play,c=p.cfg||config,supply=E.guaranteedTicketSupply(config),cost=E.playCostStats(config);
    $('#activityName').textContent=c.basic.name;$('#personalTime').textContent=p.status==='unjoined'?'含参加日共 '+c.personalDays+' 天有效':'有效期剩余 '+Math.max(0,(p.endsDay??sim.day)-sim.day)+' 天';
    $('#phoneStatus').textContent=label[p.status];$('#phoneProgressPct').textContent=p.progress.toFixed(4)+'%';$('#phoneProgressFill').style.width=p.progress+'%';$('#phoneTicketCount').textContent=p.tickets;$('#finishPrize').textContent=money(c.prize.finishPrize);const prizeCents=Math.round(c.prize.finishPrize*100);$('#phoneProgressMoney').textContent=money((p.progressUnits===1000000?prizeCents:Math.min(prizeCents-1,Math.floor(prizeCents*p.progressUnits/1000000)))/100);
    $('#phoneHint').textContent=phoneFrozen?'正在确认开奖结果…':p.status==='unjoined'?'参加活动，开启探索。':p.status==='completed'?(p.claimPending?'进度已满！请点击下方按钮领取奖金。':'进度已满，转满解锁已生成。'):p.status==='active'?(p.tickets?'抽中金币、宝石或星钻增加进度。':'获取抽奖次数，继续探索。'):'本局已结束。';
    $('#wallet-cash').textContent=money(p.rewards.cash);['coin','gem','star'].forEach(k=>$('#collect-'+k).textContent=p.collectibles[k].toLocaleString('en-US',{maximumFractionDigits:4}));
    const joining=p.status==='unjoined'||p.status!=='active'&&config.basic.repeat;
    const joinBlock=!sim.campaignOpen?'活动已结束':sim.risk?'暂不可参加':sim.available()<cost.hardReserve?'本期名额已满':'';
    const main=$('#mainAction');
    if(p.status==='completed'&&p.claimPending){
      main.textContent='🎉 领取奖金';main.disabled=busy;
    }else{
      main.textContent=busy?'开奖中…':phoneFrozen?'恢复连接':joining&&joinBlock?joinBlock:p.status==='unjoined'?'参加活动':p.status==='active'?(p.tickets?'转一次':'获取抽奖次数'):(config.basic.repeat&&sim.campaignOpen?'再次参加':label[p.status]);
      main.disabled=busy||(!phoneFrozen&&joining&&!!joinBlock)||(!phoneFrozen&&p.status!=='unjoined'&&p.status!=='active'&&!(config.basic.repeat&&sim.campaignOpen));
    }
    const last=p.records.at(-1);if(p.status==='completed')$('#phoneHint').textContent=p.claimPending?'进度已满！请点击下方按钮领取奖金。':last?.payoutStatus==='pending'?'奖金发放处理中，请稍后查看。':'奖金已发放，请查看钱包。';
    $('#resultBox').hidden=!last;$('#resultText').textContent=last?last.prize.label+(last.finish?' · 转满解锁 '+money(last.finish):''):'';$('#resultStatus').textContent=last?(last.prize.type==='none'?'本次未增加进度':last.finish?(p.claimPending?'待手动领取':last.payoutStatus==='pending'?'派奖处理中':'已发放'):'进度已更新'):'';
    const disabled=busy||phoneFrozen||p.status!=='active';
    $('#freeRow').hidden=!c.sources.free.enabled;$('#freeDesc').textContent='每日 '+c.sources.free.ticketsPerDay+' 次 · 本局上限 '+c.sources.free.cap+' 次';$('#freeBtn').disabled=true;$('#freeBtn').textContent=sim.freeDates.has(sim.day)?'今日已发放':'打开活动页发放';
    $('#taskRows').innerHTML=c.sources.task.enabled?c.tasks.map((task,i)=>task.enabled?`<div class="phone-task"><div><b>${esc(task.name)}</b><small>${taskDescription(task)} · +${c.sources.task.ticketsPerTask} 次</small></div><button data-task="${i}" ${disabled||p.tasks.includes(i)||p.granted.task>=c.sources.task.cap?'disabled':''}>${p.tasks.includes(i)?'已完成':'去完成'}</button></div>`:'').join(''):'';
    $('#friendRow').hidden=!c.sources.assist.enabled;$('#friendDesc').textContent='专属链接好友'+(c.sources.assist.depositRequired?'累计成功充值满 '+money(c.sources.assist.minDeposit)+' 后':'')+'助力 · 每人 '+c.sources.assist.ticketsPerFriend+' 次';$('#friendBtn').disabled=!!disabled||p.granted.assist>=c.sources.assist.cap;
    $('#externalTasks').innerHTML=c.tasks.map((task,i)=>task.enabled&&c.sources.task.enabled?`<div><span>${esc(task.name)}</span><button data-complete-task="${i}" ${disabled||p.tasks.includes(i)||p.granted.task>=c.sources.task.cap?'disabled':''}>${p.tasks.includes(i)?'已完成':'模拟完成'}</button></div>`:'').join('');$('#completeFriendBtn').disabled=!!disabled||!c.sources.assist.enabled||p.granted.assist>=c.sources.assist.cap;
    $('#remainingSpins').textContent=p.status==='completed'?'已完成 '+c.targetSpins+' 转':'转满需 '+c.targetSpins+' 转'+(p.status==='active'?' · 还需 '+Math.max(0,c.targetSpins-p.k)+' 转':'');
    $('#playerSupplyWarning').hidden=supply.all>=c.targetSpins||p.status==='completed';$('#playerSupplyWarning').textContent='当前最多可得 '+supply.all+' 次，未达到转满所需次数。';
    $('#simStatus').textContent=label[sim.play.status];$('#simDay').textContent='第 '+(sim.day+1)+' 天';$('#simStep').textContent=sim.play.k+' / '+config.targetSpins;$('#simStage').textContent=sim.play.k?phaseLabel[E.phaseOf(sim.play.k,config.targetSpins,config.phaseShares)]:'—';
    $('#statTickets').textContent=supply.all;$('#statTarget').textContent=config.targetSpins;$('#statReserve').textContent=money(cost.hardReserve);$('#ledgerSpent').textContent=money(sim.spent);$('#ledgerReserved').textContent=money(sim.reserved);$('#ledgerAvailable').textContent=money(sim.available());
    $('#eventLog').innerHTML=sim.events.map(e=>`<li><span>第 ${e.day} 天</span>${esc(e.text)}</li>`).join('')||'<li class="muted">暂无记录</li>';
    $('#record').textContent=JSON.stringify(sim.play.records.at(-1)||{status:sim.play.status},null,2);
    $('#reconnectBtn').disabled=!request||busy;$('#payoutRetryBtn').disabled=!sim.pending.length||busy;$('#nextDayBtn').disabled=busy;$('#campaignEndBtn').disabled=!sim.campaignOpen||busy;
    $('#sourceLabel').textContent='已载入后台设置 · 转满 '+config.targetSpins+' 次';
    updateWheelContent();
    renderChecks();
  }
  function taskDescription(t){const category={slot:'电子',live:'真人',sport:'体育',chess:'棋牌',fish:'捕鱼'};if(t.type==='play_category')return category[t.gameCategory]+'有效注单 '+t.threshold+' 局 · 每注至少 '+money(t.minBet);if(t.type==='deposit_count')return '成功充值 '+t.threshold+' 次';if(t.type==='deposit_amount')return '成功充值累计 '+t.threshold;if(t.type==='bet_count')return '有效注单 '+t.threshold+' 次';return '有效投注累计 '+t.threshold;}
  async function spin(){if(busy||!$('#prizePopup').hidden)return;const before=C.clone(sim.play);request='request-'+(++sim.sequence);const result=sim.spin(request);if(!result.ok){if(result.saved)phoneFrozen=before;handle(result);return;}
    busy=true;const turn=generation;const record=result.record;
    const sectors={coin:[0,5],none:[1,3,7],gem:[2,6],star:[4]}[record.prize.type];const sector=sectors[(record.k-1)%sectors.length];const target=360-(sector*45+22.5);angle=Math.ceil(angle/360)*360+1080+target;
    $('#wheelDisc').style.transition=$('#reduceMotion').checked?'none':'transform 950ms cubic-bezier(.15,.7,.12,1)';$('#wheelDisc').style.transform=`rotate(${angle}deg)`;
    phoneFrozen=before;render();await new Promise(r=>setTimeout(r,$('#reduceMotion').checked?0:980));if(turn!==generation)return;phoneFrozen=null;busy=false;handle(result);
  }
  function reset(c=config){closePrize();shownResults.clear();generation++;busy=false;phoneFrozen=null;request=null;config=C.normalize(c);sim=new Simulation(config);angle=0;$('#wheelDisc').style.transition='none';$('#wheelDisc').style.transform='rotate(0deg)';$('#outcome').value='random';$('#network').value='normal';$('#payout').value='posted';$('#risk').checked=false;$('#visitProb').value=config.assumptions.dailyVisitProb*100;$('#taskProb').value=config.assumptions.taskCompletionProb*100;$('#friendLambda').value=config.assumptions.assistLambda;updateWheelContent();render();}
  function fullSupply(){let r=sim.join();if(!r.ok)return r;for(let day=0;day<config.personalDays;day++){if(day)sim.nextDay();sim.grant('free');}config.tasks.forEach((_,i)=>sim.grant('task',i));for(let i=0;i<Math.ceil(config.sources.assist.cap/Math.max(1,config.sources.assist.ticketsPerFriend));i++)sim.grant('assist','scenario-friend-'+i,true);return {ok:true};}
  function scenario(name){reset(config);if(name==='fresh')return;
    if(name==='budget'){sim.config.budget.total=0;handle(sim.join());return;}
    if(name==='risk'){sim.risk=true;$('#risk').checked=true;handle(sim.join());return;}
    if(name==='ended'){sim.endCampaign();render();return;}
    if(['last','complete'].includes(name)){const r=fullSupply();if(!r.ok)return handle(r);const limit=config.targetSpins-(name==='last'?1:0);for(let k=0;k<limit;k++){const result=sim.spin('scenario-'+k);if(!result.ok)return handle(result);}render();return;}
    const result=sim.join();if(!result.ok)return handle(result);
    if(name==='no-tickets')sim.play.tickets=0;
    if(name==='expired'){sim.day=sim.play.endsDay;sim.expire();}
    if(name==='tail')sim.endCampaign();
    if(name==='lost'){sim.network='lost';$('#network').value='lost';}
    if(name==='pending'){sim.payout='pending';$('#payout').value='pending';}
    render();
  }
  function renderChecks(){const test=C.clone(config);test.assumptions.dailyVisitProb=Number($('#visitProb').value)/100;test.assumptions.taskCompletionProb=Number($('#taskProb').value)/100;test.assumptions.assistLambda=Number($('#friendLambda').value);const status=E.evaluatePublishStatus(test);$('#completionRate').textContent=(status.simRate*100).toFixed(1)+'%';$('#checkBadge').textContent=status.red.length?'未通过':status.yellow.length?'有提醒':'检查通过';$('#checkBadge').className='badge '+(status.red.length?'danger':status.yellow.length?'warning':'good');$('#checkList').innerHTML=status.red.map(x=>`<li class="danger">${esc(x)}</li>`).join('')+status.yellow.map(x=>`<li class="warning">${esc(x)}</li>`).join('')||'<li class="good">当前设置通过配置检查。</li>';$('#publishBtn').disabled=status.red.length>0;return status;}
  const devToggle=$('#devToggle'),devPanel=$('#devPanel');
  function closeDev(){devPanel.hidden=true;devToggle.setAttribute('aria-expanded','false');devToggle.focus();}
  devToggle.onclick=()=>{devPanel.hidden=!devPanel.hidden;devToggle.setAttribute('aria-expanded',String(!devPanel.hidden));if(!devPanel.hidden)$('#devClose').focus();};
  $('#devClose').onclick=closeDev;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!devPanel.hidden)closeDev();});
  $('#mainAction').onclick=()=>{
    if(sim.play.status==='completed'&&sim.play.claimPending){handle(sim.claimPrize());return;}
    if(phoneFrozen){phoneFrozen=null;handle(sim.spin(request));return;}
    if(sim.play.status==='unjoined'||sim.play.status!=='active')handle(sim.join());
    else if(!sim.play.tickets){$('#ticketSources').scrollIntoView({behavior:$('#reduceMotion').checked?'auto':'smooth',block:'start'});$('#ticketSources').focus({preventScroll:true});}
    else spin();
  };
  $('#freeBtn').onclick=()=>{};$('#taskRows').onclick=e=>{if(e.target.dataset.task!==undefined){const task=config.tasks[Number(e.target.dataset.task)];msg(task.type.startsWith('deposit')?'前往充值页面':'前往游戏页面');}};
  $('#friendBtn').onclick=()=>{const m=$('#inviteModal');if(m){m.hidden=false;$('#copyInviteBtn')?.focus();}};
  const invClose=$('#inviteClose'),cpyBtn=$('#copyInviteBtn');
  if(invClose)invClose.onclick=()=>{const m=$('#inviteModal');if(m)m.hidden=true;};
  if(cpyBtn)cpyBtn.onclick=()=>{try{navigator.clipboard?.writeText($('#inviteUrl').value);}catch(e){}msg('专属邀请链接已复制！好友注册达标即可助力。');};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#inviteModal')?.hidden)$('#inviteModal').hidden=true;});

  $('#externalTasks').onclick=e=>{if(e.target.dataset.completeTask!==undefined){const r=sim.grant('task',Number(e.target.dataset.completeTask));$('#simulationFeedback').textContent=r.message;handle(r);}};
  $('#completeFriendBtn').onclick=()=>{const r=sim.grant('assist','friend-'+(++sim.sequence),true);$('#simulationFeedback').textContent=r.message;handle(r);};
  $('#reconnectBtn').onclick=()=>{phoneFrozen=null;handle(sim.spin(request));};$('#payoutRetryBtn').onclick=()=>handle(sim.retryPayout());$('#nextDayBtn').onclick=()=>handle(sim.nextDay());$('#campaignEndBtn').onclick=()=>handle(sim.endCampaign());
  $('#risk').onchange=e=>{sim.risk=e.target.checked;render();};$('#outcome').onchange=e=>sim.outcome=e.target.value;$('#network').onchange=e=>sim.network=e.target.value;$('#payout').onchange=e=>sim.payout=e.target.value;
  $('#friendEventBtn').onclick=()=>handle(sim.grant('assist','fixed-friend',true));$('#friendInvalidBtn').onclick=()=>handle(sim.grant('assist','invalid-friend',false));
  $('#scenarios').onclick=e=>{const b=e.target.closest('[data-scenario]');if(b)scenario(b.dataset.scenario);};$('#resetBtn').onclick=()=>reset();$('#reloadBtn').onclick=()=>{if(!confirm('读取最新设置并重置模拟状态？'))return;const r=C.read(localStorage);reset(r.config);if(r.error)msg(r.error);};
  ['visitProb','taskProb','friendLambda'].forEach(id=>$('#'+id).oninput=renderChecks);
  $('#publishBtn').onclick=()=>{const status=renderChecks();if(!status.canPublish)return;try{localStorage.setItem(C.key+'-release',JSON.stringify({config,forecast:{dailyVisitProb:Number($('#visitProb').value)/100,taskCompletionProb:Number($('#taskProb').value)/100,assistLambda:Number($('#friendLambda').value)},checkedAt:new Date().toISOString(),status:'prototype'}));$('#publishResult').textContent='试算已保存至本机';}catch(e){$('#publishResult').textContent='本机保存失败。';}};
  $('#themeBtn').onclick=()=>document.documentElement.classList.toggle('light');$('#reduceMotion').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;$('#visitProb').value=config.assumptions.dailyVisitProb*100;$('#taskProb').value=config.assumptions.taskCompletionProb*100;$('#friendLambda').value=config.assumptions.assistLambda;updateWheelContent();render();
})();
