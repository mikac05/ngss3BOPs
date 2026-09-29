(function(root){
 'use strict';
 const R=root.Reward||(typeof require==='function'?require('./engine.js'):null),DAY=86400000;
 function period(c,now){const start=new Date(now);start.setHours(0,0,0,0);const end=new Date(start);end.setFullYear(end.getFullYear()+1);return {start:c.basic?.startAt?+new Date(c.basic.startAt):+start,end:c.basic?.endAt?+new Date(c.basic.endAt):+end};}
 function evaluate(c,e,now,days){
  const window=period(c,now),at=+new Date(now)+Number(days)*DAY;
  if(!Number.isInteger(Number(days))||Number(days)<0||!Number.isFinite(at))return {state:'invalid'};
  if(at<window.start||at>=window.end)return {state:'outside',at,window};
  const result=R.calculate(c,{...e,paidAt:new Date(at).toISOString()});
  if(result.state==='eligible'&&result.reward>R.minor(c.budget))return {state:'budget',at,window};
  return {...result,at,window};
 }
 function next(c,registered,now){if(!c.ageEnabled)return null;const window=period(c,now);const at=c.ages.map(a=>R.threshold(registered,a)).find(t=>t>+new Date(now));return at===undefined?null:{at,days:Math.ceil((at-+new Date(now))/DAY),within:at>=window.start&&at<window.end};}
 const api={period,evaluate,next};root.RewardForecast=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
