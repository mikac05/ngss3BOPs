# 首充成长阶梯与充值优惠管理

入口：[活动说明](guide.html) · [会议简报](presentation.html) · [首充设置](index.html) · [奖励组合](rewards.html) · [通道奖励](channel-rewards.html) · [每日任务](task-center.html) · [充值优惠总览](deposit-settings.html) · [玩家活动](player.html) · [玩家充值](deposit.html)。

## 当前推荐设置

新会员从0天档参与，另有7天和1、3、6、12个月档。充值门槛为100、500、1,000 INR；同一时长每跨一金额档增加0.5个百分点。默认现金钱包、1倍打码、单人上限100、活动预算100,000；新建起一年。新建组合只选首充，四类独立奖励按需选用，组合单笔预留上限250。

新会员首充1,000得到15，注册满6个月首充1,000得到35。五项全部开启且达标时，后者合计78。金额及文案由共享配置生成。

## 界面与计算

- 活动中心配置首充及通道赠送；任务中心配置每日充值任务；充值管理按通道只读汇总。
- 主后台保留现有活动中心完整基本字段，系统文案支持简体、繁体、英文。通道编辑基本资料、系统文案、钱包及奖励值可保存。
- 派奖、打码、单人上限和预算位于上方基本资料；跨页链接位于独立顶部导航。
- 玩家可以点击金额阶梯、修改金额、选择充值方式、查看规则及切换语系。可按整数天预览未来首充奖励，超出活动期间不显示可领金额；预览不改变今天的充值日期。已达时长与已完成奖励分别显示。确认后进入待支付状态，不自动伪造支付成功。
- player-view.js统一玩家视图；campaign-content.js统一说明与14页简报；engine.js、reward-hub.js提供计算。
- 后台沿用共享的青绿主题基准；玩家沿用backoffice/personalization/player-components.css所记录的配色。样式均放在本目录。
- 页面不展示调试工具、构建标记、版本号或制作过程。所有测试与接入说明保留在本文件及验证文档。

## 验证

node engine.test.cjs：18项；node reward-hub.test.cjs：13项。node forecast.test.cjs：6项；ui.test.cjs需要jsdom，17项源代码DOM检查通过，覆盖页面加载、推荐保存、三语、金额阶梯、钱包规则、通道与任务编辑、充值管理只读及简报导航。9个HTML文件的链接和重复ID检查、JavaScript语法检查通过。jsdom不加载外部资源，不进行浏览器或网络交互。

浏览器先前对本地file访问返回安全策略阻挡，因此真实浏览器布局、320／390px视口及长文案视觉验收未完成，未绕过限制。

## 接入边界

这是本地交付，未接真实支付、钱包或资格服务。会员情境来自player-view.js中的数据入口，供核对界面；scenario=new/returning/used/unknown/credited只改变本地测试状态，不代表真实会员。页面未建立真实充值订单，也不进行真实派奖。

正式接入需提供租户币别与时区、会员及首充记录、活动期间和分层资格、预算并发预留、每日领取历史、通道回调幂等、退款修正、多语内容及权威结算状态。通用新增活动模板属于后续接入工作；当前目录提供既有五类。

本次采用独立存储键ngss3.registration-first-deposit.launch及ngss3.deposit-reward-bundle.launch；先前草稿保留在原键，不自动覆盖。已部署租户的真实活动不得被新建推荐设置覆盖。

GitHub Pages入口：https://mikac05.github.io/ngss3BOPs/backoffice/registration-first-deposit/ 。页面源代码单独发布；NGSS3内的规则文档不随静态站点公开。对应规则位于NGSS3的docs/02_feature_and_event_specs/registration_first_deposit/及deposit_reward_hub/。
