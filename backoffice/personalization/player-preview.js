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
        showConfig(config);
      }
    },
  );
  let sourceFrame, sourceTheme, sourceConfig;
  function showConfig(next) {
    const appearance=next.previewAppearance;
    if(appearance && next.policy?.themes.includes(appearance.theme) && appearance.theme!==next.theme) {
      const theme=appearance.theme;
      next={...next,theme,color:next.policy.defaults[theme],values:{...(next.themeDefaults?.[theme] || next.values),sidebarDisabled:true,alternateDisabled:true},styles:Object.fromEntries(Object.keys(next.styles).map(k=>[k,k==="category"&&theme==="SF"?5:1])),current:{},media:{},nav:({PH:["首页","活动","钱包","推广","账户"],IN:["推广","活动","首页","钱包","我的"],SF:["首页","活动","VIP","钱包","我的"],NG:["首页","活动","推广","VIP","账户"]})[theme],previewAppearance:null};
    }
    const useSource = next.theme !== "NG" && next.page === "首页";
    document.getElementById("player").hidden = useSource;
    if (!useSource) {
      if(sourceFrame) {sourceFrame.hidden = true;sourceFrame.style.display="none";}
      player.setConfig(next);
      return;
    }
    sourceConfig = next;
    if (!sourceFrame) {
      sourceFrame = document.createElement("iframe");
      sourceFrame.title = "主题首页";
      sourceFrame.style.cssText = "width:100%;height:100%;border:0;display:block";
      document.body.append(sourceFrame);
      sourceFrame.addEventListener("load", () => sourceFrame.contentWindow.postMessage({type:"ngss3-preview-config",config:sourceConfig},location.protocol==="file:"?"*":location.origin));
    }
    sourceFrame.hidden = false;
    sourceFrame.style.display = "block";
    if(sourceTheme !== next.theme) {
      sourceTheme = next.theme;
      sourceFrame.src = next.theme === "PH" ? "../../client/crimson-home/index_short.html?embedded=1" : "../../client/source-themes/index.html?theme=" + next.theme;
    } else sourceFrame.contentWindow.postMessage({type:"ngss3-preview-config",config:next},location.protocol==="file:"?"*":location.origin);
  }
  window.addEventListener("message", e => {
    if(!sourceFrame || e.source!==sourceFrame.contentWindow || (location.protocol!=="file:"&&e.origin!==location.origin))return;
    if(e.data?.type==="ngss3-preview-ready")sourceFrame.contentWindow.postMessage({type:"ngss3-preview-config",config:sourceConfig},location.protocol==="file:"?"*":location.origin);
    if(e.data?.type==="ngss3-preview-navigation"){
      if(parent!==window)parent.postMessage(e.data,location.protocol==="file:"?"*":location.origin);
      else {config.page=e.data.page;showConfig(config);}
    }
  });
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
  const themeParam = params.get("theme");
  if (themeParam && NGDesign.themeColors[themeParam]) {
    config.theme = themeParam;
    config.color = NGDesign.themeColors[themeParam][0];
    if (themeParam === "SF") {
      config.styles.category = 5;
      config.nav = ["首页", "活动", "VIP", "钱包", "我的"];
    }
  }
  const layout = NGDesign.names.indexOf(params.get("layout"));
  if (layout >= 0 && layout < 5) config.styles.category = layout + 1;
  if (NGDesign.palettes[params.get("color")])
    config.color = params.get("color");
  showConfig(config);
  window.addEventListener("message", (e) => {
    if (e.source !== parent || parent === window) return;
    if (location.protocol !== "file:" && e.origin !== location.origin) return;
    if (
      e.data?.type !== "ngss3-preview-config" ||
      !e.data.config ||
      !["NG", "PH", "IN", "SF"].includes(e.data.config.theme) ||
      !NGDesign.themeColors[e.data.config.theme]
    )
      return;
    config = e.data.config;
    showConfig(config);
  });
  if (parent !== window)
    parent.postMessage(
      { type: "ngss3-preview-ready" },
      location.protocol === "file:" ? "*" : location.origin,
    );
})();
