'use strict';
(function(){
 const c=Reward.defaults,b=RewardHub.clone(RewardHub.defaults),currency=c.currency;
 const event={first:true,registered:'2026-01-23T12:00:00Z',paidAt:'2026-09-23T12:00:00Z',amount:'1000',channel:'third',priorDaily:'0'};
 const amount=v=>Reward.money(v)+' '+currency;
 const newer=Reward.calculate(c,{...event,registered:'2026-09-22T12:00:00Z'}),older=Reward.calculate(c,event);
 b.selected=b.items.map(x=>x.id);const stack=RewardHub.evaluate(c,b,event);
 const near={...event,registered:'2026-09-03T12:00:00Z',amount:'500'},nearNow=Reward.calculate(c,near),nearLater=Reward.calculate(c,{...near,paidAt:'2026-10-03T12:00:00Z'}),nearMore=Reward.calculate(c,{...near,amount:'1000'});
 const table=(heads,rows)=>`<div class="scroll"><table class="matrix"><thead><tr>${heads.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const sources='<div class="source-grid"><article><h3>活动中心</h3><p>首充、通用赠送、通道赠送、推荐金额及每日充值奖励。</p><p>统一设置全部充值奖励、钱包、打码与预算。</p></article><article><h3>任务中心</h3><p>每日累计充值、每日单笔充值。</p><p>显示每日充值进度；奖励设置进入充值活动。</p></article><article><h3>充值管理</h3><p>按通道汇总适用优惠。</p><p>查看规则摘要；编辑时进入充值活动。</p></article></div>';
 const sections=[
 {id:'overview',title:'首充前看到奖励活动，改变首充行为，并且可以在充值后看到结果',lead:'每位会员的一次首充礼，按注册时长和充值金额匹配一档奖励。',html:'<ul><li>新会员注册后即可参与，不必先等待数天</li><li>金额跨档有更高比例；注册较久的未首充会员享有对应档位。</li><li>充值前可以预览，充值后自动派发</li></ul>'},
 {id:'appeal',title:'玩家愿意点开的理由',lead:'目标清楚易懂，了解区别',html:table(['玩家看到什么','为什么这样设计'],[['注册即可参加','新会员能立即判断自己是否符合条件。'],['100、500、1,000三个金额档','每跨一档，奖励比例增加0.5个百分点，目标有实际差别。'],['当前档位、金额差额、奖励差额','玩家比较后自行选择，不用对照整张规则表。'],['单人最高100 INR，钱包与打码清楚显示','领取前知道可得金额和使用条件。']])},
 {id:'preset',title:'新建活动已有完整推荐设置',lead:'直接使用系统名称、简介和规则；有特殊需求时再调整。',html:table(['项目','推荐设置'],[['参与范围','新会员及尚未完成首充的会员'],['金额档位',c.bands.join('／')+' '+currency],['派奖','现金钱包，奖励金额 × '+c.multiple+'倍打码'],['额度','单人最高 '+c.cap+' '+currency+'；活动预算 '+c.budget+' '+currency],['期间与组合','新建起一年；预设只选首充活动']])+'<p class="benefit-note">币别沿用租户。系统文案提供简体、繁体及英文；所有推荐奖励可在后台调整。</p>'},
 {id:'matrix',title:'依据金额和注册时长发送',lead:'含下限、不含下一档下限；只发命中的一档。',html:Copy.table(c,'zh-CN')+'<p class="benefit-note">注册时长以首次充值成功时为准。0天起开放，保留7天及各月档；金额不拆单累计，比例按本次首充成功金额计算。</p>'},
 {id:'player',title:'玩家端：看档位、比金额、查结果',lead:'玩家选择充值方式和金额，系统展示相关优惠。',html:'<ol><li>活动详情：查看已达时长档位，点击金额阶梯比较今天的奖励；可按天预览活动期内的未来优惠。</li><li>充值页：选择通道或输入金额，适用优惠与预估合计同步更新。</li><li>确认充值：支付成功后逐项核验，显示确认中或已入账。</li></ol><p>首充只参与一次。未达到条件的首充不能在后续充值补领。</p>'},
 {id:'journeys',title:'不同会员，看到适合自己的下一步',lead:'资格已经用完，就停止展示继续爬首充阶梯的提示。',html:table(['会员状态','画面回应'],[['刚注册，首充1,000',`当前可参与，预计首充奖励 ${amount(newer.reward)}。`],['注册满6个月，首充1,000',`匹配对应档位，预计首充奖励 ${amount(older.reward)}。`],['已完成首充','显示资格已使用，仍可查看每日任务与通道优惠。'],['奖励结果待确认','保留确认状态，不提示重复充值，也不显示为零奖励。']])+''},
 {id:'timing',title:'会不会等到最后才首充？',lead:'会有这种诱因：同样的金额，等到下一时长档可能获得更多奖励。',html:table(['注册20天、尚未首充','充值金额','首充奖励'],[['今天按当前金额充值','500 INR',amount(nearNow.reward)],['等到注册满1个月再充相同金额','500 INR',amount(nearLater.reward)],['今天选择下一金额档','1,000 INR',amount(nearMore.reward)]])+`<p>今天升档要多充值500 INR，奖励多${amount(nearMore.reward-nearNow.reward)}；等待增加${amount(nearLater.reward-nearNow.reward)}。金额与奖励差额同时显示，由玩家决定。</p>`+'<p class="benefit-note">未来预览只列活动期内可到达的档位，按当前规则估算，不预留名额或预算。这个比较说明规则的诱因，尚不能证明玩家实际会等待。</p>'},
 {id:'timing-design',title:'把今天的金额目标放在眼前',lead:'先展示今天可得，再让玩家主动展开未来预览。',html:'<ul><li>金额阶梯显示充值额与奖励额，下一档显示两者差额；奖励不增加时停止提示升档。</li><li>未来预览标明日期、截止时间与预计档位，不显示超出活动期限的可领取目标。</li><li>达到注册档位标为已达；首充完成显示已完成，后续时长档不再开放领取。</li><li>如果租户优先追求尽早首充，可关闭注册时长分档，只按金额奖励；持续递增的时长奖励本身无法消除等待动机。</li></ul><p class="benefit-note">观察首充等待天数、金额档分布及每位首充会员的奖励成本，再决定是否调整时长差额。页面不承诺提高转化或充值金额。</p>'},
 {id:'ownership',title:'优惠管理负责配置，充值管理负责展示',lead:'每条充值奖励只在活动中心设置一次，各通道读取同一份规则。',html:sources},
 {id:'benefits',title:'集中管理带来的改变',lead:'保留熟悉的活动中心操作，把跨通道查找和重复配置收起来。',html:table(['目前分散配置','集中后的做法','好处'],[['通道逐个配置赠送','活动设置适用方式与通道','同一规则修改一次，少做重复配置。'],['活动、任务、通道各看各的','充值页及管理页汇总适用优惠','玩家知道能得什么，营运知道会送多少。'],['单项奖励看起来合理，合计不明显','逐项试算与组合预算一起检查','提前发现叠加后的成本。'],['文案与奖励参数容易分开维护','系统规则从配置生成','金额、钱包及限制更容易保持一致。']])},
 {id:'operations',title:'租户的设置顺序',lead:'从充值活动统一设置奖励，再检查叠加预算与通道显示。',html:'<ol><li>活动中心点击新增，活动类型选择充值活动，充值奖励类型选择首充成长阶梯：基本资料、奖励阶梯已带入，钱包、打码、单人上限与预算统一放在上方基本资料。</li><li>需要调整时，修改时长、金额档、固定金额或比例；现金钱包须填写打码倍数。</li><li>从活动列表启用所需活动，再到叠加与预算检查已启用项目的试算和总预算。</li><li>进入充值管理，按通道查看结果；需要编辑时进入充值活动。</li></ol>'},
 {id:'stack',title:'同一笔充值，奖励逐项算清楚',lead:'预设只开启首充。选择其他优惠后，按各自条件核验。',html:table(['注册满6个月，首充1,000 '+currency,'预估奖励'],stack.items.map(x=>[x.name['zh-CN'],amount(x.reward||0)]).concat([['五项都开启且达标时的合计',amount(stack.total)]]))+'<p class="benefit-note">这个合计以五项都符合条件为前提。每日次数、赠送上限及活动预算仍分别生效；所有奖励同时计入组合预算。</p>'},
 {id:'future',title:'以后新增充值活动，沿用同一条流程',lead:'新增规则后，适用通道和玩家充值页读取结果，无须再填一份优惠。',html:'<ol><li>在活动中心点击新增，活动类型选择充值活动，再选择首充、通用赠送、通道、推荐金额或每日充值奖励类型。</li><li>填写触发条件、充值方式、通道与期间。</li><li>沿用钱包、打码、上限及系统文案，设置是否允许与其他奖励叠加。</li><li>检查临界金额、适用范围和合计预算；发布后进入充值优惠总览。</li></ol><p>例如新增「周末充值赠送」：设置周末期间和适用通道即可。若玩法引入全新的触发事件，须先扩充规则能力。</p>'},
 {id:'rules',title:'把限制放在玩家做决定之前',lead:'目标感来自清楚的差别，奖励承诺也要清楚。',html:'<ul><li>首次成功充值只核验一次，不按时长阶段重复领取。</li><li>首充未达标不能补领；打码、上限和钱包在充值前可见。</li><li>系统名称、宣传简介和规则说明随玩家语系一致显示。</li><li>已有活动切换管理位置时保留原规则与已接受的订单，避免重复派奖。</li></ul>'}
 ];
 window.CampaignContent={sections,config:c};
})();
