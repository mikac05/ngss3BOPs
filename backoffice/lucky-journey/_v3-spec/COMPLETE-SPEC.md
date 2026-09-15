# 好运探索季 V3 — 完整规格包

> 本文件为便于一次性阅读的合并版；拆分文件仍以 `docs/` 下各文件为维护单位。


---

# 好运探索季 V3 — 机制审查与修正版总览

> 状态：Recommendation / Prototype-only。本文是在 G3 / v2 基线之上的 V3 建议，不代表现网已上线。

## 0. 先复述当前 G3 / v2（核对基线）

1. 玩家点击参加后进度从 **0%** 开始，并快照当时活动配置。
2. 第一次成功转动后直接到后台设定的「第一转」进度%，默认约 90%。
3. 后续以快砍 → 中段 → 细砍推进，设计上最终必须能到 100%，不能永远差 0.01。
4. 抽奖次数来自每日免费、做任务、好友助力；好友助力只加次数，不直接加进度。
5. 开奖与进度同一次 spin 处理；开奖主要货币随阶段从现金 → 积分 → 点数，并允许越级。
6. 玩家前台不显示“还差几次”；管理员才看目标旋转次数 T 与曲线。
7. 管理员不手填每个转盘扇区概率；当前概率由阶段、谢谢参与、越级与金额档位共同决定。
8. 进度到 100% 时额外发一次转满大奖，本局完成，之后不应再继续转。

---

## 1. 审查结论

现有方向是对的，但还没有达到“可放心交给运营长期配置”的程度。主要问题不是缺功能，而是 **同一个旋钮承担太多语义、完成率没有被正式建模、预算责任口径不正确、重复参加与结束边界仍可被刷、前台视觉与真实概率可能产生误解**。

V3 的核心改动是：

- **进度从随机 / 倍率式刀法改成确定性目标曲线**。管理员决定第一转、标准目标转数 T、收尾细腻度；给定快照后，玩家每一转会到哪里可完全计算。
- **奖励阶段长度与进度曲线拆开**。快砍 / 中段 / 细砍只决定第几转处于哪种奖励阶段，不再同时决定“砍多少进度”。
- **不同层级的完成难度改用有效 T**，例如标准 12 转、VIP4 10 转、VIP7 8 转；第一转保持一致。这样比“进度倍率”更容易解释、模拟与预算。
- **完成可行性与预计完成率分开**：前者是硬校验——规则上必须拿得到足够次数；后者是运营模拟——根据回访、任务、助力行为估算真正会完成多少人。
- **谢谢参与 / 越级改成绝对概率**：`谢谢 + 越级 + 本段主奖励 = 100%`。不再让管理员理解“先抽谢谢，再对剩余结果抽越级”的条件概率。
- **预算改成逐 Play 硬责任预留**。每位玩家加入时，按其有效 T 预留最大可能派奖责任；预算不足只停止新加入，不改变已加入玩家结果。
- **重复参加、任务、每日免费、好友助力全部定义事件作用域**，避免同一天重复领免费次数、旧充值瞬间完成新一局、同一下线跨局重复助力。
- **玩家转盘定位为结果动画，不是概率饼图**。服务器先保存结果，前端只把已保存结果演出来。

---

## 2. 对五个目标的直接回答

### 2.1 玩家必须感觉“快要完成，而且可以完成”

建议默认：

- 第一转：`90%`
- 标准目标转数：`12`
- 收尾细腻度：`γ = 1.8`
- 进度曲线：第一转非常快，第二转以后逐渐变细，但第 12 转精确 100%。

默认曲线约为：

| 转数 | 进度 |
|---:|---:|
| 0 | 0% |
| 1 | 90.00% |
| 2 | 91.58% |
| 4 | 94.36% |
| 6 | 96.64% |
| 8 | 98.38% |
| 10 | 99.54% |
| 11 | 99.87% |
| 12 | 100% |

最后一转不是“随机碰到 100”，而是数学上保证到 100。

### 2.2 玩家真的可以完成

发布前分两层检查：

1. **可行性检查（硬阻挡）**：某层级最大可获得抽奖次数必须 `>= 该层级有效 T`。
2. **非社交保证路线（默认建议）**：不邀请好友时，每日免费 + 任务最好也能 `>= 标准 T`。

推荐默认：

- 7 天 × 每天 1 次免费 = 7 次
- 5 个任务 × 每项 1 次 = 5 次
- 合计 12 次 = 标准 T
- 好友助力只是加速 / 替代路径，不是强迫所有玩家拉人。

若运营刻意做社交型活动，可以关闭“非社交保证”，但后台应出现黄灯并要求确认；前台必须明确好友条件。

### 2.3 管理员可控制体验曲线

V3 把体验拆成四个互不打架的控制面：

- **时长**：可玩天数。
- **完成次数**：标准 T + 分层有效 T。
- **进度体感**：第一转% + 收尾细腻度 γ。
- **做什么才能拿到次数**：每日免费 / 任务 / 好友的每事件发次数、上限、任务门槛。

奖励体验另由：

- 快砍 / 中段 / 细砍的“转数占比”
- 各段绝对的谢谢参与%、越级%、本段主奖励%
- 小 / 中 / 大金额与全局金额权重

控制。

### 2.4 管理员方便控制不同层级完成几率

不建议设置“后台中奖完成率 = 70%”然后服务器暗抽 30% 玩家不能完成。

建议操作逻辑：

- 管理员给不同层级配置 **有效 T**；T 越小，同样次数供给下越容易完成。
- 系统根据行为假设计算 `P(可取得次数 >= 有效T)`，显示预计完成率。
- 管理员可输入“目标完成率”，后台反推建议 T，但最终执行的是 T，不是隐藏随机完成率。

示例：

| 层级 | 有效 T | 业务意义 |
|---|---:|---|
| 标准 | 12 | 完整走完默认路线 |
| VIP4+ 且充值≥200 | 10 | 可以少拿 2 次就完成 |
| VIP7+ 且充值≥2000 | 8 | 更早完成，但第一转仍为 90% |

### 2.5 预算、异常与反作弊

预算责任使用：

```text
availableBudget = budgetTotal - actualSpent - outstandingReserve
```

每位新玩家加入前：

```text
requiredReserve(play)
  = finishPrize
  + Σ(k=1..effectiveT) maxCashEquivalent(phaseOf(k))
```

以建议默认奖表计算，每一转最大现金当量约 1，标准 T=12、转满大奖=5：

```text
标准玩家硬预留 = 12 × 1 + 5 = 17
```

因此：

- `availableBudget < requiredReserve` → 停止新加入。
- 已加入玩家 → 不降奖、不改曲线、不改概率。
- 每转实际只花 0.3，原本为该转预留 1 → 立即释放 0.7，之后可继续开放新名额。
- 活动结束 / Play 关闭 → 释放尚未需要的剩余预留。

这比“所有来源 cap × 每转最大值”更准确，因为完成后不能继续转，所以真正最大派奖转数是有效 T，而不是所有可发次数总和。

---

## 3. 当前文件中必须修掉的矛盾

### 3.1 “进度 RNG”与实际实现矛盾

规则文字说进度刀与奖励用独立 RNG，但现行 `gains[]` 实际是确定性公式。V3 明确：**进度不用 RNG，奖励才用安全随机数**。这是为了让目标曲线、完成次数和预算都能被精确控制。

### 3.2 `k=T` 完成与 `k>T` 继续细砍矛盾

当前公式 `k>=T` 会直接收尾到 100%，完成后又拒绝继续转，因此“k>T 还有剩余进度”理论上不可发生。V3 删除该状态：

- 正常 Play 最迟在 `effectiveT` 完成。
- 完成后 spin API 直接拒绝。
- 已经发但没用完的次数在本 Play 标记失效，不再额外开奖。

### 3.3 阶段比例不能同时表示“进度占比”和“奖励期长度”

V3：阶段比例只表示 **转数长度**。进度另由曲线函数控制。

### 3.4 预算公式把“可发次数”误当“可开奖次数”

完成后不允许继续转，因此最坏责任只需算到有效 T。V3 以逐 Play 硬预留解决。

### 3.5 重复参加的事件作用域未定义

必须明确：

- 每日免费：`member + activity + tenantDate` 去重，跨 Play 不能同日重领。
- 任务：只计算该 Play `joinedAt` 后的新行为，不让上一局累计数据瞬间满足下一局。
- 好友：同一下线在整个 activity 只可贡献一次，不能每个 Play 再贡献。

### 3.6 活动结束后允许做完本次时，次数来源是否继续有效未定义

V3 推荐：`afterEnd=finish` 时，对 **已加入 Play** 将该 Play 的有效动作窗口延长到 `personalEndsAt`，否则“允许做完”可能只是表面允许、实际上拿不到次数。活动结束后仍不允许新加入或开启重复 Play。

---

## 4. 建议默认配置

```yaml
experience:
  personalDays: 7
  firstSpinPct: 90
  standardTargetSpins: 12
  curveGamma: 1.8
  phaseSpinShares:
    fast: 40
    mid: 35
    fine: 25

tickets:
  free:
    ticketsPerDay: 1
    days: 7
    cap: 7
  task:
    ticketsPerTask: 1
    taskCount: 5
    cap: 5
  assist:
    ticketsPerQualifiedFriend: 1
    qualifiedFriendCap: 5
    cap: 5

cohorts:
  - name: standard
    effectiveTargetSpins: 12
  - name: vip4_deposit200
    effectiveTargetSpins: 10
  - name: vip7_deposit2000
    effectiveTargetSpins: 8

prize:
  sizeWeights: [60, 30, 10]
  fast: { thanks: 20, upgrade: 8, native: 72, amounts: [0.18, 0.5, 1] }
  mid:  { thanks: 25, upgrade: 10, native: 65, amounts: [18, 50, 100] }
  fine: { thanks: 30, upgrade: 8, native: 62, amounts: [50, 100, 200] }
  finishPrizeCash: 5
```

---

## 5. 推荐的产品原则

1. **完成是规则，不是奖项。** 随机只决定这一转拿什么，不决定这个玩家有没有资格最终完成。
2. **预算不能回头修改已经加入的体验。** 预算不足只影响新加入。
3. **管理员看到的是目标、原因和结果，不是十几个互相打架的参数。**
4. **前台不展示剩余转数，但必须把获得次数的方法与任何充值 / 好友门槛讲清楚。**
5. **转盘是动画，服务器记录才是真相。**
6. **任何“完成率”都要标明是运营行为估算，不是单人暗抽概率。**


---

# IMPROVED-BACKOFFICE — 好运探索季 V3 后后台规格

> 状态：Recommendation / Prototype-only。
>
> 目标：让运营先定义目标体验，再由系统验证次数供给、完成率与预算，而不是在多个页面靠经验拼凑参数。

---

## 1. IA 总体结构

### 1.1 活动中心标准上半表

保持现有活动中心心智，不另造一套壳：

- 活动类型：好运探索季
- 活动名称
- 活动时间
- 可玩天数
- 可重复参加
- 活动结束后：截断 / 允许做完本次
- 同注册 IP 上限
- 同注册设备上限
- 参与会员层级（分层）
- 派奖钱包：彩金钱包 / 现金钱包
- 打码倍率（仅现金钱包）
- 申领终端
- 营销活动
- 排版 / 背景 / 图标 / 宣传图 / 宣传简介

建议改动只有默认值：

- `活动结束后` 默认从 `截断` 改为 **允许做完本次**。
- `怎么参加` 默认且建议固定 **点击参加**；“打开即参加”放进高级设置并显示预算警告。

### 1.2 好运探索季专属下半区

重排为 7 步：

1. **体验目标**：第一转、标准 T、收尾细腻度。
2. **奖励阶段**：快砍 / 中段 / 细砍转数占比。
3. **抽奖次数**：每日免费 / 任务 / 好友，及完成路径验证。
4. **转盘开奖**：谢谢参与、越级、主奖励、金额。
5. **分层完成**：不同层级有效 T + 预计完成率。
6. **预算与反作弊**：硬预留、名额、风控规则。
7. **仿真与发布**：红灯 / 黄灯、预算、曲线、前台预览。

右侧 400px Sticky Preview 保留，但内容升级为：

1. 正在调什么 → 哪些计算会变化。
2. 玩家曲线 → 0% / 第一转 / 关键转数 / 100%。
3. 次数供给 → 不拉人最多几次 / 全路径最多几次。
4. 分层完成率 → 每层当前估算与目标。
5. 预算 → 期望成本 / 硬责任 / 可开放名额。
6. 能否开启 → 红 / 黄 / 绿灯。

---

## 2. Step 1 — 体验目标

| key | 中文标签 | 类型 | 建议默认 | i 提示：改什么 | 玩家怎样 | 不要踩什么 |
|---|---|---|---:|---|---|---|
| `experience.firstSpinPct` | 第一转进度 | number 50–95 | 90 | 第一转后的真实进度 | 第一次立刻感觉快接近终点 | 不允许 100；所有层级第一转一致 |
| `experience.standardTargetSpins` | 标准转满次数 T | integer 4–30 | 12 | 标准玩家最多需要几次成功转动 | 有足够次数时第 T 转一定 100% | 前台不显示 T |
| `experience.curveGamma` | 收尾细腻度 | number 1.0–3.0 | 1.8 | 第二转以后“前快后细”的程度 | 数值越高，越早接近 99% | 不要把它当完成率；只改变曲线形状 |
| `experience.minVisibleGainPct` | 最小可见进度增量 | readonly validation | 0.05 | 检查是否出现过度细碎进度 | 避免连续出现 0.01% 式不适感 | 若低于建议值只警告，不改变数学结果 |

### 2.1 只读计算

- 标准曲线 `P(k)`。
- 第 1 / 25% / 50% / 75% / T 转的进度。
- 倒数第二转剩余%。
- 最小非最终单次增量。
- “第一转过高 + T 过长”体验风险提示。

### 2.2 推荐公式

```text
P(0) = 0
P(1) = F
P(T) = 100

for 1 < k < T:
  q = (k - 1) / (T - 1)
  P(k) = F + (100 - F) * (1 - (1-q)^gamma)
```

`gain(k) = P(k) - P(k-1)`。

这使进度可完全预测，不需要“进度 RNG”。

---

## 3. Step 2 — 奖励阶段

阶段比例只控制 **有多少转落在哪个奖励主题**，不再控制进度份额。

| key | 中文标签 | 类型 | 默认 | i 提示 |
|---|---|---|---:|---|
| `phase.fastShare` | 快砍转数占比 | number % | 40 | 主要开现金。系统转换成整数转数；含第一转。 |
| `phase.midShare` | 中段转数占比 | number % | 35 | 主要开积分。 |
| `phase.fineShare` | 细砍转数占比 | number % | 25 | 主要开点数。 |

### 3.1 输入体验

不要让三格在编辑过程中短暂变成 121% 或 87%。推荐：

- UI 使用一个三段可拖曳 Segmented Bar。
- 任意拖动一个边界，另两段自动保持合计 100%。
- 数字输入时即时归一化，不等 blur/change。
- 保存值为整数 basis points（例如 4000 / 3500 / 2500），避免浮点误差。

### 3.2 整数转数分配

禁止多套 `round()`。唯一函数：

1. 第一转固定 `fast`。
2. 剩余 `T-1` 转，若 T≥4，先给 fast / mid / fine 各 1 转。
3. 剩余转数按三段比例使用 **Hamilton / Largest Remainder** 分配。
4. 三段整数转数严格合计 `T-1`。
5. 前台、进度预览、开奖、预算预估都调用同一 `phaseOf()`。

---

## 4. Step 3 — 抽奖次数

### 4.1 重新命名字段，消除“每日次数”歧义

原设计将三种来源都塞进“每日次数 / 目标次数”，对任务与好友语义不自然。V3 改为每个来源自己的事件单位。

#### 每日免费

| key | 标签 | 类型 | 默认 | 说明 |
|---|---|---|---:|---|
| `tickets.free.enabled` | 开启 | switch | on | 关闭后整卡灰化 |
| `tickets.free.ticketsPerDay` | 每日发次数 | integer | 1 | 每个租户日最多发多少次 |
| `tickets.free.activeDays` | 可领取天数 | readonly / derived | 7 | 默认等于可玩天数 |
| `tickets.free.capPerPlay` | 每局上限 | integer | 7 | 防止边界重复发放 |
| `tickets.free.grantMode` | 发放方式 | enum | auto_on_visit | auto_on_visit / manual_claim |

**事件作用域**：唯一键建议为 `memberId + activityId + tenantDate`，不是 `playId`。重复参加不能同一天再次领。

#### 做任务

| key | 标签 | 类型 | 默认 | 说明 |
|---|---|---|---:|---|
| `tickets.task.enabled` | 开启 | switch | on | 关闭后任务只可展示说明，不发次数 |
| `tickets.task.ticketsPerTask` | 每完成一项发次数 | integer | 1 | 所有任务共享，避免每任务再填一套 |
| `tickets.task.capPerPlay` | 每局上限 | integer | 5 | 由启用任务数量自动建议 |

五类任务仍可用，但每一类必须是 **有限的一次性里程碑**：

1. 游玩指定类型：单选电子 / 真人 / 体育 / 棋牌 / 捕鱼，可再配置有效局数或有效投注门槛。
2. 充值次数：达到 N 次。
3. 充值金额：累计达到 X。
4. 下注次数：结算有效注达到 N。
5. 下注金额：结算有效投注累计达到 X。

**重要**：重复参加的新 Play 只统计 `joinedAt` 之后新增的行为。不能因为上一局已经累计充值 2000，下一局一加入就自动完成“充值金额 2000”。

#### 好友助力

| key | 标签 | 类型 | 默认 | 说明 |
|---|---|---|---:|---|
| `tickets.assist.enabled` | 开启 | switch | on | 关闭不发助力次数 |
| `tickets.assist.ticketsPerFriend` | 每名合格好友发次数 | integer | 1 | 一名合格直接新注册下线贡献多少次 |
| `tickets.assist.qualifiedFriendCap` | 合格好友上限 | integer | 5 | 每个 activity 的计数上限 |
| `tickets.assist.capPerPlay` | 本局发次数上限 | integer | 5 | 可与好友上限推导 |
| `tickets.assist.depositRequired` | 需要充值 | switch | off | 开启时前台必须明确写出 |
| `tickets.assist.allowPromotionDoubleReward` | 与推广同时发奖 | switch | on | 文案只显示“允许” |

硬规则：

- 活动开始后新注册。
- 正式推荐关系。
- 直接下线。
- 同一新下线对同一 activity 只能贡献一次，**不能因重复 Play 再次贡献**。
- 开启充值门槛时，以成功结算 / 不可逆状态为准，不用 pending 充值事件。

### 4.2 完成路径检查

右侧必须同时显示两个值：

```text
maxTicketsAll       = 所有开启来源的理论最大可得次数
maxTicketsNonSocial = 免费 + 任务的理论最大可得次数
```

发布检查：

- `maxTicketsAll < max(effectiveT of eligible cohorts)` → **红灯，禁止发布**。
- `maxTicketsNonSocial < standardT` → **黄灯**，文案：“标准玩家若不邀请好友，无法只靠免费+任务走完。”
- 若管理员选择“非社交保证模式” → 上述黄灯升级成红灯。

### 4.3 运营完成率模型

完成率不是开奖概率，而是：

```text
CompletionRate(cohort) = P(totalEarnedTickets >= effectiveT(cohort))
```

原型可使用：

- 每日回访：Binomial(days, visitProbability)
- 每个任务：Bernoulli(taskCompletionProbability)
- 好友人数：Truncated Poisson(lambda, friendCap)

生产建议接入真实历史分层数据，替代手填假设。

---

## 5. Step 4 — 转盘开奖

### 5.1 概率模型改为绝对概率

每阶段只填：

- `thanksPct`
- `upgradePct`

系统只读：

```text
nativePct = 100 - thanksPct - upgradePct
```

这样管理员看到的就是最终有效概率，不需要理解条件概率。

### 5.2 字段

| key | 标签 | 类型 | 默认快/中/细 | 说明 |
|---|---|---|---|---|
| `prize.phase.*.thanksPct` | 谢谢参与% | 0–95 | 20 / 25 / 30 | 只给进度，不给本转奖励 |
| `prize.phase.*.upgradePct` | 越级% | 0–95 | 8 / 10 / 8 | 绝对有效概率 |
| `prize.phase.*.amountSmall` | 小档 | money/int | 0.18 / 18 / 50 | 单位依阶段 |
| `prize.phase.*.amountMid` | 中档 | money/int | 0.5 / 50 / 100 | 单位依阶段 |
| `prize.phase.*.amountBig` | 大档 | money/int | 1 / 100 / 200 | 单位依阶段 |
| `prize.sizeWeights` | 小 / 中 / 大权重 | simplex | 60/30/10 | 建议整活动共享一组；高级设置可开放 |
| `prize.finishPrizeCash` | 转满大奖 | money | 5 | 首次达到 100% 发一次 |

### 5.3 越级定义写死

- 快砍：越级 = 快砍大档现金。
- 中段：越级 = 按小 / 中 / 大权重抽快砍现金金额表。
- 细砍：越级 = 按小 / 中 / 大权重抽中段积分金额表。
- 细砍不连跳到现金。

### 5.4 后台只读预览

显示：

- 每阶段最终有效 `谢谢 / 主奖励 / 越级`。
- 各类型按有效 T 加权后的预计次数。
- 每转期望现金当量。
- 每局期望现金当量。
- 每局最大现金当量。

不要显示或允许编辑“扇区概率合计 100”的第二套表。

---

## 6. Step 5 — 分层完成

### 6.1 从“进度倍率”改为“有效 T”

建议表结构：

| key | 中文标签 | 类型 | 默认 |
|---|---|---|---|
| `cohort.enabled` | 启用 | switch | on |
| `cohort.vipMin` | 会员等级 ≥ | integer | 1 / 4 / 7 |
| `cohort.depositMin` | 活动期累计充值 ≥ | money | 0 / 200 / 2000 |
| `cohort.targetSpins` | 转满次数 | integer | 12 / 10 / 8 |
| `cohort.upgradeAddPct` | 越级加成 | number | 0 / 2 / 5 |
| `cohort.targetCompletionRate` | 目标完成率 | % | 70 / 85 / 95 |

匹配规则：

1. 只从启用行中找 `VIP >= vipMin AND depositInCampaign >= depositMin`。
2. 多行命中时，取 `targetSpins` 最小的行；若相同，再取越级加成较高。
3. 第一转进度仍统一使用 `firstSpinPct`。
4. 玩家未命中任何行时使用标准 T。

### 6.2 为什么不用进度倍率

`1.5×` 对管理员不直观：到底会提前几转完成，要模拟才知道；且可能跨阶段提前完成，造成奖型暴露变化。直接设置“10 转完成 / 8 转完成”可立即回答：

- 需要多少次数。
- 预估完成率。
- 最多开奖几转。
- 最大预算责任。

### 6.3 防止与分层资格打架

“参与会员层级”仍控制谁看得到活动；本表只控制已参加人的速度。

后台必须：

- 自动读取上半“参与会员层级”。
- 若完成难度行覆盖了一个根本不在参与层级的人群 → 黄灯并提示“该行永远不会生效”。
- 提供“一键按参与层级生成难度行”。

---

## 7. Step 6 — 预算与反作弊

### 7.1 预算字段

| key | 标签 | 类型 | 默认 | 说明 |
|---|---|---|---|---|
| `budget.total` | 本活动预算 | money | required | 总现金当量责任上限 |
| `budget.maxParticipants` | 最多可参加人数 | integer | optional | 独立业务名额上限 |
| `budget.reserveMode` | 责任模式 | enum | hard | V3 推荐只开放 hard |
| `joinMode` | 怎么参加 | enum | click | auto 放高级设置 |

### 7.2 三个预算数字必须同时显示

1. **已实际派奖** `actualSpent`
2. **已参加未完成的硬预留** `outstandingReserve`
3. **可开放余额** `available = total - actualSpent - outstandingReserve`

另外显示：

- 标准玩家每局期望成本。
- 标准 / 各层级每局最大责任。
- 当前预算还能承接多少名该层级新玩家。

### 7.3 加入时预留

```text
requiredReserve(play) = finishPrize + Σ maxCashEquivalent(phase(k))
for k = 1..effectiveT(play)
```

如果不足：

- 不创建 Play。
- 玩家显示“本期名额已满 / 活动名额已用完”。
- 不要显示内部“预算不足”。

### 7.4 已参加玩家绝不预算降级

禁止：

- 动态把现金换成点数。
- 提高谢谢参与率。
- 延长 T。
- 降低 finishPrize。
- 改历史 Play 快照。

### 7.5 反作弊推荐规则

这些均为 Recommendation，不声称现网已经存在：

- 服务器权威事件，不接受客户端直接传“任务已完成”。
- 每次次数发放有唯一 `sourceEventId`。
- 免费：按 member + activity + tenantDate 唯一。
- 任务：按 play + taskId 唯一，且只计 joinedAt 后行为。
- 充值：只计成功 / settled 状态。
- 注单：只计 settled 且非 void 的有效注。
- 助力：下线 + activity 唯一；正式推荐关系；注册时间在有效窗口。
- 设备 / IP 上限沿用活动中心已有字段。
- 额外风险信号（如大量同设备、多帐号极速互助）只能阻止新的次数发放或进入人工审查，不得暗改已经保存的 spin 结果。

---

## 8. Step 7 — 仿真与发布检查

### 8.1 红灯（禁止发布）

- 没有任何次数来源。
- `maxTicketsAll < 任一可参加层级 effectiveT`。
- 第一转 ≥100 或 <允许下限。
- effectiveT <4。
- 三阶段无法分配至少一转。
- 任一阶段 `thanks + upgrade > 100`。
- 金额负数 / 非法。
- 预算总额 < 当前已实际派奖 + 已预留责任。
- `joinMode=auto` 且没有最大参加人数与足够预算上限（避免打开页面即大量占预算）。
- afterEnd=finish 但预算没有覆盖活动结束后的尾部责任。

### 8.2 黄灯（允许发布但需确认）

- 不拉人无法达到标准 T。
- 目标完成率与当前模拟完成率差异 >10pp。
- 倒数第二转仍低于 99% 或最小增量过小，体验可能太拖。
- 助力为最大次数来源。
- 需要充值作为助力门槛。
- 高层级有效 T 太低，导致几乎没有中段 / 细砍体验。
- 小 / 中 / 大金额权重高度偏大档。
- 期望成本与硬预留差距过大，预算利用效率低。

### 8.3 绿色摘要

发布前用一句人话回答：

> “标准玩家 7 天内最多可从非社交路径拿 12 次，需要 12 次完成；预计完成率 69%。VIP4 需要 10 次，VIP7 需要 8 次。标准玩家每局期望成本约 7.86，硬责任 17。当前预算可安全新增 N 人。”

---

## 9. 后台交互细节

### 9.1 i 提示统一模板

每个可调项都按三段写：

```text
改什么：这个字段直接控制什么。
玩家怎样：玩家体验会怎么变化。
不要踩：最常见误用是什么。
```

### 9.2 模板不是第三套规则

可提供：

- 平衡型：T12 / 90% / 40-35-25 / 非社交保证。
- 高转化型：T10 / 92% / 更高免费任务供给。
- 社交裂变型：T12 / 助力占比较高，但必须显示黄灯和前台门槛。

点击模板只是一次性写入字段；之后所有真实结果仍由同一组字段计算。

### 9.3 预览模式

后台提供三种预览：

- **标准玩家**
- **指定层级**
- **自定义模拟玩家**：选择 VIP、充值、预计拿到的免费 / 任务 / 好友次数

输出：

- 曲线
- 完成所需次数
- 当前路径是否够
- 预计完成日
- 奖励阶段暴露次数
- 期望派奖 / 最大责任

---

## 10. 相对附件 04 的调整表

| 附件 04 | V3 | 原因 |
|---|---|---|
| 先设抽奖次数，再设进度 | 先体验目标，再次数供给 | 先定义目标，再检查资源是否够 |
| 快 / 中 / 细 % 同时暗含进度与阶段长度 | 只表示奖励阶段转数长度 | 消除一钮两义 |
| 进度倍率 | 有效 T | 运营更直观、预算更可算 |
| 谢谢参与后再条件抽越级 | 谢谢 / 越级 / 主奖励均为绝对概率 | 不再误解条件概率 |
| 60/30/10 完全写死 | 默认全局 60/30/10；高级可开放 | 给运营弹性但不爆炸参数数量 |
| 最坏预算用所有来源 cap | 只算最多会开奖的 effectiveT | 旧算法严重高估 |
| “可完成活动”分散在来源勾选 | 改为明确“可行性 + 非社交保证”检查 | 一眼回答能否完成 |
| 容易完成与分层分开 | 自动对齐上半参与层级 | 避免永不生效行 |
| 只有进度条预览 | 加玩家完整手机预览 / 转盘动画 | 让运营知道前台实际感受 |
| 结束后 cut 默认 | 建议 finish 默认 | 更符合“真的能完成”的产品目标 |


---

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


---

# PLAYER-UX-SPEC — 好运探索季 V3 玩家前台

> 状态：Recommendation / Prototype-only。
>
> 目标：让玩家持续感觉接近终点，但所有进度、次数来源和领取条件都是真实的；转盘只负责有趣，不承担误导概率的职责。

---

## 1. 推荐页面结构

### 1.1 首屏

从上到下：

1. 活动名称 + 个人剩余有效日期。
2. 大型进度环 / 进度条。
3. 终点奖励：`进度达到 100% 可领取 X`。
4. 当前抽奖次数。
5. “转一次”主按钮。
6. 转盘 / 能量罗盘动画。

参加前：

- 明确显示 `当前进度 0%`。
- CTA：`参加活动`。
- 不要预先显示 90% 假进度。

第一转后：

- 真实动画从 0% 跳到 firstSpinPct。
- 文案可说“进度大幅提升”，但不要说“再转一次就一定完成”。

### 1.2 次数任务区

三个入口：

- 每日免费：今天是否已领取 / 领取按钮。
- 做任务：N/M 项完成，每项奖励 X 次。
- 好友助力：已有 Y 位合格，规则入口。

不要显示后台 T，也不要计算“还差 3 次”。

允许显示：

- “再获得抽奖次数即可继续推进”。
- “完成进度到 100% 即可领取终点奖励”。
- 每个动作明确会给多少“抽奖次数”。

### 1.3 奖励余额

建议在活动页展示三个区域：

- 现金：已进入派奖钱包的累计展示（可只读）。
- 积分：活动内积分。
- 点数：活动内点数。

必须避免把积分 / 点数画得像系统现金钱包。

若未来积分 / 点数可兑换，需要另加明确兑换规则；在未确定前只写“活动积分 / 活动点数”。

---

## 2. 转盘视觉

### 2.1 推荐：能量罗盘，而非概率饼图

因为真实概率随阶段与人群越级加成变化，不建议用扇区面积暗示中奖概率。

视觉可以是 8 个等宽装饰扇区：

- 现金图标
- 积分图标
- 点数图标
- 谢谢参与图标

但必须在规则说明中写：

> “转盘用于展示开奖结果；实际结果由服务器按本活动规则产生。”

### 2.2 动画协议

前端流程：

```text
1. POST /spin(requestId)
2. 等服务器返回 SpinRecord
3. 锁主按钮
4. 根据返回 displayResult 播动画
5. 动画结束同步展示：进度变化 + 本转奖励
6. 如果 completed=true，播放终点奖励动画
```

不得：

- 动画先转完再请求服务器。
- 浏览器自己随机一个结果。
- 因为动画停错格而覆盖服务器结果。

---

## 3. 进度文案

推荐文案：

- 0%：`开始探索，第一次转动会大幅推进进度。`
- 90%：`已完成 90%，继续获取抽奖次数推进探索。`
- 99% 附近：`已经非常接近终点，继续完成活动任务获取抽奖次数。`
- 100%：`探索完成！终点奖励已发放。`

禁止：

- `只差一次`（除非后端确实公开并保证）。
- `下一次必得`（除非是实际确定性规则且产品决定公开）。
- `马上提现`（若本活动不是直接提现流程）。
- 虚假他人中奖飘屏。

---

## 4. 阶段切换视觉

可以让玩家感受到旅程变化，但不需要展示“你现在进入细砍阶段”。

推荐：

- 快砍：金色 / 现金主题，动画反馈爽快。
- 中段：蓝紫 / 积分主题。
- 细砍：青色 / 点数主题，更精细的进度动画。

切换阶段时，奖励货币的变化来自已公开活动规则，不应在中途临时更改。

---

## 5. 好友助力 UX

入口必须写：

- `只算活动开始后的直接新注册下线。`
- 若开启充值门槛：`好友完成有效充值后才计入助力。`
- 每名合格好友可得多少次。
- 最多可获得多少次。

好友助力不直接改变进度；助力成功时只播：

> `获得 +1 次抽奖次数`

不要让进度条因为好友注册直接跳动。

---

## 6. 预算 / 名额耗尽的玩家体验

### 6.1 尚未参加

当预算无法为新 Play 做硬预留：

- 参加按钮关闭。
- 文案：`本期活动名额已满`。
- 可保留活动说明，但不能让玩家继续做任务再告诉他不能参加。

### 6.2 已参加

体验完全不变：

- 仍可依快照规则拿次数。
- 仍可正常转。
- 仍按原概率派奖。
- 仍能到 100%。

绝对不要显示“预算已用完，所以奖励调整”。

---

## 7. 结束与过期

### afterEnd=finish（建议默认）

活动总入口结束后：

- 新玩家不能参加。
- 已参加玩家页面仍可打开。
- 清楚显示个人最后完成日期。
- 原有次数来源继续到个人结束日。
- 完成后正常领奖。

### afterEnd=cut

结束前至少在活动页持续显示明确截止日期。

结束时：

- 未用次数失效。
- 已领取奖励保留。
- 未到 100% 不发终点奖励。

该模式应在后台有较强警告，因为与“玩家真的可以完成”的产品目标冲突较大。

---

## 8. 完成后的处理

进度到 100% 后：

- 立即停止转盘按钮。
- 一次性展示：本局现金 / 积分 / 点数总结 + 终点奖励。
- 多余抽奖次数标注 `本局已结束`，不允许继续开奖。
- 若允许重复参加且活动仍可参加，显示独立 CTA：`开启下一轮`，明确下一轮从 0% 开始。

不要自动无感进入下一轮。

---

## 9. 前台与后台字段映射

| 后台 | 玩家前台表现 |
|---|---|
| firstSpinPct | 第一转后的真实进度 |
| targetSpins | 不直接展示，只影响实际曲线 |
| curveGamma | 不直接展示，影响进度每转变化 |
| phaseShares | 影响各奖励主题持续转数 |
| tickets.free | 每日免费入口与次数 |
| tickets.task | 任务列表与每项奖励次数 |
| tickets.assist | 好友入口、每人次数、上限、充值条件 |
| cohort.targetSpins | 不显示“你属于更容易层”，只决定该 Play 曲线；规则页可笼统说明会员等级 / 活动充值可加速 |
| thanksPct / upgradePct | 若产品要公开概率，应展示最终有效绝对概率，而非转盘扇区面积 |
| finishPrizeCash | 首屏终点奖励 |
| afterEnd | 截止文案与是否可继续完成 |

---

## 10. 无障碍与失败状态

必须设计：

- 动画减少模式：用户系统设置 prefers-reduced-motion 时缩短或跳过转盘。
- 网络超时：显示“正在确认开奖结果”，按 requestId 重查，不再发新 spin。
- 奖励入账延迟：显示“结果已保存，奖励入账处理中”。
- 重复点击：按钮 pending 锁定；服务端仍必须幂等。
- 次数为 0：按钮 disabled，焦点引导到次数来源，不弹“充值才能继续”除非活动真的有明确充值任务。
- 活动已结束 / 个人已过期 / 名额已满：三个状态文案不能混用。


---

# DECISION-LOG — 好运探索季 V3

> 记录 V3 相对 G3 / v2 的关键决策、原因与放弃方案。

| ID | 决策 | 采用 | 放弃 | 原因 |
|---|---|---|---|---|
| D01 | 进度算法 | 确定性目标曲线 | 随机进度刀 | 管理员必须精确控制 T、玩家必须真实可完成 |
| D02 | 第一转 | 所有人相同 firstSpinPct | VIP 第一转更高 | 避免第一转直接 100%，也保持体验一致 |
| D03 | 分层加速 | 不同 effective T | progress multiplier | “需要几次”比“1.2×刀”直观、可预算 |
| D04 | 阶段比例 | 只控制开奖阶段转数 | 同时控制进度份额 | 解决一钮两义 |
| D05 | 阶段转数取整 | Hamilton / largest remainder | 多处 round | 确保所有模块完全一致 |
| D06 | 完成率 | 次数供给行为模型 | 暗抽某玩家能否完成 | 保持可解释和可审计 |
| D07 | 完成可行性 | `maxTickets >= effectiveT` 硬检查 | 靠运营自己算 | 防止配置出理论上不可能完成的活动 |
| D08 | 默认完成路线 | 7 免费 + 5 任务 = 12 | 强迫好友助力 | “不拉人也能完成”更符合目标；社交可作为加速 |
| D09 | 奖励概率 | 谢谢 / 越级 / native 都是绝对概率 | 先谢谢、再对剩余抽越级 | 管理员无需换算条件概率 |
| D10 | 小中大权重 | 默认全局 60/30/10，可高级开放 | 每阶段独立九个权重 | 参数更少，仍保留运营弹性 |
| D11 | 扇区概率 | 不可编辑；视觉转盘不代表概率 | 手填扇区合计100 | 避免与阶段概率第二套真相冲突 |
| D12 | 预算 | Play 加入时硬责任预留 | 按所有来源 cap 做最坏预算 | 完成后不能继续转，真实最大 spins 是 effectiveT |
| D13 | 预算耗尽 | 停新加入 | 旧玩家降奖 / 改概率 | 已加入体验不可被预算回写 |
| D14 | VIP / 充值匹配 | 加入时快照 cohort | 每 spin 重新匹配 | 同一 Play 的完成次数必须稳定 |
| D15 | afterEnd 默认 | finish | cut | 更符合可完成体验；预算预留可保障尾部责任 |
| D16 | afterEnd=finish | 已参加者次数来源延长到 personalEndsAt | 只允许用已有次数 | 否则“允许做完”可能事实上做不完 |
| D17 | 完成后多余次数 | 本 Play 失效，拒绝再转 | 继续只开奖 | 防止完成后预算与奖期无限延长 |
| D18 | 每日免费作用域 | member+activity+tenantDate | play+date | 防止重复参加同日重领 |
| D19 | 任务作用域 | 新 Play joinedAt 后的新行为 | 直接读活动累计 | 防止新局一建立就被历史行为秒完成 |
| D20 | 好友作用域 | child+activity 唯一 | child+play 唯一 | 防止重复 Play 反复利用同一下线 |
| D21 | 钱包失败 | SpinRecord 固定 + RewardGrant 幂等重试 | 钱包失败就重抽 | 保证结果一致 |
| D22 | 玩家转盘 | 结果动画 | 概率饼图 | 真实概率变化时，等面积扇区不应暗示概率 |
| D23 | 进度显示 | 显示当前百分比，不显示剩余次数 | “还差 N 次” | 保留当前产品意图 |
| D24 | 风控 | 阻止新的 ticket grant / 人审 | 暗改已保存奖 | 保持结果完整性与可审计 |

---

## 特别说明：为什么不保留“进度 RNG”

附件文字里曾把“进度与开奖两个独立 RNG”列为硬限制，但 v2 实际进度代码已经是 deterministic `gains[]`。V3 选择把这一点正式统一为 **进度确定、奖励随机**。若重新加入进度 RNG，将直接削弱：

- 目标 T 的准确性。
- 分层完成率可解释性。
- 预算责任计算。
- 自动发布校验。

因此不建议保留。

---

## 不采用的替代方案

### A. 后台直接输入“完成概率 65%”

不采用。这样最容易演变成服务器在用户层随机决定“能不能完成”，难以解释且与真实进度体验冲突。

### B. 预算快用完时动态提高谢谢参与

不采用。会让同一快照玩家的实际概率随预算变化，破坏公平与审计。

### C. 转盘扇区按照概率动态改变面积

暂不采用。阶段、层级越级加成、金额档位都会使扇区变得复杂；运营与玩家反而更难理解。更推荐视觉罗盘 + 规则页明确概率。

### D. 好友助力直接砍进度

不采用。次数与进度必须分开，否则社交事件会绕过目标曲线，完成率与预算模型失真。


---

# OPEN-QUESTIONS — 好运探索季 V3

> 只保留无法从现有附件确定、上线前必须产品 / 技术 / 财务拍板的问题。每题给建议默认。

## OQ01 积分 / 点数最终如何处理？

**问题**：附件定义积分、点数为活动内货币，并给现金当量，但没有写提现、兑换、过期与跨活动规则。

**建议默认**：

- V3 Prototype：只作为活动内余额展示，不称系统钱包。
- 上线前必须决定：`不可兑换，只做活动内价值` 或 `Play 关闭时按固定汇率结算到派奖钱包`。
- 若可兑换，必须复用平台钱包精度与舍入规则，不能自行发明小数精度。

## OQ02 是否允许运营公开中奖概率？

**建议默认**：规则页显示每阶段最终绝对概率及“当前阶段”，但不在转盘扇区面积暗示概率。

## OQ03 小 / 中 / 大 60/30/10 是否开放？

**建议默认**：开放为“高级设置”，整活动共用一组，并提供恢复默认按钮；不要每阶段各自开放三组。

## OQ04 VIP / 充值是否允许在 Play 中途加速？

**建议默认**：不允许；加入时快照 cohort。中途达成新层级只影响下一局。

理由：可预测、预算稳定、玩家规则容易解释。

## OQ05 afterEnd 的正式默认值？

**建议默认**：`允许做完本次`。

若运营选择 `截断`，后台加二次确认，并要求确认玩家端已经展示明确截止日期。

## OQ06 自动参加是否保留？

**建议默认**：保留在高级设置但不推荐。必须同时配置最大参加人数，并在预算预览显示“打开页面即占用硬责任”。

## OQ07 风控确认作弊后，已经合法入账的奖励能否追回？

附件只写不得撤回已合法推广奖，没有完整活动冻结 / 回收政策。

**建议默认**：

- 系统风险判定只阻止新次数与新 Play。
- 已保存 SpinRecord 不重抽。
- 任何资产冻结 / 追回必须由平台既有风控与法务流程决定，不在此活动私自实现。

## OQ08 充值与注单的“有效”状态对应现网哪个事件？

**建议默认**：只接受平台统一的 settled / final 状态；具体 event name 由实际系统对接时映射。

## OQ09 玩家多余次数完成后是否完全作废，还是可带到重复下一局？

**建议默认**：作废，不跨 Play。理由：跨局会让下一局不是从公平的统一起点开始，并增加预算责任复杂度。

## OQ10 预计完成率的数据源

**建议默认**：

- Prototype：手填假设。
- Production：若数据平台可用，优先使用近 30 天同分层行为数据；样本不足回退 60 / 90 天，并显示样本量。


---

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
