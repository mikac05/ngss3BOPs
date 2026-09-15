# 好运探索季 V3 Prototype

这是一个可直接交给 Antigravity / Codex 继续开发的零第三方依赖原型专案，包含：

- 后后台 7 步配置体验
- 实时进度曲线、次数供给、完成率、预算责任预览
- 玩家手机端转盘 Prototype
- 可复用的纯 JS 计算引擎
- 算法单元测试
- 完整产品 / 后端 / 前台规格文档

> 状态：Recommendation / Prototype-only。不是现网实现。

## 启动

```bash
npm run dev
```

浏览器打开终端显示的 `http://localhost:4173`。不需要安装第三方 npm 套件。

## 测试

```bash
npm test
npm run build
```

## 目录

```text
lucky-journey-v3/
├─ README.md
├─ package.json
├─ index.html
├─ src/
│  ├─ main.js          # 后后台 + 玩家原型
│  ├─ styles.css
│  ├─ engine.js        # phase / progress / budget / completion math
│  └─ engine.test.js
└─ docs/
   ├─ 00-EXECUTIVE-REVIEW.md
   ├─ IMPROVED-BACKOFFICE.md
   ├─ IMPROVED-SPIN-ENGINE.md
   ├─ PLAYER-UX-SPEC.md
   ├─ DECISION-LOG.md
   ├─ OPEN-QUESTIONS.md
   └─ QA-CHECKLIST.md
```

## 生产接入原则

当前玩家页的“转一次”使用浏览器内 Mock Server 以便演示。正式实现必须：

1. 前端 `POST /spin`。
2. 服务端产生并保存结果。
3. 前端只根据返回的 SpinRecord 播动画。
4. requestId 幂等，断线后查询同一结果。
5. 钱包派奖使用独立 rewardGrantId 幂等。

详细规格请看 `docs/IMPROVED-SPIN-ENGINE.md`。

## 建议给 Codex / Antigravity 的第一条指令

```text
请以此仓库 docs/ 下的 V3 规格为唯一产品基线。
先运行 npm test 与 npm run build，确认现有 Prototype 正常；本专案零第三方依赖。
然后把前端 Mock Server 边界抽象成 API client，但不要改变 engine.js 的数学定义；
生产环境的 spin 结果必须由后端返回，前端只负责动画。
任何你发现的规格冲突先写入 docs/DECISION-LOG.md，再修改实现。
```
