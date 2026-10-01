(function(root){
 'use strict';
 const rows=[
  ['available','success',['可以参加','可以參加','Ready to participate'],['首次成功充值符合条件后，奖励自动派发。','首次成功充值符合條件後，獎勵自動派發。','Your first successful qualifying deposit earns an automatic reward.']],
  ['login','neutral',['请先登录','請先登入','Sign in required'],['登录后可查看个人资格和奖励进度。','登入後可查看個人資格與獎勵進度。','Sign in to view your eligibility and reward progress.']],
  ['notstarted','neutral',['活动未开始','活動未開始','Not started'],['活动开放后才可参加，请留意开始时间。','活動開放後才可參加，請留意開始時間。','Participation opens at the activity start time.']],
  ['ended','neutral',['活动已结束','活動已結束','Activity ended'],['已停止接受新参与。已达标的奖励继续按原规则处理。','已停止接受新參與。已達標的獎勵繼續按原規則處理。','New participation has ended. Qualified rewards continue under the original rules.']],
  ['paused','warning',['暂不可参加','暫不可參加','Temporarily unavailable'],['本活动暂停接受新参与，请稍后查看。已确认的奖励不受影响。','本活動暫停接受新參與，請稍後查看。已確認的獎勵不受影響。','New participation is paused. Confirmed rewards are unaffected.']],
  ['blocked','neutral',['不能参加','不能參加','Not eligible'],['当前账户不符合本活动参与条件。请查看规则；如有疑问，请联系客服。','目前帳戶不符合本活動參與條件。請查看規則；如有疑問，請聯絡客服。','This account does not meet the participation requirements. Review the rules or contact support.']],
  ['unmet','warning',['尚未达标','尚未達標','Target not reached'],['当前充值金额未达奖励条件，可先查看金额档位。','目前充值金額未達獎勵條件，可先查看金額檔位。','The current amount does not qualify. Review the amount tiers before depositing.']],
  ['used','neutral',['首充资格已使用','首充資格已使用','First deposit already used'],['已完成过首次充值，本活动不能再次参加。其他充值活动按各自规则核验。','已完成過首次充值，本活動不能再次參加。其他充值活動按各自規則核驗。','Your first deposit is complete, so this activity cannot be entered again. Other offers have separate rules.']],
  ['limit','neutral',['已达赠送上限','已達贈送上限','Reward limit reached'],['本活动的单用户赠送上限已用完，不再产生新奖励。','本活動的單用戶贈送上限已用完，不再產生新獎勵。','You have reached this activity’s reward limit. No further rewards can be earned from it.']],
  ['pending','warning',['等待支付结果','等待支付結果','Awaiting payment'],['请完成当前订单。收到成功结果后，再核验各项奖励。','請完成目前訂單。收到成功結果後，再核驗各項獎勵。','Complete the current order. Rewards are checked after payment succeeds.']],
  ['unknown','warning',['正在核验','正在核驗','Verifying'],['充值或奖励结果正在核对，请勿为领取奖励重复充值。','充值或獎勵結果正在核對，請勿為領取獎勵重複充值。','We are checking the payment or reward result. Do not deposit again to claim this reward.']],
  ['rewardpending','warning',['待派奖','待派獎','Reward pending'],['资格已通过，奖励正在排队入账，无需再次充值或手动领取。','資格已通過，獎勵正在排隊入帳，無需再次充值或手動領取。','Eligibility is confirmed and the reward is queued. No additional deposit or manual claim is needed.']],
  ['rewardfailed','warning',['派奖处理中','派獎處理中','Reward processing'],['奖励入账暂未完成，系统将继续处理。请保留当前订单记录。','獎勵入帳暫未完成，系統將繼續處理。請保留目前訂單紀錄。','The reward has not been credited yet. Processing will continue; retain your order record.']],
  ['credited','success',['已领奖','已領獎','Reward received'],['奖励已自动入账，本次领奖完成；首充奖励不能重复领取。','獎勵已自動入帳，本次領獎完成；首充獎勵不能重複領取。','The reward was automatically credited. This first deposit reward cannot be claimed again.']]
 ];
 const bn={"available": ["অংশ নিতে পারেন", "প্রথম সফল ডিপোজিটে শর্ত পূরণ হলে বোনাস স্বয়ংক্রিয়ভাবে জমা হবে।"], "login": ["লগইন করুন", "লগইন করে যোগ্যতা ও বোনাসের অগ্রগতি দেখুন।"], "notstarted": ["অফার শুরু হয়নি", "অফার শুরু হলে অংশ নিতে পারবেন। শুরুর সময় দেখুন।"], "ended": ["অফার শেষ", "নতুন অংশগ্রহণ বন্ধ। অর্জিত বোনাস আগের নিয়মেই প্রক্রিয়া হবে।"], "paused": ["আপাতত বন্ধ", "নতুন অংশগ্রহণ স্থগিত। নিশ্চিত হওয়া বোনাসে এর প্রভাব নেই।"], "blocked": ["অংশ নিতে পারবেন না", "এই অ্যাকাউন্ট অংশগ্রহণের শর্ত পূরণ করে না। নিয়ম দেখুন বা সহায়তায় যোগাযোগ করুন।"], "unmet": ["শর্ত পূরণ হয়নি", "বর্তমান পরিমাণে বোনাসের শর্ত পূরণ হয়নি। ডিপোজিটের আগে ধাপগুলো দেখুন।"], "used": ["প্রথম ডিপোজিট সম্পন্ন", "প্রথম ডিপোজিট হয়ে গেছে, তাই এই অফারে আবার অংশ নিতে পারবেন না। অন্য অফারের নিজস্ব নিয়ম প্রযোজ্য।"], "limit": ["বোনাস সীমা পূর্ণ", "এই অফারে আপনার বোনাস সীমা পূর্ণ। নতুন বোনাস আর পাওয়া যাবে না।"], "pending": ["পেমেন্টের অপেক্ষায়", "বর্তমান অর্ডারের পেমেন্ট সম্পন্ন করুন। সফল হলে বোনাস যাচাই হবে।"], "unknown": ["যাচাই চলছে", "পেমেন্ট বা বোনাস যাচাই হচ্ছে। এই বোনাস পেতে আবার ডিপোজিট করবেন না।"], "rewardpending": ["বোনাস জমার অপেক্ষায়", "যোগ্যতা নিশ্চিত হয়েছে। বোনাস জমা হবে; আবার ডিপোজিট বা দাবি করতে হবে না।"], "rewardfailed": ["বোনাস প্রক্রিয়াধীন", "বোনাস এখনও জমা হয়নি। প্রক্রিয়া চলবে। অর্ডারের রেকর্ড রাখুন।"], "credited": ["বোনাস পেয়েছেন", "বোনাস স্বয়ংক্রিয়ভাবে জমা হয়েছে। প্রথম ডিপোজিটের এই বোনাস আবার পাওয়া যাবে না।"]};
 rows.forEach(r=>{r[2].push(bn[r[0]][0]);r[3].push(bn[r[0]][1]);});
 const index={'zh-CN':0,'zh-TW':1,en:2,bn:3};
 function get(key,lang='zh-CN'){const r=rows.find(r=>r[0]===key)||rows[0],i=index[lang]??0;return {key:r[0],tone:r[1],title:r[2][i],body:r[3][i]};}
 function resolve({order,scenario,active,first,calculation,basic,now,budget}){
  if(['pending','unknown','rewardpending','rewardfailed','credited'].includes(order))return order;
  if(['login','notstarted','ended','paused','blocked','limit'].includes(scenario))return scenario;
  if(!first)return 'used';
  if(!active)return 'paused';
  if(basic?.periodMode!=='always'){
   if(basic?.startAt&&+now<+new Date(basic.startAt))return 'notstarted';
   if(basic?.endAt&&+now>=+new Date(basic.endAt))return 'ended';
  }
  if(budget)return 'paused';
  return calculation?.state==='eligible'?'available':'unmet';
 }
 function rewardLabel(item,lang='zh-CN'){
  const i=index[lang]??0;
  const reasons={channel:['此通道不适用','此通道不適用','Channel not eligible','এই চ্যানেলে প্রযোজ্য নয়'],'payment-method':['此充值方式不适用','此充值方式不適用','Payment method not eligible','এই পদ্ধতিতে প্রযোজ্য নয়'],'claim-limit':['已达领奖次数上限','已達領獎次數上限','Claim limit reached','দাবির সীমা পূর্ণ'],'daily-limit':['已达当日赠送上限','已達當日贈送上限','Daily reward limit reached','দৈনিক বোনাস সীমা পূর্ণ'],'member-cap':['已达单用户赠送上限','已達單用戶贈送上限','User reward limit reached','ব্যক্তিগত বোনাস সীমা পূর্ণ'],'cumulative-target':['累计充值尚未达标','累計充值尚未達標','Deposit total has not qualified','মোট ডিপোজিটের শর্ত অপূর্ণ'],'daily-target':['当日累计尚未达标','當日累計尚未達標','Daily deposit total has not qualified','দিনের মোট ডিপোজিটের শর্ত অপূর্ণ']};
  if(item.state==='unknown')return get('unknown',lang).title;
  if(item.state==='notFirst')return get('used',lang).title;
  if(item.state==='budget')return get('paused',lang).title;
  if(item.state==='inactive')return ['不在活动期间','不在活動期間','Outside the activity period','অফারের সময়ের বাইরে'][i];
  return reasons[item.reason]?.[i]||get('unmet',lang).title;
 }
 root.ParticipationStates={get,resolve,rewardLabel,keys:rows.map(r=>r[0])};
})(typeof window==='undefined'?globalThis:window);
