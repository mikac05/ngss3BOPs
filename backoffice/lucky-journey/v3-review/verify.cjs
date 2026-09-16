const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('./engine.js'),C=require('./config.js'),{Simulation}=require('./simulation.js');
const {JSDOM,VirtualConsole}=require(process.env.LJ_JSDOM||'jsdom');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS '+name);};
const cfg=()=>C.defaults();
function ready(c=cfg()){const s=new Simulation(c);assert(s.join().ok);return s;}
function supply(s){for(let day=0;day<s.config.personalDays;day++){if(day)s.nextDay();s.grant('free');}s.config.tasks.forEach((_,i)=>s.grant('task',i));for(let i=0;i<Math.ceil(s.config.sources.assist.cap/Math.max(1,s.config.sources.assist.ticketsPerFriend));i++)s.grant('assist','f'+i,true);}
function mount(name,storage){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(fs.readFileSync(path.join(__dirname,name),'utf8'),{url:'https://prototype.invalid/'+name,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});const w=dom.window;w.alert=()=>{};w.confirm=()=>true;w.matchMedia=()=>({matches:true});w.IntersectionObserver=class{observe(){}};w.HTMLElement.prototype.scrollIntoView=function(){};w.URL.createObjectURL=()=> 'blob:mock';w.URL.revokeObjectURL=()=>{};if(storage)w.localStorage.setItem(C.key,storage);for(const el of w.document.querySelectorAll('script[src]'))w.eval(fs.readFileSync(path.join(__dirname,el.getAttribute('src').split('?')[0]),'utf8'));return {dom,w,d:w.document,errors};}
function fill(m,path,v){const el=m.d.querySelector('[data-path="'+path+'"]');assert(el,path);if(el.type==='checkbox')el.checked=v;else el.value=String(v);el.dispatchEvent(new m.w.Event('input',{bubbles:true}));}


test('remaining attempts are allocated and final guarantee works for T 4-30',()=>{for(let T=4;T<=30;T++){const c=cfg();c.targetSpins=T;const a=E.allocatePhaseSpins(T,c.phaseShares);assert.equal(a.fast+a.mid+a.fine,T-1);for(const outcome of ['native','thanks']){let units=0;for(let k=1;k<=T;k++){const r=E.drawProgress(c,k,units,()=>.5,outcome);units+=r.gainUnits;assert(Math.abs(r.gainUnits-r.amount*(r.type==='coin'?10000:r.type==='gem'?100:r.type==='star'?1:0))<1e-6);if(k<T)assert(units<1000000);}assert.equal(units,1000000);}}});
test('legacy payout curve and friend cap are discarded',()=>{const c=C.normalize({...cfg(),firstSpinPct:95,nonSocialGuaranteed:true,sources:{assist:{friendCap:1}},cohorts:[{}]});assert.equal(c.firstSpinPct,94);assert(!('cohorts' in c));assert(!('friendCap' in c.sources.assist));assert(!('nonSocialGuaranteed' in c));});
test('only fixed reward is reserved',()=>{assert.equal(E.playCostStats(cfg()).hardReserve,5);assert(E.evaluatePublishStatus(cfg()).canPublish);const c=cfg();Object.assign(c.budget,{total:100,actualSpent:10,outstandingReserve:55,maxParticipants:0});assert.equal(E.availableSlots(c),7);});
test('thanks consumes attempt without progress or payout',()=>{const s=ready();s.spin('first');s.grant('task',0);const before=s.play.progress;s.outcome='thanks';const r=s.spin('thanks');assert(r.ok);assert.equal(s.play.k,2);assert.equal(s.play.progress,before);assert.equal(s.spent,0);assert.equal(s.reserved,5);});
test('collectible amount determines progress and never credits wallet',()=>{const s=ready();s.outcome='coin';const r=s.spin('coin');assert.equal(s.play.progress,r.record.prize.amount);assert.equal(s.play.rewards.cash,0);assert.equal(s.spent,0);});
test('last attempt overrides thanks and awards fixed amount exactly once',()=>{const s=ready();supply(s);s.outcome='thanks';for(let k=1;k<=12;k++)assert(s.spin('t'+k).ok);assert.equal(s.play.progress,100);assert.equal(s.play.rewards.cash,5);assert.equal(s.spent,5);assert.equal(s.reserved,0);assert(['coin','gem','star'].includes(s.play.records.at(-1).prize.type));assert(s.spin('t12').replayed);assert.equal(s.spent,5);assert(!s.spin('extra').ok);});
test('cent amounts preserve available slots and reserve balances',()=>{const c=cfg();c.prize.finishPrize=.1;c.budget.total=.3;c.budget.actualSpent=.2;c.budget.maxParticipants=0;assert.equal(E.availableSlots(c),1);const s=ready(c);assert.equal(s.available(),0);supply(s);for(let k=0;k<12;k++)s.spin('cent'+k);assert.equal(s.spent,.3);assert.equal(s.reserved,0);assert.equal(s.available(),0);});
test('pending final reward retains liability then posts once',()=>{const s=ready();supply(s);s.payout='pending';for(let k=0;k<12;k++)s.spin('p'+k);assert.equal(s.pending.length,1);assert.equal(s.spent,0);assert.equal(s.reserved,5);s.retryPayout();assert.equal(s.spent,5);assert.equal(s.reserved,0);s.retryPayout();assert.equal(s.spent,5);});
test('friend count is unlimited up to ticket cap',()=>{const c=cfg();c.sources.assist.cap=20;const s=ready(c);for(let i=0;i<20;i++)assert(s.grant('assist','f'+i).ok);assert(!s.grant('assist','f20').ok);assert(!s.grant('assist','f0').ok);});
test('insufficient free and tasks is only a warning',()=>{const c=cfg();c.sources.free.cap=1;c.sources.task.cap=1;c.sources.assist.cap=20;const r=E.evaluatePublishStatus(c);assert(r.canPublish);assert(r.yellow.some(x=>x.includes('免费＋任务')));});
test('insufficient sources warn without blocking publication or participation',()=>{const c=cfg();c.sources.free.cap=1;c.sources.task.cap=1;c.sources.assist.cap=1;const check=E.evaluatePublishStatus(c);assert(check.canPublish);assert(check.yellow.some(x=>x.includes('全部来源')));assert(ready(c).play.status==='active');});
test('response loss retries saved result without deduction',()=>{const s=ready();s.network='lost';assert(s.spin('x').saved);const p=s.play.progress;assert(s.spin('x').replayed);assert.equal(s.play.k,1);assert.equal(s.play.progress,p);});
test('send failure does not deduct',()=>{const s=ready();s.network='fail';assert(!s.spin('x').ok);assert.equal(s.play.k,0);assert.equal(s.play.tickets,1);});
test('expiration releases reserve without award',()=>{const s=ready();s.day=7;s.expire();assert.equal(s.reserved,0);assert.equal(s.spent,0);assert(!s.spin('x').ok);});
test('cut releases reserve and finish preserves current game',()=>{const c=cfg();c.budget.afterEnd='cut';const a=ready(c);a.endCampaign();assert.equal(a.reserved,0);const b=ready();b.endCampaign();assert.equal(b.play.status,'active');});
test('source deduplication remains across repeats',()=>{const c=cfg();c.basic.repeat=true;const s=ready(c);supply(s);for(let i=0;i<12;i++)s.spin('x'+i);assert(s.join().ok);assert(!s.grant('free').ok);assert(!s.grant('assist','f0').ok);assert(s.grant('assist','new-friend').ok);});
test('first spin setting and residual stages preserve exact totals',()=>{for(const first of [6,50,90,94]){const c=cfg();c.firstSpinPct=first;const rows=E.progressPreview(c);assert.equal(rows[1].progress,first);assert.equal(rows.at(-1).progress,100);assert(rows.slice(1,-1).every(r=>r.progress<100));}});
test('legacy manual grant always migrates to visit grant',()=>{const c=C.normalize({...cfg(),sources:{free:{grantMode:'manual_claim'}}});assert.equal(c.sources.free.grantMode,'auto_on_visit');assert.equal(ready(c).play.tickets,1);});
test('every stage supports all items at identical progress speed',()=>{for(const phase of ['fast','mid','fine']){const c=cfg(),plan=E.progressPlan(c),k=plan.findIndex((r,i)=>i>0&&r.phase===phase)+1;const rows=['coin','gem','star'].map(type=>E.drawProgress(c,k,12345,()=>.8,type));assert.equal(new Set(rows.map(r=>r.gainUnits)).size,1);assert.deepEqual(rows.map(r=>r.type),['coin','gem','star']);rows.forEach(r=>assert.equal(Math.round(r.amount*(1000000/r.denominator)),r.gainUnits));}});
test('conditional probability cutoffs match recommended allocation',()=>{const c=cfg();for(const phase of ['fast','mid','fine']){const plan=E.progressPlan(c),k=plan.findIndex((r,i)=>i>0&&r.phase===phase)+1,counts={coin:0,gem:0,star:0};for(let i=0;i<100;i++)counts[E.drawProgress(c,k,0,()=>(i+.5)/100,'native').type]++;assert.deepEqual(counts,c.prize[phase].weights);}});
test('bounded forecast matches exhaustive daily/task/friend convolution',()=>{for(let sample=0;sample<20;sample++){const c=cfg();c.personalDays=c.sources.free.days=3;c.tasks=c.tasks.slice(0,3);c.sources.task.taskCount=3;c.sources.free.cap=sample%5;c.sources.task.cap=sample%4;c.sources.assist.cap=sample%8;c.targetSpins=4+sample%8;const events=(n,p,t,cap)=>{const arr=[];for(let bits=0;bits<(1<<n);bits++){let count=0;for(let j=0;j<n;j++)count+=(bits>>j)&1;arr.push([Math.min(count*t,cap),p**count*(1-p)**(n-count)]);}return arr;};const f=events(3,c.assumptions.dailyVisitProb,c.sources.free.ticketsPerDay,c.sources.free.cap),t=events(3,c.assumptions.taskCompletionProb,c.sources.task.ticketsPerTask,c.sources.task.cap);let expected=0,prob=Math.exp(-c.assumptions.assistLambda);for(let friends=0;friends<100;friends++){if(friends)prob*=c.assumptions.assistLambda/friends;for(const [fv,fp]of f)for(const[tv,tp]of t)if(fv+tv+Math.min(friends*c.sources.assist.ticketsPerFriend,c.sources.assist.cap)>=c.targetSpins)expected+=fp*tp*prob;}assert(Math.abs(expected-E.completionProbability(c))<1e-10);}});
test('popup copy separates progress items from final wallet reward',()=>{const copy=require('./simulation.js').resultCopy;const item=copy({prize:{type:'star',amount:5000,gainUnits:5000},progress:90.5,completed:false});assert(item.title.includes('丰收'));assert(item.progress.includes('0.5000%'));const final=copy({prize:{type:'coin',amount:1},completed:true,finish:5,payoutStatus:'pending'});assert(final.message.includes('正在发放'));assert(!final.message.includes('已发放'));});
const admin=mount('index.html');
test('admin initializes with three panels and three equal card containers',()=>{assert.deepEqual(admin.errors,[]);assert.equal(admin.d.querySelectorAll('#sections>.panel').length,3);assert.equal(admin.d.querySelectorAll('.sidebar>.side-card').length,3);assert(!admin.d.body.textContent.includes('分层完成'));assert(!admin.d.body.textContent.includes('仿真与发布'));assert(!admin.d.body.textContent.includes('VIP'));});
test('preview defaults open and compact phase summaries are inline',()=>{assert(admin.d.querySelector('details[open] #curve'));assert(!admin.d.querySelector('[data-path="sources.free.grantMode"]'));fill(admin,'firstSpinMin',80);fill(admin,'firstSpinMax',85);assert(admin.d.getElementById('curveSummary').textContent.includes('80%'));});
test('item probabilities rebalance and insufficient supply is shown in ticket card',()=>{const handle=admin.d.querySelector('.item-slider[data-phase=fast] [data-boundary="0"]');handle.dispatchEvent(new admin.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(handle.getAttribute('aria-valuenow'),'69');assert(admin.d.querySelector('.item-slider[data-phase=fast] .allocation-legend').textContent.includes('5%'));assert(!admin.d.querySelector('[data-path^="prize.fast.weights"]'));fill(admin,'targetSpins',30);assert(!admin.d.getElementById('ticketShortfall').hidden);assert.equal(admin.d.getElementById('sideTarget').closest('.side-card').querySelector('h2').textContent,'抽奖次数');});
test('compact-only layout migrates old full layout',()=>{assert.equal(C.normalize({presentation:{layout:'full'}}).presentation.layout,'compact');assert(!admin.d.querySelector('[data-path="presentation.layout"]'));});
test('stage slider updates adjacent shares and preserves third segment',()=>{const a=admin.d.querySelector('#phaseAllocation [data-boundary="0"]');const fine=Number(admin.d.querySelector('[data-path="phaseShares.fine"]').value);a.dispatchEvent(new admin.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(Number(admin.d.querySelector('[data-path="phaseShares.fast"]').value),41);assert.equal(Number(admin.d.querySelector('[data-path="phaseShares.fine"]').value),fine);assert.equal(['fast','mid','fine'].reduce((n,k)=>n+Number(admin.d.querySelector('[data-path="phaseShares.'+k+'"]').value),0),100);});
test('source switch collapses fields and preserves values',()=>{fill(admin,'sources.assist.enabled',false);assert(admin.d.querySelector('#source-assist .source-body').hidden);fill(admin,'sources.assist.enabled',true);assert(!admin.d.querySelector('#source-assist .source-body').hidden);});
test('invalid fields explain limits and clear after correction',()=>{fill(admin,'targetSpins',3);assert(!admin.d.querySelector('[data-path="targetSpins"]').closest('.field').querySelector('.field-error').hidden);fill(admin,'targetSpins',12);assert(admin.d.querySelector('[data-path="targetSpins"]').closest('.field').querySelector('.field-error').hidden);});
test('allocation handles clamp at neighbor without changing other segments',()=>{const handle=admin.d.querySelector('.item-slider[data-phase=fast] [data-boundary="0"]'),next=admin.d.querySelector('.item-slider[data-phase=fast] [data-boundary="1"]');handle.dispatchEvent(new admin.w.KeyboardEvent('keydown',{key:'End',bubbles:true}));assert.equal(Number(handle.getAttribute('aria-valuenow')),Number(next.getAttribute('aria-valuenow'))-1);assert(!admin.d.querySelector('.item-slider input'));assert(!admin.d.body.textContent.includes('混合开奖'));assert(!admin.d.body.textContent.includes('中奖后道具分配'));});
test('numeric shares only change the adjacent stage',()=>{const fine=admin.d.querySelector('[data-path="phaseShares.fine"]').value;fill(admin,'phaseShares.fast',50);assert.equal(admin.d.querySelector('[data-path="phaseShares.fine"]').value,fine);});
test('changing global T updates every admin summary',()=>{fill(admin,'targetSpins',10);assert.equal(admin.d.getElementById('sideTarget').textContent,'10 次');assert(admin.d.getElementById('curveSummary').textContent.includes('第 10 次'));});
test('phase numeric edits preserve exact total',()=>{fill(admin,'phaseShares.fast',55);const sum=['fast','mid','fine'].reduce((n,k)=>n+Number(admin.d.querySelector('[data-path="phaseShares.'+k+'"]').value),0);assert.equal(sum,100);});
test('task toggle drops supply and disables threshold field',()=>{fill(admin,'tasks.0.enabled',false);assert.equal(admin.d.getElementById('sideTask').textContent,'1 次');assert(admin.d.querySelector('[data-path="tasks.0.threshold"]').disabled);});
test('reward wallet is locked to cash and wagering field is enabled',()=>{assert.equal(admin.d.querySelector('[data-path="basic.wallet"]').value,'cash');assert(admin.d.querySelector('[data-path="basic.wallet"]').disabled);assert(!admin.d.getElementById('wagerField').hidden);fill(admin,'basic.wallet','bonus');assert.equal(admin.d.querySelector('[data-path="basic.wallet"]').value,'cash');assert(!admin.d.getElementById('wagerField').hidden);});
test('collapse can reopen without losing edits',()=>{const panel=admin.d.getElementById('prizes');panel.querySelector('.collapse').click();assert(panel.querySelector('.panel-body').hidden);panel.querySelector('.collapse').click();assert.equal(admin.d.querySelector('[data-path="targetSpins"]').value,'10');});
test('draft round trip includes name mode and no tiers',()=>{fill(admin,'basic.nameMode','custom');fill(admin,'basic.name','测试活动');admin.d.getElementById('saveBtn').click();const record=JSON.parse(admin.w.localStorage.getItem(C.key));assert(!record.config.cohorts);fill(admin,'basic.name','临时');admin.d.getElementById('restoreBtn').click();assert.equal(admin.d.getElementById('nameMode').value,'custom');assert.equal(admin.d.querySelector('[data-path="basic.name"]').value,'测试活动');});
let transfer=admin.w.localStorage.getItem(C.key);admin.dom.window.close();const player=mount('player.html',transfer);
test('simulator loads latest saved configuration',()=>{assert.deepEqual(player.errors,[]);assert.equal(player.d.getElementById('activityName').textContent,'测试活动');assert.equal(player.d.getElementById('statTarget').textContent,'10');assert(!player.d.body.textContent.includes('VIP'));assert(player.d.getElementById('publishBtn'));});
test('developer controls stay hidden until expanded and close with Escape',()=>{const panel=player.d.getElementById('devPanel'),toggle=player.d.getElementById('devToggle');assert(panel.hidden);assert(panel.contains(player.d.getElementById('scenarios')));toggle.click();assert(!panel.hidden);assert.equal(toggle.getAttribute('aria-expanded'),'true');player.d.dispatchEvent(new player.w.KeyboardEvent('keydown',{key:'Escape'}));assert(panel.hidden);});
test('player navigation does not grant; external completion grants a task',()=>{player.d.getElementById('mainAction').click();assert.equal(player.d.getElementById('phoneStatus').textContent,'进行中');const task=player.d.querySelector('[data-task="1"]');task.click();assert.equal(player.d.getElementById('phoneTicketCount').textContent,'1');player.d.querySelector('[data-complete-task="1"]').click();assert.equal(player.d.getElementById('phoneTicketCount').textContent,'2');});
test('scenario completed disables spinning',()=>{player.d.querySelector('[data-scenario="complete"]').click();assert.equal(player.d.getElementById('phoneProgressPct').textContent,'100.0000%');assert(player.d.getElementById('mainAction').disabled);});
test('publication checks are separate and respond to invalid assumptions',()=>{const input=player.d.getElementById('visitProb');input.value=101;input.dispatchEvent(new player.w.Event('input'));assert(player.d.getElementById('publishBtn').disabled);input.value=90;input.dispatchEvent(new player.w.Event('input'));assert(!player.d.getElementById('publishBtn').disabled);});
test('shortage permits publication without confirmation dialog',()=>{const c=cfg();c.sources.free.cap=1;c.sources.task.cap=1;c.sources.assist.cap=1;const m=mount('player.html',JSON.stringify({config:c}));m.w.confirm=()=>{throw new Error('Unexpected blocking confirmation');};assert(!m.d.getElementById('publishBtn').disabled);m.d.getElementById('publishBtn').click();assert(m.w.localStorage.getItem(C.key+'-release'));assert.deepEqual(m.errors,[]);m.dom.window.close();});
test('publish simulation records only local release' ,()=>{player.d.getElementById('publishBtn').click();assert(player.w.localStorage.getItem(C.key+'-release'));});
player.dom.window.close();
test('three entry pages have unique IDs and existing local assets/anchors',()=>{for(const file of ['index.html','player.html','guide.html']){const mounted=mount(file),dom=mounted.dom,d=dom.window.document,ids=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);for(const el of d.querySelectorAll('[href],[src]')){const ref=el.getAttribute('href')||el.getAttribute('src');if(!ref||/^(https?:|data:)/.test(ref))continue;if(ref.startsWith('#')){assert(d.getElementById(ref.slice(1)));continue;}assert(fs.existsSync(path.resolve(__dirname,ref.split(/[?#]/)[0])),ref);}dom.window.close();}});
test('item allocation migrates fractional and zero probabilities to integer minimum one',()=>{for(const weights of [{coin:.05,gem:99.9,star:.05},{coin:0,gem:100,star:0},{coin:0,gem:0,star:0},{coin:33.3,gem:33.3,star:33.4}]){const c=cfg();c.prize.fast.weights=weights;const values=Object.values(C.normalize(c).prize.fast.weights);assert(values.every(v=>Number.isInteger(v)&&v>=1));assert.equal(values.reduce((a,b)=>a+b,0),100);}});
test('raw fractional item probabilities fail validation',()=>{const c=cfg();c.prize.fast.weights={coin:69.9,gem:25.1,star:5};assert(E.evaluatePublishStatus(c).red.some(x=>x.includes('道具概率')));});
test('all supported T and first-spin settings have positive increments at extreme shares',()=>{for(let T=4;T<=30;T++)for(let F=6;F<=94;F++)for(const shares of [{fast:0,mid:0,fine:100},{fast:100,mid:0,fine:0},{fast:0,mid:100,fine:0},{fast:40,mid:35,fine:25}]){const c=cfg();Object.assign(c,{targetSpins:T,firstSpinPct:F,phaseShares:shares});const plan=E.progressPlan(c);assert.equal(plan.at(-1).target,1000000);assert(plan.every((row,i)=>Number.isInteger(row.target)&&(!i||row.target>plan[i-1].target)));}});
test('phone contains real player controls and popup, simulation completion stays outside',()=>{const m=mount('player.html');const phone=m.d.querySelector('.phone');assert(phone.contains(m.d.getElementById('prizePopup')));assert(!phone.contains(m.d.getElementById('externalTasks')));assert.equal(m.d.getElementById('freeBtn').tagName,'SPAN');assert(m.d.getElementById('remainingSpins').textContent.includes('12'));m.dom.window.close();});
test('friend deposit threshold checks below and equal amounts',()=>{const c=cfg();c.sources.assist.depositRequired=true;c.sources.assist.minDeposit=50;const sim=new Simulation(c);assert(sim.join().ok);assert(!sim.grant('assist','new-friend',{eligible:true,depositAmount:49.99}).ok);assert(sim.grant('assist','new-friend',{eligible:true,depositAmount:50}).ok);});
test('threshold settings persist and validate',()=>{const c=cfg();c.sources.assist.depositRequired=true;c.sources.assist.minDeposit=123.45;c.tasks[0].threshold=200;const n=C.normalize(c);assert.equal(n.sources.assist.minDeposit,123.45);assert.equal(n.tasks[0].threshold,200);assert(!E.evaluatePublishStatus(n).red.length);n.tasks[0].threshold=0;assert(E.evaluatePublishStatus(n).red.some(x=>x.includes('任务门槛')));});
test('no-ticket CTA scrolls and focuses sources without spinning',()=>{const m=mount('player.html');m.d.querySelector('[data-scenario="no-tickets"]').click();const button=m.d.getElementById('mainAction'),target=m.d.getElementById('ticketSources');let scrolled=false;target.scrollIntoView=()=>scrolled=true;assert(!button.disabled);assert.equal(button.textContent,'获取抽奖次数');button.click();assert(scrolled);assert.equal(m.d.activeElement,target);assert.equal(m.d.getElementById('phoneTicketCount').textContent,'0');assert.deepEqual(m.errors,[]);m.dom.window.close();});
test('first-spin mean bounds and midpoint use saved plan',()=>{for(const F of [6,90,94]){const c=cfg();c.firstSpinPct=F;assert.equal(E.sampleFirstUnits(c,()=>0),(F-5)*10000);assert.equal(E.sampleFirstUnits(c,()=>.5),F*10000);assert.equal(E.sampleFirstUnits(c,()=>1-Number.EPSILON),(F+5)*10000);for(const rng of [()=>0,()=>.5,()=>1-Number.EPSILON]){const sim=new Simulation(c,rng);assert(sim.join().ok);const first=sim.play.firstUnits;const result=sim.spin('first');assert.equal(result.record.progressUnits,first);assert.equal(sim.play.plan[0].target,first);assert(sim.spin('first').replayed);assert.equal(sim.play.firstUnits,first);supply(sim);sim.outcome='thanks';for(let k=2;k<=c.targetSpins;k++)assert(sim.spin('s'+k).ok);assert.equal(sim.play.progressUnits,1000000);assert.equal(sim.spent,c.prize.finishPrize);}}});
test('first-spin extremes leave strictly positive increments at every T',()=>{for(let T=4;T<=30;T++)for(const F of [6,94])for(const actual of [F-5,F+5])for(const shares of [{fast:0,mid:0,fine:100},{fast:40,mid:35,fine:25}]){const c=cfg();Object.assign(c,{targetSpins:T,firstSpinPct:F,phaseShares:shares});const rows=E.progressPlan(c,actual*10000);assert.equal(rows[0].target,actual*10000);assert.equal(rows.at(-1).target,1000000);assert(rows.every((r,i)=>!i||r.target>rows[i-1].target));}});
test('phone leads with money and explanatory counts stay outside',()=>{const m=mount('player.html'),phone=m.d.querySelector('.phone');assert(phone.contains(m.d.getElementById('phoneProgressMoney')));assert(!phone.contains(m.d.getElementById('remainingSpins')));assert(!phone.textContent.includes('扇区大小'));assert(!m.d.getElementById('expectedCost'));assert(m.d.body.textContent.includes('完成度计算'));m.dom.window.close();});
test('invalid first-spin bounds block validation',()=>{for(const [min,max] of [[0,90],[99,95],[95,80]]){const c=cfg();c.firstSpinMin=min;c.firstSpinMax=max;assert(E.evaluatePublishStatus(c).red.some(x=>x.includes('首转')));}});
test('budget is relocated to basic settings and old budget section is removed',()=>{
  const m=mount('index.html');
  assert(!m.d.getElementById('budget'));
  assert(m.d.querySelector('#basic [data-path="budget.total"]'));
  assert(!m.d.querySelector('[data-path="budget.maxParticipants"]'));
  assert(!m.d.querySelector('[data-path="budget.joinMode"]'));
  m.dom.window.close();
});

test('basic claim mode supports auto and manual, defaults to auto',()=>{
  const c=cfg();
  assert.equal(c.basic.claimMode,'auto');
  const m=mount('index.html');
  const select=m.d.querySelector('[data-path="basic.claimMode"]');
  assert(select);
  assert.equal(select.value,'auto');
  fill(m,'basic.claimMode','manual');
  assert.equal(select.value,'manual');
  m.dom.window.close();
});

test('first spin min and max range is editable in admin and respected by engine',()=>{
  const c=cfg();
  c.firstSpinMin=85;
  c.firstSpinMax=92;
  for(let i=0;i<20;i++){
    const u=E.sampleFirstUnits(c,()=>i/20);
    assert(u>=850000&&u<=920000);
  }
});

test('decay controls are hidden while progression curve is preserved',()=>{
  const m=mount('index.html');
  const slider=m.d.getElementById('phaseSlider');
  assert(slider.hidden);
  assert.equal(slider.style.display,'none');
  assert(m.d.getElementById('curve'));
  m.dom.window.close();
});

test('wheel images are configurable, have defaults, and render into player wheel disc',()=>{
  const c=cfg();
  for(const k of ['thanks','coin','gem','star']){
    assert(c.presentation.wheelImages[k]);
  }
  const m=mount('player.html');
  const img0=m.d.getElementById('wheel-img-0');
  assert(img0);
  assert(img0.getAttribute('href').startsWith('data:image/svg+xml'));
  m.dom.window.close();
});

test('exclusive referral link contains campaign parameters and modal functions',()=>{
  const m=mount('player.html');
  m.d.getElementById('mainAction').click();
  const inviteBtn=m.d.getElementById('friendBtn');
  const modal=m.d.getElementById('inviteModal');
  const link=m.d.getElementById('inviteUrl');
  assert(inviteBtn&&modal&&link);
  assert(modal.hidden);
  inviteBtn.click();
  assert(!modal.hidden);
  assert(link.value.includes('act=lucky-journey'));
  assert(link.value.includes('src=lj_wheel'));
  m.d.getElementById('inviteClose').click();
  assert(modal.hidden);
  m.dom.window.close();
});

test('manual claim mode requires user CTA click to claim prize',()=>{
  const c=cfg();
  c.basic.claimMode='manual';
  const s=ready(c);
  supply(s);
  for(let k=1;k<=12;k++)s.spin('s'+k);
  assert.equal(s.play.progress,100);
  assert.equal(s.play.claimPending,true);
  assert.equal(s.spent,0);
  const claimed=s.claimPrize();
  assert(claimed.ok);
  assert.equal(s.play.claimPending,false);
  assert.equal(s.spent,5);
});

test('unlock hero has exactly 3 fields on one line: prize, firstSpin range selector, and targetSpins with range 4~30',()=>{
  const m=mount('index.html');
  const heroGrid=m.d.querySelector('.unlock-hero>.form-grid');
  const fields=heroGrid.querySelectorAll(':scope>.field');
  assert.equal(fields.length, 3);
  assert(fields[0].querySelector('[data-path="prize.finishPrize"]'));
  assert(fields[1].querySelector('[data-path="firstSpinMin"]'));
  assert(fields[1].querySelector('[data-path="firstSpinMax"]'));
  assert(fields[1].querySelector('.range-slider-wrap'));
  assert(fields[2].querySelector('[data-path="targetSpins"]'));
  assert(fields[2].textContent.includes('4~30') || fields[2].textContent.includes('4～30'));
  m.dom.window.close();
});

test('range slider drag updates firstSpin inputs and state',()=>{
  const m=mount('index.html');
  const tMin=m.d.getElementById('rangeThumbMin');
  tMin.value=82;
  tMin.dispatchEvent(new m.w.Event('input',{bubbles:true}));
  assert.equal(m.d.querySelector('[data-path="firstSpinMin"]').value,'82');
  assert.equal(m.d.getElementById('firstSpinFill').style.left,'82%');
  m.dom.window.close();
});

test('tasks only contain deposit_amount and bet_amount; play_category, deposit_count, and bet_count are removed',()=>{
  const c=cfg();
  assert.equal(c.tasks.length, 2);
  assert.deepEqual(c.tasks.map(t=>t.name), ['充值金额', '下注金额']);
  assert(!c.tasks.some(t=>['play_category','deposit_count','bet_count'].includes(t.type)));
  assert(!c.tasks.some(t=>t.name.includes('游玩指定类型')||t.name.includes('充值次数')||t.name.includes('下注次数')));
});

test('wheel prize names are customizable with max length of 6 characters for wheel fit',()=>{
  const c=cfg();
  assert.deepEqual(c.presentation.wheelNames, { thanks: '谢谢参与', coin: '金币', gem: '宝石', star: '星钻' });
  const m=mount('index.html');
  const coinInput=m.d.querySelector('[data-path="presentation.wheelNames.coin"]');
  assert(coinInput);
  assert.equal(coinInput.getAttribute('maxlength'), '6');
  fill(m,'presentation.wheelNames.coin','超级金币奖');
  assert.equal(coinInput.value,'超级金币奖');
  fill(m,'presentation.wheelNames.coin','超级无敌无敌金币');
  assert.equal(coinInput.value.length, 6);
  m.dom.window.close();
});

test('player wheel disc renders custom prize names and adapts font size for long labels',()=>{
  const initial = JSON.stringify({
    config: {
      presentation: {
        wheelNames: { thanks: '下次好运', coin: '至尊大金币', gem: '七彩宝石', star: '至尊大星钻' }
      }
    }
  });
  const m=mount('player.html', initial);
  const text0 = m.d.getElementById('wheel-text-0');
  assert.equal(text0.textContent, '至尊大金币');
  assert.equal(text0.getAttribute('font-size'), '8.5');
  const text1 = m.d.getElementById('wheel-text-1');
  assert.equal(text1.textContent, '下次好运');
  assert.equal(text1.getAttribute('font-size'), '10');
  const text4 = m.d.getElementById('wheel-text-4');
  assert.equal(text4.textContent, '至尊大星钻');
  assert.equal(text4.getAttribute('font-size'), '8.5');
  assert.equal(m.d.getElementById('wallet-label-coin').textContent, '至尊大金币');
  assert.equal(m.d.getElementById('wallet-label-gem').textContent, '七彩宝石');
  assert.equal(m.d.getElementById('wallet-label-star').textContent, '至尊大星钻');
  m.dom.window.close();
});

test('floating window icon has 8 presets and defaults to wheel_float_1',()=>{
  const c = cfg();
  assert.equal(c.presentation.floatIcon, 'wheel_float_1');
  assert.equal(C.DEFAULT_FLOAT_ICONS.length, 8);
  for(let i=1;i<=8;i++){
    const item = C.DEFAULT_FLOAT_ICONS[i-1];
    assert.equal(item.id, 'wheel_float_'+i);
    assert(fs.existsSync(path.resolve(__dirname, item.src)), item.src);
  }
});

test('admin displays float icon tiles, switches on click, and saves in configuration',()=>{
  const m = mount('index.html');
  const tiles = m.d.querySelectorAll('.float-icon-tile');
  assert.equal(tiles.length, 8);
  assert(tiles[0].classList.contains('active'));
  assert.equal(tiles[0].getAttribute('aria-checked'), 'true');
  
  // Click on tile 3
  tiles[2].click();
  assert(!tiles[0].classList.contains('active'));
  assert(tiles[2].classList.contains('active'));
  assert.equal(tiles[2].getAttribute('aria-checked'), 'true');
  assert.equal(m.d.getElementById('saveState').dataset.state, 'dirty');
  
  // Save settings
  m.d.getElementById('saveBtn').click();
  const saved = JSON.parse(m.w.localStorage.getItem(C.key));
  assert.equal(saved.config.presentation.floatIcon, 'wheel_float_3');
  m.dom.window.close();
});

test('player client displays chosen float icon widget with click interaction',()=>{
  const initial = JSON.stringify({
    config: {
      presentation: {
        floatIcon: 'wheel_float_5'
      }
    }
  });
  const m = mount('player.html', initial);
  const widget = m.d.getElementById('phoneFloatWidget');
  const img = m.d.getElementById('phoneFloatIconImg');
  assert(widget && img);
  assert(img.src.includes('wheel_float_5.png'));
  
  let scrolled = false;
  m.d.querySelector('.wheel').scrollIntoView = () => { scrolled = true; };
  widget.click();
  assert(scrolled);
  m.dom.window.close();
});

(async()=>{const m=mount('player.html');m.d.getElementById('mainAction').click();m.d.getElementById('outcome').value='star';m.d.getElementById('outcome').dispatchEvent(new m.w.Event('change'));m.d.getElementById('mainAction').click();await new Promise(r=>setTimeout(r,50));test('winning spin opens popup with exact progress and closes without replay',()=>{assert(!m.d.getElementById('prizePopup').hidden);assert(m.d.getElementById('prizeAmount').textContent.includes('星钻'));const progress=Number(m.d.getElementById('phoneProgressPct').textContent.replace('%',''));assert(progress>=85&&progress<=95);m.d.getElementById('prizeClose').click();assert(m.d.getElementById('prizePopup').hidden);m.d.getElementById('reconnectBtn').click();assert(m.d.getElementById('prizePopup').hidden);assert.deepEqual(m.errors,[]);});m.dom.window.close();console.log('Verified '+count+' test groups.');})().catch(e=>{console.error(e);process.exitCode=1;});
