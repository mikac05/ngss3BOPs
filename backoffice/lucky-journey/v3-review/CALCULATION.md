# 好运探索季 (Lucky Journey)：计算模型与后端实现规范

**适用版本**：`v3-review` (2026-09 最新规范)  
**读者对象**：后端开发工程师、系统架构师、风控与数据审核团队

---

## 1. 核心机制与状态机定义

### 1.1 业务本质
本活动采用 **「固定次数转满保底、过程中道具不产生现金」** 的心流设计。
- 达成条件：会员在有效期内获取并消耗设定总次数 $T$（设定范围 $4 \sim 30$ 次，默认 $12$ 次），进度必定达到 100% 并解锁固定现金奖金。
- 核心体验：首转爆击（88%~94%）锚定极高沉没成本；中后段采用自适应指数衰减，金币/宝石/星钻带来不同精细度收集反馈；末转 100% 补满。
- 不存在“随机决定能否转满”或“动态增加解锁门槛”的暗箱逻辑。

### 1.2 局生命周期状态机 (Play Lifecycle)
```
[未参加 (unjoined)]
       │
       ▼ 会员主动参加 (POST /join)
  [进行中 (active)] ◄─────────────┐
       │                          │ 消耗次数转动 (POST /spin)
       ├──────────────────────────┘
       │
       ├─── 达成第 T 次且进度=100% ───► [已完成 (completed)]
       │                                     │
       │                                     ├─ claimMode: auto ──► 自动发起派奖
       │                                     └─ claimMode: manual ─► 待手动点击领取 (POST /claim)
       │
       ├─── 个人有效天数到期 ─────────► [已到期 (expired)] ──► 释放预算预留
       │
       └─── 租户全局截断 ─────────────► [活动结束 (campaign_cut)] ──► 释放预算预留
```

---

## 2. 两层开奖与最佳默认参数矩阵

### 2.1 两层开奖逻辑
每一转的开奖计算分为两层：
1. **第一层（中奖判定）**：判断本次是否命中「谢谢参与」。若命中，本转扣除次数，进度增量 $\Delta = 0$。
2. **第二层（道具分配）**：若命中中奖，依据当前所处阶段的**条件概率**分配道具类型（金币、宝石、星钻），并将该转的进度增量 $\Delta$ 换算为对应道具数量展示。

### 2.2 最佳默认参数矩阵 (Golden Standard)
经过心流衰减与玩家留存模型校准的最佳默认值如下：

| 阶段 (Phase) | 次数占比 (`phaseShares`) | 谢谢参与率 (`thanksPct`) | 道具条件概率：金币 (`coin`) | 道具条件概率：宝石 (`gem`) | 道具条件概率：星钻 (`star`) | 核心心流定位 |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **快砍 (fast)** | **40%** | **15%** (中奖 85%) | **70%** | **25%** | **5%** | 吞噬 88% 剩余空间，大步飞跃，建立极强沉没成本 |
| **中段 (mid)** | **35%** | **25%** (中奖 75%) | **20%** | **60%** | **20%** | 步幅放缓至 99.8%，悬念拉锯，制造 Near-miss 预期 |
| **细砍 (fine)** | **25%** | **30%** (中奖 70%) | **5%** | **25%** | **70%** | 极限微步逼近（99.8%~99.9999%），星钻微量递增 |

### 2.3 特殊转数保底铁律（代码硬约束）
- **第 1 转（首转）**：
  - **不抽谢谢参与**（谢谢参与率强制 0%，中奖率 100%）。
  - 首转进度强制均匀随机落入 `[firstSpinMin, firstSpinMax]` 设定区间（默认 `88% ~ 94%`）。
- **第 $T$ 转（最后转）**：
  - **不抽谢谢参与**（谢谢参与率强制 0%，中奖率 100%）。
  - 增量 $\Delta = 1,000,000 - \text{currentProgress}$，**强制精准补满 100%**。

---

## 3. 百万微单位进度量化与衰减公式

### 3.1 标量进度体系
- 系统内部以整数 $U = 1,000,000$ 表示 100.0000% 完整进度（$1$ 单位 $= 0.0001\%$）。
- **绝对禁止使用浮点数累计进度**，全部运算基于 64 位整型（BIGINT）。

### 3.2 道具换算比例表
中奖道具数量由该转增量 $\Delta$（整型）除以对应单位换算：
$$\text{道具展示数量} = \frac{\Delta}{\text{单位换算基数}}$$

| 道具代码 | 道具名称 | 最小进度单位 | 单位换算基数 (`denominator`) | 小数位规范 |
| :--- | :---: | :---: | :---: | :---: |
| `coin` | 金币 | 1 / 100 (1%) | 10,000 | 最多 4 位小数 |
| `gem` | 宝石 | 1 / 10,000 (0.01%) | 100 | 最多 2 位小数 |
| `star` | 星钻 | 1 / 1,000,000 (0.0001%) | 1 | 纯整数 |

> **无感等价性**：相同 $\Delta$ 增量下，抽中哪种道具对总进度的推进**完全一致**。道具种类仅用于丰富转盘盘面视觉与心跳收集感。

### 3.3 次数分配算法 (Largest Remainder Method)
总次数 $T$ 扣除第 1 转后，剩余 $T - 1$ 次在三阶段中分配：
1. 快砍、中段、细砍各保底预留 $1$ 次（共 $3$ 次）。
2. 剩余 $T - 4$ 次按 `phaseShares` 百分比分配整数次：
   $$q_i = (T - 4) \times \frac{\text{share}_i}{100}$$
   $$\text{alloc}_i = 1 + \lfloor q_i \rfloor$$
3. 剩余未分配次数按小数部分 $(q_i - \lfloor q_i \rfloor)$ 从大到小优先补齐 $+1$。

### 3.4 进度目标线与非线性指数衰减
设首转随机抽取值为 $f \in [\text{firstSpinMin} \times 10^4, \text{firstSpinMax} \times 10^4]$，总剩余差距 $R = U - f$。
各阶段的累积目标线为：
- 快砍阶段终点目标：$L_{\text{fast}} = \text{round}(f + 0.88 \times R)$
- 中阶段终点目标：$L_{\text{mid}} = \text{round}(f + 0.998 \times R)$
- 细砍阶段终点目标：$L_{\text{fine}} = 1,000,000$

阶段内部第 $j$ 次（共 $n$ 次，步长比 $t = j/n$）的目标进度为凹向衰减曲线：
$$Q = \lfloor L_{\text{start}} + (L_{\text{end}} - L_{\text{start}}) \times (1 - (1 - t)^2) \rfloor$$

**严格单调递增保障**：
系统生成计划时执行保护校验：
$$Q_k = \max(Q_{k-1} + 1, \min(Q_k, U - (T - k)))$$
确保后续每一中奖转数均至少获得 $+1$ 单位正向进度，且在第 $T$ 之前绝不溢出到 $1,000,000$。

---

## 4. 预算、负债与派奖机制

### 4.1 财务负债模型
- 单局唯一最大责任：固定现金奖金 $A$（`prize.finishPrize`，默认 5.00）。
- **参加开局时**：系统预留一笔硬负债 $A$（`outstandingReserve += A`），**不计入已支出**。
- **转动过程中**：产生任何金币、宝石、星钻或谢谢参与，均**不发生钱包余额变动**。
- **达成解锁时**：进入待派发/已派发流程，预留转换为实际支出（`actualSpent += A`, `outstandingReserve -= A`）。
- **到期/截断释放**：未完成到期或活动结束截断，释放该预留（`outstandingReserve -= A`）。
- **可用预算计算**：
  $$\text{availableBudget} = \text{budget.total} - \text{budget.actualSpent} - \text{budget.outstandingReserve}$$
  $$\text{availableSlots} = \lfloor \frac{\text{availableBudget}}{A} \rfloor$$
  可用名额不足 $1$ 时，拒绝新会员开新局，但不影响已参加局的继续游戏。

### 4.2 派奖钱包与打码约束
- **派奖钱包**：锁定为现金钱包（`basic.wallet = 'cash'`），达标后奖金直接入账至现金钱包。
- **打码倍数 (`wageringMultiple`)**：入账时附加流水约束（例如设置 1 倍，则入账 5 元现金需完成 5 元有效投注后方可提款）。

### 4.3 领取方式 (`claimMode`)
- `claimMode = 'auto'`：第 $T$ 次转动补满瞬间，后端在同一开奖事务中自动向钱包服务派发奖单。
- `claimMode = 'manual'`：转满后局状态置为 `claimPending = true`，前端呈现「🎉 领取奖金」按钮。会员点击后调用 `POST /claim` 接口，幂等派发并入账。

---

## 5. 渠道裂变、好友助力与任务来源

### 5.1 专属好友邀请渠道标识
玩家在活动界面复制的专属邀请链接格式必须带活动与来源标记：
```
https://ngss.game/register?act=lucky-journey&ref={member_id}&src=lj_wheel
```
- 注册与充值事件消费时，仅当来源标识匹配 `src=lj_wheel` 时，方才触发本活动的助力加次。
- 与全站常规推广、常态代理佣金系统**相互独立、并行结算**。

### 5.2 次数来源约束表
| 来源标识 | 来源名称 | 派发规则 | 上限控制 |
| :--- | :---: | :--- | :--- |
| `free` | 每日免费 | 会员每日首次进入活动页自动到账，同日开新局不重复派发 | 受 `sources.free.cap`（局上限）控制 |
| `assist` | 好友助力 | 通过专属链接注册好友完成有效行为后即时派发；可配置最低充值门槛 (`minDeposit`) | 受 `sources.assist.cap`（局上限）控制，单好友终身助力 1 次 |
| `task` | 运营任务 | 精简为两大核心门槛：**充值金额** (`deposit_amount`) 与 **有效投注金额** (`bet_amount`) | 每任务每局限完成 1 次，受 `sources.task.cap` 控制 |

---

## 6. 后端数据库事务与并发幂等规范

### 6.1 开奖接口幂等键 (Idempotency Key)
客户端每次发起转动必须携带客户端生成的全局唯一 `requestId`：
$$\text{IdempotencyKey} = \text{tenant\_id} + \text{activity\_id} + \text{member\_id} + \text{play\_id} + \text{requestId}$$
- 数据库表必须在该键上建立 `UNIQUE` 索引。
- 遇网络超时重发，直接原样返回已存开奖结果（`spinId`, `progress`, `prize`），严禁二次扣次。

### 6.2 转动数据库原子事务规范 (POST /spin)
```sql
BEGIN TRANSACTION;
  -- 1. 悲观锁锁定本局，防止多端并发连点
  SELECT * FROM lj_play WHERE id = :play_id AND member_id = :member_id FOR UPDATE;

  -- 2. 状态与有效期检查
  IF status != 'active' OR current_timestamp > ends_at THEN
     ROLLBACK; RETURN ERROR('PLAY_NOT_ACTIVE');
  END IF;

  -- 3. 可用次数检查
  IF tickets <= 0 THEN
     ROLLBACK; RETURN ERROR('NO_TICKETS');
  END IF;

  -- 4. 幂等检查
  SELECT * FROM lj_spin_record WHERE request_id = :request_id;
  IF FOUND THEN
     ROLLBACK; RETURN existing_record;
  END IF;

  -- 5. 执行开奖逻辑 (扣次、累加整数进度、记录结果)
  UPDATE lj_play SET 
    tickets = tickets - 1,
    k = k + 1,
    progress_units = :new_units,
    status = CASE WHEN k + 1 >= :target_spins THEN 'completed' ELSE 'active' END
  WHERE id = :play_id;

  INSERT INTO lj_spin_record (id, play_id, k, prize_type, prize_amount, progress_units, request_id)
  VALUES (:spin_id, :play_id, :k, :type, :amount, :new_units, :request_id);

  -- 6. 若完成且为 auto 模式，写入事务 outbox 派奖任务
  IF :new_units >= 1000000 AND :claim_mode = 'auto' THEN
     INSERT INTO lj_payout_outbox (play_id, member_id, amount, wallet, wagering_mult)
     VALUES (:play_id, :member_id, :finish_prize, 'cash', :wagering_multiple);
  END IF;

COMMIT;
```

### 6.3 派奖防超发治理
- 钱包转账采用 Outbox + 独立 Worker 异步驱动。
- 钱包账变使用 `payoutId = "lj_payout_" + play_id` 作为转账幂等流水号。
- 无论网络重试多少次，同一局游戏（`play_id`）只允许发生一笔有效入账。

