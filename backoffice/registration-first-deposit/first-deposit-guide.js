'use strict';
(function(){
 const R=Reward,c=R.defaults;
 const table=(heads,rows)=>'<div class="scroll"><table><thead><tr>'+heads.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
 function strategy(base){const x=R.clone(c);x.ages=[{value:0,unit:'d'},{value:1,unit:'d'},{value:7,unit:'d'}];x.cells=base.map(n=>[0,.5,1].map(extra=>({type:'percent',value:String(n+extra)})));return x;}
 const early=strategy([2,1,.5]),later=strategy([.5,1,2]);
 function result(config,days){return R.money(R.calculate(config,{first:true,registered:'2026-01-01T12:00:00Z',paidAt:new Date(Date.UTC(2026,0,1+days,12)).toISOString(),amount:'1000'}).reward)+' INR';}
 const timingTable=table(['注册时长','越早首充回馈越高','注册越久回馈越高'],[0,1,7].map((d,i)=>[Copy.ageRange(early.ages[i],early.ages[i+1],'zh-CN'),result(early,d),result(later,d)]));
 window.CampaignContent={sections:[
 {id:'overview',title:'首充阶梯是什么？',lead:'首次成功充值时，依据注册时长和充值金额匹配一档奖励，每位会员只参与一次。',html:'<p>注册后即可参加。充值前查看当前奖励，充值成功并核验通过后自动派发。首次充值未达到条件，后续充值不能补领。</p><p>注册时长奖励可以递增，也可以递减。选择哪种方向，取决于租户希望会员尽早首充，还是照顾注册较久、尚未首充的会员。</p>'},
 {id:'settings',title:'后台如何设置',lead:'新增活动 → 活动类型选择充值活动 → 默认首充阶梯。',html:'<ol><li>基本设置：选择活动起止时间或始终开启，设置充值方式、派奖钱包、打码倍数、单用户赠送上限及活动预算。</li><li>开启「按注册时长分档」，填写每档下限，再设置充值金额下限。</li><li>在交叉表内，为每一格选择固定金额或百分比。每格可独立调整，不要求奖励随注册时长增加。</li><li>检查试算及玩家预览，保存为草稿，确认后启用。</li></ol><p>不需要时长差异时，关闭时长分档，只按金额档发放。现金钱包须填写打码倍数；无封顶也不会超过总体活动预算。</p>'},
 {id:'timing-strategies',title:'两种回馈方向，都能用同一张表设置',lead:'以下均以首充1,000 INR比较，只改变注册时长对应的奖励。',html:timingTable+'<p>这两套是可选设置，不会同时发放，也不会自动替换当前活动配置。选择一个方向后，逐格填写奖励即可。</p><p class="benefit-note">「0~1日」指注册后未满24小时；「1~7日」指满24小时、未满7日。例如晚上23:00注册，次日上午充值仍属于0~1日。分档按已过时长计算，不按凌晨换日。</p>'},
 {id:'early-reward',title:'希望尽早首充：越早充值，回馈越高',lead:'让会员看清现在可得的奖励，以及跨过时长档位后的差别。',html:'<p>将时长下限设为0日、1日、7日，奖励从上往下递减。按下表，首充1,000 INR：注册后立即充值可得30 INR；满24小时后为20 INR；满7日后为15 INR。</p>'+Copy.table(early,'zh-CN')+'<p>固定金额也能递减，例如同一金额档依次设置30、20、15 INR。当前档截止时间应按会员注册时间显示，不能用每天重置的倒计时。只说明真实奖励差额，不制造虚假限时。</p>'},
 {id:'later-reward',title:'照顾较早注册的会员：注册越久，回馈越高',lead:'适合为注册较久、仍未首充的会员提供较高首充回馈。',html:'<p>同样设为0日、1日、7日，将奖励从上往下递增。按下表，首充1,000 INR：未满24小时可得15 INR；满24小时为20 INR；满7日为30 INR。</p>'+Copy.table(later,'zh-CN')+'<p class="benefit-note">这种设置可能让会员等待更高档位。如果目标是尽早首充，建议采用递减奖励，或关闭时长分档。若下一档已超过活动结束时间，就不显示为本期可达到的目标。</p>'},
 {id:'matrix',title:'系统默认奖励与计算方式',lead:'系统默认按注册时长递增；需要尽早首充时，可改用上方递减设置。',html:Copy.table(c,'zh-CN')+table(['设置','系统默认'],[['充值金额下限',c.bands.join('／')+' INR'],['派奖钱包与打码','现金钱包；奖励金额 × '+c.multiple+'倍'],['单用户赠送上限',c.cap+' INR'],['活动预算',c.budget+' INR']])+'<p>比例奖励＝首次成功充值金额 × 命中比例，保留两位小数并舍去不足一分的部分，再受单用户上限和活动预算限制。固定金额直接取命中格的金额，不与其他格累加。</p>'},
 {id:'player',title:'玩家会看到什么',lead:'充值前比较奖励，充值后查看处理结果。',html:'<ol><li>当前注册档位和已达到的时长档；达到时长不代表已经领奖。</li><li>金额阶梯、预计奖励，以及提高充值金额后的差额。</li><li>可展开未来日期预览，比较届时的奖励。递减方案应明确显示未来奖励较低，递增方案则说明等待后的差额；最终以首充成功时的规则为准。</li><li>支付核验、待派奖、已领奖等状态。完成首充后，不再提供重复领取目标。</li></ol><p>未来预览不预留预算，也不改变实际结算时间。系统名称、宣传简介和规则支持简体、繁体、英文与孟加拉文；启用前逐一检查对应语系。</p>'},
 {id:'boundaries',title:'哪些边界需要先确认',lead:'以首次充值成功时的注册时长及金额匹配，区间含下限、不含上限。',html:'<ul><li>采用上方0／1／7日分档时，注册满24小时进入1日档，满7日进入7日档；其他设置以实际档位下限为准。发起订单时的预估不锁定奖励。</li><li>活动结束后不接受新的参与；已达标奖励继续按已确认的规则处理。</li><li>每位会员限一次首充奖励，不能把后续充值累计成首充，也不能按多个时长档重复领奖。</li><li>变更奖励方向前确认生效范围，已确认的奖励沿用原规则。</li></ul>'}
 ]};
})();
