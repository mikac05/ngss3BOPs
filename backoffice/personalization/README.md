# 个性化改版 · 演示

- [打开个性化配置页](index.html)
- [PM / UI 演示指南](presentation.html)
- [五分钟演示提词](PRESENTATION.md)
- [首页样式对照](design-source-map.json) / [页面样式对照](page-design-source-map.json)

PC 管理页面，建议窗口宽度至少 1366 px。右侧预览为 H5 玩家网站。
NG 主题包含 58 款样式及绿黑、橙白、藍白配色；可配置默认值和玩家可选范围。

操作顺序：主题与颜色 → 玩家可选范围 → 组件样式 → 预览与检查 → 查看修改并保存。
右下角开发工具箱可检查租户、登录状态、语言、内容状态与回归场景。

这是使用合成数据的交互演示。保存仅在当前页面会话生效，刷新后重置；可导出 JSON 留存。
不连接正式站点，不提交登录、充值或交易。最终装饰和视觉待 UI 确认，真实接口另行接入。

共享玩家组件位于 player-components.js / player-pages.js；组件目录位于 ng-design-catalog.js /
ng-page-designs.js；管理流程位于 customize-studio.js。配色使用共享 CSS 变量，组件按区域更新。
本地浏览器版本 pages-20260907-5 的 61 项回归检查通过。
