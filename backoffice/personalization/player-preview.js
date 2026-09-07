(function () {
  "use strict";
  const player = new NGPlayer.Player(
    document.getElementById("player"),
    (page) => {
      if (parent !== window)
        parent.postMessage(
          { type: "ngss3-preview-navigation", page },
          location.protocol === "file:" ? "*" : location.origin,
        );
      else {
        config.page = page;
        player.setConfig(config);
      }
    },
  );
  let config = {
    tenantId: "standalone",
    theme: "NG",
    color: "BDOK",
    styles: {
      category: 1,
      header: 1,
      sidebar: 1,
      shortcuts: 1,
      grid: 1,
      search: 1,
      carousel: 1,
      download: 1,
    },
    values: {
      topStatusBar: { loggedIn: "全部功能", loggedOut: "基本功能" },
      sidebar: "关闭",
      sidebarDisabled: true,
      shortcuts: "浮动并列",
      categoryButtons: "图示+名称",
      topDownloadBar: "开启",
      gameIconStyle: "标准",
      footerStyle: "样式一",
      buttonStyle: "样式一",
      profileLayout: "样式一",
      vipCard: "完整卡片",
      vipPage: "表格",
      authVisual: "简洁框",
      depositPage: "方式优先",
      amountAutoInput: "按钮",
      recordsDisplay: "下拉",
      inbox: "列表",
      userVerification: "列表",
    },
    auth: "loggedIn",
    locale: "zh",
    nav: ["首页", "活动", "推广", "VIP", "账户"],
    page: "首页",
    content: "normal",
    install: true,
    policy: NGDesign.defaultPolicy(),
  };
  const params = new URLSearchParams(location.search);
  const layout = NGDesign.names.indexOf(params.get("layout"));
  if (layout >= 0 && layout < 5) config.styles.category = layout + 1;
  if (NGDesign.palettes[params.get("color")])
    config.color = params.get("color");
  player.setConfig(config);
  window.addEventListener("message", (e) => {
    if (e.source !== parent || parent === window) return;
    if (location.protocol !== "file:" && e.origin !== location.origin) return;
    if (
      e.data?.type !== "ngss3-preview-config" ||
      !e.data.config ||
      !NGDesign.themeColors[e.data.config.theme]
    )
      return;
    config = e.data.config;
    player.setConfig(config);
  });
  if (parent !== window)
    parent.postMessage(
      { type: "ngss3-preview-ready" },
      location.protocol === "file:" ? "*" : location.origin,
    );
})();
