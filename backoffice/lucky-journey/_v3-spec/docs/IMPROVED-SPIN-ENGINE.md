# IMPROVED-SPIN-ENGINE — 好运探索季 V3 后端计算与开奖规格

> 状态：Recommendation / Prototype-only。
>
> 设计目标：服务器权威、幂等、可审计；进度确定性、奖励随机；任何已加入玩家的完成路径与最大预算责任都可计算。

---

## 1. 核心不变量

1. 客户端永不决定进度、奖型、金额或是否完成。
2. 同一 `requestId` / `spinId` 重试必须返回同一结果，不重复扣次数、不重抽。
3. 同一 Play 并发只允许一个 spin 成功。
4. 进度是 **确定性函数**，不使用 RNG。
5. 奖励使用服务器安全 RNG；金额档位也由服务器抽。
6. 进度与奖励互不改写：中了什么奖不能改变这转进度。
7. 第一转所有层级使用同一 `firstSpinPct`。
8. 每个层级最迟在自身 `effectiveTargetSpins` 到 100%。
9. 达到 100% 后本 Play 立即完成，不允许再转。
10. 预算不足只阻止新 Play；已经加入的 Play 使用已预留责任继续完成。
11. 转盘不会发新的抽奖次数。
12. 好友助力只发次数，不改进度。

---

## 2. 数据对象

```text
ActivityConfigVersion {
  configVersionId
  tenantId
  activityId
  effectiveAt

  campaignStart
  campaignEnd
  personalDays
  canRepeat
  afterEnd              // cut | finish
  joinMode              // click | auto

  eligibleSegments[]
  wallet                // cash | bonus
  wageringMultiple

  experience {
    firstSpinPct
    standardTargetSpins
    curveGamma
    phaseShares { fast, mid, fine }
  }

  ticketSources {
    free { enabled, ticketsPerDay, capPerPlay, grantMode }
    task { enabled, ticketsPerTask, capPerPlay }
    assist { enabled, ticketsPerFriend, friendCap, capPerPlay,
             depositRequired, allowPromotionDoubleReward }
  }

  tasks[] {
    taskId
    type                 // play_category | deposit_count | deposit_amount | bet_count | bet_amount
    threshold
    gameCategory?        // 单选
    enabled
  }

  prize {
    sizeWeights[3]
    fast { thanksPct, upgradePct, amounts[3] }
    mid  { thanksPct, upgradePct, amounts[3] }
    fine { thanksPct, upgradePct, amounts[3] }
    finishPrizeCash
  }

  cohorts[] {
    cohortId
    enabled
    vipMin
    depositMin
    targetSpins
    upgradeAddPct
    targetCompletionRate // preview only
  }

  budget {
    totalCashEquivalent
    maxParticipants?
  }
}
```

```text
Play {
  playId
  tenantId
  activityId
  memberId
  configVersionId

  joinedAt
  personalEndsAt
  sourceEligibilityEndsAt

  effectiveTargetSpins
  cohortId

  ticketsAvailable
  progressBp              // 0..10000 basis points
  spinIndex               // successful spin count

  status                  // active | completed | expired | campaign_cut | void
  finishPrizePosted

  liabilityReserved       // remaining hard reserve
  createdAt
  updatedAt
}
```

建议进度内部用 basis points：`10000 = 100%`，避免浮点累积误差。

```text
TicketLedger {
  ticketGrantId
  playId
  memberId
  activityId
  sourceType              // free | task | assist | admin_adjustment
  sourceEventId           // globally idempotent key
  quantity
  tenantDate?
  taskId?
  assistMemberId?
  createdAt
}
```

```text
SpinRecord {
  spinId
  requestId
  playId
  k
  phase

  progressBeforeBp
  progressAfterBp
  gainBp

  prizeType               // none | cash | credit | point
  prizeAmount
  cashEquivalent
  prizeSize               // small | mid | big | none
  upgraded                // bool

  finishPrizePostedThisSpin
  finishPrizeAmount

  liabilityReleasedThisSpin
  createdAt
}
```

```text
RewardGrant {
  rewardGrantId            // unique: spinId:main / spinId:finish
  spinId
  walletType
  rewardType
  amount
  status                   // pending | posted | failed_retryable | terminal
}
```

```text
BudgetLedger {
  activityId
  totalBudget
  actualSpent
  outstandingReserve
  version
}
```

---

## 3. 加入 Play

### 3.1 资格

```text
canJoin =
  now >= campaignStart
  AND now <= campaignEnd
  AND member in eligibleSegments
  AND member has activity access
  AND repeatRuleSatisfied
  AND participantCapAvailable
  AND budgetCanReserve(member)
```

### 3.2 选择难度层级

`depositInCampaign` 与 VIP 可在加入时取一次用于 **本 Play 的有效 T 快照**。推荐不要每一转重新变化，否则玩家同一局“需要几转完成”会动态变化，后台也难以预测。

```text
function chooseCohort(vip, depositInCampaign, cfg):
  matches = enabled rows where vip >= vipMin and deposit >= depositMin
  if none:
    return standard { targetSpins = cfg.experience.standardTargetSpins,
                      upgradeAddPct = 0 }
  return row with smallest targetSpins
         tie-breaker: highest upgradeAddPct
```

> 若业务一定需要“中途充值后立刻加速”，可以作为 V3.1 高级模式，但预算、曲线和 UI 都要重新计算；不建议作为默认。

### 3.3 个人结束时间

```text
personalEndsAt = joinedAt + personalDays

if afterEnd == cut:
  sourceEligibilityEndsAt = min(personalEndsAt, campaignEnd)
else:
  sourceEligibilityEndsAt = personalEndsAt
```

`afterEnd=finish`：活动结束后不接受新加入，但已加入玩家的有效次数来源可继续到 `personalEndsAt`。

### 3.4 硬责任预留

先计算该 Play 最多会发生的 prize-bearing spins：`effectiveTargetSpins`。

```text
reserve = finishPrizeCash
for k in 1..effectiveTargetSpins:
  phase = phaseOf(k, effectiveTargetSpins, phaseShares)
  reserve += maxCashEquivalentForPhase(phase)
```

原始配置：

- 快砍最大 = max(native cash, upgrade cash)
- 中段最大 = max(big credit/100, big fast cash)
- 细砍最大 = max(big point/10000, big mid credit/100)

事务：

```text
BEGIN TX
  lock BudgetLedger(activityId)
  reject if total - actualSpent - outstandingReserve < reserve
  outstandingReserve += reserve
  insert Play(... liabilityReserved = reserve ...)
COMMIT
```

---

## 4. 唯一阶段函数

### 4.1 为什么不用 round()

必须确保：

- fast + mid + fine 的整数转数严格等于 `T-1`。
- 前台预览、进度、开奖、预算完全一致。

### 4.2 Hamilton 分配

```text
function allocatePhaseSpins(T, shares):
  require T >= 4
  rest = T - 1

  // 保证第一转后的三个阶段至少各 1 转
  nFast = 1
  nMid  = 1
  nFine = 1
  remaining = rest - 3

  normalized = normalize(shares)
  quotas = remaining * normalized
  floors = floor(quotas)
  add floors to each phase
  leftover = remaining - sum(floors)

  按 quota 的小数余数由大到小分 leftover
  return {nFast,nMid,nFine}
```

### 4.3 phaseOf

```text
function phaseOf(k, T, shares):
  if k == 1: return fast
  n = allocatePhaseSpins(T, shares)
  if k <= 1 + n.fast: return fast
  if k <= 1 + n.fast + n.mid: return mid
  return fine
```

不存在合法的 `k > T` spin，因为 `k=T` 完成后 Play 立即关闭。

---

## 5. 进度计算

### 5.1 标准公式

```text
function progressAt(k, T, F, gamma):
  if k <= 0: return 0
  if k == 1: return F
  if k >= T: return 100

  q = (k - 1) / (T - 1)
  return F + (100 - F) * (1 - (1 - q)^gamma)
```

落库前转换为 basis points。

### 5.2 一次 spin 的进度

```text
before = play.progressBp
expectedAfter = roundToBp(progressAt(k, play.effectiveTargetSpins,
                                     cfg.firstSpinPct,
                                     cfg.curveGamma))

after = max(before, expectedAfter)
if k >= play.effectiveTargetSpins:
  after = 10000

gain = after - before
```

因为 T 在加入时快照，曲线不会因后来后台编辑改变。

### 5.3 体验防护

配置发布时检查：

- `P(k) > P(k-1)` for every k。
- `P(T)=100`。
- 倒数第二转不能被舍入成 10000；若出现，降低 gamma 或 T。
- 最小非最终 gain 小于建议阈值时黄灯。

---

## 6. 奖励开奖

### 6.1 有效概率

每阶段：

```text
thanksPct   = configured
upgradePct  = min(configured + cohort.upgradeAddPct,
                  100 - thanksPct)
nativePct   = 100 - thanksPct - upgradePct
```

管理员看到的三个值即为真实绝对概率。

### 6.2 抽奖

```text
u = secureRandom(0, 100)

if u < thanksPct:
  prize = none
else if u < thanksPct + upgradePct:
  prize = upgradePrize(phase)
else:
  prize = nativePrize(phase)
```

金额档位再用独立安全随机数：

```text
size = weightedRandom([small, mid, big], [60,30,10])
```

生产实现应使用平台现有安全随机源 / CSPRNG；不要用浏览器 `Math.random()`。

### 6.3 nativePrize

```text
fast -> cash   from fast.amounts[size]
mid  -> credit from mid.amounts[size]
fine -> point  from fine.amounts[size]
```

### 6.4 upgradePrize

```text
fast -> cash = max(fast.amounts)  // 快砍越级固定大档
mid  -> cash = fast.amounts[size]
fine -> credit = mid.amounts[size]
```

细砍不连跳现金。

### 6.5 换算

```text
100 point  = 1 credit
100 credit = 1 cash

cashEquivalent(cash x)   = x
cashEquivalent(credit x) = x / 100
cashEquivalent(point x)  = x / 10000
```

积分与点数仍是活动内账本，不假设它们已经是系统钱包。

---

## 7. 一次 spin 的原子流程

推荐数据库事务 + Outbox / 幂等奖励写入：

```text
function spin(playId, requestId, actorMemberId):
  BEGIN TX

  // A. 请求幂等
  existing = SpinRecord.findBy(playId, requestId)
  if existing:
      COMMIT
      return existing

  // B. 锁 Play
  play = SELECT ... FOR UPDATE
  reject if play.memberId != actorMemberId
  reject if play.status != active
  reject if play.ticketsAvailable < 1
  reject if now > play.sourceEligibilityEndsAt AND no previously granted tickets usable

  cfg = loadConfigVersion(play.configVersionId)
  k = play.spinIndex + 1
  reject if k > play.effectiveTargetSpins

  phase = phaseOf(k, play.effectiveTargetSpins, cfg.phaseShares)

  // C. 进度：确定性
  progressBefore = play.progressBp
  progressAfter  = progressAtBp(k, play.effectiveTargetSpins,
                                cfg.firstSpinPct, cfg.curveGamma)
  gain = progressAfter - progressBefore

  // D. 奖励：随机，但与进度无关
  prize = drawPrize(cfg, play.cohortId, phase, secureRng)

  // E. 扣次数、更新 Play
  play.ticketsAvailable -= 1
  play.spinIndex = k
  play.progressBp = progressAfter

  // F. 主奖励
  mainCE = cashEquivalent(prize)
  insert RewardGrant(unique spinId:main, prize)

  // G. 完成大奖
  finishPrize = 0
  if progressBefore < 10000 AND progressAfter == 10000:
      assert play.finishPrizePosted == false
      finishPrize = cfg.prize.finishPrizeCash
      insert RewardGrant(unique spinId:finish, finishPrize)
      play.finishPrizePosted = true
      play.status = completed

  // H. 预算责任释放
  maxForThisSpin = maxCashEquivalentForPhase(phase)
  play.liabilityReserved -= maxForThisSpin
  BudgetLedger.outstandingReserve -= maxForThisSpin
  BudgetLedger.actualSpent += mainCE

  if completed:
      // finish prize原本已经在加入时预留
      play.liabilityReserved -= cfg.finishPrizeCash
      BudgetLedger.outstandingReserve -= cfg.finishPrizeCash
      BudgetLedger.actualSpent += cfg.finishPrizeCash

      // 后续已经预留但不会再发生的转数（若因特殊配置提前完成）全部释放
      release = play.liabilityReserved
      play.liabilityReserved = 0
      BudgetLedger.outstandingReserve -= release

  insert SpinRecord(...)
  insert OutboxEvent(reward grants...)

  COMMIT
  return SpinRecord
```

### 7.1 钱包服务失败

如果派奖钱包不与活动 DB 同库，不能假设跨服务原子事务。推荐：

- SpinRecord 与 RewardGrant / Outbox 在一个本地事务落库。
- 钱包入账使用 `rewardGrantId` 幂等。
- 前台若派奖尚未成功，可显示“开奖结果已保存，奖励入账处理中”。
- 重试钱包，不重抽 spin。

---

## 8. 抽奖次数发放

### 8.1 每日免费

```text
uniqueKey = activityId + memberId + tenantDate
if not exists and active Play exists and within sourceEligibilityEndsAt:
  grant min(ticketsPerDay, remaining source cap)
```

重复 Play 不会同一日重领。

### 8.2 任务

任务从 Play.joinedAt 起累计：

```text
progress = aggregateEligibleEvents(member, task, from=play.joinedAt)
if threshold crossed and no TicketLedger(playId, taskId):
  grant ticketsPerTask subject to cap
```

- 充值只算 settled。
- 下注只算 settled、有效、非 void。
- 游玩类型为单选。

### 8.3 好友助力

```text
qualifies =
  child.registeredAt >= campaignStart
  AND directReferral(child, member)
  AND child not used for any assist in this activity
  AND now <= activePlay.sourceEligibilityEndsAt
  AND (depositRequired == false OR child has settled qualifying deposit)
```

唯一键建议：`activityId + assistedChildMemberId`。

助力事件只增加 tickets，不改 progress。

---

## 9. 预算状态机

### 9.1 预算正常

```text
actualSpent + outstandingReserve <= totalBudget
```

### 9.2 预算只够旧玩家

当 `availableBudget < nextJoinReserve`：

- 活动仍对 active Play 正常运行。
- 新玩家参加按钮改成“本期名额已满”。
- 不暂停 spin。
- 不调概率。

### 9.3 管理员降低预算

禁止把 `budget.total` 保存到小于：

```text
actualSpent + outstandingReserve
```

后台显示最小可降值。

### 9.4 增加预算

增加预算后，可立即重新开放新加入；不用修改任何旧快照。

### 9.5 活动提前停止

- 不再新加入。
- `afterEnd=cut`：关闭未完成 Play、清未用次数、释放剩余责任，不发 finishPrize。
- `afterEnd=finish`：保留 active Play 与其全部责任到 personalEndsAt。

---

## 10. 完成率模拟算法

### 10.1 目的

只用于后台规划：给定次数获取行为，某 cohort 在个人窗口内拿到至少 T 次的概率。

### 10.2 默认原型模型

```text
FreeTickets = ticketsPerDay * Binomial(days, dailyVisitProbability)
TaskTickets = Σ ticketsPerTask * Bernoulli(task_i_completionProbability)
AssistCount = min(Poisson(lambda), friendCap)
AssistTickets = AssistCount * ticketsPerFriend

TotalTickets = FreeTickets + TaskTickets + AssistTickets
CompletionRate = P(TotalTickets >= effectiveT)
```

可用离散分布 convolution 精确计算，不需要 Monte Carlo。

### 10.3 生产建议

优先改为：

- 过去 30 / 60 / 90 天分层回访率。
- 类似任务真实完成率。
- 合格直接新注册下线人数分布。

并显示数据窗口和样本量。没有历史数据时，明确标注“假设模型”。

---

## 11. 完整情境表

| ID | 情境 | V3 结果 |
|---|---|---|
| S01 | 活动中点击参加 | 校验资格、选择 cohort、快照配置、预留责任、建 Play，进度 0% |
| S02 | 活动结束后才参加 | 拒绝，不建 Play，不计奖 |
| S03 | 无次数点转 | 409/业务拒绝，不扣、不抽、不推进度 |
| S04 | 第一转 | 进度精确到 firstSpinPct；阶段 fast；奖励按 fast 概率抽 |
| S05 | 第 2 转以后 | 进度按曲线 `P(k)`；阶段按唯一 `phaseOf` |
| S06 | 中段主奖励 | 积分；越级现金 |
| S07 | 细砍主奖励 | 点数；越级积分；不连跳现金 |
| S08 | 谢谢参与 | 本转无奖励，但进度正常推进 |
| S09 | k=effectiveT | 精确 100%；发 finishPrize 一次；Play completed |
| S10 | completed 后还有次数 | 拒绝继续转；本 Play 剩余次数标记失效 |
| S11 | 同 requestId 重试 | 返回原 SpinRecord |
| S12 | 两设备同时转 | Play row lock；一笔先成功，另一笔重读后依新状态处理 |
| S13 | 成功开奖后断线 | 再请求同 requestId / 查询 spinId 返回原结果 |
| S14 | 钱包暂时失败 | spin 结果不重抽；RewardGrant 持续幂等重试 |
| S15 | 好友合格 | 只加次数 |
| S16 | 助力要求充值、下线未完成 settled 充值 | 暂不成立 |
| S17 | 与推广同时允许 | 各自按规则发放；好运探索季只记自己的 TicketLedger |
| S18 | 来源中途关闭 | 新 Play 使用新快照；旧 Play 继续按旧快照来源规则 |
| S19 | 任务未启用 | 行为不发次数 |
| S20 | 游玩指定类型 | 只认配置中的单一类型及有效事件 |
| S21 | 高层级 | 加入时获得更小有效 T；第一转仍相同 |
| S22 | 中途升级 VIP / 充值 | V3 默认不改变当前 Play 的 T；下个 Play 可使用新 cohort |
| S23 | 预算不足 | 停止新 Play；旧 Play 正常 |
| S24 | 后台改曲线 | 只影响新 Play configVersion |
| S25 | 可重复参加 | 上一 Play closed 后新建；进度 0%；同日免费不能重领 |
| S26 | 新 Play 的充值任务 | 只计算新 joinedAt 后新增充值，不沿用旧局累积 |
| S27 | 同一下线跨 Play 助力 | 拒绝，activity 范围唯一 |
| S28 | afterEnd=cut | 活动结束时关闭 active Play；未用次数失效；不发 finishPrize；释放责任 |
| S29 | afterEnd=finish | 不接受新加入；旧 Play 可继续获次数 / 转动到 personalEndsAt 或完成 |
| S30 | personalEndsAt 到期 | 关闭 Play；未用次数失效；不补发 finishPrize；已入账保留 |
| S31 | 管理员把预算调低到已承诺责任以下 | 阻止保存 |
| S32 | 预算增加 | 新加入可重新开放 |
| S33 | phase share 修改造成整数分配变化 | 新 Play 使用新 phase plan；旧 Play不变 |
| S34 | thanks+upgrade >100 | 配置红灯，禁止发布 |
| S35 | maxTicketsAll < 某 cohort T | 红灯，禁止发布 |
| S36 | 非社交路径不足但总路径足够 | 黄灯；若“非社交保证”开启则红灯 |
| S37 | 自动参加大量打开页面 | 高风险；V3默认 click；auto 要参与人数 cap + 预算检查 |
| S38 | 充值退款 / 注单 void 后任务 | 默认只在结算态授予，避免事后回收；若仍发生逆转需风控政策另定 |
| S39 | 风控怀疑作弊 | 可阻止新的 ticket grant / 转人工；不得偷偷更改已保存 SpinRecord |
| S40 | 前端动画卡死 | 可跳过动画，直接读取 SpinRecord 并展示真实结果 |

---

## 12. 数值范例

### 12.1 默认标准玩家

配置：

```text
F=90
T=12
gamma=1.8
phase shares=40/35/25
```

整数阶段：

```text
第一转 fast
post-first fast = 4
mid = 4
fine = 3
=> 实际开奖阶段：fast 5 转、mid 4 转、fine 3 转
```

进度约：

```text
k1  = 90.0000
k2  = 91.5765
k3  = 93.0317
k4  = 94.3629
k5  = 95.5673
k6  = 96.6413
k7  = 97.5810
k8  = 98.3812
k9  = 99.0355
k10 = 99.5351
k11 = 99.8665
k12 = 100.0000
```

### 12.2 VIP4 玩家

若有效 T=10，同样第一转 90%，曲线压缩在 10 转完成。玩家不是“进度倍率 1.2 倍”，而是后台明确知道：**需要 10 次**。

### 12.3 VIP7 玩家

有效 T=8，最多 8 次完成。预算最大 prize-bearing spins 也只有 8，因此硬预留更低。

### 12.4 开奖概率范例

快砍：

```text
thanks 20%
upgrade 8%
native cash 72%
```

如果小 / 中 / 大 = 60 / 30 / 10：

```text
native cash金额 EV
= 0.18*0.6 + 0.5*0.3 + 1*0.1
= 0.358

fast 单转 EV
= 8%*1 + 72%*0.358
= 0.33776 cash-equivalent
```

默认阶段 5 fast / 4 mid / 3 fine，加 finishPrize=5，原型计算每局期望约 `7.86`，最大责任 `17`。

---

## 13. 相对附件 05 的调整表

| 附件 05 | V3 | 理由 |
|---|---|---|
| 文字说进度与奖励两个 RNG，但进度实际 deterministic | 明确进度无 RNG | 目标曲线必须可控 |
| phaseOf 用 round | Hamilton 唯一分配 | 严格合计且所有模块一致 |
| 进度按三段 share 切 gains | 曲线函数独立于阶段 share | 消除一套参数双重职责 |
| 进度倍率 | cohort effective T | 更直接、更可预算 |
| 越级是“非谢谢后”的条件概率 | 越级改绝对概率 | 管理员看到真实有效率 |
| k>T 仍可 fine | 不存在合法 k>T | k=T 已完成后不能再转 |
| source cap 总和参与最坏预算 | 只按 effectiveT 开奖转数算 | 最大责任口径正确 |
| VIP / 充值每 spin 现查 | V3 默认加入时快照 cohort | 同一 Play 体验稳定 |
| 结束后 finish 的来源窗口不明 | 明确延长到 personalEndsAt | 确保真的可做完 |
| 重复 Play 的次数事件作用域不明 | 免费 activity-day；任务 play；助力 activity | 防刷且可实现 |
