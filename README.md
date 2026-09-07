# NGSS3 原型中心 (Prototype Hub & Interactive Reference)

本仓库为 NGSS3 产品管理端（Back Office）与玩家前端（Client）交互参考原型静态发布站点，支持 GitHub Pages 与本机无服务器浏览。

---

## 📂 原型目录结构 (Architecture)

```text
ngss3BOPs/
├── index.html                               # 原型中心导航首页 (Prototype Hub Entry)
├── favicon.svg                              # 站点图标
├── og.png                                   # OpenGraph 社群分享图
├── .nojekyll                                # 确保 GitHub Pages 正确载入底线与资源目录
│
├── backoffice/                              # 【管理端原型 (Back Office)】
│   ├── game-stats/                          # 1. 游戏统计管理看板 (Game Statistics Dashboard)
│   │   ├── index.html                       #    React SPA 独立构建入口
│   │   └── assets/                          #    Vite / React 打包资源 (JS / CSS)
│   └── multiplier-apex-hunt/                # 2. 倍率巅峰挑战后台设定 (Multiplier Apex Hunt Setup)
│       └── index.html                       #    独立互动原型 (Lo Shu 洛书幻方 / 表单校验 / Element Plus 白天模式)
│
└── client/                                  # 【玩家端原型 (Client / Player)】
    └── multiplier-apex-hunt/                # 1. 倍率巅峰挑战玩家端 (连续中奖范本)
        └── index.html                       #    H5 活动中心范本 (Bingo 连线 / 模拟控制台)
```

---

## 🚀 包含原型详细说明

### 1. 管理端 (Back Office)
- **[个性化改版](backoffice/personalization/)**：
  - PC 管理端，保留 Element Plus 风格与独立 H5 预览；建议窗口宽度至少 1366 px。
  - NG 主题 58 款组件样式，支持绿黑、橙白、藍白，以及租户默认值和玩家可选范围。
  - [PM / UI 演示指南](backoffice/personalization/presentation.html) · [五分钟提词](backoffice/personalization/PRESENTATION.md) · [组件与开发说明](backoffice/personalization/README.md)。
  - 使用合成数据；保存仅在当前页面会话生效，刷新后重置，可导出 JSON 留存。真实接口另行接入。
- **游戏统计管理看板 (`/backoffice/game-stats/`)**：
  - 面向游戏平台运营与管理团队。
  - 支持多日期与统计维度（平台、游戏、币种）筛选、实时 KPI 指标、多系列趋势折线图、构成与损益排行分析、明细下钻表格、排序分页与数据导出。
- **倍率巅峰挑战后台设定 (`/backoffice/multiplier-apex-hunt/`)**：
  - 活动中心倍率阶梯与 Bingo 规则配置后台。
  - 支持阶梯目标自定义、2×2 / 3×3 洛书幻方（Lo Shu Magic Square，Rank Sum = 15）等距平衡排列与手动指定、每条连线独立奖励、Happy Hour 加码排程、责任上限计算与实时字段 Blocking / Warning 校验清单，并提供 Element Plus 官方标准白天/暗黑模式切换。

### 2. 玩家端 (Client)
- **倍率巅峰挑战玩家端 (`/client/multiplier-apex-hunt/`)**：
  - 依据 NGSS3 已登录玩家端活动列表与连续中奖页面为范本制作。
  - 具备 3×3 Bingo 棋盘霓虹连线发光绘制、目标池收发展开、Happy Hour 加码时段、Aviator 资格游戏启动与真实手机端互动体验。
  - 底部提供桌面端全宽「模拟控制台」，支持不同倍率模拟出奖、自定义倍率、Bingo 开关与 Happy Hour 加码切换。

---

## 🌐 本地预览与 GitHub Pages

- **本机预览**：在仓库根目录运行 `python -m http.server 8765 --bind 127.0.0.1`，浏览器打开 `http://127.0.0.1:8765/`。个性化页使用同源 iframe 通信，请通过 HTTP 预览。
- **GitHub Pages**：推送到 `main` 分支后，GitHub Pages 自动以 `index.html` 作为根目录对外提供服务。
