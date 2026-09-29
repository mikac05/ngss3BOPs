const assert=require('node:assert/strict');
const R=require('./engine.js'),F=require('./forecast.js');let n=0;
function check(name,fn){fn();n++;console.log('PASS',name);}
const c=R.clone(R.defaults);c.basic={startAt:'2026-09-01T00:00:00Z',endAt:'2026-10-01T00:00:00Z'};
const e={first:true,registered:'2026-09-03T12:00:00Z',paidAt:'2026-09-23T12:00:00Z',amount:'500'};
check('forecast and actual reward share inclusive start and exclusive end',()=>{assert.equal(R.calculate(c,{...e,registered:'2026-08-01',paidAt:c.basic.startAt}).state,'eligible');assert.equal(R.calculate(c,{...e,paidAt:c.basic.endAt}).state,'inactive');assert.equal(F.evaluate(c,e,'2026-09-30T00:00:00Z',1).state,'outside');assert.equal(F.evaluate(c,e,'2026-09-30T00:00:00Z',0).state,'eligible');});
check('next age tier reports when activity ends first',()=>{const next=F.next(c,e.registered,e.paidAt);assert.equal(next.within,false);assert.equal(new Date(next.at).toISOString(),'2026-10-03T12:00:00.000Z');});
check('invalid preview day never produces reward',()=>{for(const d of [-1,0.5,NaN,Infinity])assert.equal(F.evaluate(c,e,e.paidAt,d).state,'invalid');});
check('forecast honours exact anniversary and custom fixed reward',()=>{const x=R.clone(c);x.basic.endAt='2027-01-01';x.cells[2][1]={type:'fixed',value:'33'};assert.equal(F.evaluate(x,e,e.paidAt,9).reward,750);assert.equal(F.evaluate(x,e,e.paidAt,10).reward,3300);assert.equal(e.paidAt,'2026-09-23T12:00:00Z');});
check('disabled age tiers do not invite waiting',()=>{const x=R.clone(c);x.ageEnabled=false;assert.equal(F.next(x,e.registered,e.paidAt),null);assert.equal(F.evaluate(x,e,e.paidAt,0).reward,500);});
check('uncapped reward still cannot reserve beyond total activity budget',()=>{const x=R.clone(c);x.cap='';x.budget='5';assert.equal(F.evaluate(x,e,e.paidAt,0).state,'budget');const r=R.calculate(x,e),state={available:500,reserved:0,spent:0,records:{}};const s=R.settle(state,'one',r,e);assert.equal(s.last,'budget');assert.equal(s.available,500);assert.equal(Object.keys(s.records).length,0);});
console.log(n+' forecast and period checks passed');
