'use strict';
const R=Reward,H=RewardHub,C=Copy,$=id=>document.getElementById(id);
const query=new URLSearchParams(location.search),view=document.body.dataset.view;
const cfg=R.load(),bundle=H.load(),now=new Date(),registered=new Date(now);
const scenario=query.get('scenario')||'new';
if(['notstarted','ended'].includes(scenario)){
 const offset=scenario==='notstarted'?86400000:-86400000;
 cfg.basic={...cfg.basic,periodMode:'scheduled',startAt:new Date(+now+(scenario==='notstarted'?offset:-30*86400000)).toISOString(),endAt:new Date(+now+(scenario==='notstarted'?30*86400000:offset)).toISOString()};
}

if(['returning','used','unknown','credited','rewardpending','rewardfailed','pending'].includes(scenario))registered.setUTCMonth(registered.getUTCMonth()-8);else if(scenario==='near')registered.setUTCDate(registered.getUTCDate()-20);else registered.setUTCDate(registered.getUTCDate()-1);
let lang=['zh-CN','zh-TW','en','bn'].includes(query.get('lang'))?query.get('lang'):'zh-CN';
let amount=query.get('amount')||(scenario==='unmet'?'50':null)||(['returning','used','unknown','credited','rewardpending','rewardfailed','pending'].includes(scenario)?'1000':'100');
let channel='third',order=['unknown','credited','pending','rewardpending','rewardfailed'].includes(scenario)?scenario:'draft',snapshot=null;
const first=!['used','credited','rewardpending','rewardfailed'].includes(scenario);let participation='available';
let futureDays=7;
const budgetRaw=query.get('budget')||cfg.budget;
const availableBudget=/^\d+(\.\d{1,2})?$/.test(budgetRaw)?Math.min(R.minor(budgetRaw),R.minor(cfg.budget)):null;
function lacksBudget(r){return r.state==='eligible'&&(availableBudget===null||r.reward>availableBudget);}
const T={bn:PlayerBN.ui,
'zh-CN':{center:'活动中心',deposit:'充值',back:'返回活动',headline:'你的首充奖励',age:'当前注册档位',new:'已注册',top:'本活动最高奖励',tiers:'选择金额，查看可得奖励',current:'当前金额',next:'下一金额档',difference:'金额差额',extra:'奖励增加',estimate:'预计可得',amount:'充值金额',channel:'充值方式',third:'三方支付',other:'其他方式',linked:'本次充值优惠',none:'此金额暂无适用优惠',not:'未达条件',checking:'正在核验',used:'首充资格已使用',usedHint:'首充奖励每位会员限一次。你仍可查看其他充值优惠。',once:'仅限首次成功充值，匹配一档奖励；未达标的首充不补发。',go:'前往充值',submit:'确认充值',rules:'规则说明',wallet:'派奖钱包',cash:'现金钱包',bonus:'彩金钱包',turnover:'所需打码',limit:'单人上限',status:'充值结果',pending:'等待支付结果',pendingText:'请完成支付。支付成功后，各项优惠分别核验。',unknown:'正在确认奖励',unknownText:'充值结果正在核对，请勿为领取奖励重复充值。',credited:'奖励已入账',creditedText:'首充奖励已完成，请到钱包查看。',cancel:'取消订单',otherOffers:'查看充值优惠',budget:'当前优惠暂不可用，请稍后查看。',invalid:'请输入有效充值金额。',record:'查看奖励详情',notYet:'尚未达到活动门槛',ageHint:'以首次充值成功时的注册时长为准。',max:'已达到当前可得奖励上限',after:'核验通过后自动派发',total:'预计奖励合计',balance:'剩余每日赠送额度以核验结果为准。',noActivity:'当前暂无首充活动',closed:'此活动当前未开放，请查看其他充值优惠。'},
'zh-TW':{center:'活動中心',deposit:'充值',back:'返回活動',headline:'你的首充獎勵',age:'目前註冊檔位',new:'已註冊',top:'本活動最高獎勵',tiers:'選擇金額，查看可得獎勵',current:'目前金額',next:'下一金額檔',difference:'金額差額',extra:'獎勵增加',estimate:'預計可得',amount:'充值金額',channel:'充值方式',third:'三方支付',other:'其他方式',linked:'本次充值優惠',none:'此金額暫無適用優惠',not:'未達條件',checking:'正在核驗',used:'首充資格已使用',usedHint:'首充獎勵每位會員限一次。你仍可查看其他充值優惠。',once:'僅限首次成功充值，匹配一檔獎勵；未達標的首充不補發。',go:'前往充值',submit:'確認充值',rules:'規則說明',wallet:'派獎錢包',cash:'現金錢包',bonus:'彩金錢包',turnover:'所需打碼',limit:'單人上限',status:'充值結果',pending:'等待支付結果',pendingText:'請完成支付。支付成功後，各項優惠分別核驗。',unknown:'正在確認獎勵',unknownText:'充值結果正在核對，請勿為領取獎勵重複充值。',credited:'獎勵已入帳',creditedText:'首充獎勵已完成，請到錢包查看。',cancel:'取消訂單',otherOffers:'查看充值優惠',budget:'目前優惠暫不可用，請稍後查看。',invalid:'請輸入有效充值金額。',record:'查看獎勵詳情',notYet:'尚未達到活動門檻',ageHint:'以首次充值成功時的註冊時長為準。',max:'已達到目前可得獎勵上限',after:'核驗通過後自動派發',total:'預計獎勵合計',balance:'剩餘每日贈送額度以核驗結果為準。',noActivity:'目前暫無首充活動',closed:'此活動目前未開放，請查看其他充值優惠。'},
en:{center:'Activity center',deposit:'Deposit',back:'Back to activity',headline:'Your first deposit reward',age:'Your membership tier',new:'Registered',top:'Maximum activity reward',tiers:'Choose an amount to compare rewards',current:'Current amount',next:'Next amount tier',difference:'Amount difference',extra:'Reward increase',estimate:'Estimated reward',amount:'Deposit amount',channel:'Payment method',third:'Third-party payment',other:'Other method',linked:'Deposit offers',none:'No applicable offer for this amount',not:'Not qualified',checking:'Verifying',used:'First deposit already used',usedHint:'One first deposit reward per member. Other deposit offers may still apply.',once:'Only your first successful deposit can qualify for one tier. An ineligible first deposit cannot qualify later.',go:'Go to deposit',submit:'Confirm deposit',rules:'How it works',wallet:'Reward wallet',cash:'Cash wallet',bonus:'Bonus wallet',turnover:'Required turnover',limit:'Reward cap',status:'Deposit result',pending:'Awaiting payment',pendingText:'Complete payment. Each offer is verified separately after payment succeeds.',unknown:'Confirming your reward',unknownText:'We are checking the result. Do not make another deposit to claim this reward.',credited:'Reward credited',creditedText:'Your first deposit reward is available in your wallet.',cancel:'Cancel order',otherOffers:'View deposit offers',budget:'This offer is temporarily unavailable. Please check later.',invalid:'Enter a valid deposit amount.',record:'View reward details',notYet:'Activity requirements not met',ageHint:'Your membership period is checked when the first deposit succeeds.',max:'Current reward cap reached',after:'Sent automatically after verification',total:'Estimated total reward',balance:'Remaining daily reward allowance is subject to verification.',noActivity:'No first deposit activity available',closed:'This activity is not currently available. View other deposit offers.'}
};

const F={bn:PlayerBN.forecast,
 'zh-CN':{progress:'注册进度',reached:'已达',future:'预览未来优惠',days:'多少天后',next:'到下一时长档',period:'活动期间',date:'预览日期',tier:'预计档位',reward:'同金额预计奖励',today:'今天充值',later:'所选日期充值',increase:'比今天增加',note:'仅预览首充奖励，按当前规则计算，不预留预算。实际奖励以充值成功时的活动规则与资格核验为准。',outside:'所选日期不在活动期间内，无法参与本活动。',beyond:'下一时长档在活动结束之后，本期无法达到。',top:'已达到最高时长档。',done:'首充已完成，后续时长档不再领取。',achieved:'已完成奖励档位',invalid:'请输入有效的整数天数。',todayGoal:'今天的下一金额档',amount:'充值金额',bonus:'预计奖励',extraAmount:'多充值',extraReward:'奖励增加',currentOnly:'前往充值时按当前日期重新预估。',closed:'活动当前未开放。'},
 'zh-TW':{progress:'註冊進度',reached:'已達',future:'預覽未來優惠',days:'多少天後',next:'到下一時長檔',period:'活動期間',date:'預覽日期',tier:'預計檔位',reward:'同金額預計獎勵',today:'今天充值',later:'所選日期充值',increase:'比今天增加',note:'僅預覽首充獎勵，按目前規則計算，不預留預算。實際獎勵以充值成功時的活動規則與資格核驗為準。',outside:'所選日期不在活動期間內，無法參與本活動。',beyond:'下一時長檔在活動結束之後，本期無法達到。',top:'已達到最高時長檔。',done:'首充已完成，後續時長檔不再領取。',achieved:'已完成獎勵檔位',invalid:'請輸入有效的整數天數。',todayGoal:'今天的下一金額檔',amount:'充值金額',bonus:'預計獎勵',extraAmount:'多充值',extraReward:'獎勵增加',currentOnly:'前往充值時按目前日期重新預估。',closed:'活動目前未開放。'},
 en:{progress:'Membership progress',reached:'Reached',future:'Preview future offers',days:'Days from today',next:'Next membership tier',period:'Activity period',date:'Preview date',tier:'Projected tier',reward:'Estimated reward at the same amount',today:'Deposit today',later:'Deposit on selected date',increase:'Increase from today',note:'First deposit reward only, based on current rules. No budget is reserved. Actual rewards depend on the rules and eligibility when payment succeeds.',outside:'The selected date is outside the activity period.',beyond:'The next membership tier falls after this activity ends.',top:'Highest membership tier reached.',done:'First deposit completed. Later membership tiers cannot be claimed.',achieved:'Completed reward tier',invalid:'Enter a valid whole number of days.',todayGoal:'Next amount tier today',amount:'Deposit amount',bonus:'Estimated reward',extraAmount:'Additional deposit',extraReward:'Reward increase',currentOnly:'Your reward is recalculated for today when you proceed to deposit.',closed:'This activity is not currently open.'}
};
function drawForecast(event,current,active){
 const f=F[lang],period=RewardForecast.period(cfg,now),nf=RewardForecast.next(cfg,registered.toISOString(),now),future=RewardForecast.evaluate(cfg,event,now,futureDays),date=t=>new Date(t).toLocaleString(lang,{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
 $('futurePanel').hidden=view!=='activity'||!first||order!=='draft'||!active;
 $('futureTitle').textContent=f.future;$('futureDaysLabel').textContent=f.days;$('futureDays').value=Number.isFinite(futureDays)?futureDays:'';
 $('activityPeriod').textContent=f.period+' · '+(cfg.basic?.periodMode==='always'?(lang==='bn'?'সবসময় চালু':lang==='en'?'Always open':lang==='zh-TW'?'始終開啟':'始终开启'):date(period.start)+' — '+date(period.end));
 $('nextAge').textContent=f.next;$('nextAge').disabled=!nf?.within;
 $('nextAge').onclick=()=>{futureDays=nf.days;draw();};
 $('forecastDate').textContent=Number.isFinite(future.at)?f.date+' · '+date(future.at):'';
 const reward=future.state==='eligible'?money(future.reward):future.state==='outside'?f.outside:future.state==='invalid'?f.invalid:future.state==='budget'?T[lang].budget:T[lang].notYet;
 $('forecastResult').replaceChildren();
 for(const text of [f.amount+' · '+amount+' '+cfg.currency,...(future.state==='eligible'?[f.tier+' · '+ageName(cfg.ages[future.row])]:[]),f.reward+' · '+reward]){const el=document.createElement('p');el.textContent=text;$('forecastResult').append(el);}
 $('forecastCompare').replaceChildren();
 if(future.state==='eligible'&&current.state==='eligible'){
  const delta=future.reward-current.reward;
  const a=document.createElement('p');a.textContent=f.today+' '+money(current.reward)+' → '+f.later+' '+money(future.reward);$('forecastCompare').append(a);
  const b=document.createElement('strong');b.textContent=f.increase+' '+money(delta);$('forecastCompare').append(b);
 }
 $('forecastNote').textContent=(!nf?f.top:nf.within?'':f.beyond)+' '+f.note+' '+f.currentOnly;
}

function ev(a=amount){return {first:['credited','rewardpending','rewardfailed'].includes(scenario)?true:first,registered:registered.toISOString(),paidAt:now.toISOString(),amount:a,channel,priorDaily:'0',rewardHistory:{}};}
function offerName(x){return x.id==='registration-first-deposit'?cfg.texts[lang].name:x.name[lang]||(lang==='bn'?PlayerBN.names[bundle.items.find(i=>i.id===x.id)?.type]||PlayerBN.names.deposit:x.name.en);}
function money(v){return R.money(v)+' '+cfg.currency;}
function ageName(a){return a.value===0?T[lang].new:C.age(a,lang);}
function link(page){return page+'?'+new URLSearchParams({scenario,amount,lang,...(query.has('budget')?{budget:query.get('budget')}:{})});}
function draw(){
  const w=T[lang],event=snapshot||ev(),active=bundle.selected.includes('registration-first-deposit');
  const navLabels={bn:PlayerBN.nav,'zh-CN':['活动中心','充值管理','集中管理简报','设置说明','首充活动','玩家页面','充值页面','首充规则','首充简报'],'zh-TW':['活動中心','充值管理','集中管理簡報','設定說明','首充活動','玩家頁面','充值頁面','首充規則','首充簡報'],en:['Activity center','Deposit management','Management plan','Setup guide','First deposit settings','Player page','Deposit page','First deposit rules','First deposit presentation']};document.querySelectorAll('.page-navigation a').forEach((a,i)=>{a.textContent=navLabels[lang][i];const page=new URL(a.href).pathname.split('/').pop();if(['player.html','deposit.html'].includes(page))a.href=link(page);});
  document.documentElement.lang=lang;document.title=view==='deposit'?w.deposit:cfg.texts[lang].name;$('locale').value=lang;$('pageTitle').textContent=view==='deposit'?w.deposit:w.center;
  $('back').textContent=w.back;$('back').href=link('player.html');$('back').hidden=view!=='deposit';
  $('title').textContent=cfg.texts[lang].name;$('intro').textContent=cfg.texts[lang].intro;
  $('rulesTitle').textContent=w.rules;$('rules').textContent=C.rules(cfg,lang);$('table').innerHTML=C.table(cfg,lang);
  $('amountLabel').textContent=w.amount+' · '+cfg.currency;$('channelLabel').textContent=w.channel;
  $('third').textContent=w.third;$('other').textContent=w.other;$('channel').value=channel;$('channelField').hidden=view!=='deposit';
  $('amountInput').value=amount;$('amountInput').disabled=order!=='draft';$('channel').disabled=order!=='draft';
  $('tierTitle').textContent=w.tiers;$('once').textContent=w.once;$('rewardTitle').textContent=w.linked;
  $('stage').hidden=order!=='draft'||!first||!active;
  $('progressPanel').hidden=!active;$('progressTitle').textContent=F[lang].progress;$('completionNote').textContent=!first?F[lang].done:'';
  $('stageTitle').textContent=w.headline;$('ageHint').textContent=w.ageHint;
  $('resultPanel').hidden=order==='draft';$('cancel').hidden=order!=='pending';$('cancel').textContent=w.cancel;
  $('resultTitle').textContent=w[order]||'';$('resultText').textContent=w[order+'Text']||'';
  $('status').textContent=!active?w.closed:!first?w.usedHint:'';
  $('primary').hidden=order!=='draft';$('primary').textContent=view==='deposit'?w.submit:!first||!active?w.otherOffers:w.go;
  $('primary').disabled=false;$('warning').textContent='';
  try{
    const r=R.calculate(cfg,event),p=H.evaluate(cfg,bundle,event);let row=cfg.ageEnabled?-1:0;
    if(cfg.ageEnabled)cfg.ages.forEach((a,i)=>{if(+now>=R.threshold(registered.toISOString(),a))row=i;});
    $('ageLabel').textContent=w.age+' · '+(row>=0?ageName(cfg.ages[row]):w.notYet);
    $('ageSteps').innerHTML=(cfg.ageEnabled?cfg.ages:[cfg.ages[0]]).map((a,i)=>`<span class="${i===row?'current':i<row?'passed':''}">${i<=row?'✓ ':''}${C.esc(ageName(a))}<small>${i<=row?F[lang].reached:'—'}</small></span>`).join('');
    $('maximum').textContent=cfg.cap?w.top+' '+cfg.cap+' '+cfg.currency:'';
    $('estimate').textContent=active&&r.state==='eligible'?money(r.reward):!first?w.used:w.notYet;
    $('estimateLabel').textContent=w.estimate;
    drawForecast(event,r,active);
    if(order==='credited'&&r.state==='eligible')$('completionNote').textContent=F[lang].achieved+' · '+ageName(cfg.ages[r.row])+' / '+cfg.bands[r.col]+' '+cfg.currency+' · '+F[lang].done;
    if(r.state==='inactive'){$('status').textContent=F[lang].closed;$('stage').hidden=true;}
    $('tierButtons').replaceChildren();
    cfg.bands.forEach((a,i)=>{const v=R.calculate(cfg,{...event,amount:a}),button=document.createElement('button');button.type='button';button.className='tier-choice'+(r.col===i?' selected':'');button.setAttribute('aria-pressed',r.col===i);button.disabled=order!=='draft';button.innerHTML='<span>'+C.esc(a+' '+cfg.currency)+'</span><strong>'+C.esc(active&&v.state==='eligible'?money(v.reward):'—')+'</strong><small>'+w.estimate+'</small>';button.onclick=()=>{amount=a;draw();};$('tierButtons').append(button);});
    const next=cfg.bands.find(a=>R.minor(a)>R.minor(amount));
    const nr=next?R.calculate(cfg,{...event,amount:next}):null;
    $('nextGoal').textContent=active&&first&&nr?.state==='eligible'&&nr.reward>(r.reward||0)?`${w.next} ${next} ${cfg.currency} · ${w.difference} ${money(R.minor(next)-R.minor(amount))} · ${w.extra} ${money(nr.reward-(r.reward||0))}`:r.reward&&cfg.cap&&r.reward>=R.minor(cfg.cap)?w.max:'';
    if(active&&first&&nr?.state==='eligible'&&nr.reward>(r.reward||0)){const f=F[lang];$('nextGoal').innerHTML='<span>'+f.todayGoal+' · '+C.esc(next+' '+cfg.currency)+'</span><span>'+f.extraAmount+' <b>'+C.esc(money(R.minor(next)-R.minor(amount)))+'</b></span><span>'+f.extraReward+' <b>'+C.esc(money(nr.reward-(r.reward||0)))+'</b></span>';}
    $('destination').textContent=active&&r.state==='eligible'?`${w.wallet}：${w[cfg.wallet]}${cfg.wallet==='cash'?' · '+w.turnover+' '+money(r.turnover):''} · ${w.after}`:'';
    $('rewardList').innerHTML=p.items.map(x=>`<div class="rewardCard"><strong>${C.esc(offerName(x))}</strong><span>${order==='unknown'?w.checking:x.state==='eligible'?money(x.reward):ParticipationStates.rewardLabel(x,lang)}</span></div>`).join('')||w.none;
    $('rewardList').hidden=view!=='deposit';$('rewardTitle').hidden=view!=='deposit';
    $('total').hidden=view!=='deposit';$('total').textContent=order==='unknown'?w.checking:order==='credited'?w.credited:w.total+' '+money(p.total)+(p.unknown?' · '+w.checking:'');
    $('paymentNote').textContent=view==='deposit'?w.balance:'';
    if(p.overOrderLimit||p.overSharedBudget||(active&&r.state==='eligible'&&r.reward>R.minor(cfg.budget))){$('warning').textContent=w.budget;$('primary').disabled=true;$('estimate').textContent=w.budget;$('nextGoal').textContent='';}
    if(R.minor(amount)<=0)$('primary').disabled=true;
    applyParticipation(r,p,active);
    drawBudget(r,p,active,event);
  }catch(_){$('warning').textContent=w.invalid;$('primary').disabled=true;$('estimate').textContent='—';$('forecastResult').textContent=w.invalid;$('forecastCompare').textContent='';$('nextGoal').textContent='';$('rewardList').textContent='';$('total').textContent='';}
}
const stateActions={bn:PlayerBN.actions,
 'zh-CN':{rules:'查看参与规则',details:'查看奖励详情',progress:'查看处理进度',received:'奖励已到账，金额及钱包请以入账明细为准。',processing:'奖励尚未完成入账，请以实际钱包记录为准。',login:'登录后可查看个人资格。'},
 'zh-TW':{rules:'查看參與規則',details:'查看獎勵詳情',progress:'查看處理進度',received:'獎勵已到帳，金額及錢包請以入帳明細為準。',processing:'獎勵尚未完成入帳，請以實際錢包紀錄為準。',login:'登入後可查看個人資格。'},
 en:{rules:'View participation rules',details:'View reward details',progress:'View processing status',received:'The reward has been credited. Refer to the wallet record for the amount and destination.',processing:'The reward has not been credited yet. Check the actual wallet record.',login:'Sign in to view your eligibility.'}
};
function applyParticipation(r,p,active){
 participation=ParticipationStates.resolve({order,scenario,active,first,calculation:r,basic:cfg.basic,now,budget:p.overOrderLimit||p.overSharedBudget||(r.reward||0)>R.minor(cfg.budget)});
 const state=ParticipationStates.get(participation,lang),a=stateActions[lang],stopped=!['available','unmet'].includes(participation);
 $('resultPanel').hidden=false;$('resultPanel').dataset.state=participation;$('resultPanel').dataset.tone=state.tone;$('resultTitle').textContent=state.title;$('resultText').textContent=state.body;
 $('stateAction').textContent=participation==='credited'?a.details:['unknown','rewardpending','rewardfailed'].includes(participation)?a.progress:a.rules;
 $('stateDetail').hidden=true;$('stateDetail').textContent=participation==='credited'?a.received:a.processing;
 $('stateAction').onclick=()=>{if(['credited','unknown','rewardpending','rewardfailed'].includes(participation)){$('stateDetail').hidden=!$('stateDetail').hidden;}else{$('rulesPanel').open=true;$('rulesPanel').scrollIntoView({block:'nearest'});}};
 if(stopped){$('stage').hidden=true;$('futurePanel').hidden=true;$('nextGoal').textContent='';$('amountPicker').hidden=true;$('primary').hidden=true;$('destination').textContent='';}
 else $('amountPicker').hidden=false;
 if(['login','blocked','notstarted','ended','paused','limit'].includes(participation))$('progressPanel').hidden=true;
 if(view==='deposit'&&['login','blocked','notstarted','ended','paused','limit','used'].includes(participation)){
   const other=p.items.filter(x=>x.id!=='registration-first-deposit');
   $('rewardList').innerHTML=p.items.map(x=>'<div class="rewardCard"><strong>'+C.esc(offerName(x))+'</strong><span>'+C.esc(x.id==='registration-first-deposit'?state.title:x.state==='eligible'?money(x.reward):ParticipationStates.rewardLabel(x,lang))+'</span></div>').join('');
   $('total').textContent=T[lang].total+' '+money(other.filter(x=>x.state==='eligible').reduce((sum,x)=>sum+x.reward,0));
 }
 if(['unknown','rewardpending','rewardfailed'].includes(participation)){$('total').textContent=state.title;$('rewardList').textContent=state.body;}
 if(participation==='credited')$('rewardList').innerHTML='<div class="rewardCard"><strong>'+C.esc(cfg.texts[lang].name)+'</strong><span>'+C.esc(state.title)+'</span></div>';
}
$('futureDays').oninput=e=>{futureDays=e.target.value===''?NaN:Number(e.target.value);draw();};
$('locale').onchange=e=>{lang=e.target.value;const q=new URLSearchParams(location.search);q.set('lang',lang);history.replaceState(null,'','?'+q);draw();};$('amountInput').oninput=e=>{amount=e.target.value;draw();};$('channel').onchange=e=>{channel=e.target.value;draw();};
$('primary').onclick=()=>{if($('primary').disabled)return;if(view!=='deposit'){location.href=link('deposit.html');return;}snapshot=ev();order='pending';draw();};
$('cancel').onclick=()=>{order='draft';snapshot=null;draw();};

const budgetText={
 'zh-CN':{title:'活动可用奖励余额',note:'可选择其他档位查看奖励。',low:'此档位暂不发送奖励',ok:'预计可得',unknown:'暂时无法确认此档位奖励',future:'未来奖励仅供参考，以实际参与时的可用状态为准。',required:'本笔按规则奖励',choose:'可修改金额查看其他档位；首充仅限一笔，不累计。'},
 'zh-TW':{title:'活動可用獎勵餘額',note:'可選擇其他檔位查看獎勵。',low:'此檔位暫不發送獎勵',ok:'預計可得',unknown:'暫時無法確認此檔位獎勵',future:'未來獎勵僅供參考，以實際參與時的可用狀態為準。',required:'本筆按規則獎勵',choose:'可修改金額查看其他檔位；首充僅限一筆，不累計。'},
 en:{title:'Available reward budget',note:'Choose another tier to view rewards.',low:'No reward sent for this tier',ok:'Estimated reward',unknown:'Reward availability unknown',future:'Future rewards are estimates. Availability is checked when you participate.',required:'Reward under current rules',choose:'Change the amount to compare tiers. Only one first deposit qualifies; deposits do not add up.'},
 bn:{title:'পুরস্কারের অবশিষ্ট বাজেট',note:'পুরস্কার দেখতে অন্য ধাপ বেছে নিন।',low:'এই ধাপে পুরস্কার দেওয়া হবে না',ok:'আনুমানিক পুরস্কার',unknown:'পুরস্কার নিশ্চিত করা যাচ্ছে না',future:'ভবিষ্যৎ পুরস্কার আনুমানিক। অংশ নেওয়ার সময় প্রাপ্যতা যাচাই হবে。',required:'নিয়ম অনুযায়ী পুরস্কার',choose:'অন্য ধাপ দেখতে পরিমাণ বদলান। শুধু প্রথম জমা প্রযোজ্য; একাধিক জমা যোগ হয় না।'}
};
function drawBudget(r,p,active,event){
 const text=budgetText[lang];
 if(!active||!first||order!=='draft'||!['available','unmet','budget'].includes(participation))return;
 document.querySelectorAll('.tier-choice').forEach((button,i)=>{const v=R.calculate(cfg,{...event,amount:cfg.bands[i]}),low=lacksBudget(v);button.classList.toggle('budget-unavailable',low);button.querySelector('small').textContent=v.state==='eligible'?(low?text.low:text.ok):T[lang].notYet;});
 $('forecastNote').textContent+=' '+text.future;
 const next=cfg.bands.find(a=>R.minor(a)>R.minor(amount));if(next&&lacksBudget(R.calculate(cfg,{...event,amount:next})))$('nextGoal').textContent='';
 if(lacksBudget(r)){
  $('stage').hidden=false;$('amountPicker').hidden=false;$('primary').hidden=false;$('primary').disabled=true;
  $('estimateLabel').textContent=text.required;$('estimate').textContent=money(r.reward);
  $('warning').textContent=(availableBudget===null?text.unknown:text.low)+' · '+text.choose;$('nextGoal').textContent='';$('destination').textContent='';
  $('resultTitle').textContent=availableBudget===null?text.unknown:text.low;$('resultText').textContent=text.note;
  if(view==='deposit'){
   const cards=[...$('rewardList').children];p.items.forEach((x,i)=>{if(x.id==='registration-first-deposit'&&cards[i])cards[i].querySelector('span').textContent=text.low;});
   $('total').textContent=T[lang].total+' '+money(p.items.filter(x=>x.id!=='registration-first-deposit'&&x.state==='eligible').reduce((sum,x)=>sum+x.reward,0));
  }
 }
}

draw();
