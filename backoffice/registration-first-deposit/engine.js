(function(root){
  'use strict';
  const KEY='ngss3.registration-first-deposit.launch';
  const defaults={schemaVersion:1,revision:1,currency:'INR',wallet:'cash',multiple:1,cap:'100',budget:'100000',ageEnabled:true,
    ages:[{value:0,unit:'d'},{value:7,unit:'d'},{value:1,unit:'m'},{value:3,unit:'m'},{value:6,unit:'m'},{value:12,unit:'m'}],
    bands:['100','500','1000'],cells:[0.5,1,1.5,2,2.5,3].map(base=>[0,0.5,1].map(extra=>({type:'percent',value:String(base+extra)}))),
    texts:{'zh-CN':{name:'首充阶梯',intro:'首次充值达标享奖励，充值前查看你的专属档位与可得金额。'},'zh-TW':{name:'首充階梯',intro:'首次充值達標享獎勵，充值前查看你的專屬檔位與可得金額。'},bn:{name:'প্রথম ডিপোজিট বোনাস',intro:'প্রথম ডিপোজিটের আগে আপনার ধাপ ও সম্ভাব্য বোনাস দেখুন।'},en:{name:'First deposit milestones',intro:'See your tier and estimated reward before your first deposit.'}}};
  const clone=v=>JSON.parse(JSON.stringify(v));
  function minor(s){if(!/^\d+(\.\d{1,2})?$/.test(String(s)))throw Error('金额须为非负数，最多两位小数');const [a,b='']=String(s).split('.');const n=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(n)||n>100000000000)throw Error('金额超出允许范围');return n;}
  const money=n=>(n/100).toFixed(2);
  function threshold(reg,age){const d=new Date(reg);if(!Number.isFinite(+d))throw Error('注册时间无效');if(age.unit==='d')return +d+age.value*86400000;const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+age.value);const end=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,end));return +d;}
  function validate(c){const errors=[];try{
    if(c.schemaVersion!==1||!Number.isInteger(c.revision)||c.revision<1)errors.push('活动配置无效');
    if(typeof c.ageEnabled!=='boolean'||typeof c.currency!=='string'||!/^[A-Z]{3,6}$/.test(c.currency))errors.push('时长开关或币别格式无效');
    if(!['cash','bonus'].includes(c.wallet))errors.push('请选择派奖钱包');
    if(c.wallet==='cash'&&(!Number.isInteger(Number(c.multiple))||Number(c.multiple)<0||Number(c.multiple)>10000||String(c.multiple).trim()===''))errors.push('现金钱包须填写0至10000的整数打码倍数');
    if(!c.bands.length||c.bands.length>8||minor(c.bands[0])<=0)errors.push('充值区间须从正金额开始，最多8档');
    c.bands.forEach((v,i)=>{if(i&&minor(v)<=minor(c.bands[i-1]))errors.push('充值下限须递增，不能重叠');else minor(v);});
    if(!c.ages.length||c.ages.length>8)errors.push('注册时长须设置1至8档');
    c.ages.forEach((a,i)=>{if(!['d','m'].includes(a.unit)||!Number.isInteger(a.value)||a.value<0||a.value>1200)errors.push('时长须为0至1200的整数');if(i){const p=c.ages[i-1];if(a.unit===p.unit?a.value<=p.value:!(p.unit==='d'&&p.value<=28&&a.unit==='m'&&a.value>=1))errors.push('时长下限须递增；混用时仅支持不超过28天后接月档');}});
    if(c.cells.length!==c.ages.length)errors.push('奖励行数不一致');
    c.cells.forEach(r=>{if(r.length!==c.bands.length)errors.push('奖励列数不一致');r.forEach(v=>{if(!['fixed','percent'].includes(v.type)||minor(v.value)<=0||(v.type==='percent'&&minor(v.value)>10000))errors.push('奖励须大于0；比例不得超过100%');});});
    if(c.cap!==''&&minor(c.cap)<=0)errors.push('奖励上限须大于0或留空');if(minor(c.budget)<=0)errors.push('预算须大于0');
    ['zh-CN','zh-TW','en','bn'].forEach(l=>{if(!c.texts[l]?.name?.trim()||!c.texts[l]?.intro?.trim())errors.push(l+' 活动名称与宣传简介必填');});
  }catch(e){errors.push(e.message);}return [...new Set(errors)];}
  function calculate(c,e){const errors=validate(c);if(errors.length)return {state:'invalid',errors};
    if(!e.first)return {state:'notFirst'};
    const reg=+new Date(e.registered),at=+new Date(e.paidAt);if(!Number.isFinite(reg)||!Number.isFinite(at)||at<reg)return {state:'invalid',errors:['注册与首充时间无效']};
    if(c.basic?.periodMode!=='always'&&((c.basic?.startAt&&at<+new Date(c.basic.startAt))||(c.basic?.endAt&&at>=+new Date(c.basic.endAt))))return {state:'inactive'};
    let amount;try{amount=minor(e.amount);}catch(x){return {state:'invalid',errors:[x.message]};}
    let row=c.ageEnabled?-1:0; if(c.ageEnabled)c.ages.forEach((a,i)=>{if(at>=threshold(e.registered,a))row=i;});
    let col=-1;c.bands.forEach((v,i)=>{if(amount>=minor(v))col=i;});
    if(row<0||col<0)return {state:'ineligible',reason:row<0?'age':'amount'};
    const cell=c.cells[row][col];let reward=cell.type==='fixed'?minor(cell.value):Number(BigInt(amount)*BigInt(minor(cell.value))/10000n);
    if(c.cap!=='')reward=Math.min(reward,minor(c.cap));
    if(!reward)return {state:'ineligible',reason:'rounding'};
    return {state:'eligible',row,col,reward,turnover:c.wallet==='cash'?reward*Number(c.multiple):null};
  }
  function settle(s,key,result,event){s=clone(s);if(s.records[key])return s;if(result.state!=='eligible')return s;if(s.available<result.reward)return {...s,last:'budget'};s.available-=result.reward;s.reserved+=result.reward;s.records[key]={reward:result.reward,status:'pending',event};s.last='pending';return s;}
  function callback(s,key,status){s=clone(s);const r=s.records[key];if(!r||r.status==='posted')return s;if(status==='posted'){s.reserved-=r.reward;s.spent+=r.reward;}r.status=status;return s;}
  function renameLegacyNames(value){return JSON.parse(JSON.stringify(value).replace(/\u9996\u5145\u6210\u957f\u9636\u68af/g,'首充阶梯').replace(/\u9996\u5145\u6210\u9577\u968e\u68af/g,'首充階梯'));}
  function load(){try{const c=renameLegacyNames(JSON.parse(localStorage.getItem(KEY)));if(c?.texts&&!c.texts.bn)c.texts.bn=clone(defaults.texts.bn);if(c&&!validate(c).length)return c;}catch(_){}return clone(defaults);}
  const api={KEY,defaults,clone,minor,money,threshold,validate,calculate,settle,callback,load,renameLegacyNames};root.Reward=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
