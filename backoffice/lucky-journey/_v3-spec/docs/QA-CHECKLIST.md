# QA-CHECKLIST — 好运探索季 V3

## A. 数学与配置

- [ ] `P(0)=0`
- [ ] `P(1)=firstSpinPct`
- [ ] `P(T)=100`
- [ ] 所有 k：`P(k)>P(k-1)`
- [ ] fast/mid/fine phase spins 合计 T-1
- [ ] 同一 `phaseOf()` 被开奖、预算、预览共用
- [ ] thanks + upgrade <= 100
- [ ] native = 100 - thanks - upgrade
- [ ] 小中大权重合计 100
- [ ] 各 eligible cohort 的 max tickets >= effectiveT
- [ ] 非社交保证模式开启时 free+task >= standardT

## B. 预算

- [ ] 新 Play 加入前锁 BudgetLedger
- [ ] actualSpent + outstandingReserve 永不超过 totalBudget
- [ ] 降低预算不得低于既有责任
- [ ] 已加入 Play 不受预算后续变化影响
- [ ] complete / expire / cut 都会正确释放未使用责任

## C. 幂等与并发

- [ ] playId + requestId unique
- [ ] rewardGrantId unique
- [ ] TicketLedger sourceEventId unique
- [ ] 同一 Play 两设备并发只有一个顺序化结果
- [ ] 断线重试返回相同 SpinRecord
- [ ] 钱包重试不重抽

## D. 次数防刷

- [ ] 免费按 activity + member + tenantDate 去重
- [ ] 任务只算 joinedAt 后事件
- [ ] 同一 task 每 Play 只发一次
- [ ] 助力 child + activity 唯一
- [ ] 助力只认活动开始后直接新注册下线
- [ ] 充值门槛只用 final/settled 充值
- [ ] 注单任务只算 settled 非 void

## E. 生命周期

- [ ] 活动结束后新参加拒绝
- [ ] afterEnd=cut 行为正确
- [ ] afterEnd=finish 已加入者来源窗口延长到 personalEndsAt
- [ ] personalEndsAt 到期关闭
- [ ] completed 后拒绝 spin
- [ ] repeat 新 Play 从 0%，旧事件不重用

## F. 玩家前台

- [ ] 加入前显示 0%，不会预先伪装接近完成
- [ ] 不显示剩余转数 T
- [ ] 充值 / 助力门槛明确
- [ ] 谢谢参与仍推进真实进度
- [ ] 转盘动画只消费服务器已保存结果
- [ ] 网络失败不会重新开奖
- [ ] 预算满仅影响未参加用户
- [ ] 完成后立即显示结算并停止转动

## G. 原型 / 规格一致性

- [ ] Prototype 默认配置与 Markdown 默认配置一致
- [ ] Prototype 只使用 Mock Server 进行浏览器演示，文案明确生产必须服务端权威
- [ ] `npm test` 通过
- [ ] `npm run build` 通过
