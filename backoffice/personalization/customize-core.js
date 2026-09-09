(function () {
  const PAGES = [
    "全局",
    "首页",
    "登入注册",
    "钱包",
    "个人中心",
    "导航",
    "其他",
  ];
  const THEMES = ["NG", "WG", "GAME"];
  const VIEWPORTS = [320, 375, 390, 480, "desktop"];
  const PLAYER_PAGES = [
    "首页",
    "登入注册",
    "活动",
    "推广",
    "VIP",
    "账户",
    "钱包",
    "充值",
    "提款",
    "站内信",
    "设置",
    "客服",
  ];
  const NAV_CHOICES = NGCurrent.nav.map(x => x[0]);
  const LIVE_NAV = ["首页", "活动", "推广", "VIP", "账户"];
  const AXURE_NAV = ["首页", "活动", "钱包", "我的", "推广"];
  const THEME_NAV_COUNTS = { NG: 5, WG: 4, GAME: 3 };
  const THEME_NAV_DEFAULTS = {
    NG: { loggedOut: LIVE_NAV.slice(), loggedIn: LIVE_NAV.slice() },
    WG: {
      loggedOut: ["首页", "活动", "VIP", "账户"],
      loggedIn: ["首页", "活动", "钱包", "账户"],
    },
    GAME: {
      loggedOut: ["首页", "活动", "账户"],
      loggedIn: ["首页", "钱包", "账户"],
    },
  };
  const AUTH = { loggedOut: "登入前", loggedIn: "登入後" };
  const CAPABILITIES = [
    "首页",
    "游戏浏览/搜索（最近/收藏/厂商）",
    "登入注册",
    "语言",
    "充值",
    "取款",
    "钱包/纪录",
    "个人中心",
    "设置",
    "站内信",
    "用户验证",
    "客服",
    "活动入口",
    "VIP 页入口",
    "App download",
  ];
  const ALTERNATE_TARGETS = [
    "客服",
    "设置",
    "个人中心",
    "站内信",
    "用户验证",
    "VIP 页入口",
    "App download",
    "充值",
    "取款",
  ];
  const OBJECT_CAPABILITY = {
    depositPage: "充值",
    amountAutoInput: "充值",
    recordsDisplay: "钱包/纪录",
    vipCard: "VIP 页入口",
    vipPage: "VIP 页入口",
    inbox: "站内信",
    userVerification: "用户验证",
    topDownloadBar: "App download",
    downloadFAB: "App download",
  };

  const NG_DEFAULTS = {
    theme: "NG",
    themeColor: "BDOK",
    categoryButtons: "图示+名称",
    topStatusBarLoggedOut: "基本功能",
    topStatusBarLoggedIn: "全部功能",
    sidebar: "关闭",
    shortcuts: "浮动并列",
    gameLayout: "样式一",
    searchPagination: "Open",
    topDownloadBar: "开启",
    downloadFAB: "开启",
    depositPage: "方式优先",
    recordsDisplay: "下拉",
    amountAutoInput: "按钮",
    vipCard: "完整卡片",
    vipPage: "表格",
    inbox: "列表",
    userVerification: "列表",
    bottomNav: { loggedOut: LIVE_NAV.slice(), loggedIn: LIVE_NAV.slice() },
    popupStyle: "样式一",
    alternateButton: null,
    carouselStyle: "通用Banner",
    footerStyle: "样式一",
    profileLayout: "样式一",
    authVisual: "简洁框",
    brandMark: "本站品牌标志（固定）",
    buttonStyle: "样式一",
    gameIconStyle: "标准",
  };

  const THEME_DEFAULTS = {
    NG: Object.assign({}, NG_DEFAULTS),
    WG: Object.assign({}, NG_DEFAULTS, {
      theme: "WG",
      themeColor: "BDAK",
      sidebar: "左方",
      gameLayout: "样式二",
      popupStyle: "样式二",
      carouselStyle: "通用Banner",
      footerStyle: "样式一",
      profileLayout: "样式二",
      authVisual: "简洁框",
      buttonStyle: "样式一",
      gameIconStyle: "标准",
      bottomNav: {
        loggedOut: THEME_NAV_DEFAULTS.WG.loggedOut.slice(),
        loggedIn: THEME_NAV_DEFAULTS.WG.loggedIn.slice(),
      },
    }),
    GAME: Object.assign({}, NG_DEFAULTS, {
      theme: "GAME",
      themeColor: "BDLKK",
      categoryButtons: "仅图示",
      sidebar: "关闭",
      shortcuts: "浮动收折",
      carouselStyle: "轮播Banner",
      footerStyle: "样式三",
      profileLayout: "样式四",
      authVisual: "插画框",
      buttonStyle: "样式三",
      gameIconStyle: "极简",
      gameLayout: "样式三",
      bottomNav: {
        loggedOut: THEME_NAV_DEFAULTS.GAME.loggedOut.slice(),
        loggedIn: THEME_NAV_DEFAULTS.GAME.loggedIn.slice(),
      },
    }),
  };

  const CATALOG = [
    {
      id: "theme",
      page: "全局",
      label: "主题",
      type: "single-select",
      options: ["NG", "WG", "GAME"],
      required: true,
      supportsOff: false,
      risk: "R0",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed / Live-observed：NG 为 NGSS 默认主题；WG、GAME 为次主题且目录可能更小。",
      playerEffect: "切换整站视觉目录与可继承默认值；不改变账户、钱包或权限。",
      dependencies: "所有主题相关 chrome / variant。",
      fallback: "无 OFF。未知支持保留 Open。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "NG", WG: "WG", GAME: "GAME" },
    },
    {
      id: "themeColor",
      page: "全局",
      label: "主题颜色",
      type: "single-select",
      options: ["BDOK", "BDAK", "BDLKK"],
      required: true,
      supportsOff: false,
      risk: "R0",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：默认跟随所选主题；只有所选主题已声明支持时才允许租户 SET。选项与现网默认仍为 Prototype-only / Open。",
      playerEffect: "改变主色与按钮色，不改变玩法或结算。",
      dependencies: "主题。",
      fallback: "INHERIT 至所选主题推荐色；未知则 Open。",
      support: { NG: "open", WG: "open", GAME: "open" },
      defaults: { NG: "BDOK", WG: "BDAK", GAME: "BDLKK" },
    },
    {
      id: "categoryButtons",
      page: "首页",
      label: "分类按钮",
      type: "single-select",
      options: ["图示+名称", "仅名称", "仅图示"],
      required: true,
      supportsOff: false,
      risk: "R0/R1",
      sourceThemeSelectable: true,
      evidence: "Prototype-only 选项；Live 默认按主题 INHERIT。",
      playerEffect: "首页分类入口呈现变化，不改变可玩游戏集合。",
      dependencies: "首页游戏浏览。",
      fallback: "INHERIT 主题默认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "图示+名称", WG: "图示+名称", GAME: "仅图示" },
    },
    {
      id: "topStatusBar",
      page: "首页",
      label: "顶部状态列",
      type: "per-auth-select",
      options: ["简洁", "基本功能", "全部功能"],
      required: true,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence: "Prototype-only：登入前 / 登入後独立配置。",
      playerEffect: "改变顶栏密度与可放快捷入口；登入前预览不得出现余额。",
      dependencies: "快捷按钮、替代按钮；所有提供模式必须先通过响应式设计 QA。",
      fallback: "INHERIT 主题默认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: {
        NG: { loggedOut: "基本功能", loggedIn: "全部功能" },
        WG: { loggedOut: "基本功能", loggedIn: "基本功能" },
        GAME: { loggedOut: "简洁", loggedIn: "基本功能" },
      },
    },
    {
      id: "sidebar",
      page: "首页",
      label: "侧边栏",
      type: "single-select",
      options: ["左方", "右方"],
      required: false,
      supportsOff: true,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence:
        "Live-observed：NG 默认 关闭。User-confirmed 2026-08-28：关闭 = OFF。",
      playerEffect: "提供或收回侧栏宿主；OFF 时能力必须改走其他宿主。",
      dependencies: "快捷按钮=侧边栏内。",
      fallback: "NG 主题默认解析为 OFF。",
      support: { NG: true, WG: true, GAME: "open" },
      defaults: { NG: "关闭", WG: "左方", GAME: "关闭" },
    },
    {
      id: "shortcuts",
      page: "首页",
      label: "快捷按钮",
      type: "single-select",
      options: ["浮动并列", "浮动收折", "状态列按钮", "侧边栏内"],
      required: false,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：保留四种宿主选项且无 OFF。默认值与实际快捷功能集合仍为 Prototype-only / Open。",
      playerEffect: "改变快捷入口位置，不改变充值提款资格。",
      dependencies: "侧边栏、顶部状态列、取款/客服可达性。",
      fallback: "INHERIT 主题默认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "浮动并列", WG: "浮动并列", GAME: "浮动收折" },
    },
    {
      id: "gameLayout",
      page: "首页",
      label: "游戏排版",
      type: "single-select",
      options: ["样式一", "样式二", "样式三", "样式四", "样式五"],
      required: true,
      supportsOff: false,
      risk: "R0",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-09-04：游戏排版改为 Figma 对应的样式一至样式五；仅切换中央游戏浏览区，共用首页其他物件。",
      playerEffect: "改变游戏卡片排布，不改变搜索结果或权限。",
      dependencies: "游戏浏览/搜索。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "样式一", WG: "样式二", GAME: "样式三" },
    },
    {
      id: "searchPagination",
      page: "首页",
      label: "搜索/分页模式",
      type: "single-select",
      options: ["搜索列", "分页"],
      required: false,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：INHERIT 是唯一沿用主题默认的语意；SET 仅有 搜索列 / 分页，无 OFF。主题支援与现网默认仍为 Open。",
      playerEffect:
        "规划中的浏览模式；预览仅合成。GAME 无声明支持且无安全回退。",
      dependencies: "游戏浏览/搜索。",
      fallback: "无安全回退（GAME = Block）。",
      support: { NG: "open", WG: "open", GAME: "open" },
      defaults: { NG: "Open", WG: "Open", GAME: "Open" },
      unsafeIfUnsupported: true,
    },
    {
      id: "topDownloadBar",
      page: "首页",
      label: "顶部下载栏",
      type: "single-select",
      options: ["开启"],
      required: false,
      supportsOff: true,
      risk: "R1",
      sourceThemeSelectable: false,
      evidence:
        "Prototype-only。User-confirmed 2026-08-28：关闭 = OFF；下载FAB 跟随本物件。",
      playerEffect: "控制 App 下载栏与派生 下载FAB；OFF 时两者同时隐藏。",
      dependencies:
        "派生 下载FAB、App 安装能力（模拟）；所有提供组合必须先通过响应式设计 QA。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "开启", WG: "开启", GAME: "开启" },
    },
    {
      id: "downloadFAB",
      page: "首页",
      label: "下载FAB",
      type: "derived-readonly",
      options: [],
      required: false,
      supportsOff: false,
      derivedFrom: "topDownloadBar",
      risk: "R1",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：跟随顶部下载栏，不单独支持 OFF 或租户覆盖。",
      playerEffect: "与顶部下载栏同步显示或隐藏，不产生独立租户差异。",
      dependencies: "顶部下载栏、App 安装能力（模拟）。",
      fallback: "由顶部下载栏解析结果派生。",
      support: { NG: true, WG: true, GAME: true },
      defaults: {
        NG: "跟随顶部下载栏",
        WG: "跟随顶部下载栏",
        GAME: "跟随顶部下载栏",
      },
    },
    {
      id: "depositPage",
      page: "钱包",
      label: "充值页",
      type: "single-select",
      options: ["方式优先", "额度优先"],
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：方式优先 / 额度优先，无 OFF；仅版式，不改变充值资格、通道、限额或账务。",
      playerEffect: "通道/额度信息架构，不改变结算。",
      dependencies: "充值能力可达性由导航/快捷按钮提供。",
      fallback: "INHERIT。",
      support: { NG: true, WG: "open", GAME: "open" },
      defaults: { NG: "方式优先", WG: "额度优先", GAME: "方式优先" },
    },
    {
      id: "recordsDisplay",
      page: "钱包",
      label: "纪录顯示",
      type: "single-select",
      options: ["下拉", "收折"],
      required: true,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：下拉 / 收折，无 OFF；仅改变呈现，不删除、过滤或改变交易纪录。标签保持 纪录顯示。",
      playerEffect: "纪录呈现方式，不改变账本。",
      dependencies: "钱包/纪录。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: "open" },
      defaults: { NG: "下拉", WG: "收折", GAME: "下拉" },
    },
    {
      id: "amountAutoInput",
      page: "钱包",
      label: "额度自动输入",
      type: "single-select",
      options: ["按钮", "自动", "无"],
      required: false,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：按钮 / 自动 / 无，无 OFF。自动只使用上游建议值、可修改且绝不自动提交；不得改变额度、限额、资格、费率或入账。",
      playerEffect: "输入辅助；无 仍保留手动输入框，不改变钱包规则。",
      dependencies: "充值页。",
      fallback: "INHERIT。",
      support: { NG: true, WG: "open", GAME: "open" },
      defaults: { NG: "按钮", WG: "按钮", GAME: "无" },
    },
    {
      id: "vipCard",
      page: "个人中心",
      label: "显示VIP卡片",
      type: "single-select",
      options: ["完整卡片", "仅显示徽章", "隐藏VIP资讯"],
      required: true,
      supportsOff: false,
      risk: "R2",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：完整卡片 / 仅显示徽章 / 隐藏VIP资讯，无 OFF；隐藏是 SET 且仍必须保留 VIP 页入口。",
      playerEffect: "个人中心 VIP 展示；不改变 VIP 等级或返水。",
      dependencies: "底部导航 VIP 槽位。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: "open" },
      defaults: { NG: "完整卡片", WG: "仅显示徽章", GAME: "完整卡片" },
    },
    {
      id: "vipPage",
      page: "个人中心",
      label: "VIP页",
      type: "single-select",
      options: ["表格", "卡片"],
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：表格 / 卡片，无 OFF；仅改变版面，不影响 VIP 等级、升降级、奖励或领取资格。",
      playerEffect: "VIP 页版式，不改变权益计算。",
      dependencies: "VIP 页入口。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: "open" },
      defaults: { NG: "表格", WG: "卡片", GAME: "卡片" },
    },
    {
      id: "inbox",
      page: "个人中心",
      label: "站内信",
      type: "single-select",
      options: ["列表", "已读收折"],
      required: true,
      supportsOff: false,
      risk: "R2",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：列表 / 已读收折，无 OFF；未读保持可见，玩家不能删除。本原型不改变投递、已读判定或保存期限。",
      playerEffect: "列表形态；无删除动作。已读可收折，未读保持可见。",
      dependencies: "个人中心。",
      fallback: "INHERIT。",
      support: { NG: true, WG: true, GAME: "open" },
      defaults: { NG: "列表", WG: "列表", GAME: "已读收折" },
    },
    {
      id: "userVerification",
      page: "个人中心",
      label: "用户验证",
      type: "single-select",
      options: ["列表", "多步"],
      required: true,
      supportsOff: false,
      risk: "R2",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：列表 / 多步，无 OFF；仅流程呈现，保留上游要求的项目、顺序与状态，禁止无证据称为 KYC。",
      playerEffect: "验证任务排布，不改变审核状态、资格、权限或业务规则。",
      dependencies: "个人中心。",
      fallback: "INHERIT。",
      support: { NG: true, WG: "open", GAME: "open" },
      defaults: { NG: "列表", WG: "多步", GAME: "列表" },
    },
    {
      id: "bottomNav",
      page: "导航",
      label: "底部导航",
      type: "per-auth-ordered-slots",
      options: NAV_CHOICES,
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：槽位数量跟随主题，登入前 / 登入後分开设置，不提供 OFF 或空槽。NG 五槽组合为 Live-observed；认证态映射及 WG/GAME 数量是 Prototype-only / Open。",
      playerEffect: "改变主站可达宿主。能力仍须至少一处可见可操作表面。",
      dependencies:
        "主题槽位数量声明、认证态、VIP、取款、客服、个人中心、活动。",
      fallback: "各认证态回到所选主题默认；不补空槽、不自动注入客服。",
      support: { NG: true, WG: "open", GAME: "open" },
      defaults: {
        NG: { loggedOut: LIVE_NAV.slice(), loggedIn: LIVE_NAV.slice() },
        WG: {
          loggedOut: THEME_NAV_DEFAULTS.WG.loggedOut.slice(),
          loggedIn: THEME_NAV_DEFAULTS.WG.loggedIn.slice(),
        },
        GAME: {
          loggedOut: THEME_NAV_DEFAULTS.GAME.loggedOut.slice(),
          loggedIn: THEME_NAV_DEFAULTS.GAME.loggedIn.slice(),
        },
      },
    },
    {
      id: "popupStyle",
      page: "其他",
      label: "弹窗样式",
      type: "single-select",
      options: ["样式一", "样式二"],
      required: true,
      supportsOff: false,
      risk: "R0",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：样式一 / 样式二，无 OFF，仅视觉。跨主题 R0=Warn；未支援时仅可使用已声明安全回退，否则 Block。现网映射仍为 Open。",
      playerEffect: "弹窗视觉，不改变文案业务规则。",
      dependencies: "主题支持。",
      fallback: "GAME → NG 样式一（Auto-resolve）。",
      support: { NG: true, WG: "open", GAME: "open" },
      defaults: { NG: "样式一", WG: "Open", GAME: "Open" },
      safeFallback: {
        theme: "NG",
        value: "样式一",
        reason: "GAME 未声明弹窗样式，安全回退 NG 样式一",
      },
    },
    {
      id: "alternateButton",
      page: "其他",
      label: "替代按钮",
      type: "capability-placement",
      options: ["浮动收折", "顶部状态列", "底部导航自选槽位"],
      required: false,
      supportsOff: true,
      risk: "R1",
      sourceThemeSelectable: true,
      evidence:
        "User-confirmed 2026-08-28：SET 必须指定位置、承载能力与认证范围；无 SET=未指定；不得隐式当作 客服。精确产品支持仍为 Open。",
      playerEffect:
        "额外 chrome 宿主；只改变已声明能力的入口位置，不改变上游资格或业务规则。",
      dependencies:
        "承载能力声明、认证范围、底部导航、顶部状态列与保护能力可达性。",
      fallback: "INHERIT 跟随主题；OFF 明确无替代按钮；无静默宿主。",
      support: { NG: "open", WG: "open", GAME: "open" },
      defaults: { NG: null, WG: null, GAME: null },
    },
    {
      id: "carouselStyle",
      page: "首页",
      label: "轮播样式",
      type: "single-select",
      options: ["通用Banner", "小Banner", "轮播Banner"],
      required: true,
      supportsOff: false,
      risk: "R0/R1",
      sourceThemeSelectable: false,
      evidence:
        "User-approved Target；选项来自 Axure Prototype-only。仅控制视觉版式。",
      playerEffect:
        "改变首页轮播版式，不改变轮播内容、排序、排程、连结、资格或启用状态。",
      dependencies:
        "轮播内容与能力均由上游管理；所有提供选项已通过设计端响应式检查。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "通用Banner", WG: "通用Banner", GAME: "轮播Banner" },
      themeOptions: {
        NG: ["通用Banner", "小Banner", "轮播Banner"],
        WG: ["通用Banner", "小Banner"],
        GAME: ["小Banner", "轮播Banner"],
      },
    },
    {
      id: "footerStyle",
      page: "全局",
      label: "页尾内容",
      type: "single-select",
      options: ["样式一", "样式二", "样式三"],
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: false,
      evidence:
        "User-confirmed 2026-08-28：仅选择页尾预设版式，不直接编辑内容；精确现网名称 Open。",
      playerEffect:
        "只改变页尾结构与视觉，不改变文字、HTML、网址、法务/客服内容、路由或业务规则。",
      dependencies: "主题预设与设计系统；内容继续由既有上游来源管理。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "样式一", WG: "样式一", GAME: "样式三" },
      themeOptions: {
        NG: ["样式一", "样式二", "样式三"],
        WG: ["样式一", "样式二"],
        GAME: ["样式二", "样式三"],
      },
    },
    {
      id: "profileLayout",
      page: "个人中心",
      label: "个人中心版面",
      type: "single-select",
      options: ["样式一", "样式二", "样式三", "样式四", "样式五"],
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: false,
      evidence: "User-approved Target；选项来自 Axure Prototype-only。",
      playerEffect:
        "改变个人中心版面，不移除账户、VIP、站内信、语言、客服、设置或用户验证能力。",
      dependencies: "所有个人中心保护能力必须保持可达。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "样式一", WG: "样式二", GAME: "样式四" },
      themeOptions: {
        NG: ["样式一", "样式二", "样式三", "样式四", "样式五"],
        WG: ["样式一", "样式二", "样式三"],
        GAME: ["样式三", "样式四", "样式五"],
      },
    },
    {
      id: "authVisual",
      page: "登入注册",
      label: "登入注册视觉",
      type: "single-select",
      options: ["简洁框", "插画框"],
      required: true,
      supportsOff: false,
      risk: "R1/R2",
      sourceThemeSelectable: false,
      evidence:
        "User-approved Target；选项标签 Recommendation，现网映射 Open。",
      playerEffect:
        "只改变登入注册视觉，不改变认证、权限、验证码、验证或恢复规则。",
      dependencies: "登入注册入口、字段、错误、验证与恢复表面必须清晰可用。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "简洁框", WG: "简洁框", GAME: "插画框" },
      themeOptions: {
        NG: ["简洁框", "插画框"],
        WG: ["简洁框"],
        GAME: ["插画框"],
      },
    },
    {
      id: "brandMark",
      page: "全局",
      label: "品牌标志",
      type: "fixed-readonly",
      options: [],
      required: true,
      supportsOff: false,
      risk: "R2",
      sourceThemeSelectable: false,
      evidence: "User-confirmed 2026-08-28：固定唯读，不提供 SET、OFF 或上传。",
      playerEffect:
        "显示本站品牌标志；缺少资产时仅回退本站站名，绝不取用其他站点资产。",
      dependencies: "本站品牌绑定与本站站名。",
      fallback: "本站站名（固定）。",
      support: { NG: true, WG: true, GAME: true },
      defaults: {
        NG: "本站品牌标志（固定）",
        WG: "本站品牌标志（固定）",
        GAME: "本站品牌标志（固定）",
      },
    },
    {
      id: "buttonStyle",
      page: "全局",
      label: "按钮样式",
      type: "single-select",
      options: ["样式一", "样式二", "样式三", "样式四"],
      required: true,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: false,
      evidence: "User-approved Target；选项来自 Axure Prototype-only。",
      playerEffect: "改变按钮视觉，不改变动作、权限、资格或业务状态。",
      dependencies:
        "默认、悬停、按下、选中、禁用、载入、错误与阻挡状态由设计系统保证。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "样式一", WG: "样式一", GAME: "样式三" },
      themeOptions: {
        NG: ["样式一", "样式二", "样式三", "样式四"],
        WG: ["样式一", "样式二"],
        GAME: ["样式三", "样式四"],
      },
    },
    {
      id: "gameIconStyle",
      page: "首页",
      label: "游戏图标",
      type: "single-select",
      options: ["标准", "极简"],
      required: true,
      supportsOff: false,
      risk: "R1",
      sourceThemeSelectable: false,
      evidence:
        "User-approved Target；选项标签 Recommendation，Figma Prototype-only。",
      playerEffect:
        "改变游戏与最爱图标视觉；收藏与启动能力持续可操作，不改变可玩游戏集合。",
      dependencies: "游戏标题、启动与收藏表面必须保持可辨识可操作。",
      fallback: "仅可解析至所选主题默认并要求确认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: "标准", WG: "标准", GAME: "极简" },
      themeOptions: { NG: ["标准", "极简"], WG: ["标准"], GAME: ["极简"] },
    },
  ];

  window.NGDesign.extendCatalog(CATALOG, THEME_DEFAULTS);
  const byId = Object.fromEntries(
    CATALOG.map(function (item) {
      return [item.id, item];
    }),
  );
  const SEMANTIC_IDS = {
    gameGridStyle: "home.gameCardLayout",
    theme: "global.theme",
    themeColor: "global.themeColor",
    categoryButtons: "home.categoryButton",
    topStatusBar: "home.topStatusBar",
    sidebar: "home.sidebar",
    shortcuts: "home.quickButtons",
    gameLayout: "home.gameLayout",
    searchPagination: "home.searchPaginationMode",
    topDownloadBar: "home.topDownloadBar",
    downloadFAB: "home.downloadFab",
    depositPage: "wallet.depositPage",
    recordsDisplay: "wallet.recordDisplay",
    amountAutoInput: "wallet.amountAutoInput",
    vipCard: "profile.showVipCard",
    vipPage: "profile.vipPage",
    inbox: "profile.inbox",
    userVerification: "profile.userVerification",
    bottomNav: "nav.bottomNav",
    popupStyle: "other.popupStyle",
    alternateButton: "other.alternateButton",
    carouselStyle: "home.carouselStyle",
    footerStyle: "global.footerStyle",
    profileLayout: "profile.layoutStyle",
    authVisual: "auth.visualStyle",
    brandMark: "global.brandMark",
    buttonStyle: "global.buttonStyle",
    gameIconStyle: "home.gameIconStyle",
  };

  function clone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  const ZH_TO_EN = {
    选择介面语言: "Select UI language",
    选择合成租户: "Select composed tenant",
    选择主题: "Select theme",
    载入示范场景: "Load sample scenario",
    "仅用于检查多语言长文案是否造成截断或碰撞，不是租户配置。":
      "For checking whether long multilingual copy truncates or collides; not tenant config.",
    长文案版面测试: "Long-copy layout test",
    页面与物件树: "Pages and object tree",
    "搜索物件、页面、风险": "Search objects, pages, risks",
    搜索物件: "Search objects",
    玩家预览: "Player preview",
    首页: "Home",
    钱包: "Wallet",
    个人中心: "Personal center",
    活动: "Promotions",
    推广: "Affiliate",
    账户: "Account",
    充值: "Deposit",
    提款: "Withdraw",
    站内信: "Inbox",
    设置: "Settings",
    客服: "Support",
    我的: "Me",
    登入前: "Logged out",
    登入後: "Logged in",
    "游戏浏览/搜索（最近/收藏/厂商）":
      "Game browse/search (recent/favorites/providers)",
    登入注册: "Login / register",
    语言: "Language",
    取款: "Withdraw",
    "钱包/纪录": "Wallet / history",
    用户验证: "User verification",
    活动入口: "Promotions entry",
    "VIP 页入口": "VIP page entry",
    "图示+名称": "Icon + name",
    基本功能: "Basic features",
    全部功能: "All features",
    关闭: "Off",
    浮动并列: "Floating side-by-side",
    直式: "Vertical",
    开启: "On",
    方式优先: "Method-first",
    下拉: "Dropdown",
    按钮: "Button",
    完整卡片: "Full card",
    表格: "Table",
    列表: "List",
    样式一: "Style 1",
    左方: "Left",
    横拉: "Horizontal scroll",
    样式二: "Style 2",
    仅图示: "Icon only",
    浮动收折: "Floating collapsible",
    主题: "Theme",
    "User-confirmed / Live-observed：NG 为 NGSS 默认主题；WG、GAME 为次主题且目录可能更小。":
      "User-confirmed / Live-observed: NG is the NGSS default theme; WG and GAME are secondary themes and may have a smaller catalog.",
    "切换整站视觉目录与可继承默认值；不改变账户、钱包或权限。":
      "Switches site-wide visual catalog and inheritable defaults; does not change account, wallet, or permissions.",
    "所有主题相关 chrome / variant。": "All theme-related chrome / variant.",
    "无 OFF。未知支持保留 Open。": "No OFF. Unknown support stays Open.",
    主题颜色: "Theme color",
    "User-confirmed 2026-08-28：默认跟随所选主题；只有所选主题已声明支持时才允许租户 SET。选项与现网默认仍为 Prototype-only / Open。":
      "User-confirmed 2026-08-28: default follows the selected theme; tenant SET only if that theme declares support. Options and live defaults remain Prototype-only / Open.",
    "改变主色与按钮色，不改变玩法或结算。":
      "Changes primary and button colors; does not change gameplay or settlement.",
    "主题。": "Theme.",
    "INHERIT 至所选主题推荐色；未知则 Open。":
      "INHERIT to the selected theme’s recommended colors; unknown stays Open.",
    分类按钮: "Category buttons",
    仅名称: "Name only",
    "Prototype-only 选项；Live 默认按主题 INHERIT。":
      "Prototype-only options; Live default is theme INHERIT.",
    "首页分类入口呈现变化，不改变可玩游戏集合。":
      "Changes how home category entries are presented; does not change the playable game set.",
    "首页游戏浏览。": "Home game browse.",
    "INHERIT 主题默认。": "INHERIT theme default.",
    顶部状态列: "Top status bar",
    简洁: "Compact",
    "Prototype-only：登入前 / 登入後独立配置。":
      "Prototype-only: logged-out / logged-in configured independently.",
    "改变顶栏密度与可放快捷入口；登入前预览不得出现余额。":
      "Changes top-bar density and which shortcuts fit; logged-out preview must not show balance.",
    "快捷按钮、替代按钮；所有提供模式必须先通过响应式设计 QA。":
      "Shortcut buttons, fallback buttons; every offered mode must pass responsive-design QA first.",
    侧边栏: "Sidebar",
    右方: "Right",
    "Live-observed：NG 默认 关闭。User-confirmed 2026-08-28：关闭 = OFF。":
      "Live-observed: NG default is Off. User-confirmed 2026-08-28: Off = OFF.",
    "提供或收回侧栏宿主；OFF 时能力必须改走其他宿主。":
      "Provides or withdraws the sidebar host; when OFF, capabilities must move to another host.",
    "快捷按钮=侧边栏内。": "Shortcut buttons = in sidebar.",
    "NG 主题默认解析为 OFF。": "NG theme default resolves to OFF.",
    快捷按钮: "Shortcut buttons",
    状态列按钮: "Status-bar buttons",
    侧边栏内: "In sidebar",
    "User-confirmed 2026-08-28：保留四种宿主选项且无 OFF。默认值与实际快捷功能集合仍为 Prototype-only / Open。":
      "User-confirmed 2026-08-28: keep four host options and no OFF. Defaults and the actual shortcut set remain Prototype-only / Open.",
    "改变快捷入口位置，不改变充值提款资格。":
      "Changes shortcut placement; does not change deposit/withdraw eligibility.",
    "侧边栏、顶部状态列、取款/客服可达性。":
      "Sidebar, top status bar, withdraw/support reachability.",
    游戏排版: "Game layout",
    "User-confirmed 2026-08-28：保留直式 / 横拉且无 OFF；主题默认仍为 Prototype-only / Open。":
      "User-confirmed 2026-08-28: keep Vertical / Horizontal scroll and no OFF; theme defaults remain Prototype-only / Open.",
    "改变游戏卡片排布，不改变搜索结果或权限。":
      "Changes game-card arrangement; does not change search results or permissions.",
    "游戏浏览/搜索。": "Game browse/search.",
    "搜索/分页模式": "Search / pagination mode",
    搜索列: "Search bar",
    分页: "Pagination",
    "User-confirmed 2026-08-28：INHERIT 是唯一沿用主题默认的语意；SET 仅有 搜索列 / 分页，无 OFF。主题支援与现网默认仍为 Open。":
      "User-confirmed 2026-08-28: INHERIT is the only follow-theme-default meaning; SET is Search bar / Pagination only, no OFF. Theme support and live defaults remain Open.",
    "规划中的浏览模式；预览仅合成。GAME 无声明支持且无安全回退。":
      "Planned browse mode; preview is composed only. GAME has no declared support and no safe fallback.",
    "无安全回退（GAME = Block）。": "No safe fallback (GAME = Block).",
    顶部下载栏: "Top download bar",
    "Prototype-only。User-confirmed 2026-08-28：关闭 = OFF；下载FAB 跟随本物件。":
      "Prototype-only. User-confirmed 2026-08-28: Off = OFF; download FAB follows this object.",
    "控制 App 下载栏与派生 下载FAB；OFF 时两者同时隐藏。":
      "Controls the app download bar and derived download FAB; when OFF both hide.",
    "派生 下载FAB、App 安装能力（模拟）；所有提供组合必须先通过响应式设计 QA。":
      "Derived download FAB, app-install capability (simulated); every offered combination must pass responsive-design QA first.",
    下载FAB: "Download FAB",
    "User-confirmed 2026-08-28：跟随顶部下载栏，不单独支持 OFF 或租户覆盖。":
      "User-confirmed 2026-08-28: follows the top download bar; no standalone OFF or tenant override.",
    "与顶部下载栏同步显示或隐藏，不产生独立租户差异。":
      "Shows or hides in sync with the top download bar; no independent tenant variance.",
    "顶部下载栏、App 安装能力（模拟）。":
      "Top download bar, app-install capability (simulated).",
    "由顶部下载栏解析结果派生。":
      "DERIVED from the top download bar’s resolved result.",
    跟随顶部下载栏: "Follow top download bar",
    充值页: "Deposit page",
    额度优先: "Amount-first",
    "User-confirmed 2026-08-28：方式优先 / 额度优先，无 OFF；仅版式，不改变充值资格、通道、限额或账务。":
      "User-confirmed 2026-08-28: Method-first / Amount-first, no OFF; layout only; does not change deposit eligibility, channels, limits, or ledgering.",
    "通道/额度信息架构，不改变结算。":
      "Channel/amount information architecture; does not change settlement.",
    "充值能力可达性由导航/快捷按钮提供。":
      "Deposit reachability is provided by nav / shortcut buttons.",
    纪录顯示: "History display",
    收折: "Collapsible",
    "User-confirmed 2026-08-28：下拉 / 收折，无 OFF；仅改变呈现，不删除、过滤或改变交易纪录。标签保持 纪录顯示。":
      "User-confirmed 2026-08-28: Dropdown / Collapsible, no OFF; presentation only; does not delete, filter, or alter transaction history. Keep the History display label.",
    "纪录呈现方式，不改变账本。":
      "History presentation; does not change the ledger.",
    "钱包/纪录。": "Wallet / history.",
    额度自动输入: "Amount auto-fill",
    自动: "Auto",
    无: "None",
    "User-confirmed 2026-08-28：按钮 / 自动 / 无，无 OFF。自动只使用上游建议值、可修改且绝不自动提交；不得改变额度、限额、资格、费率或入账。":
      "User-confirmed 2026-08-28: Button / Auto / None, no OFF. Auto uses upstream suggested values only, remains editable, and never auto-submits; must not change amounts, limits, eligibility, fees, or crediting.",
    "输入辅助；无 仍保留手动输入框，不改变钱包规则。":
      "Input assist; None still keeps the manual input field and does not change wallet rules.",
    "充值页。": "Deposit page.",
    显示VIP卡片: "Show VIP card",
    仅显示徽章: "Badge only",
    隐藏VIP资讯: "Hide VIP info",
    "User-confirmed 2026-08-28：完整卡片 / 仅显示徽章 / 隐藏VIP资讯，无 OFF；隐藏是 SET 且仍必须保留 VIP 页入口。":
      "User-confirmed 2026-08-28: Full card / Badge only / Hide VIP info; no OFF. Hide is SET and the VIP page entry must still remain.",
    "个人中心 VIP 展示；不改变 VIP 等级或返水。":
      "Account-center VIP presentation; does not change VIP level or rebate.",
    "底部导航 VIP 槽位。": "Bottom-nav VIP slot.",
    VIP页: "VIP page",
    卡片: "Card",
    "User-confirmed 2026-08-28：表格 / 卡片，无 OFF；仅改变版面，不影响 VIP 等级、升降级、奖励或领取资格。":
      "User-confirmed 2026-08-28: Table / Card; no OFF. Layout only; does not affect VIP level, promotion/demotion, rewards, or claim eligibility.",
    "VIP 页版式，不改变权益计算。":
      "VIP page layout; does not change benefit calculation.",
    "VIP 页入口。": "VIP page entry.",
    已读收折: "Collapse read",
    "User-confirmed 2026-08-28：列表 / 已读收折，无 OFF；未读保持可见，玩家不能删除。本原型不改变投递、已读判定或保存期限。":
      "User-confirmed 2026-08-28: List / Collapse read; no OFF. Unread stays visible; players cannot delete. This prototype does not change delivery, read detection, or retention.",
    "列表形态；无删除动作。已读可收折，未读保持可见。":
      "List presentation; no delete action. Read items may collapse; unread stays visible.",
    "个人中心。": "Account center.",
    多步: "Multi-step",
    "User-confirmed 2026-08-28：列表 / 多步，无 OFF；仅流程呈现，保留上游要求的项目、顺序与状态，禁止无证据称为 KYC。":
      "User-confirmed 2026-08-28: List / Multi-step; no OFF. Presentation of the flow only; keep upstream-required items, order, and status. Do not call it KYC without evidence.",
    "验证任务排布，不改变审核状态、资格、权限或业务规则。":
      "Verification-task layout; does not change review status, eligibility, permissions, or business rules.",
    底部导航: "Bottom nav",
    "User-confirmed 2026-08-28：槽位数量跟随主题，登入前 / 登入後分开设置，不提供 OFF 或空槽。NG 五槽组合为 Live-observed；认证态映射及 WG/GAME 数量是 Prototype-only / Open。":
      "User-confirmed 2026-08-28: Slot count follows the theme; logged-out / logged-in are set separately; no OFF or empty slots. NG five-slot mix is Live-observed; auth-state mapping and WG/GAME counts are Prototype-only / Open.",
    "改变主站可达宿主。能力仍须至少一处可见可操作表面。":
      "Changes the player-site reachable host. A capability must still have at least one visible, operable surface.",
    "主题槽位数量声明、认证态、VIP、取款、客服、个人中心、活动。":
      "Theme slot-count declaration, auth state, VIP, withdraw, support, account center, promotions.",
    "各认证态回到所选主题默认；不补空槽、不自动注入客服。":
      "Each auth state returns to the selected theme defaults; do not pad empty slots or auto-inject support.",
    弹窗样式: "Modal style",
    "User-confirmed 2026-08-28：样式一 / 样式二，无 OFF，仅视觉。跨主题 R0=Warn；未支援时仅可使用已声明安全回退，否则 Block。现网映射仍为 Open。":
      "User-confirmed 2026-08-28: Style 1 / Style 2; no OFF; visual only. Cross-theme R0=Warn. If unsupported, only a declared safe fallback may be used, else Block. Live mapping remains Open.",
    "弹窗视觉，不改变文案业务规则。":
      "Modal visuals; does not change copy or business rules.",
    "主题支持。": "Theme support.",
    "GAME → NG 样式一（Auto-resolve）。": "GAME → NG Style 1 (Auto-resolve).",
    "GAME 未声明弹窗样式，安全回退 NG 样式一":
      "GAME did not declare a modal style; safe fallback to NG Style 1",
    替代按钮: "Replacement button",
    底部导航自选槽位: "Custom bottom-nav slot",
    "User-confirmed 2026-08-28：SET 必须指定位置、承载能力与认证范围；无 SET=未指定；不得隐式当作 客服。精确产品支持仍为 Open。":
      "User-confirmed 2026-08-28: SET must specify position, hosted capability, and auth scope; no SET = unspecified; must not be treated implicitly as support. Exact product support remains Open.",
    "额外 chrome 宿主；只改变已声明能力的入口位置，不改变上游资格或业务规则。":
      "Extra chrome host; only changes entry location for a declared capability; does not change upstream eligibility or business rules.",
    "承载能力声明、认证范围、底部导航、顶部状态列与保护能力可达性。":
      "Hosted-capability declaration, auth scope, bottom nav, top status bar, and protected-capability reachability.",
    "INHERIT 跟随主题；OFF 明确无替代按钮；无静默宿主。":
      "INHERIT follows the theme; OFF means no replacement button; no silent host.",
    "自定义后台控制台 · 决策完成 P2":
      "Customization back-office console · Decision-complete P2",
    "选择主题 → 载入主题默认值 → 选择页面 → 选择物件 → 调整 → 预览 → 即时检查 → 查看差异 → 储存至本站 Live 或取消":
      "Select theme → Load theme defaults → Select page → Select object → Adjust → Preview → Live check → View diff → Save to this site Live or cancel",
    "规划原型 · 合成数据 · 不写入租户 / 后端 / 配置 / 生产数据":
      "Planning prototype · Synthetic data · Does not write tenant / backend / config / production data",
    "证据分层：User-confirmed / Live-observed 优先于 Prototype-only；标识符与存储行为 = Recommendation / Open":
      "Evidence layers: User-confirmed / Live-observed over Prototype-only; identifiers and storage behavior = Recommendation / Open",
    "当前非现网后台，亦非 Current API/schema":
      "This is not the live back-office, nor the Current API/schema",
    保存本地示例: "Save and update this site Live",
    "储存至本站 Live 或取消": "Save to this site Live or cancel",
    即时检查: "Live check",
    介面语言: "UI language",
    合成租户: "Synthetic tenant",
    示范场景: "Demo scenario",
    选择示范场景: "Select demo scenario",
    长文案测试: "Long-copy test",
    "页面 / 物件": "Page / object",
    仅同主题物件: "Same-theme objects only",
    仅已修改: "Modified only",
    仅不兼容: "Incompatible only",
    仅必填: "Required only",
    需关注: "Needs attention",
    预览: "Preview",
    即时检查结果: "Live-check results",
    运行检查: "Run check",
    查看差异: "View diff",
    取消: "Cancel",
    重置物件: "Reset object",
    重置页面: "Reset page",
    重置全部: "Reset all",
    登入后: "Logged-in",
    来源主题: "Source theme",
    覆盖模式: "Override mode",
    请求值: "Requested value",
    解析值: "Resolved value",
    继承默认: "Inherit default",
    证据: "Evidence",
    风险: "Risk",
    依赖: "Dependencies",
    回退: "Fallback",
    玩家效果: "Player effect",
    必填: "Required",
    默认: "Default",
    支持: "Support",
    值: "Value",
    主题默认: "Theme default",
    混合主题演示: "Mixed-theme demo",
    承载能力: "Hosted capability",
    认证范围: "Auth scope",
    既有槽位: "Existing slots",
    请选择槽位: "Select a slot",
    请选择已声明能力: "Select a declared capability",
    上移: "Move up",
    下移: "Move down",
    "载入主题默认（此状态）": "Load theme defaults (this state)",
    "预览 Axure钱包我的": "Preview Axure Wallet/Me",
    视口: "Viewport",
    认证: "Auth",
    玩家页: "Player page",
    内容态: "Content state",
    "上游能力状态（模拟）": "Upstream capability status (simulated)",
    全部启用: "All enabled",
    未启用: "Not enabled",
    租户已启用: "Tenant enabled",
    租户未启用: "Tenant not enabled",
    受保护能力可达性: "Protected-capability reachability",
    可达: "Reachable",
    缺失: "Missing",
    上游未启用: "Upstream not enabled",
    差异审阅: "Diff review",
    "物件 / 模式": "Object / mode",
    请求: "Request",
    继承: "Inherit",
    解析: "Resolve",
    "来源 / 影响": "Source / impact",
    "结果 / 理由": "Result / reason",
    影响: "Impact",
    "校验 / 兼容性": "Validation / compatibility",
    可套用: "Applicable",
    不可套用: "Not applicable",
    确认: "Confirm",
    返回: "Back",
    "NGSS管理系统": "NGSS Admin System",
    "会员管理": "Member Management",
    "彩票管理": "Lottery Management",
    "报表统计": "Reports & Statistics",
    "考勤管理": "Attendance Management",
    "运营管理": "Operations Management",
    "APP安装引导管理": "App Install Guide Management",
    "域名管理": "Domain Management",
    "安卓马甲包管理": "Android Shell Package Management",
    "仿应用商店模板管理": "Store Template Management",
    "推广渠道管理": "Affiliate Channel Management",
    "Affiliate渠道管理": "Affiliate Channel Management",
    "个性化改版": "Customization Studio",
    "归因埋点管理": "Attribution & Tracking",
    "游戏管理": "Game Management",
    "代理管理": "Agent Management",
    "优惠管理": "Promotion Management",
    "财务管理": "Finance Management",
    "风控管理": "Risk Management",
    "信息管理": "Information Management",
    "系统管理": "System Management",
    "站点管理员": "Site Admin",
    "开发工具箱": "Developer Toolbox",
    "收起后台导航": "Collapse sidebar",
    "展开后台导航": "Expand sidebar",
    "后台导航": "Backoffice Navigation",
    "跳到设置": "Skip to settings",
    "面包屑": "Breadcrumb",
    本站设定尚未储存: "This site’s settings are not saved",
    主题修改尚未储存: "Theme changes are not saved",
    取消未储存修改: "Discard unsaved changes",
    保存本地示例: "Update this site Live now",
    "切换合成租户不会共用任何设定。当前站点未储存的修改会留在其页面内存中，不会写入另一站点。":
      "Switching synthetic tenant does not share any settings. Unsaved changes on the current site stay in that page’s memory and are not written to another site.",
    "切换主题将载入新主题默认，并保留现有明确指定／关闭值重新检查；导航不会被静默截断或补位。":
      "Switching theme loads the new theme defaults and re-checks existing explicit SET/OFF values; navigation is not silently truncated or padded.",
    "恢复此租户上次保存的本地示例，包括颜色、样式与玩家可选范围。":
      "Restores the current synthetic tenant site’s present Live settings.",
    "保存当前租户的主题、颜色、样式与玩家可选范围，仅保留于此页面会话。不会连接或更新正式站点。":
      "After checks pass, this overwrites the current synthetic tenant site Live. The prototype does not keep history and cannot roll back; confirm the diff first.",
    "已保存本地示例。刷新页面会重置；请导出配置留存。":
      "Saved and updated the current synthetic tenant site Live; the prototype does not keep history or rollback versions.",
    "储存期间设定或检查条件已改变；本站 Live 未更新，请重新检查。":
      "Settings or check conditions changed during save; this site’s Live was not updated. Re-run checks.",
    "已恢复上次保存的本地示例。":
      "Unsaved changes discarded; this site’s Live is unchanged.",
    侧边栏宿主冲突: "Sidebar host conflict",
    简洁顶栏快捷: "Compact top-bar shortcuts",
    取款不可达: "Withdrawal unreachable",
    "VIP 不可达": "VIP unreachable",
    安装入口: "Install entry",
    跨主题: "Cross-theme",
    弹窗回退: "Modal fallback",
    搜索无回退: "Search has no fallback",
    响应式顶栏: "Responsive top bar",
    替代按钮缺少能力: "Alt button missing capability",
    替代按钮顶栏冲突: "Alt button top-bar conflict",
    替代按钮置换导航: "Alt button replaces navigation",
    不隐式当作客服: "Do not implicitly treat as CS",
    未启用能力新指定: "New SET on disabled capability",
    "本站 Live 覆盖未生效": "This-site Live override not applied",
    换主题槽数不符: "Theme switch slot count mismatch",
    无效工作值: "Invalid working value",
    登入前无余额: "No balance before login",
    中文: "Chinese",
    英文: "English",
    场景: "Scenario",
    结果: "Result",
    详情: "Details",
    通过: "Pass",
    失败: "Fail",
    允许: "Allow",
    警告: "Warn",
    自动解析: "Auto-resolve",
    复核: "Review",
    阻挡: "Block",
    未保存修改: "Unsaved changes",
    干净: "Clean",
    仅页面内存: "Page memory only",
    草稿: "Draft",
    已套用: "Applied",
    过期预览: "Stale preview",
    模拟: "Simulation",
    唯读: "Read-only",
    派生: "DERIVED",
    同主题优先: "Same-theme first",
    不兼容: "Incompatible",
    响应式: "Responsive",
    全部长文案: "All long copy",
    徽章: "Badge",
    导航: "Navigation",
    表单标签: "Form labels",
    标题: "Title",
    "目标／仅原型": "Target / Prototype-only",
    仅原型: "Prototype-only",
    使用者确认: "User-confirmed",
    现场观察: "Live-observed",
    建议: "Recommendation",
    "现行介面／资料结构": "Current UI / data structure",
    待确认: "Open",
    指定: "SET",
    设计检查: "Design check",
    正式站点: "Production site",
    应用程式下载: "App download",
    应用程式: "App",
    "深层连结／提示讯息": "Deep link / toast",
    提示讯息: "Toast",
    测试情境: "Test scenario",
    桌面: "Desktop",
    认证状态: "Auth state",
    介面框架: "UI chrome",
    一般: "Default",
    空白: "Empty",
    载入中: "Loading",
    错误: "Error",
    长内容: "Long content",
    "合成租户 A": "Synthetic tenant A",
    "初始 Live NG 默认（合成）": "Initial Live NG defaults (synthetic)",
    "底部导航/": "Bottom nav/",
    "替代按钮/浮动收折": "Alt button/floating collapse",
    "替代按钮/顶部状态列": "Alt button/top status bar",
    "快捷按钮/取款": "Shortcut/withdrawal",
    "底部导航/钱包": "Bottom nav/wallet",
    "底部导航/账户": "Bottom nav/account",
    "替代按钮/取款": "Alt button/withdrawal",
    "快捷按钮/充值": "Shortcut/deposit",
    "替代按钮/充值": "Alt button/deposit",
    "底部导航/VIP": "Bottom nav/VIP",
    "替代按钮/VIP 页入口": "Alt button/VIP page entry",
    "个人中心 VIP 卡片/徽章": "Account VIP card/badge",
    "应用入口/首页": "App entry/home",
    "首页游戏排版:": "Home GAME layout:",
    "搜索/分页:": "Search/pagination:",
    "顶部状态列/简洁登入入口": "Top status bar/compact login entry",
    "顶部状态列/": "Top status bar/",
    "顶部状态列/语言": "Top status bar/language",
    "账户/钱包": "Account/wallet",
    "底部导航/账户或我的": "Bottom nav/account or mine",
    "替代按钮/个人中心": "Alt button/account center",
    "替代按钮/设置": "Alt button/settings",
    "个人中心/设置": "Account center/settings",
    "替代按钮/站内信": "Alt button/inbox",
    "个人中心/站内信": "Account center/inbox",
    "替代按钮/用户验证": "Alt button/user verification",
    "个人中心/用户验证": "Account center/user verification",
    "底部导航/活动": "Bottom nav/promos",
    "替代按钮/App download": "Alt button/App download",
    租户未开启安装: "Tenant has not enabled install",
    "上游能力未启用；Customize 不创建入口":
      "Upstream capability is off; Customize does not create an entry",
    "Prototype-only/Open：不支持状态仅为示范情景，不是已证实主题事实。":
      "Prototype-only/Open: unsupported state is a demo scenario only, not a confirmed theme fact.",
    "派生自顶部下载栏；不接受独立租户覆盖或 OFF。":
      "DERIVED from the top download bar; independent tenant override or OFF is not accepted.",
    "旧式 SET=关闭 已按 User-confirmed 规则规范化为 OFF。":
      "Legacy SET=Off has been normalized to OFF per User-confirmed rules.",
    "必填物件不可 OFF。": "Required objects cannot be OFF.",
    "；请求=": "; request=",
    "，解析=": ", resolve=",
    "Prototype-only/Open 情景：": "Prototype-only/Open scenario:",
    "所选主题不支持「": "The selected theme does not support “",
    "」且无声明安全回退。": "” and has no declared safe fallback.",
    "支持/默认值 Open，未当作现网事实。":
      "Support/default is Open; not treated as live-site fact.",
    "所选主题尚无明确支持声明：可继续预览，但不能储存租户指定值；请先补齐主题支持声明。":
      "The selected theme has no explicit support statement: preview may continue, but tenant SET values cannot be saved until the theme support statement is completed.",
    "跨主题物件 ": "Cross-theme object ",
    "）。同主题优先。": "). Same-theme first.",
    "上游能力「": 'Upstream capability "',
    "」未启用；本物件不在玩家端生效，Customize 不会启用该能力。":
      '" is not enabled; this object is not live on the player site, and Customize will not enable the capability.',
    "本站 Live 既有覆盖目前不生效；能力重新启用前必须重新检查，不会自动恢复。":
      "This site's existing Live override is currently inactive; re-check before re-enabling the capability—it will not restore automatically.",
    "不可为上游未启用能力建立新的 SET。":
      "Cannot create a new SET for an upstream-disabled capability.",
    "SET 但值为空，草稿无效。": "SET with an empty value; draft is invalid.",
    全预览: "Full preview",
    "底部导航必须填满所选主题声明的 ": "Bottom nav must fill all ",
    " 个槽位；不允许 OFF 或空槽。":
      " slots declared by the selected theme; OFF or empty slots are not allowed.",
    "底部导航槽位不可重复。": "Bottom-nav slots must not duplicate.",
    "SET 必须明确选择承载位置、已声明能力与认证范围；不得使用 未指定 或隐式 客服。":
      "SET must explicitly choose host slot, a declared capability, and auth scope; unspecified or implicit CS is not allowed.",
    "不可为上游未启用能力「":
      'Cannot create a new replacement-button SET for upstream-disabled capability "',
    "」建立新的替代按钮 SET。": '".',
    "顶部状态列为 简洁，无法承载替代按钮。":
      "Top status bar is Compact and cannot host a replacement button.",
    "必须明确选择一个既有底部导航槽位；不得新增或留空。":
      "Must explicitly choose an existing bottom-nav slot; do not add slots or leave empty.",
    "将以「": "Will replace slot ",
    "」置换第 ": ' with "',
    " 槽「": ' slot "',
    "」；槽位总数不变，并须复核受保护能力可达性。":
      '"; slot count stays the same, and protected-capability reachability must be reviewed.',
    "替代按钮与快捷按钮都使用 浮动收折，需检查堆叠与遮挡。":
      "Replacement button and shortcut both use floating collapse; check stacking and occlusion.",
    "全部适用认证状态 / 320·375·390·480":
      "All applicable auth states / 320·375·390·480",
    "快捷按钮 = 侧边栏内 且 侧边栏 = 关闭。":
      "Shortcut = inside sidebar AND sidebar = closed.",
    "首页 / 全部 auth": "Home / all auth",
    "顶部状态列（": "Top status bar (",
    "）= 简洁 与 快捷按钮 = 状态列按钮 冲突。":
      ") = Compact conflicts with shortcut = status-bar button.",
    "登入後简洁顶栏且取款快捷隐藏，又无替代取款宿主。":
      "Logged-in Compact top bar with withdraw shortcut hidden and no alternate withdraw host.",
    "隐藏VIP资讯 且": "Hide VIP info AND",
    "移除 VIP 槽位；账户/我的不是已声明的 VIP 替代宿主。":
      "VIP slot removed; Account/Mine is not a declared VIP replacement host.",
    "App 安装能力可用时，顶部下载栏为 OFF；派生 下载FAB 同步 OFF，安装入口不可达。":
      "When App install is available, top download bar is OFF; derived Download FAB is also OFF, so the install entry is unreachable.",
    "Axure钱包我的 只允许登入後五槽 Prototype-only 预览，不允许用于登入前。":
      "Axure Wallet Mine allows logged-in five-slot Prototype-only preview only; not for logged-out.",
    "Axure钱包我的 为登入後五槽 Prototype-only：推广由第 3 槽移至第 5 槽、VIP 被移除、账户改为我的；不得静默变更。":
      "Axure Wallet Mine is logged-in five-slot Prototype-only: Promo moves from slot 3 to slot 5, VIP is removed, Account becomes Mine; no silent change.",
    "客服槽位由操作者显式选择，未自动注入。":
      "CS slot is explicitly chosen by the operator; not auto-injected.",
    "受保护能力「": 'Protected capability "',
    "」在": '" has',
    "无可见可操作表面（深链/toast 不计）。":
      "no visible actionable surface in (deep links/toasts do not count).",
    "登入前预览禁止展示钱包余额；仅占位符。":
      "Logged-out preview must not show wallet balance; placeholders only.",
    隐私: "Privacy",
    "工作值已过期：预期版本 ": "Working values are stale: expected version ",
    " 与本站 Live 版本 ": " does not match this site's Live version ",
    " 不一致。": ".",
    储存: "Save",
    "当前模拟 Live 设定无效，玩家端使用最后可用设定。":
      "Current simulated Live config is invalid; the player site uses last-known-good.",
    玩家端: "Player site",
    "预览已过期：必须刷新后再储存。":
      "Preview is stale: refresh before saving.",
    "草稿含未知物件，保留 last-known-good。":
      "Draft contains unknown objects; keep last-known-good.",
    "自动解析需明确确认，禁止静默。":
      "Auto-resolve requires explicit confirmation; no silent apply.",
    "复核项目需明确确认后方可储存。":
      "Review items require explicit confirmation before save.",
    '<p class="tiny">无匹配物件</p>': '<p class="tiny">No matching objects</p>',
    '<div class="open-box"><strong>唯读派生物件</strong><p class="tiny">下载FAB 跟随顶部下载栏：顶部下载栏开启时同步开启；顶部下载栏 OFF 时同步 OFF。此处没有独立 SET、OFF 或租户覆盖。</p></div>':
      '<div class="open-box"><strong>Read-only derived object</strong><p class="tiny">Download FAB follows the top download bar: on when the bar is on; OFF when the bar is OFF. No independent SET, OFF, or tenant override here.</p></div>',
    " 槽（数量跟随主题）</h3>": " slots (count follows theme)</h3>",
    ">上移</button>": ">Move up</button>",
    ">下移</button></div>": ">Move down</button></div>",
    ">载入主题默认（此状态）</button>":
      ">Load theme defaults (this state)</button>",
    ">预览 Axure钱包我的</button></div></div>":
      ">Preview Axure Wallet Mine</button></div></div>",
    '<p class="warn-box tiny">登入前 / 登入後分开设置；两边都必须填满主题声明槽数，不提供关闭或空槽。NG 五槽组合有现场观察证据；WG=4 / GAME=3 是已批准的合成测试情境，并非现网事实，正式声明支援前不可储存。Axure钱包我的 仅登入後五槽可预览，固定复核；客服不会被自动注入。</p>':
      '<p class="warn-box tiny">Logged-out and logged-in are configured separately; both must fill the theme-declared slot count—no OFF or empty slots. NG five-slot mix has live-observed evidence; WG=4 / GAME=3 are approved synthetic test cases, not live facts—do not save until formally declared. Axure Wallet Mine is logged-in five-slot preview only, always Review; CS is not auto-injected.</p>',
    '<label class="field">承载能力（必选；不会默认为客服）<select data-action="alt-capability"><option value="">（请选择已声明能力）</option>':
      '<label class="field">Hosted capability (required; does not default to CS)<select data-action="alt-capability"><option value="">(Select a declared capability)</option>',
    '</select></label><label class="field">认证范围<select data-action="alt-auth"><option value="both"':
      '</select></label><label class="field">Auth scope<select data-action="alt-auth"><option value="both"',
    '>登入前 + 登入後</option><option value="loggedOut"':
      '>Logged-out + logged-in</option><option value="loggedOut"',
    '>登入前</option><option value="loggedIn"':
      '>Logged-out</option><option value="loggedIn"',
    ">登入後</option></select></label>": ">Logged-in</option></select></label>",
    '既有槽位（置换、不增槽）<select data-action="alt-slot" data-auth="':
      'Existing slot (replace, do not add)<select data-action="alt-slot" data-auth="',
    '"><option value="">（请选择槽位）</option>':
      '"><option value="">(Select a slot)</option>',
    '<p class="tiny">INHERIT 跟随主题声明；OFF 明确不显示替代按钮。SET 才需要选择能力、认证范围与宿主。</p>':
      '<p class="tiny">INHERIT follows the theme declaration; OFF explicitly hides the replacement button. SET requires choosing capability, auth scope, and host.</p>',
    " · 必填": " · required",
    '<div class="panel"><h3>覆盖模式</h3><div class="mode-row">':
      '<div class="panel"><h3>Override mode</h3><div class="mode-row">',
    "关闭（OFF）": "Off (OFF)",
    '</div><p class="tiny">INHERIT=跟随主题默认；SET=租户值；关闭=OFF。重置回到 INHERIT。DERIVED=由上游物件唯读派生。</p></div>':
      '</div><p class="tiny">INHERIT=follow theme default; SET=tenant value; closed=OFF. Reset returns to INHERIT. DERIVED=read-only from an upstream object.</p></div>',
    '<div class="panel"><h3>選項</h3>': '<div class="panel"><h3>Value</h3>',
    '<div class="panel"><h3>来源主题（混合主题演示）</h3><div class="mode-row">':
      '<div class="panel"><h3>Source theme (mixed-theme demo)</h3><div class="mode-row">',
    '<p class="tiny">同主题优先。跨主题：R0/R1=Warn，R2=Review；无安全回退=Block。</p></div></div>':
      '<p class="tiny">Same-theme first. Cross-theme: R0/R1=Warn, R2=Review; no safe fallback=Block.</p></div></div>',
    '<div class="panel"><h3>证据 / 风险 / 依赖 / 回退 / 玩家效果</h3><div class="kv">':
      '<div class="panel"><h3>Evidence / risk / dependencies / fallback / player effect</h3><div class="kv">',
    "<div>默认</div><div>": "<div>Default</div><div>",
    "<div>支持</div><div>NG=": "<div>Support</div><div>NG=",
    "<div>请求值</div><div>": "<div>Requested value</div><div>",
    "<div>解析值</div><div>": "<div>Resolved value</div><div>",
    "<div>证据</div><div>": "<div>Evidence</div><div>",
    "<div>风险</div><div>": "<div>Risk</div><div>",
    "<div>依赖</div><div>": "<div>Dependencies</div><div>",
    "<div>回退</div><div>": "<div>Fallback</div><div>",
    "<div>玩家效果</div><div>": "<div>Player effect</div><div>",
    "> 我确认自动解析（请求值与解析值均已看见，禁止静默）</label>":
      "> I confirm Auto-resolve (requested and resolved values were both seen; no silent apply)</label>",
    "> 我确认复核风险并允许储存</label>":
      "> I confirm Review risks and allow save</label>",
    '<div class="player-body is-loading"><button class="btn is-loading" disabled>载入中</button></div>':
      '<div class="player-body is-loading"><button class="btn is-loading" disabled>Loading</button></div>',
    '<div class="player-body"><div class="card block-box">合成错误态 · 请重试（无真实请求）</div></div>':
      '<div class="player-body"><div class="card block-box">Synthetic error · retry (no real request)</div></div>',
    '<div class="player-body"><div class="card">空态：暂无合成内容</div></div>':
      '<div class="player-body"><div class="card">Empty: no synthetic content yet</div></div>',
    最近: "Recent",
    收藏: "Favorites",
    厂商: "Providers",
    廠商: "Providers",
    " / 超长分类名称示例文本": " / extra-long category name sample",
    '<div class="card tiny">搜索/分页模式：':
      '<div class="card tiny">Search/pagination mode:',
    " · 证据 Open/Prototype-only</div>":
      " · evidence Open/Prototype-only</div>",
    活动列表: "Promo list",
    活動列表: "Promo list",
    活动入口超长文案: "Promo entry extra-long copy",
    '<div class="card">推广（Live 宿主）。Axure 预览可能置换此槽。</div>':
      '<div class="card">Promo (Live host). Axure preview may replace this slot.</div>',
    '<div class="card">VIP 页 · ': '<div class="card">VIP page · ',
    " · 卡片隐藏但仍须可达": " · card hidden but still must be reachable",
    '<div class="card open-box">VIP 上游能力未启用；Customize 不显示或启用入口。</div>':
      '<div class="card open-box">VIP upstream capability is not enabled; Customize will not show or enable the entry.</div>',
    '<div class="card">个人中心<br>': '<div class="card">Account center<br>',
    "VIP 资讯隐藏": "VIP info hidden",
    "<br>站内信：": "<br>Inbox:",
    "（不可删除）<br>": "(cannot delete)<br>",
    "用户验证：": "User verification:",
    "（非 KYC）": "(not KYC)",
    "用户验证：上游未启用": "User verification: upstream not enabled",
    '<div class="card">纪录顯示：': '<div class="card">Records display:',
    "<br>余额：": "<br>Balance:",
    登入前不展示: "Hidden when logged out",
    '<div class="card open-box">钱包/纪录上游能力未启用。</div>':
      '<div class="card open-box">Wallet/records upstream capability is not enabled.</div>',
    '<div class="card">充值页版式：': '<div class="card">Deposit page layout:',
    " · 额度自动输入：": " · amount auto-fill:",
    "带入上游建议值；玩家可修改；不会自动提交。":
      "Prefill upstream suggested amount; player can edit; never auto-submit.",
    "保留手动输入框，不提供额外辅助。":
      "Keep the manual amount field; no extra helpers.",
    "显示可选额度按钮，仍可手动输入。":
      "Show optional amount chips; manual input still allowed.",
    "<br>仅呈现，不改变限额、资格、费率或账务</div>":
      "<br>Presentation only; does not change limits, eligibility, fees, or ledger</div>",
    '<div class="card open-box">充值上游能力未启用；Customize 不提供新 SET。</div>':
      '<div class="card open-box">Deposit upstream capability is not enabled; Customize will not offer a new SET.</div>',
    '<div class="card">提款（资格/结算不变）<br>余额：':
      '<div class="card">Withdraw (eligibility/settlement unchanged)<br>Balance:',
    隐藏: "Hidden",
    " · 无删除按钮</div>": " · no delete button</div>",
    '<div class="card open-box">站内信上游能力未启用。</div>':
      '<div class="card open-box">Inbox upstream capability is not enabled.</div>',
    '<div class="card">语言 / 设置</div>':
      '<div class="card">Language / Settings</div>',
    '<div class="card">客服表面（非 toast）</div>':
      '<div class="card">Support surface (not toast)</div>',
    "超长内容 ": "Extra-long content ",
    '<button type="button" class="fab">充值</button><button type="button" class="fab">取款</button><button type="button" class="fab">客服</button>':
      '<button type="button" class="fab">Deposit</button><button type="button" class="fab">Withdraw</button><button type="button" class="fab">Support</button>',
    '<button type="button" class="fab">下载</button>':
      '<button type="button" class="fab">Download</button>',
    '<h2>预览</h2><div class="grid-2">': '<h2>Preview</h2><div class="grid-2">',
    '<label class="field">视口<select id="vp-select">':
      '<label class="field">Viewport<select id="vp-select">',
    '<label class="field">认证<select id="auth-select"><option value="loggedOut"':
      '<label class="field">Auth<select id="auth-select"><option value="loggedOut"',
    '<label class="field">玩家页<select id="page-select">':
      '<label class="field">Player page<select id="page-select">',
    '<label class="field">内容态<select id="content-select">':
      '<label class="field">Content state<select id="content-select">',
    '<label class="field">App 安装能力（模拟）<select id="install-select"><option value="on"':
      '<label class="field">App install capability (simulated)<select id="install-select"><option value="on"',
    '>租户已启用</option><option value="off"':
      '>Tenant enabled</option><option value="off"',
    ">租户未启用</option></select></label>":
      ">Tenant not enabled</option></select></label>",
    '<label class="field">上游能力状态（模拟）<select id="capability-select"><option value="">全部启用</option>':
      '<label class="field">Upstream capability status (simulated)<select id="capability-select"><option value="">All enabled</option>',
    "未启用</option>": "Not enabled</option>",
    '<p class="tiny">“应用程式安装能力（模拟）”只控制预览与可达性检查：下载浮动按钮跟随顶部下载栏；能力启用时将该组合关闭会阻挡储存。它不会修改真实租户能力。</p>':
      '<p class="tiny">“App install capability (simulated)” only controls preview and reachability checks: the download FAB follows the top download bar; turning this combo off while the capability is enabled blocks save. It does not change real tenant capabilities.</p>',
    '<p class="tiny">主题 ': '<p class="tiny">Theme ',
    " · 草稿 v": " · Draft v",
    " · <strong>过期预览</strong>": " · <strong>Stale preview</strong>",
    "下载 App": "Download App",
    "下載 App": "Download App",
    立即下载应用程序安装包: "Download the app install package now",
    首頁: "Home",
    首页主导航超长: "Extra-long home primary nav",
    " · 充值/取款/客服": " · Deposit/Withdraw/Support",
    "登入/注册": "Login/Register",
    "登入/註冊": "Login/Register",
    登入或注册超长按钮文案: "Extra-long login or register button copy",
    '"><div class="tiny" style="padding:8px">侧边栏 ':
      '"><div class="tiny" style="padding:8px">Sidebar ',
    "<br>快捷：充值/取款/客服": "<br>Shortcuts: Deposit/Withdraw/Support",
    账: "Acct",
    賬: "Acct",
    活動: "Promo",
    户: "ount",
    戶: "ount",
    '<div class="panel"><h3>受保护能力可达性</h3><div class="reach">':
      '<div class="panel"><h3>Protected capability reachability</h3><div class="reach">',
    "> 确认 ": "> Confirm ",
    可储存: "Can save",
    无法储存: "Cannot save",
    "<h2>校验 / 兼容性</h2>": "<h2>Validation / Compatibility</h2>",
    "</strong> · 请求 ": "</strong> · Request ",
    " → 解析 ": " → Parse ",
    " <span class='tiny'>影响：": " <span class='tiny'>Impact: ",
    '<button type="button" class="btn" data-action="simulate-stale">模拟过期草稿</button>':
      '<button type="button" class="btn" data-action="simulate-stale">Simulate stale draft</button>',
    '<button type="button" class="btn" data-action="simulate-stale-preview">模拟过期预览</button>':
      '<button type="button" class="btn" data-action="simulate-stale-preview">Simulate stale preview</button>',
    '<button type="button" class="btn" data-action="simulate-invalid">模拟失效已套用配置</button>':
      '<button type="button" class="btn" data-action="simulate-invalid">Simulate invalid applied config</button>',
    '<button type="button" class="btn" data-action="clear-sim">清除模拟</button></div>':
      '<button type="button" class="btn" data-action="clear-sim">Clear simulation</button></div>',
    '<p class="tiny">呈现不改变权限、资格、钱包账本、充提结算、VIP 计算、验证或通知投递。Deep link / toast 不能作为唯一表面。</p>':
      '<p class="tiny">Presentation does not change permissions, eligibility, wallet ledger, deposit/withdraw settlement, VIP calculation, verification, or notification delivery. Deep link / toast cannot be the only surface.</p>',
    " · 工作值 ": " · Working values ",
    " · 本站 Live 版本 ": " · This-site Live version ",
    " · 预期版本 ": " · Expected version ",
    " · 未储存修改": " · Unsaved changes",
    " · 已同步": " · Synced",
    " · 仅页面内存测试情境": " · In-page memory test scenario only",
    "</td><td>来源主题：": "</td><td>Source theme: ",
    " / 登入前+登入后 / 320·375·390·480·desktop</div></td><td>":
      " / pre-login+post-login / 320·375·390·480·desktop</div></td><td>",
    '</tbody></table><button type="button" class="btn" data-action="close-drawers">关闭</button></div>':
      '</tbody></table><button type="button" class="btn" data-action="close-drawers">Close</button></div>',
    "1. NG 默认（合成示例）": "1. NG production defaults",
    "2. 侧边栏宿主冲突": "2. Sidebar host conflict",
    "3. 简洁顶栏快捷入口冲突": "3. Compact top-bar shortcut conflict",
    "4. 取款可达性": "4. Withdraw reachability",
    "5. VIP 可达性": "5. VIP reachability",
    "6. 安装入口可达性": "6. Install-entry reachability",
    "7. 跨主题 R0 警告": "7. Cross-theme R0 warning",
    "8. 跨主题 R2 复核": "8. Cross-theme R2 review",
    "9. 不支援但有安全自动解析": "9. Unsupported with safe auto-resolve",
    "10. 不支援且不安全时阻挡": "10. Unsupported and unsafe: block",
    "11. 登入前余额隐私": "11. Pre-login balance privacy",
    "12. 响应式顶栏设计检查": "12. Responsive top-bar design check",
    "13. 取消恢复本地示例": "13. Cancel restores this-site production settings",
    "14. 过期工作值阻挡储存": "14. Stale working values block save",
    "15. 保存更新当前租户的本地示例":
      "15. Valid save updates this-site production settings directly",
    "16. 替代按钮没有未指定选项":
      "16. Alternate buttons have no unspecified option",
    "17. 替代按钮指定值必须完整":
      "17. Alternate-button assigned values must be complete",
    "18. 替代按钮顶栏位置遵守认证状态":
      "18. Alternate-button top-bar placement respects auth state",
    "19. 替代导航置换保持数量并要求复核":
      "19. Alternate nav swap keeps slot count and requires review",
    "20. 替代按钮不会隐式指定客服":
      "20. Alternate buttons do not implicitly assign Support",
    "21. 确认绑定解析器内容": "21. Confirm bound parser content",
    "22. 未启用能力拒绝新指定值":
      "22. Disabled capability rejects new assigned values",
    "23. 本站既有覆盖在能力未启用时保持不生效并要求复核":
      "23. Existing this-site overrides stay inert when capability is off and require review",
    "24. 换主题不会静默调整导航槽数":
      "24. Changing theme does not silently change nav slot count",
    "25. 无效工作值阻挡且保持最后可用设定":
      "25. Invalid working values block save and keep last-known-good settings",
    "26. 合成租户站点状态完全隔离":
      "26. Synthetic tenant site state is fully isolated",
    "27. 取消恢复上次保存的本地示例":
      "27. Cancel restores this-site production settings",
    "28. 所有语意物件识别码使用英文点分小驼峰格式":
      "28. All semantic object IDs use English dotted camelCase",
    "29. 语言切换保留未储存设定": "29. Language switch keeps unsaved settings",
    未指定: "Unspecified",
    '<div class="drawer-panel"><h2 id="checks-title">运行检查</h2><table><thead><tr><th>#</th><th>场景</th><th>结果</th><th>详情</th></tr></thead><tbody>':
      '<div class="drawer-panel"><h2 id="checks-title">Run checks</h2><table><thead><tr><th>#</th><th>Scenario</th><th>Result</th><th>Details</th></tr></thead><tbody>',
    "本站 Live · 主题 ": "This-site Live · Theme ",
    '">确认</button><button type="button" class="btn" data-action="close-drawers">返回</button></div></div>':
      '">Confirm</button><button type="button" class="btn" data-action="close-drawers">Back</button></div></div>',
    "Allow · Live NG 默认": "Allow · Live NG default",
    "Block · 侧边栏宿主冲突": "Block · Sidebar host conflict",
    "Block · 简洁顶栏快捷": "Block · Compact top-bar shortcuts",
    "Block · 取款不可达": "Block · Withdraw unreachable",
    "Block · VIP 不可达": "Block · VIP unreachable",
    "Block · 安装入口": "Block · Install entry",
    "Warn · 跨主题 R0": "Warn · Cross-theme R0",
    "Review · 跨主题 R2": "Review · Cross-theme R2",
    "Auto-resolve · GAME 弹窗回退": "Auto-resolve · GAME popup fallback",
    "Block · GAME 搜索无回退": "Block · GAME search with no fallback",
    "Design QA · 320–480 响应式顶栏": "Design QA · 320–480 responsive top bar",
    "Review · Axure钱包我的": "Review · Axure Wallet / Me",
    "Block · 替代按钮缺少能力": "Block · Alternate button missing capability",
    "Block · 替代按钮顶栏冲突": "Block · Alternate button top-bar conflict",
    "Review · 替代按钮置换导航": "Review · Alternate button swaps nav",
    "Allow · 不隐式当作客服": "Allow · Not treated as Support implicitly",
    "Block · 未启用能力新 SET": "Block · New SET on disabled capability",
    "Review · 本站 Live 覆盖未生效":
      "Review · This-site Live override not in effect",
    "Block · 换主题槽数不符": "Block · Theme change slot-count mismatch",
    "Block · 无效草稿": "Block · Invalid draft",
    "Allow · 登入前无余额": "Allow · No balance pre-login",
    "无效已套用配置已回退 last-known-good（模拟，非现网缓存）。":
      "Invalid applied config rolled back to last-known-good (simulation, not live cache).",
    "合成租户 B": "Synthetic tenant B",
  };

  Object.assign(ZH_TO_EN, {
    "User-confirmed 2026-09-04：游戏排版改为 Figma 对应的样式一至样式五；仅切换中央游戏浏览区，共用首页其他物件。":
      "User-confirmed 2026-09-04: game layout now maps to Figma Styles 1–5; only the central game browser changes while all other home objects are shared.",
    装置尺寸: "Viewport",
    裝置尺寸: "Viewport",
    狀態: "State",
    頁面: "Page",
    App狀態: "App State",
    物件開關: "Object Toggle",
    "🛠️ 开发者 / 模拟控制台": "🛠️ Developer / Simulation Console",
    "开发者 / 模拟控制台": "Developer / Simulation Console",
    "展开 / 收折": "Expand / Collapse",
    "示范场景 (Scene)": "Demonstration Scene (Scene)",
    示范场景: "Demonstration Scene",
    长文案压力测试: "Long-copy stress test",
    "内容狀態 (Content State)": "Content State (Content State)",
    内容狀態: "Content State",
    "App狀態 (App State)": "App State (App State)",
    "物件開關 (Object Toggle)": "Object Toggle (Object Toggle)",
    全部啟用: "All enabled",
    未啟用: "disabled",
    租戶已啟用: "Tenant enabled",
    租戶未啟用: "Tenant disabled",
    預設: "Default",
    載入中: "Loading",
    錯誤: "Error",
    長內容: "Long content",
    跟随主题默认: "Follow theme default",
    已覆盖主题默认: "Theme default overridden",
    "已覆盖主题默认（关闭）": "Theme default overridden (Off)",
    重置回主题默认: "Reset to theme default",
    系统锁定: "System locked",
    "直接选择样式即可覆盖；点击重置回到主题默认。":
      "Select any style below to override; click reset to return to theme default.",
    "直接点选下方样式即可自订覆盖；点选重置清除租户覆盖回到主题默认。":
      "Directly click any style below to customize override; click reset to clear tenant override and return to theme default.",
    点选下方任意样式直接覆盖: "Click any style below to override directly",
    "（点选下方任意样式直接覆盖）":
      "(Click any style below to override directly)",
    "重置 = 回到 INHERIT，清除租户覆盖，绝不静默 OFF。":
      "Reset = return to INHERIT; clear tenant override, never silently set OFF.",
    "同主题优先。跨主题：R0/R1=Warn，R2=Review；无安全回退则阻挡（Block）。":
      "Prefer same-theme objects. Cross-theme: R0/R1 = Warn, R2 = Review; no safe fallback = Block.",
    "首页(登录)-绿黑": "Home (Login) - Green Black",
    状态与覆盖: "Status and Override",
    "来源主题（混合主题演示）": "Source theme (hybrid theme demo)",
    "NGSS3 自定义后台 · P2 决策原型（Target / Prototype-only）":
      "NGSS3 Customization Back Office · P2 Decision Prototype (Target / Prototype-only)",
    跳到物件编辑: "Skip to object editor",
    简体中文: "Simplified Chinese",
    重置: "Reset",
    "重置主题/全部": "Reset theme / all",
    "重置 = 回到 INHERIT，绝不静默 OFF。":
      "Reset = return to INHERIT; never silently set OFF.",
    "INHERIT=跟随主题默认；SET=租户值；关闭=OFF。重置回到 INHERIT。DERIVED=由上游物件唯读派生。":
      "INHERIT = follow the theme default; SET = tenant value; Off = OFF. Reset returns to INHERIT. DERIVED = read-only value derived from an upstream object.",
    "同主题优先。跨主题：R0/R1=Warn，R2=Review；无安全回退=Block。":
      "Prefer same-theme objects. Cross-theme: R0/R1 = Warn, R2 = Review; no safe fallback = Block.",
    "App 安装能力（模拟）": "App install capability (simulated)",
    "“应用程式安装能力（模拟）”只控制预览与可达性检查：下载浮动按钮跟随顶部下载栏；能力启用时将该组合关闭会阻挡储存。它不会修改真实租户能力。":
      "The app install capability (simulated) controls preview and reachability checks only: the download FAB follows the top download bar; turning this combination off while the capability is enabled blocks Save. It does not modify real tenant capabilities.",
    下载: "Download",
    状态与版本模拟: "Status and version simulation",
    模拟过期草稿: "Simulate stale draft",
    模拟过期预览: "Simulate stale preview",
    模拟失效已套用配置: "Simulate invalid applied configuration",
    清除模拟: "Clear simulation",
    "呈现不改变权限、资格、钱包账本、充提结算、VIP 计算、验证或通知投递。Deep link / toast 不能作为唯一表面。":
      "Presentation does not change permissions, eligibility, the wallet ledger, deposit or withdrawal settlement, VIP calculations, verification, or notification delivery. A deep link or toast cannot be the only surface.",
    "同一解析器输出：模式 / 请求值 / 继承默认 / 解析值 / 来源主题 / 页面·认证影响 / 风险 / 证据 / 结果与理由。底部导航逐槽显示。":
      "The same resolver output shows mode / requested value / inherited default / resolved value / source theme / page and authentication impact / risk / evidence / result and reason. Bottom navigation is shown slot by slot.",
    "30. 英文介面没有未翻译可见文字":
      "30. English interface has no untranslated visible text",
    全局: "Global",
    导航: "Navigation",
    其他: "Other",
    轮播样式: "Carousel style",
    通用Banner: "General banner",
    小Banner: "Small banner",
    轮播Banner: "Carousel banner",
    页尾内容: "Footer content",
    个人中心版面: "Personal-center layout",
    登入注册视觉: "Login / register visuals",
    简洁框: "Compact frame",
    插画框: "Illustrated frame",
    品牌标志: "Brand mark",
    "本站品牌标志（固定）": "This-site brand mark (fixed)",
    "本站站名（固定）": "This-site name (fixed)",
    按钮样式: "Button style",
    游戏图标: "Game icon style",
    标准: "Standard",
    极简: "Minimal",
    样式三: "Style 3",
    样式四: "Style 4",
    样式五: "Style 5",
    固定唯读物件: "Fixed read-only object",
    "品牌标志绑定本站，不提供 SET、OFF 或上传。缺少标志时显示本站站名，绝不取用其他站点资产。":
      "The brand mark is bound to this site with no SET, OFF, or upload. If the mark is missing, show this site's name and never use another site's asset.",
    "轮播样式：": "Carousel style: ",
    "登入注册视觉：": "Login / register visuals: ",
    账号: "Account",
    "登入 / 注册": "Login / register",
    "个人中心版面：": "Personal-center layout: ",
    "页尾内容：": "Footer content: ",
    "仅预设版式，不编辑内容": "Preset layout only; content is not editable",
    "按钮样式：": "Button style: ",
    "User-approved Target；选项来自 Axure Prototype-only。仅控制视觉版式。":
      "User-approved Target; options are Axure Prototype-only. Controls visual layout only.",
    "User-approved Target；选项来自 Axure Prototype-only。":
      "User-approved Target; options are Axure Prototype-only.",
    "User-approved Target；选项标签 Recommendation，现网映射 Open。":
      "User-approved Target; option labels are Recommendations and live mapping remains Open.",
    "User-approved Target；选项标签 Recommendation，Figma Prototype-only。":
      "User-approved Target; option labels are Recommendations and Figma Prototype-only.",
    "User-confirmed 2026-08-28：固定唯读，不提供 SET、OFF 或上传。":
      "User-confirmed 2026-08-28: fixed read-only, with no SET, OFF, or upload.",
    "改变首页轮播版式，不改变轮播内容、排序、排程、连结、资格或启用状态。":
      "Changes the home carousel layout without changing its content, order, schedule, links, eligibility, or enablement.",
    "轮播内容与能力均由上游管理；所有提供选项已通过设计端响应式检查。":
      "Carousel content and capability stay upstream; every offered option has passed design-side responsive checks.",
    "User-confirmed 2026-08-28：仅选择页尾预设版式，不直接编辑内容；精确现网名称 Open。":
      "User-confirmed 2026-08-28: select a preset footer layout only; do not edit content directly. Exact live names remain Open.",
    "只改变页尾结构与视觉，不改变文字、HTML、网址、法务/客服内容、路由或业务规则。":
      "Changes footer structure and visuals only; does not change text, HTML, URLs, legal/support content, routing, or business rules.",
    "主题预设与设计系统；内容继续由既有上游来源管理。":
      "Theme presets and the design system; content remains managed by its existing upstream source.",
    "仅可解析至所选主题默认并要求确认。":
      "May resolve only to the selected theme default and requires confirmation.",
    "改变个人中心版面，不移除账户、VIP、站内信、语言、客服、设置或用户验证能力。":
      "Changes the personal-center layout without removing account, VIP, inbox, language, support, settings, or user-verification capabilities.",
    "所有个人中心保护能力必须保持可达。":
      "All protected personal-center capabilities must remain reachable.",
    "只改变登入注册视觉，不改变认证、权限、验证码、验证或恢复规则。":
      "Changes login/register visuals only; does not change authentication, permissions, CAPTCHA, verification, or recovery rules.",
    "登入注册入口、字段、错误、验证与恢复表面必须清晰可用。":
      "Login/register entry, fields, errors, verification, and recovery surfaces must remain clear and usable.",
    "显示本站品牌标志；缺少资产时仅回退本站站名，绝不取用其他站点资产。":
      "Shows this site's brand mark; if missing, falls back only to this site's name and never another site's asset.",
    "本站品牌绑定与本站站名。": "This-site brand binding and this-site name.",
    "本站站名（固定）。": "This-site name (fixed).",
    "改变按钮视觉，不改变动作、权限、资格或业务状态。":
      "Changes button visuals without changing actions, permissions, eligibility, or business state.",
    "默认、悬停、按下、选中、禁用、载入、错误与阻挡状态由设计系统保证。":
      "Default, hover, pressed, selected, disabled, loading, error, and blocked states are guaranteed by the design system.",
    "改变游戏与最爱图标视觉；收藏与启动能力持续可操作，不改变可玩游戏集合。":
      "Changes game and favorite-icon visuals; favorite and launch capabilities remain operable and the playable game set is unchanged.",
    "游戏标题、启动与收藏表面必须保持可辨识可操作。":
      "Game title, launch, and favorite surfaces must remain identifiable and operable.",
    请求选项: "Requested option",
    不属于: "is not supported by",
    所选: "selected",
    "主题；已解析为该主题默认": "theme; resolved to that theme's default",
    "必须明确确认，禁止静默替换。":
      "Explicit confirmation is required; silent replacement is forbidden.",
    "且没有声明同主题安全默认值。":
      "and no safe same-theme default is declared.",
  });

  Object.assign(ZH_TO_EN, {
    跳到设置: "Skip to settings",
    租户: "Tenant",
    查看修改: "Review changes",
    撤销修改: "Discard changes",
    开发与检查: "Developer tools",
    "导出配置 JSON": "Export configuration JSON",
    "查看 Figma 对照表 ↗": "View Figma source map ↗",
    模拟条件: "Simulation conditions",
    重置当前页面: "Reset current page",
    重置全部外观: "Reset all appearance",
  });
  const EN_TO_ZH = {
    "Target / Prototype-only": "目标／仅原型",
    "Prototype-only": "仅原型",
    "User-confirmed": "使用者确认",
    "Live-observed": "现场观察",
    Recommendation: "建议",
    "Current API/schema": "现行介面／资料结构",
    Open: "待确认",
    "Auto-resolve": "自动解析",
    Allow: "允许",
    Warn: "警告",
    Review: "复核",
    Block: "阻挡",
    DERIVED: "派生",
    INHERIT: "继承",
    SET: "指定",
    OFF: "关闭",
    "upstream inactive": "上游未启用",
    inactive: "未启用",
    "Design QA": "设计检查",
    Live: "正式站点",
    "App download": "应用程式下载",
    App: "应用程式",
    "Deep link / toast": "深层连结／提示讯息",
    toast: "提示讯息",
    fixture: "测试情境",
    desktop: "桌面",
    auth: "认证状态",
    chrome: "介面框架",
    normal: "一般",
    empty: "空白",
    loading: "载入中",
    error: "错误",
    long: "长内容",
    pass: "通过",
    fail: "失败",
  };

  const sourceTextByNode = new WeakMap();
  const sourceAttrsByElement = new WeakMap();

  function buildReplacer(dictionary) {
    const keys = Object.keys(dictionary).sort(function (a, b) {
      return b.length - a.length;
    });
    if (!keys.length) return function (text) { return text; };
    const escaped = keys.map(function (k) {
      return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    const regex = new RegExp(escaped.join("|"), "g");
    const memo = new Map();
    return function (text) {
      if (typeof text !== "string" || !text) return text;
      const cached = memo.get(text);
      if (cached !== undefined) return cached;
      const res = text.replace(regex, function (m) {
        return dictionary[m] !== undefined ? dictionary[m] : m;
      });
      if (memo.size < 3000) memo.set(text, res);
      return res;
    };
  }

  const fastZhToEn = buildReplacer(ZH_TO_EN);
  const fastEnToZh = buildReplacer(EN_TO_ZH);

  function replaceTerms(text, dictionary) {
    if (dictionary === EN_TO_ZH) return fastEnToZh(text);
    if (dictionary === ZH_TO_EN) return fastZhToEn(text);
    return Object.keys(dictionary)
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .reduce(function (value, key) {
        return value.split(key).join(dictionary[key]);
      }, text);
  }

  function localizedText(source) {
    if (state.uiLocale === "zh") return fastEnToZh(source);
    return fastZhToEn(source);
  }

  function localizeInterface() {
    document.documentElement.lang = state.uiLocale === "en" ? "en" : "zh-Hans";
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
          if (parent.closest("[data-studio-localized]")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    let node;
    while ((node = walker.nextNode())) {
      if (!sourceTextByNode.has(node))
        sourceTextByNode.set(node, node.nodeValue);
      const target = localizedText(sourceTextByNode.get(node));
      if (node.nodeValue !== target) {
        node.nodeValue = target;
      }
    }
    document
      .querySelectorAll("[placeholder], [title], [aria-label]")
      .forEach(function (element) {
        if (element.closest("[data-studio-localized]")) return;
        if (!sourceAttrsByElement.has(element)) {
          sourceAttrsByElement.set(element, {
            placeholder: element.getAttribute("placeholder"),
            title: element.getAttribute("title"),
            ariaLabel: element.getAttribute("aria-label"),
          });
        }
        const original = sourceAttrsByElement.get(element);
        if (original.placeholder !== null) {
          const next = localizedText(original.placeholder);
          if (element.getAttribute("placeholder") !== next)
            element.setAttribute("placeholder", next);
        }
        if (original.title !== null) {
          const next = localizedText(original.title);
          if (element.getAttribute("title") !== next)
            element.setAttribute("title", next);
        }
        if (original.ariaLabel !== null) {
          const next = localizedText(original.ariaLabel);
          if (element.getAttribute("aria-label") !== next)
            element.setAttribute("aria-label", next);
        }
      });
  }

  function ensureAlternateSpec() {
    const row = state.draft.alternateButton;
    if (!row.value || typeof row.value !== "object")
      row.value = {
        placement: "",
        target: "",
        authScope: "both",
        navSlot: { loggedOut: "", loggedIn: "" },
      };
    if (!row.value.navSlot) row.value.navSlot = { loggedOut: "", loggedIn: "" };
    return row.value;
  }

  function inheritDraft(theme) {
    const draft = {};
    CATALOG.forEach(function (item) {
      draft[item.id] = {
        mode:
          item.id === "theme"
            ? "SET"
            : item.id === "downloadFAB"
              ? "DERIVED"
              : item.id === "brandMark"
                ? "FIXED"
                : "INHERIT",
        value:
          item.id === "theme" ? theme : clone(THEME_DEFAULTS[theme][item.id]),
        sourceTheme: theme,
        extra:
          item.id === "bottomNav"
            ? { preset: { loggedOut: "theme", loggedIn: "theme" } }
            : {},
      };
      if (item.id === "topStatusBar") {
        draft[item.id].value = clone(
          THEME_DEFAULTS[theme].topStatusBarLoggedOut
            ? {
                loggedOut: THEME_DEFAULTS[theme].topStatusBarLoggedOut,
                loggedIn: THEME_DEFAULTS[theme].topStatusBarLoggedIn,
              }
            : THEME_DEFAULTS[theme].topStatusBar || {
                loggedOut: "基本功能",
                loggedIn: "全部功能",
              },
        );
      }
    });
    draft.theme.value = theme;
    return draft;
  }

  const tenantStores = {};
  const state = {
    tenantId: "tenant-a",
    tenantLabel: "合成租户 A",
    uiLocale: "zh",
    theme: "NG",
    search: "",
    selectedId: "themeColor",
    filters: {
      sameThemeOnly: false,
      modifiedOnly: false,
      incompatible: false,
      required: false,
      needsAttention: false,
    },
    preview: {
      viewport: 390,
      auth: "loggedIn",
      page: "首页",
      content: "normal",
      locale: "zh-Hans",
      installEnabled: true,
      unavailableCapability: "",
      stale: false,
      capturedDraftVersion: 1,
    },
    draft: inheritDraft("NG"),
    published: {
      version: 1,
      theme: "NG",
      objects: inheritDraft("NG"),
      at: "2026-08-27T00:00:00Z",
      tenantId: "tenant-a",
      valid: true,
      label: "初始 Live NG 默认（合成）",
    },
    expectedVersion: 1,
    draftVersion: 1,
    acks: { auto: {}, review: {} },
    ui: {
      loadingApply: false,
      invalidApplied: false,
      fallbackMessage: "",
      lastKnownGood: null,
      confirm: null,
      checks: null,
      unsupportedSim: null,
      supportedSim: null,
    },
  };
  state.ui.lastKnownGood = clone(state.published);

  function switchTheme(theme) {
    const previousDraft = state.draft;
    const previousTheme = state.theme;
    state.theme = theme;
    const nextDraft = inheritDraft(theme);
    if (previousDraft && previousTheme !== theme) {
      CATALOG.forEach(function (item) {
        if (
          item.id === "theme" ||
          item.id === "downloadFAB" ||
          item.id === "brandMark"
        )
          return;
        const previous = previousDraft[item.id];
        if (previous && (previous.mode === "SET" || previous.mode === "OFF"))
          nextDraft[item.id] = clone(previous);
      });
    }
    nextDraft.theme.extra = clone(previousDraft.theme.extra || {});
    state.draft = nextDraft;
    state.draft.theme.value = theme;
    state.acks = { auto: {}, review: {} };
    state.ui.unsupportedSim = null;
    state.ui.supportedSim = null;
  }

  function capabilityAvailable(name) {
    return (
      !state.preview.unavailableCapability ||
      state.preview.unavailableCapability !== name
    );
  }

  const els = {
    tree: document.getElementById("tree"),
    detail: document.getElementById("object-detail"),
    preview: document.getElementById("preview-pane"),
    validation: document.getElementById("validation-pane"),
    uiLanguage: document.getElementById("ui-language-select"),
    tenant: document.getElementById("tenant-select"),
    theme: document.getElementById("theme-select"),
    scene: document.getElementById("scene-select"),
    stress: document.getElementById("stress-select"),
    search: document.getElementById("object-search"),
    filters: document.getElementById("filters"),
    version: document.getElementById("version-line"),
    apply: document.getElementById("apply-btn"),
    diff: document.getElementById("diff-drawer"),
    checks: document.getElementById("checks-drawer"),
    confirm: document.getElementById("confirm-modal"),
  };

  function themeDefaultFor(id, theme) {
    if (id === "downloadFAB") return "跟随顶部下载栏";
    if (id === "topStatusBar") {
      return {
        loggedOut: THEME_DEFAULTS[theme].topStatusBarLoggedOut,
        loggedIn: THEME_DEFAULTS[theme].topStatusBarLoggedIn,
      };
    }
    return clone(THEME_DEFAULTS[theme][id]);
  }

  function requestedValue(id) {
    const row = state.draft[id];
    const item = byId[id];
    if (id === "downloadFAB") {
      const bar = requestedValue("topDownloadBar");
      return {
        disabled: bar.disabled,
        value: bar.disabled ? null : "开启",
        inherited: bar.inherited,
        derived: true,
      };
    }
    if (id === "brandMark")
      return {
        disabled: false,
        value: themeDefaultFor(id, state.theme),
        fixed: true,
      };
    if (row.mode === "OFF" && item.supportsOff)
      return { disabled: true, value: null };
    if (row.mode === "SET" || id === "theme") {
      if (row.value === "关闭" && item.supportsOff)
        return { disabled: true, value: null, legacyClosed: true };
      return { disabled: false, value: clone(row.value) };
    }
    const inherited = themeDefaultFor(id, state.theme);
    return inherited === "关闭"
      ? { disabled: true, value: null, inherited: true }
      : { disabled: false, value: inherited, inherited: true };
  }

  function outcomeRank(name) {
    return (
      { Allow: 0, Warn: 1, "Auto-resolve": 2, Review: 3, Block: 4 }[name] || 0
    );
  }

  function worse(a, b) {
    return outcomeRank(a) >= outcomeRank(b) ? a : b;
  }

  function supportOf(item, theme) {
    return item.prototypeSupport?.[theme] ?? item.support[theme];
  }

  function isCrossTheme(item, row) {
    return (
      item.sourceThemeSelectable &&
      row.sourceTheme &&
      row.sourceTheme !== state.theme &&
      row.mode === "SET"
    );
  }

  function headerFor(auth, values) {
    return auth === "loggedIn"
      ? values.topStatusBar.loggedIn
      : values.topStatusBar.loggedOut;
  }

  function navHas(nav, name) {
    return (nav || []).indexOf(name) !== -1;
  }

  function navFor(values, auth) {
    const nav = values.bottomNav || {};
    return Array.isArray(nav) ? nav : nav[auth] || [];
  }

  function alternateApplies(values, auth) {
    const spec = values.alternateSpec;
    if (
      !spec ||
      values.alternateDisabled ||
      !spec.placement ||
      !spec.target ||
      !(spec.authScope === "both" || spec.authScope === auth)
    )
      return false;
    if (!capabilityAvailable(spec.target)) return false;
    if (spec.placement === "顶部状态列" && headerFor(auth, values) === "简洁")
      return false;
    if (spec.placement === "底部导航自选槽位") {
      const rawIndex = (spec.navSlot || {})[auth];
      const index =
        rawIndex === "" || rawIndex === undefined || rawIndex === null
          ? -1
          : Number(rawIndex);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= navFor(values, auth).length
      )
        return false;
    }
    return true;
  }

  function effectiveNav(values, auth) {
    const nav = navFor(values, auth).slice();
    const spec = values.alternateSpec;
    if (
      alternateApplies(values, auth) &&
      spec.placement === "底部导航自选槽位"
    ) {
      const index = Number((spec.navSlot || {})[auth]);
      if (Number.isInteger(index) && index >= 0 && index < nav.length)
        nav[index] = spec.target;
    }
    return nav;
  }

  function shortcutHosts(values) {
    if (values.shortcutsDisabled) return [];
    if (values.shortcuts === "侧边栏内")
      return values.sidebar !== "关闭" && !values.sidebarDisabled
        ? ["sidebar"]
        : [];
    if (values.shortcuts === "状态列按钮") return ["header"];
    return ["fab"];
  }

  function withdrawalShortcutVisible(values, auth) {
    const hosts = shortcutHosts(values);
    if (!hosts.length) return false;
    if (hosts.indexOf("header") !== -1 && headerFor(auth, values) === "简洁")
      return false;
    return true;
  }

  function csHosts(values, auth) {
    const hosts = [];
    if (
      withdrawalShortcutVisible(values, auth) ||
      (shortcutHosts(values).length &&
        !(
          shortcutHosts(values).indexOf("header") !== -1 &&
          headerFor(auth, values) === "简洁"
        ))
    ) {
      if (shortcutHosts(values).length) {
        if (
          !(
            shortcutHosts(values).indexOf("header") !== -1 &&
            headerFor(auth, values) === "简洁"
          )
        )
          hosts.push("快捷按钮");
      }
    }
    if (values.sidebar !== "关闭" && !values.sidebarDisabled)
      hosts.push("侧边栏");
    if (navHas(effectiveNav(values, auth), "客服"))
      hosts.push("底部导航/" + AUTH[auth]);
    if (
      alternateApplies(values, auth) &&
      values.alternateSpec.target === "客服" &&
      values.alternateSpec.placement === "浮动收折"
    )
      hosts.push("替代按钮/浮动收折");
    if (
      alternateApplies(values, auth) &&
      values.alternateSpec.target === "客服" &&
      values.alternateSpec.placement === "顶部状态列" &&
      headerFor(auth, values) !== "简洁"
    )
      hosts.push("替代按钮/顶部状态列");
    return Array.from(new Set(hosts));
  }

  function flattenValues(resolvedRows) {
    const values = {};
    resolvedRows.forEach(function (row) {
      if (row.id === "topStatusBar") values.topStatusBar = row.resolved;
      else if (row.id === "sidebar") {
        values.sidebar = row.disabled ? "关闭" : row.resolved;
        values.sidebarDisabled = row.disabled;
      } else if (row.id === "shortcuts") {
        values.shortcuts = row.resolved;
        values.shortcutsDisabled = row.disabled;
      } else if (row.id === "alternateButton") {
        values.alternateDisabled = row.disabled;
        values.alternateSpec = row.disabled ? null : row.resolved;
      } else {
        values[row.id] = row.disabled ? null : row.resolved;
      }
    });
    return values;
  }

  function capabilityMap(values, preview) {
    const auth = preview.auth;
    const nav = effectiveNav(values, auth);
    const header = headerFor(auth, values);
    const shortcutOk = withdrawalShortcutVisible(values, auth);
    const altTarget = alternateApplies(values, auth)
      ? values.alternateSpec.target
      : null;
    const hasAccount =
      navHas(nav, "账户") ||
      navHas(nav, "我的") ||
      navHas(nav, "个人中心") ||
      altTarget === "个人中心";
    const hasWallet = navHas(nav, "钱包");
    const hasVip =
      navHas(nav, "VIP") ||
      navHas(nav, "VIP 页入口") ||
      altTarget === "VIP 页入口";
    const hasPromo = navHas(nav, "活动");
    const hasHome = navHas(nav, "首页");
    const hasSettings =
      navHas(nav, "设置") || hasAccount || altTarget === "设置";
    const hasInbox =
      navHas(nav, "站内信") || hasAccount || altTarget === "站内信";
    const hasVerification =
      navHas(nav, "用户验证") || hasAccount || altTarget === "用户验证";
    const topBarOn = values.topDownloadBar === "开启";
    const fabOn = topBarOn && values.downloadFAB === "开启";
    const alternateInstall = altTarget === "App download";
    const installSurface = preview.installEnabled
      ? topBarOn || fabOn || alternateInstall
      : true;
    const withdrawHosts = [];
    if (shortcutOk) withdrawHosts.push("快捷按钮/取款");
    if (hasWallet) withdrawHosts.push("底部导航/钱包");
    if (hasAccount) withdrawHosts.push("底部导航/账户");
    if (navHas(nav, "取款") || altTarget === "取款")
      withdrawHosts.push("替代按钮/取款");
    if (values.sidebar !== "关闭" && !values.sidebarDisabled)
      withdrawHosts.push("侧边栏");
    const depositHosts = withdrawHosts.slice();
    if (shortcutOk) depositHosts.push("快捷按钮/充值");
    if (navHas(nav, "充值") || altTarget === "充值")
      depositHosts.push("替代按钮/充值");
    const vipHosts = [];
    if (navHas(nav, "VIP") || navHas(nav, "VIP 页入口"))
      vipHosts.push("底部导航/VIP");
    if (altTarget === "VIP 页入口" && !navHas(nav, "VIP 页入口"))
      vipHosts.push("替代按钮/VIP 页入口");
    if (hasAccount && values.vipCard !== "隐藏VIP资讯")
      vipHosts.push("个人中心 VIP 卡片/徽章");
    const map = {};
    map["首页"] = { ok: hasHome, surfaces: ["应用入口/首页"] };
    map["游戏浏览/搜索（最近/收藏/厂商）"] = {
      ok: hasHome && !!values.searchPagination,
      surfaces: hasHome
        ? [
            "首页游戏排版:" + values.gameLayout,
            "搜索/分页:" + (values.searchPagination || "Open"),
          ]
        : [],
    };
    map["登入注册"] = {
      ok: header !== "off",
      surfaces:
        header === "简洁"
          ? ["顶部状态列/简洁登入入口"]
          : ["顶部状态列/" + header, hasAccount ? "账户" : ""].filter(Boolean),
    };
    map["语言"] = {
      ok: header === "全部功能" || hasSettings,
      surfaces: [
        header === "全部功能" ? "顶部状态列/语言" : null,
        hasSettings ? "设置" : null,
      ].filter(Boolean),
    };
    map["充值"] = { ok: depositHosts.length > 0, surfaces: depositHosts };
    map["取款"] = { ok: withdrawHosts.length > 0, surfaces: withdrawHosts };
    map["钱包/纪录"] = {
      ok: hasWallet || hasAccount,
      surfaces: [
        hasWallet ? "底部导航/钱包" : null,
        hasAccount ? "账户/钱包" : null,
      ].filter(Boolean),
    };
    map["个人中心"] = {
      ok: hasAccount,
      surfaces: hasAccount
        ? [
            navHas(nav, "账户") ||
            navHas(nav, "我的") ||
            navHas(nav, "个人中心")
              ? "底部导航/账户或我的"
              : "替代按钮/个人中心",
          ]
        : [],
    };
    map["设置"] = {
      ok: hasSettings,
      surfaces: hasSettings
        ? [
            navHas(nav, "设置") || altTarget === "设置"
              ? "替代按钮/设置"
              : "个人中心/设置",
          ]
        : [],
    };
    map["站内信"] = {
      ok: hasInbox,
      surfaces: hasInbox
        ? [
            navHas(nav, "站内信") || altTarget === "站内信"
              ? "替代按钮/站内信"
              : "个人中心/站内信",
          ]
        : [],
    };
    map["用户验证"] = {
      ok: hasVerification,
      surfaces: hasVerification
        ? [
            navHas(nav, "用户验证") || altTarget === "用户验证"
              ? "替代按钮/用户验证"
              : "个人中心/用户验证",
          ]
        : [],
    };
    map["客服"] = {
      ok: csHosts(values, auth).length > 0,
      surfaces: csHosts(values, auth),
    };
    map["活动入口"] = {
      ok: hasPromo,
      surfaces: hasPromo ? ["底部导航/活动"] : [],
    };
    map["VIP 页入口"] = {
      ok: hasVip || (hasAccount && values.vipCard !== "隐藏VIP资讯"),
      surfaces: vipHosts,
    };
    map["App download"] = {
      ok: !preview.installEnabled || topBarOn || fabOn || alternateInstall,
      surfaces: preview.installEnabled
        ? [
            topBarOn ? "顶部下载栏" : null,
            fabOn ? "下载FAB" : null,
            alternateInstall ? "替代按钮/App download" : null,
          ].filter(Boolean)
        : ["租户未开启安装"],
    };
    CAPABILITIES.forEach(function (name) {
      if (!capabilityAvailable(name))
        map[name] = {
          ok: true,
          inactive: true,
          surfaces: ["上游能力未启用；Customize 不创建入口"],
        };
    });
    map._download = {
      topBarOn: topBarOn,
      fabOn: fabOn,
      installSurface: installSurface,
    };
    return map;
  }

  function resolveAll() {
    const items = CATALOG.map(function (item) {
      const row = state.draft[item.id];
      const inheritedRaw = themeDefaultFor(item.id, state.theme);
      const inherited = inheritedRaw === "关闭" ? "OFF" : inheritedRaw;
      const req = requestedValue(item.id);
      const sourceTheme =
        row.mode === "INHERIT" ? state.theme : row.sourceTheme || state.theme;
      const simulatedUnsupported = state.ui.unsupportedSim === item.id;
      const support = simulatedUnsupported
        ? false
        : state.ui.supportedSim === item.id
          ? true
          : supportOf(item, state.theme);
      let resolved = req.value;
      let disabled = !!req.disabled;
      let inactive = false;
      let outcome = "Allow";
      const reasons = [];
      const evidence = [item.evidence];
      if (item.prototypeSupport?.[state.theme]) evidence.push("Prototype-only：本机交互已开放，正式产品支援状态仍待确认。");
      if (simulatedUnsupported)
        evidence.push(
          "Prototype-only/Open：不支持状态仅为示范情景，不是已证实主题事实。",
        );
      if (item.id === "downloadFAB")
        reasons.push("派生自顶部下载栏；不接受独立租户覆盖或 OFF。");
      if (req.legacyClosed)
        reasons.push("旧式 SET=关闭 已按 User-confirmed 规则规范化为 OFF。");
      if (item.id === "theme") {
        resolved = state.theme;
        disabled = false;
      }
      if (disabled && item.required) {
        outcome = "Block";
        reasons.push("必填物件不可 OFF。");
      }
      if (support === false && item.safeFallback) {
        const requested = disabled ? "OFF" : resolved;
        resolved = clone(item.safeFallback.value);
        disabled = false;
        outcome = worse(outcome, "Auto-resolve");
        reasons.push(
          item.safeFallback.reason +
            "；请求=" +
            JSON.stringify(requested) +
            "，解析=" +
            JSON.stringify(resolved),
        );
      } else if (support === false && !item.safeFallback) {
        outcome = "Block";
        reasons.push(
          (simulatedUnsupported ? "Prototype-only/Open 情景：" : "") +
            "所选主题不支持「" +
            item.label +
            "」且无声明安全回退。",
        );
      } else if (support === "open") {
        reasons.push("支持/默认值 Open，未当作现网事实。");
        if (row.mode === "SET") {
          outcome = "Block";
          reasons.push(
            "所选主题尚无明确支持声明：可继续预览，但不能储存租户指定值；请先补齐主题支持声明。",
          );
        }
      }
      if (
        row.mode === "SET" &&
        item.themeOptions &&
        item.themeOptions[state.theme] &&
        item.themeOptions[state.theme].indexOf(resolved) === -1
      ) {
        const requestedOption = clone(resolved);
        const sameThemeDefault = themeDefaultFor(item.id, state.theme);
        if (
          sameThemeDefault !== undefined &&
          sameThemeDefault !== null &&
          item.themeOptions[state.theme].indexOf(sameThemeDefault) !== -1
        ) {
          resolved = clone(sameThemeDefault);
          disabled = false;
          outcome = worse(outcome, "Auto-resolve");
          reasons.push(
            "请求选项「" +
              requestedOption +
              "」不属于 " +
              state.theme +
              " 主题；已解析为该主题默认「" +
              sameThemeDefault +
              "」，必须明确确认，禁止静默替换。",
          );
        } else {
          outcome = "Block";
          reasons.push(
            "请求选项「" +
              requestedOption +
              "」不属于 " +
              state.theme +
              " 主题，且没有声明同主题安全默认值。",
          );
        }
      }
      if (isCrossTheme(item, row) && support !== false) {
        const cross = /R2/.test(item.risk) ? "Review" : "Warn";
        outcome = worse(outcome, cross);
        reasons.push(
          "跨主题物件 " +
            sourceTheme +
            " → " +
            state.theme +
            "（" +
            item.risk +
            "）。同主题优先。",
        );
      }
      const upstreamCapability = OBJECT_CAPABILITY[item.id];
      if (upstreamCapability && !capabilityAvailable(upstreamCapability)) {
        inactive = true;
        reasons.push(
          "上游能力「" +
            upstreamCapability +
            "」未启用；本物件不在玩家端生效，Customize 不会启用该能力。",
        );
        if (row.mode === "SET") {
          const publishedRow =
            state.published && state.published.objects
              ? state.published.objects[item.id]
              : null;
          const historicalUnchanged =
            publishedRow &&
            publishedRow.mode === "SET" &&
            JSON.stringify(publishedRow.value) === JSON.stringify(row.value);
          if (historicalUnchanged) {
            outcome = worse(outcome, "Review");
            reasons.push(
              "本站 Live 既有覆盖目前不生效；能力重新启用前必须重新检查，不会自动恢复。",
            );
          } else {
            outcome = "Block";
            reasons.push("不可为上游未启用能力建立新的 SET。");
          }
        }
      }
      if (
        row.mode === "SET" &&
        (resolved === undefined || resolved === null || resolved === "")
      ) {
        outcome = "Block";
        reasons.push("SET 但值为空，草稿无效。");
      }
      return {
        id: item.id,
        label: item.label,
        page: item.page,
        risk: item.risk,
        mode: row.mode,
        sourceTheme: sourceTheme,
        support: support,
        requested:
          item.id === "downloadFAB"
            ? "DERIVED"
            : row.mode === "OFF" || req.legacyClosed
              ? "OFF"
              : row.mode === "INHERIT"
                ? "INHERIT"
                : req.value,
        inherited: inherited,
        resolved: resolved,
        disabled: disabled,
        inactive: inactive,
        outcome: outcome,
        reasons: reasons,
        evidence: evidence,
        needsAck: outcome === "Auto-resolve" || outcome === "Review",
      };
    });

    const values = flattenValues(items);
    const issues = [];
    function add(id, outcome, reason, impact) {
      issues.push({
        id: id,
        outcome: outcome,
        reason: reason,
        impact: impact || "全预览",
      });
      const target = items.find(function (row) {
        return row.id === id;
      });
      if (target) {
        target.outcome = worse(target.outcome, outcome);
        target.reasons.push(reason);
        if (outcome === "Auto-resolve" || outcome === "Review")
          target.needsAck = true;
      }
    }

    ["loggedOut", "loggedIn"].forEach(function (authKey) {
      const nav = navFor(values, authKey);
      const expectedCount = THEME_NAV_COUNTS[state.theme];
      if (
        !Array.isArray(nav) ||
        nav.length !== expectedCount ||
        nav.some(function (slot) {
          return !slot;
        })
      ) {
        add(
          "bottomNav",
          "Block",
          AUTH[authKey] +
            "底部导航必须填满所选主题声明的 " +
            expectedCount +
            " 个槽位；不允许 OFF 或空槽。",
          AUTH[authKey],
        );
      }
      if (new Set(nav.map(NGCurrent.canonical)).size !== nav.length) {
        add(
          "bottomNav",
          "Block",
          AUTH[authKey] + "底部导航槽位不可重复。",
          AUTH[authKey],
        );
      }
    });

    if (state.draft.alternateButton.mode === "SET") {
      const spec = values.alternateSpec || {};
      const validPlacement =
        byId.alternateButton.options.indexOf(spec.placement) !== -1;
      const validTarget = ALTERNATE_TARGETS.indexOf(spec.target) !== -1;
      const validScope =
        ["loggedOut", "loggedIn", "both"].indexOf(spec.authScope) !== -1;
      if (!validPlacement || !validTarget || !validScope) {
        add(
          "alternateButton",
          "Block",
          "SET 必须明确选择承载位置、已声明能力与认证范围；不得使用 未指定 或隐式 客服。",
          "替代按钮",
        );
      } else if (!capabilityAvailable(spec.target)) {
        add(
          "alternateButton",
          "Block",
          "不可为上游未启用能力「" + spec.target + "」建立新的替代按钮 SET。",
          "替代按钮",
        );
      } else {
        const scopes =
          spec.authScope === "both"
            ? ["loggedOut", "loggedIn"]
            : [spec.authScope];
        scopes.forEach(function (authKey) {
          if (
            spec.placement === "顶部状态列" &&
            values.topStatusBar[authKey] === "简洁"
          ) {
            add(
              "alternateButton",
              "Block",
              AUTH[authKey] + "顶部状态列为 简洁，无法承载替代按钮。",
              AUTH[authKey],
            );
          }
          if (spec.placement === "底部导航自选槽位") {
            const rawIndex = (spec.navSlot || {})[authKey];
            const index =
              rawIndex === "" || rawIndex === undefined || rawIndex === null
                ? -1
                : Number(rawIndex);
            const nav = navFor(values, authKey);
            if (!Number.isInteger(index) || index < 0 || index >= nav.length) {
              add(
                "alternateButton",
                "Block",
                AUTH[authKey] +
                  "必须明确选择一个既有底部导航槽位；不得新增或留空。",
                AUTH[authKey],
              );
            } else {
              add(
                "alternateButton",
                "Review",
                AUTH[authKey] +
                  "将以「" +
                  spec.target +
                  "」置换第 " +
                  (index + 1) +
                  " 槽「" +
                  nav[index] +
                  "」；槽位总数不变，并须复核受保护能力可达性。",
                AUTH[authKey],
              );
            }
          }
        });
        if (spec.placement === "浮动收折" && values.shortcuts === "浮动收折") {
          add(
            "alternateButton",
            "Warn",
            "替代按钮与快捷按钮都使用 浮动收折，需检查堆叠与遮挡。",
            "全部适用认证状态 / 320·375·390·480",
          );
        }
      }
    }

    if (
      values.shortcuts === "侧边栏内" &&
      !values.shortcutsDisabled &&
      (values.sidebar === "关闭" || values.sidebarDisabled)
    ) {
      add(
        "shortcuts",
        "Block",
        "快捷按钮 = 侧边栏内 且 侧边栏 = 关闭。",
        "首页 / 全部 auth",
      );
    }
    ["loggedOut", "loggedIn"].forEach(function (authKey) {
      if (
        values.shortcuts === "状态列按钮" &&
        !values.shortcutsDisabled &&
        values.topStatusBar[authKey] === "简洁"
      ) {
        add(
          "topStatusBar",
          "Block",
          "顶部状态列（" +
            AUTH[authKey] +
            "）= 简洁 与 快捷按钮 = 状态列按钮 冲突。",
          AUTH[authKey],
        );
      }
    });

    const loggedInCaps = capabilityMap(values, {
      auth: "loggedIn",
      installEnabled: true,
    });
    const loggedOutCaps = capabilityMap(values, {
      auth: "loggedOut",
      installEnabled: true,
    });
    if (
      values.topStatusBar.loggedIn === "简洁" &&
      !withdrawalShortcutVisible(values, "loggedIn") &&
      !loggedInCaps["取款"].ok
    ) {
      add(
        "shortcuts",
        "Block",
        "登入後简洁顶栏且取款快捷隐藏，又无替代取款宿主。",
        "登入後",
      );
    }
    ["loggedOut", "loggedIn"].forEach(function (authKey) {
      if (
        values.vipCard === "隐藏VIP资讯" &&
        !navHas(effectiveNav(values, authKey), "VIP") &&
        !navHas(effectiveNav(values, authKey), "VIP 页入口") &&
        !(
          alternateApplies(values, authKey) &&
          values.alternateSpec.target === "VIP 页入口"
        )
      ) {
        add(
          "vipCard",
          "Block",
          "隐藏VIP资讯 且" +
            AUTH[authKey] +
            "移除 VIP 槽位；账户/我的不是已声明的 VIP 替代宿主。",
          AUTH[authKey] + " / VIP",
        );
      }
    });
    const downloadPairOff = values.topDownloadBar !== "开启";
    if (downloadPairOff && capabilityAvailable("App download")) {
      add(
        "topDownloadBar",
        "Block",
        "App 安装能力可用时，顶部下载栏为 OFF；派生 下载FAB 同步 OFF，安装入口不可达。",
        "安装入口",
      );
    }
    ["loggedOut", "loggedIn"].forEach(function (authKey) {
      const authNav = navFor(values, authKey);
      const navKey = authNav.join("/");
      const presets = (state.draft.bottomNav.extra || {}).preset || {};
      if (navKey === AXURE_NAV.join("/")) {
        if (authKey === "loggedOut") {
          add(
            "bottomNav",
            "Block",
            "Axure钱包我的 只允许登入後五槽 Prototype-only 预览，不允许用于登入前。",
            AUTH[authKey] + "底部导航",
          );
        } else {
          add(
            "bottomNav",
            "Review",
            "Axure钱包我的 为登入後五槽 Prototype-only：推广由第 3 槽移至第 5 槽、VIP 被移除、账户改为我的；不得静默变更。",
            AUTH[authKey] + "底部导航",
          );
        }
      }
      if (
        authNav.indexOf("客服") !== -1 &&
        presets[authKey] !== "axure" &&
        navKey !== AXURE_NAV.join("/")
      ) {
        issues.push({
          id: "bottomNav",
          outcome: "Allow",
          reason: AUTH[authKey] + "客服槽位由操作者显式选择，未自动注入。",
          impact: AUTH[authKey] + "底部导航",
        });
      }
    });
    const previewCaps = capabilityMap(values, state.preview);
    [
      { key: "loggedOut", caps: loggedOutCaps },
      { key: "loggedIn", caps: loggedInCaps },
    ].forEach(function (variant) {
      CAPABILITIES.forEach(function (name) {
        if (!variant.caps[name] || !variant.caps[name].ok) {
          add(
            "bottomNav",
            "Block",
            "受保护能力「" +
              name +
              "」在" +
              AUTH[variant.key] +
              "无可见可操作表面（深链/toast 不计）。",
            AUTH[variant.key],
          );
        }
      });
    });
    if (state.preview.auth === "loggedOut") {
      issues.push({
        id: "theme",
        outcome: "Allow",
        reason: "登入前预览禁止展示钱包余额；仅占位符。",
        impact: "隐私",
      });
    }
    if (state.expectedVersion !== state.published.version) {
      add(
        "theme",
        "Block",
        "工作值已过期：预期版本 " +
          state.expectedVersion +
          " 与本站 Live 版本 " +
          state.published.version +
          " 不一致。",
        "储存",
      );
    }
    if (state.ui.invalidApplied) {
      add(
        "theme",
        "Block",
        "当前模拟 Live 设定无效，玩家端使用最后可用设定。",
        "玩家端",
      );
    }
    if (state.preview.stale)
      add("theme", "Block", "预览已过期：必须刷新后再储存。", "储存");
    const unknown = Object.keys(state.draft).some(function (id) {
      return !byId[id];
    });
    if (unknown)
      add("theme", "Block", "草稿含未知物件，保留 last-known-good。", "草稿");
    window.NGDesign.validateDraft(
      state.draft,
      state.theme,
      values.themeColor,
      { checkedNav: { loggedOut: navFor(values, "loggedOut"), loggedIn: navFor(values, "loggedIn") } },
    ).forEach(function (reason) {
      const owner = /^(导航|App 替代)/.test(reason) ? "bottomNav" : /^下载/.test(reason) ? "topDownloadBar" : "theme";
      add(owner, "Block", reason, owner === "bottomNav" ? "底部导航" : owner === "topDownloadBar" ? "下载栏" : "玩家外观");
    });

    items.forEach(function (row) {
      if (
        row.needsAck &&
        row.outcome === "Auto-resolve" &&
        !state.acks.auto[row.id]
      ) {
        row.reasons.push("自动解析需明确确认，禁止静默。");
      }
      if (
        row.needsAck &&
        row.outcome === "Review" &&
        !state.acks.review[row.id]
      ) {
        row.reasons.push("复核项目需明确确认后方可储存。");
      }
    });

    items.forEach(row => { row.reasons = [...new Set(row.reasons)]; });
    const counts = {
      Allow: 0,
      Warn: 0,
      "Auto-resolve": 0,
      Review: 0,
      Block: 0,
    };
    items.forEach(function (row) {
      counts[row.outcome] += 1;
    });
    const blockCount = items.filter(function (row) {
      return row.outcome === "Block";
    }).length;
    const pendingAuto = items.filter(function (row) {
      return row.outcome === "Auto-resolve" && !state.acks.auto[row.id];
    });
    const pendingReview = items.filter(function (row) {
      return row.outcome === "Review" && !state.acks.review[row.id];
    });
    issues
      .filter(function (issue) {
        return issue.outcome === "Review";
      })
      .forEach(function (issue) {
        if (
          !state.acks.review[issue.id] &&
          !pendingReview.some(function (row) {
            return row.id === issue.id;
          })
        )
          pendingReview.push({ id: issue.id });
      });
    const canApply =
      blockCount === 0 &&
      pendingAuto.length === 0 &&
      pendingReview.length === 0 &&
      !state.ui.invalidApplied;
    return {
      items: items,
      values: values,
      issues: issues,
      counts: counts,
      blockCount: blockCount,
      pendingAuto: pendingAuto,
      pendingReview: pendingReview,
      canApply: canApply,
      capabilities: previewCaps,
      loggedInCaps: loggedInCaps,
      loggedOutCaps: loggedOutCaps,
    };
  }

  function dirty() {
    return (
      JSON.stringify({ theme: state.theme, objects: state.draft }) !==
      JSON.stringify({
        theme: state.published.theme,
        objects: state.published.objects,
      })
    );
  }

  function acknowledgementContext() {
    return JSON.stringify({
      theme: state.theme,
      draft: state.draft,
      preview: state.preview,
      supportedSim: state.ui.supportedSim,
      unsupportedSim: state.ui.unsupportedSim,
      invalidApplied: state.ui.invalidApplied,
      expectedVersion: state.expectedVersion,
      publishedVersion: state.published.version,
    });
  }

  function invalidateAcknowledgementsIfChanged(before) {
    if (before !== acknowledgementContext())
      state.acks = { auto: {}, review: {} };
  }

  function badgeClass(outcome) {
    return (
      {
        Allow: "badge-allow",
        Warn: "badge-warn",
        "Auto-resolve": "badge-auto",
        Review: "badge-review",
        Block: "badge-block",
      }[outcome] || "badge-open"
    );
  }

  function filteredCatalog(resolved) {
    const q = state.search.trim().toLowerCase();
    return CATALOG.filter(function (item) {
      if (item.id === "theme") return false;
      const row = resolved.items.find(function (entry) {
        return entry.id === item.id;
      });
      const draft = state.draft[item.id];
      if (
        q &&
        (item.label + item.id + item.page + item.risk)
          .toLowerCase()
          .indexOf(q) === -1
      )
        return false;
      if (state.filters.sameThemeOnly && draft.sourceTheme !== state.theme)
        return false;
      if (
        state.filters.modifiedOnly &&
        (draft.mode === "INHERIT" ||
          draft.mode === "DERIVED" ||
          draft.mode === "FIXED") &&
        item.id !== "theme"
      )
        return false;
      if (state.filters.incompatible && row.outcome === "Allow") return false;
      if (state.filters.required && !item.required) return false;
      if (
        state.filters.needsAttention &&
        !(
          row.outcome === "Block" ||
          row.outcome === "Review" ||
          row.outcome === "Auto-resolve" ||
          row.outcome === "Warn" ||
          (item.required && draft.mode === "OFF")
        )
      )
        return false;
      return true;
    });
  }

  function optionButtons(id, options, current, disabled) {
    return options
      .map(function (opt) {
        const selected = JSON.stringify(current) === JSON.stringify(opt);
        return (
          '<button type="button" class="btn' +
          (selected ? " is-selected" : "") +
          (disabled ? " is-disabled" : "") +
          '" ' +
          (selected ? 'aria-pressed="true"' : 'aria-pressed="false"') +
          (disabled ? " disabled" : "") +
          ' data-action="set-value" data-id="' +
          id +
          '" data-value="' +
          encodeURIComponent(
            typeof opt === "string" ? opt : JSON.stringify(opt),
          ) +
          '">' +
          opt +
          "</button>"
        );
      })
      .join("");
  }

  function renderTree(resolved) {
    const isSearching = !!(state.search && state.search.trim());
    state.collapsedPages = state.collapsedPages || {};
    const activeItemPage = byId[state.selectedId]
      ? byId[state.selectedId].page
      : "";

    els.tree.innerHTML =
      PAGES.map(function (page) {
        const rows = filteredCatalog(resolved).filter(function (item) {
          return item.page === page;
        });
        if (!rows.length) return "";

        // Auto-expand if searching, or if it contains the currently selected item and user hasn't explicitly toggled
        const isCollapsed = !isSearching && !!state.collapsedPages[page];
        const hasSelected = rows.some(function (item) {
          return item.id === state.selectedId;
        });

        return (
          '<div class="tree-group' +
          (isCollapsed ? " is-collapsed" : "") +
          '">' +
          '<div class="tree-group-header' +
          (hasSelected ? " contains-selected" : "") +
          '" data-action="toggle-page" data-page="' +
          page +
          '" role="button" aria-expanded="' +
          !isCollapsed +
          '">' +
          '<span class="tree-group-title"><span class="tree-arrow">' +
          (isCollapsed ? "▸" : "▾") +
          "</span> " +
          page +
          "</span>" +
          '<span class="badge badge-open tiny" style="height:18px; padding:0 6px; font-size:10px;">' +
          rows.length +
          "</span>" +
          "</div>" +
          (isCollapsed
            ? ""
            : '<div class="tree-group-items">' +
              rows
                .map(function (item) {
                  const row = resolved.items.find(function (entry) {
                    return entry.id === item.id;
                  });
                  const current = state.selectedId === item.id;
                  return (
                    '<button type="button" class="tree-item' +
                    (current ? " is-selected" : "") +
                    (row.outcome === "Block" ? " is-blocked" : "") +
                    '" data-action="select" data-id="' +
                    item.id +
                    '" ' +
                    (current ? 'aria-current="true"' : "") +
                    ">" +
                    "<span>" +
                    item.label +
                    (item.required ? " *" : "") +
                    (state.draft[item.id].mode !== "INHERIT" &&
                    state.draft[item.id].mode !== "DERIVED" &&
                    state.draft[item.id].mode !== "FIXED" &&
                    item.id !== "theme"
                      ? " ·"
                      : "") +
                    "</span>" +
                    '<span class="badge ' +
                    badgeClass(row.outcome) +
                    '">' +
                    row.outcome +
                    "</span></button>"
                  );
                })
                .join("") +
              "</div>") +
          "</div>"
        );
      }).join("") || '<p class="tiny">无匹配物件</p>';
  }

  function renderLegacyDetail(resolved, targetEl) {
    const target = targetEl || els.detail;
    const item = byId[state.selectedId];
    const row = resolved.items.find(function (entry) {
      return entry.id === item.id;
    });
    const draft = state.draft[item.id];
    const disabledEditor = draft.mode === "FIXED" || draft.mode === "DERIVED";
    let editor = "";
    if (item.id === "downloadFAB") {
      editor =
        '<div class="open-box"><strong>唯读派生物件</strong><p class="tiny">下载FAB 跟随顶部下载栏：顶部下载栏开启时同步开启；顶部下载栏 OFF 时同步 OFF。此处没有独立 SET、OFF 或租户覆盖。</p></div>';
    } else if (item.id === "brandMark") {
      editor =
        '<div class="open-box"><strong>固定唯读物件</strong><p class="tiny">品牌标志绑定本站，不提供 SET、OFF 或上传。缺少标志时显示本站站名，绝不取用其他站点资产。</p></div>';
    } else if (item.id === "topStatusBar") {
      editor = ["loggedOut", "loggedIn"]
        .map(function (key) {
          return (
            '<div class="field"><span>' +
            AUTH[key] +
            '</span><div class="mode-row">' +
            optionButtons(
              "topStatusBar." + key,
              item.options,
              draft.value[key],
              disabledEditor,
            ) +
            "</div></div>"
          );
        })
        .join("");
    } else if (item.id === "bottomNav") {
      editor =
        ["loggedOut", "loggedIn"]
          .map(function (authKey) {
            const slots = (draft.value || {})[authKey] || [];
            const axureDisabled =
              disabledEditor ||
              authKey !== "loggedIn" ||
              THEME_NAV_COUNTS[state.theme] !== AXURE_NAV.length;
            return (
              '<div class="panel"><h3>' +
              AUTH[authKey] +
              " · " +
              THEME_NAV_COUNTS[state.theme] +
              " 槽（数量跟随主题）</h3>" +
              slots
                .map(function (slot, index) {
                  return (
                    '<div class="slot-row"><span>' +
                    (index + 1) +
                    '</span><select data-action="nav-slot" data-auth="' +
                    authKey +
                    '" data-index="' +
                    index +
                    '"' +
                    (disabledEditor ? " disabled" : "") +
                    ">" +
                    NAV_CHOICES.map(function (choice) {
                      return (
                        "<option" +
                        (choice === slot ? " selected" : "") +
                        ">" +
                        choice +
                        "</option>"
                      );
                    }).join("") +
                    '</select><button type="button" class="btn" data-action="nav-up" data-auth="' +
                    authKey +
                    '" data-index="' +
                    index +
                    '"' +
                    (disabledEditor ? " disabled" : "") +
                    ">上移</button>" +
                    '<button type="button" class="btn" data-action="nav-down" data-auth="' +
                    authKey +
                    '" data-index="' +
                    index +
                    '"' +
                    (disabledEditor ? " disabled" : "") +
                    ">下移</button></div>"
                  );
                })
                .join("") +
              '<div class="cluster"><button type="button" class="btn" data-action="nav-live" data-auth="' +
              authKey +
              '"' +
              (disabledEditor ? " disabled" : "") +
              ">载入主题默认（此状态）</button>" +
              '<button type="button" class="btn" data-action="nav-axure" data-auth="' +
              authKey +
              '"' +
              (axureDisabled ? " disabled" : "") +
              ">预览 Axure钱包我的</button></div></div>"
            );
          })
          .join("") +
        '<p class="warn-box tiny">登入前 / 登入後分开设置；两边都必须填满主题声明槽数，不提供关闭或空槽。NG 五槽组合有现场观察证据；WG=4 / GAME=3 是已批准的合成测试情境，并非现网事实，正式声明支援前不可储存。Axure钱包我的 仅登入後五槽可预览，固定复核；客服不会被自动注入。</p>';
    } else if (item.id === "alternateButton") {
      const spec =
        draft.value && typeof draft.value === "object"
          ? draft.value
          : {
              placement: "",
              target: "",
              authScope: "both",
              navSlot: { loggedOut: "", loggedIn: "" },
            };
      const effectiveOptions = item.options.slice();
      if (item.supportsOff && effectiveOptions.indexOf("关闭") === -1) {
        effectiveOptions.push("关闭");
      }
      editor =
        '<div class="mode-row">' +
        optionButtons(
          "alternateButton.placement",
          effectiveOptions,
          draft.mode === "OFF" ? "关闭" : spec.placement,
          disabledEditor,
        ) +
        "</div>";
      if (draft.mode === "SET") {
        editor +=
          '<label class="field">承载能力（必选；不会默认为客服）<select data-action="alt-capability"><option value="">（请选择已声明能力）</option>' +
          ALTERNATE_TARGETS.map(function (target) {
            return (
              '<option value="' +
              target +
              '"' +
              (spec.target === target ? " selected" : "") +
              ">" +
              target +
              "</option>"
            );
          }).join("") +
          '</select></label><label class="field">认证范围<select data-action="alt-auth"><option value="both"' +
          (spec.authScope === "both" ? " selected" : "") +
          '>登入前 + 登入後</option><option value="loggedOut"' +
          (spec.authScope === "loggedOut" ? " selected" : "") +
          '>登入前</option><option value="loggedIn"' +
          (spec.authScope === "loggedIn" ? " selected" : "") +
          ">登入後</option></select></label>";
        if (spec.placement === "底部导航自选槽位") {
          const navValues = requestedValue("bottomNav").value || {};
          const scopes =
            spec.authScope === "both"
              ? ["loggedOut", "loggedIn"]
              : [spec.authScope];
          editor += scopes
            .map(function (authKey) {
              const slots = navValues[authKey] || [];
              const selectedSlot = (spec.navSlot || {})[authKey];
              return (
                '<label class="field">' +
                AUTH[authKey] +
                '既有槽位（置换、不增槽）<select data-action="alt-slot" data-auth="' +
                authKey +
                '"><option value="">（请选择槽位）</option>' +
                slots
                  .map(function (slot, index) {
                    return (
                      '<option value="' +
                      index +
                      '"' +
                      (String(selectedSlot) === String(index)
                        ? " selected"
                        : "") +
                      ">" +
                      (index + 1) +
                      " · " +
                      slot +
                      "</option>"
                    );
                  })
                  .join("") +
                "</select></label>"
              );
            })
            .join("");
        }
      } else {
        editor +=
          '<p class="tiny">INHERIT 跟随主题声明；OFF 明确不显示替代按钮。SET 才需要选择能力、认证范围与宿主。</p>';
      }
    } else {
      const effectiveOptions = item.options.slice();
      if (item.supportsOff && effectiveOptions.indexOf("关闭") === -1) {
        effectiveOptions.push("关闭");
      }
      editor =
        '<div class="mode-row">' +
        optionButtons(
          item.id,
          effectiveOptions,
          draft.mode === "OFF" ? "关闭" : draft.value,
          disabledEditor,
        ) +
        "</div>";
    }
    let modeStatusHtml = "";
    if (draft.mode === "INHERIT") {
      modeStatusHtml =
        '<span class="badge badge-open" style="font-size:13px; padding:4px 10px;">跟随主题默认</span> <span class="tiny muted">（点选下方任意样式直接覆盖）</span>';
    } else if (draft.mode === "SET") {
      modeStatusHtml =
        '<span class="badge badge-allow" style="font-size:13px; padding:4px 10px;">已覆盖主题默认</span> <button type="button" class="btn tiny" data-action="reset-object" style="margin-left:8px;">重置回主题默认</button>';
    } else if (draft.mode === "OFF") {
      modeStatusHtml =
        '<span class="badge badge-block" style="font-size:13px; padding:4px 10px;">已覆盖主题默认（关闭）</span> <button type="button" class="btn tiny" data-action="reset-object" style="margin-left:8px;">重置回主题默认</button>';
    } else {
      modeStatusHtml =
        '<span class="badge badge-proto" style="font-size:13px; padding:4px 10px;">' +
        draft.mode +
        "（系统锁定）</span>";
    }
    const legacyHtml =
      "<h2>" +
      item.label +
      ' <span class="help-tip" data-tip="直接选择样式即可覆盖；点击重置回到主题默认。">?</span> <span class="badge ' +
      badgeClass(row.outcome) +
      '">' +
      row.outcome +
      '</span> <span class="badge badge-' +
      (item.risk.indexOf("R2") === 0
        ? "r2"
        : item.risk.indexOf("R1") === 0
          ? "r1"
          : "r0") +
      '">' +
      item.risk +
      "</span></h2>" +
      '<p class="tiny">' +
      window.NGCurrent.description(item.id, item.playerEffect) +
      "</p>" +
      '<div class="panel"><h3>状态与覆盖 <span class="help-tip" data-tip="直接点选下方样式即可自订覆盖；点选重置清除租户覆盖回到主题默认。">?</span></h3><div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
      modeStatusHtml +
      "</div></div>" +
      '<div class="panel"><h3>選項</h3>' +
      editor +
      "</div>" +
      (item.sourceThemeSelectable
        ? '<div class="panel"><h3>来源主题（混合主题演示） <span class="help-tip" data-tip="同主题优先。跨主题：R0/R1=Warn，R2=Review；无安全回退则阻挡（Block）。">?</span></h3><div class="mode-row">' +
          THEMES.map(function (theme) {
            return (
              '<button type="button" class="btn' +
              (draft.sourceTheme === theme ? " is-selected" : "") +
              (draft.mode !== "SET" ? " is-disabled" : "") +
              '" data-action="set-source" data-id="' +
              item.id +
              '" data-theme="' +
              theme +
              '"' +
              (draft.mode !== "SET" ? " disabled" : "") +
              ">" +
              theme +
              "</button>"
            );
          }).join("") +
          "</div></div>"
        : "") +
      '<div class="panel evidence-risk-panel"><h3>证据 / 风险 / 依赖 / 回退 / 玩家效果</h3><div class="kv">' +
      "<div>ID</div><div><code>" +
      SEMANTIC_IDS[item.id] +
      "</code></div>" +
      "<div>默认</div><div>" +
      JSON.stringify(row.inherited) +
      "</div>" +
      "<div>支持</div><div>NG=" +
      item.support.NG +
      " · WG=" +
      item.support.WG +
      " · GAME=" +
      item.support.GAME +
      "</div>" +
      "<div>请求值</div><div>" +
      JSON.stringify(row.requested) +
      "</div>" +
      "<div>解析值</div><div>" +
      JSON.stringify(row.resolved) +
      (row.disabled ? "（OFF）" : "") +
      "</div>" +
      "<div>证据</div><div>" +
      item.evidence +
      "</div>" +
      "<div>风险</div><div>" +
      item.risk +
      "</div>" +
      "<div>依赖</div><div>" +
      item.dependencies +
      "</div>" +
      "<div>回退</div><div>" +
      item.fallback +
      "</div>" +
      "<div>玩家效果</div><div>" +
      item.playerEffect +
      "</div></div></div>" +
      (row.reasons.length
        ? '<ul class="issues">' +
          row.reasons
            .map(function (reason) {
              return "<li>" + reason + "</li>";
            })
            .join("") +
          "</ul>"
        : "") +
      (row.outcome === "Auto-resolve"
        ? '<label><input type="checkbox" data-action="ack-auto" data-id="' +
          item.id +
          '"' +
          (state.acks.auto[item.id] ? " checked" : "") +
          "> 我确认自动解析（请求值与解析值均已看见，禁止静默）</label>"
        : "") +
      (row.outcome === "Review"
        ? '<label><input type="checkbox" data-action="ack-review" data-id="' +
          item.id +
          '"' +
          (state.acks.review[item.id] ? " checked" : "") +
          "> 我确认复核风险并允许储存</label>"
        : "");
    target.innerHTML = legacyHtml;
    return legacyHtml;
  }

  function t(locale, zh, hant, longLabel) {
    if (locale === "zh-Hant") return hant || zh;
    if (locale === "long") return (longLabel || zh) + " · ExtendedLabelToken";
    return zh;
  }

  function renderDetail(resolved) {
    window.NGStudio.detail(resolved, renderLegacyDetail);
  }
  function renderPreview(resolved) {
    window.NGStudio.preview(resolved);
  }

  function acknowledgementControl(row, surface) {
    const kind = row.outcome === "Auto-resolve" ? "auto" : row.outcome === "Review" ? "review" : null;
    if (!kind) return "";
    const label = kind === "auto" ? "我确认自动解析结果" : "我确认复核风险并允许储存";
    return '<label class="field"><input type="checkbox" data-action="ack-' + kind + '" data-id="' + row.id + '" id="ack-' + surface + '-' + row.id + '"' + (state.acks[kind][row.id] ? ' checked' : '') + '> ' + localizedText(label) + '</label>';
  }

  function renderValidation(resolved) {
    const applyLabel = resolved.canApply ? "可储存" : "无法储存";
    const objectOutcomes = resolved.items.filter(function (row) {
      return row.outcome !== "Allow";
    });
    els.validation.innerHTML =
      "<h2>校验 / 兼容性</h2>" +
      '<div class="cluster">' +
      '<span class="badge badge-allow">Allow ' +
      resolved.counts.Allow +
      "</span>" +
      '<span class="badge badge-warn">Warn ' +
      resolved.counts.Warn +
      "</span>" +
      '<span class="badge badge-auto">Auto-resolve ' +
      resolved.counts["Auto-resolve"] +
      "</span>" +
      '<span class="badge badge-review">Review ' +
      resolved.counts.Review +
      "</span>" +
      '<span class="badge badge-block">Block ' +
      resolved.blockCount +
      "</span>" +
      '<span class="badge ' +
      (resolved.canApply ? "badge-allow" : "badge-block") +
      '">' +
      applyLabel +
      "</span></div>" +
      "<ul class='issues'>" +
      objectOutcomes
        .map(function (row) {
          return (
            "<li><span class='badge " +
            badgeClass(row.outcome) +
            "'>" +
            row.outcome +
            "</span> <strong>" +
            row.label +
            "</strong> · 请求 " +
            JSON.stringify(row.requested) +
            " → 解析 " +
            JSON.stringify(row.resolved) +
            " · " +
            row.reasons.join("；") +
            acknowledgementControl(row, "validation") +
            "</li>"
          );
        })
        .join("") +
      resolved.issues
        .map(function (issue) {
          return (
            "<li><span class='badge " +
            badgeClass(issue.outcome) +
            "'>" +
            issue.outcome +
            "</span> " +
            issue.reason +
            " <span class='tiny'>影响：" +
            issue.impact +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>";
    els.apply.disabled = !resolved.canApply || state.ui.loadingApply;
    els.apply.classList.toggle("is-blocked", !resolved.canApply);
    els.apply.classList.toggle("is-loading", state.ui.loadingApply);
    els.apply.setAttribute("aria-disabled", String(!resolved.canApply));
    els.version.textContent =
      state.tenantLabel +
      " · 工作值 " +
      state.draftVersion +
      " · 本站 Live 版本 " +
      state.published.version +
      " · 预期版本 " +
      state.expectedVersion +
      (dirty() ? " · 未储存修改" : " · 已同步") +
      " · 仅页面内存测试情境";
  }

  function diffRows(resolved) {
    return resolved.items
      .filter(function (row) {
        if (row.id === "downloadFAB" || row.id === "brandMark") return false;
        return (
          JSON.stringify(row.requested) !== JSON.stringify(row.inherited) ||
          row.mode !== "INHERIT" ||
          row.outcome !== "Allow" ||
          (row.id === "theme" && state.theme !== state.published.theme)
        );
      })
      .concat(state.theme !== state.published.theme ? [] : []);
  }

  function renderDiff(resolved) {
    const rows = resolved.items.filter(function (row) {
      if (row.id === "downloadFAB" || row.id === "brandMark") return false;
      return (
        row.mode !== "INHERIT" ||
        JSON.stringify(row.resolved) !== JSON.stringify(row.inherited) ||
        row.outcome !== "Allow" ||
        (row.id === "theme" && state.theme !== "NG")
      );
    });
    els.diff.className = "drawer open";
    els.diff.innerHTML =
      '<div class="drawer-panel"><h2 id="diff-title">差异审阅 <span class="help-tip" data-tip="同一解析器输出：模式 / 请求值 / 继承默认 / 解析值 / 来源主题 / 页面·认证影响 / 风险 / 证据 / 结果与理由。底部导航逐槽显示。">?</span></h2><table><thead><tr><th>物件 / 模式</th><th>请求</th><th>继承</th><th>解析</th><th>来源 / 影响</th><th>风险</th><th>证据</th><th>结果 / 理由</th></tr></thead><tbody>' +
      rows
        .map(function (row) {
          const slots =
            row.id === "bottomNav"
              ? ["loggedOut", "loggedIn"]
                  .map(function (auth) {
                    const inherited = Array.isArray(
                      row.inherited && row.inherited[auth],
                    )
                      ? row.inherited[auth]
                      : [];
                    const resolvedSlots = Array.isArray(
                      row.resolved && row.resolved[auth],
                    )
                      ? row.resolved[auth]
                      : [];
                    return (
                      "<div class='tiny'><strong>" +
                      (auth === "loggedOut" ? "登入前" : "登入后") +
                      "</strong> " +
                      resolvedSlots
                        .map(function (value, index) {
                          return (
                            "#" +
                            (index + 1) +
                            " " +
                            (inherited[index] || "∅") +
                            " → " +
                            value
                          );
                        })
                        .join("；") +
                      "</div>"
                    );
                  })
                  .join("")
              : "";
          const inactive = row.reasons.some(function (reason) {
            return /inactive|未启用/.test(reason);
          })
            ? "<div class='badge badge-review'>upstream inactive</div>"
            : "";
          return (
            "<tr><td>" +
            row.label +
            "<div class='tiny'>" +
            row.mode +
            "</div></td><td>" +
            JSON.stringify(row.requested) +
            "</td><td>" +
            JSON.stringify(row.inherited) +
            "</td><td>" +
            JSON.stringify(row.resolved) +
            slots +
            "</td><td>来源主题：" +
            (row.sourceTheme || state.theme) +
            "<div class='tiny'>" +
            row.page +
            " / 登入前+登入后 / 320·375·390·480·desktop</div></td><td>" +
            row.risk +
            "</td><td>" +
            row.evidence.join(" ") +
            "</td><td><span class='badge " +
            badgeClass(row.outcome) +
            "'>" +
            row.outcome +
            "</span>" +
            inactive +
            "<div class='tiny'>" +
            row.reasons.join("；") +
            "</div>" +
            acknowledgementControl(row, "diff") +
            "</td></tr>"
          );
        })
        .join("") +
      '</tbody></table><button type="button" class="btn" data-action="close-drawers">关闭</button></div>';
  }

  function snapshotState() {
    return clone({
      tenantId: state.tenantId,
      tenantLabel: state.tenantLabel,
      uiLocale: state.uiLocale,
      theme: state.theme,
      draft: state.draft,
      published: state.published,
      expectedVersion: state.expectedVersion,
      draftVersion: state.draftVersion,
      acks: state.acks,
      preview: state.preview,
      ui: state.ui,
      selectedId: state.selectedId,
      search: state.search,
      filters: state.filters,
    });
  }

  function restoreState(snap) {
    state.tenantId = snap.tenantId;
    state.tenantLabel = snap.tenantLabel;
    state.uiLocale = snap.uiLocale || "zh";
    state.theme = snap.theme;
    state.draft = snap.draft;
    state.published = snap.published;
    state.expectedVersion = snap.expectedVersion;
    state.draftVersion = snap.draftVersion;
    state.acks = snap.acks;
    state.preview = snap.preview;
    state.ui = snap.ui;
    state.selectedId = snap.selectedId;
    state.search = snap.search || "";
    state.filters = snap.filters || {
      sameThemeOnly: false,
      modifiedOnly: false,
      incompatible: false,
      required: false,
      needsAttention: false,
    };
  }

  function initialTenantSnapshot(id, label) {
    const snap = snapshotState();
    const objects = inheritDraft("NG");
    const entry = {
      version: 1,
      theme: "NG",
      objects: clone(objects),
      at: "2026-08-27T00:00:00Z",
      tenantId: id,
      valid: true,
      label: "初始 Live NG 默认（合成）",
    };
    snap.tenantId = id;
    snap.tenantLabel = label;
    snap.theme = "NG";
    snap.draft = objects;
    snap.published = entry;
    snap.expectedVersion = 1;
    snap.draftVersion = 1;
    snap.acks = { auto: {}, review: {} };
    snap.ui.lastKnownGood = clone(entry);
    snap.ui.loadingApply = false;
    snap.ui.fallbackMessage = "";
    return snap;
  }

  function switchTenant(id) {
    tenantStores[state.tenantId] = snapshotState();
    restoreState(clone(tenantStores[id]));
    closeDrawers();
  }

  function loadScene(name) {
    state.theme = "NG";
    state.draft = inheritDraft("NG");
    state.acks = { auto: {}, review: {} };
    state.preview.installEnabled = true;
    state.preview.unavailableCapability = "";
    state.preview.auth = "loggedIn";
    state.preview.viewport = 390;
    state.ui.invalidApplied = false;
    state.ui.fallbackMessage = "";
    state.ui.unsupportedSim = null;
    state.ui.supportedSim = null;
    state.expectedVersion = state.published.version;
    const set = function (id, mode, value, sourceTheme) {
      if (id === "downloadFAB") return;
      if (mode === "SET" && value === "关闭" && byId[id].supportsOff) {
        mode = "OFF";
        value = null;
      }
      state.draft[id].mode = mode;
      if (value !== undefined) state.draft[id].value = clone(value);
      if (sourceTheme) state.draft[id].sourceTheme = sourceTheme;
    };
    const scenes = {
      "live-ng": function () {},
      "block-sidebar": function () {
        set("shortcuts", "SET", "侧边栏内");
        set("sidebar", "INHERIT", "关闭");
      },
      "block-compact-shortcut": function () {
        set("topStatusBar", "SET", { loggedOut: "基本功能", loggedIn: "简洁" });
        set("shortcuts", "SET", "状态列按钮");
      },
      "block-withdrawal": function () {
        set("topStatusBar", "SET", { loggedOut: "基本功能", loggedIn: "简洁" });
        set("shortcuts", "SET", "状态列按钮");
        set("bottomNav", "SET", {
          loggedOut: LIVE_NAV.slice(),
          loggedIn: ["首页", "活动", "推广", "VIP", "充值"],
        });
        set("sidebar", "SET", "关闭");
        set("alternateButton", "OFF");
      },
      "block-vip": function () {
        set("vipCard", "SET", "隐藏VIP资讯");
        set("bottomNav", "SET", {
          loggedOut: ["首页", "活动", "推广", "钱包", "账户"],
          loggedIn: ["首页", "活动", "推广", "钱包", "账户"],
        });
      },
      "block-install": function () {
        set("topDownloadBar", "OFF");
      },
      "warn-cross-r0": function () {
        set("popupStyle", "SET", "样式二", "WG");
      },
      "review-cross-r2": function () {
        set("vipCard", "SET", "仅显示徽章", "WG");
      },
      "auto-safe": function () {
        switchTheme("GAME");
        state.ui.unsupportedSim = "popupStyle";
        set("popupStyle", "SET", "样式二", "GAME");
      },
      "block-unsafe": function () {
        switchTheme("GAME");
        state.ui.unsupportedSim = "searchPagination";
        set("searchPagination", "SET", "搜索列", "GAME");
      },
      "responsive-header": function () {
        set("topStatusBar", "SET", {
          loggedOut: "全部功能",
          loggedIn: "全部功能",
        });
        set("topDownloadBar", "SET", "开启");
        state.preview.viewport = 320;
      },
      "axure-nav": function () {
        set("bottomNav", "SET", {
          loggedOut: LIVE_NAV.slice(),
          loggedIn: AXURE_NAV.slice(),
        });
        state.draft.bottomNav.extra.preset.loggedIn = "axure";
      },
      "block-alt-missing": function () {
        state.ui.supportedSim = "alternateButton";
        set("alternateButton", "SET", {
          placement: "浮动收折",
          target: "",
          authScope: "both",
          navSlot: { loggedOut: "", loggedIn: "" },
        });
      },
      "block-alt-header": function () {
        state.ui.supportedSim = "alternateButton";
        set("topStatusBar", "SET", { loggedOut: "简洁", loggedIn: "基本功能" });
        set("alternateButton", "SET", {
          placement: "顶部状态列",
          target: "设置",
          authScope: "loggedOut",
          navSlot: { loggedOut: "", loggedIn: "" },
        });
      },
      "review-alt-nav": function () {
        state.ui.supportedSim = "alternateButton";
        set("alternateButton", "SET", {
          placement: "底部导航自选槽位",
          target: "客服",
          authScope: "loggedIn",
          navSlot: { loggedOut: "", loggedIn: "2" },
        });
      },
      "alt-no-implicit-cs": function () {
        state.ui.supportedSim = "alternateButton";
        set("alternateButton", "SET", {
          placement: "浮动收折",
          target: "设置",
          authScope: "loggedIn",
          navSlot: { loggedOut: "", loggedIn: "" },
        });
      },
      "block-unavailable-new": function () {
        state.preview.unavailableCapability = "VIP 页入口";
        set("vipCard", "SET", "仅显示徽章");
      },
      "review-unavailable-live": function () {
        state.preview.unavailableCapability = "VIP 页入口";
        set("vipCard", "SET", "仅显示徽章");
        state.published.objects.vipCard = clone(state.draft.vipCard);
      },
      "block-theme-count": function () {
        set("bottomNav", "SET", {
          loggedOut: LIVE_NAV.slice(),
          loggedIn: LIVE_NAV.slice(),
        });
        switchTheme("WG");
      },
      "block-invalid-draft": function () {
        set("gameLayout", "SET", "");
      },
      "privacy-logged-out": function () {
        state.preview.auth = "loggedOut";
        state.preview.page = "钱包";
      },
    };
    (scenes[name] || function () {})();
    state.draft.theme.value = state.theme;
    state.draftVersion += 1;
  }

  const CHECK_NAMES_ZH = {
    "1. live NG default": "1. NG 默认（合成示例）",
    "2. sidebar-host conflict": "2. 侧边栏宿主冲突",
    "3. compact-header shortcut conflict": "3. 简洁顶栏快捷入口冲突",
    "4. withdrawal reachability": "4. 取款可达性",
    "5. VIP reachability": "5. VIP 可达性",
    "6. installation reachability": "6. 安装入口可达性",
    "7. cross-theme R0 warning": "7. 跨主题 R0 警告",
    "8. cross-theme R2 review": "8. 跨主题 R2 复核",
    "9. unsupported safe auto-resolution": "9. 不支援但有安全自动解析",
    "10. unsupported unsafe block": "10. 不支援且不安全时阻挡",
    "11. logged-out balance privacy": "11. 登入前余额隐私",
    "12. responsive header is a design QA gate": "12. 响应式顶栏设计检查",
    "13. cancel restores current live": "13. 取消恢复本地示例",
    "14. stale draft blocks apply": "14. 过期工作值阻挡储存",
    "15. valid save updates this tenant site Live directly":
      "15. 保存更新当前租户的本地示例",
    "16. alternate has no unspecified SET option": "16. 替代按钮没有未指定选项",
    "17. alternate SET requires complete spec": "17. 替代按钮指定值必须完整",
    "18. alternate header respects auth compact mode":
      "18. 替代按钮顶栏位置遵守认证状态",
    "19. alternate nav replacement keeps count and Reviews":
      "19. 替代导航置换保持数量并要求复核",
    "20. alternate target is never implicit support":
      "20. 替代按钮不会隐式指定客服",
    "21. acknowledgement is bound to resolver context":
      "21. 确认绑定解析器内容",
    "22. unavailable capability rejects new SET": "22. 未启用能力拒绝新指定值",
    "23. existing Live unavailable override stays inactive Review":
      "23. 本站既有覆盖在能力未启用时保持不生效并要求复核",
    "24. theme change does not silently resize SET navigation":
      "24. 换主题不会静默调整导航槽数",
    "25. invalid draft blocks and preserves last-known-good":
      "25. 无效工作值阻挡且保持最后可用设定",
    "26. synthetic tenants keep isolated lifecycle state":
      "26. 合成租户站点状态完全隔离",
    "27. cancel restores current Live": "27. 取消恢复上次保存的本地示例",
    "28. all semantic object IDs use English dot-separated lowerCamelCase":
      "28. 所有语意物件识别码使用英文点分小驼峰格式",
    "29. language switch preserves unsaved configuration":
      "29. 语言切换保留未储存设定",
    "30. English interface has no untranslated visible text":
      "30. 英文介面没有未翻译可见文字",
    "31. catalog expands to 28 and theme stays out of tree":
      "31. 目录扩展为 28 且左栏不显示主题",
    "32. footer is preset layout only": "32. 页尾内容仅为预设版式",
    "33. brand mark is fixed and tenant-safe": "33. 品牌标志固定且站点隔离",
    "34. unsupported new option visibly auto-resolves":
      "34. 新选项不支援时明确自动解析",
    "35. new visual selectors never offer OFF": "35. 新视觉选择器均不提供 OFF",
    "36. new preview surfaces are represented": "36. 新增预览表面均有呈现",
  };

  function runChecks() {
    const saved = snapshotState();
    const savedStores = clone(tenantStores);
    const results = [];
    function check(name, fn) {
      restoreState(clone(saved));
      try {
        const ok = fn();
        results.push({
          name: name,
          ok: !!ok,
          detail: ok === true ? "pass" : String(ok),
        });
      } catch (err) {
        results.push({ name: name, ok: false, detail: String(err) });
      }
    }
    check("1. live NG default", function () {
      loadScene("live-ng");
      const r = resolveAll();
      return (
        r.blockCount === 0 &&
        r.values.sidebar === "关闭" &&
        r.values.bottomNav.loggedOut.join("/") === LIVE_NAV.join("/") &&
        r.values.bottomNav.loggedIn.join("/") === LIVE_NAV.join("/")
      );
    });
    check("2. sidebar-host conflict", function () {
      loadScene("block-sidebar");
      const r = resolveAll();
      return r.items.some(function (row) {
        return row.id === "shortcuts" && row.outcome === "Block";
      });
    });
    check("3. compact-header shortcut conflict", function () {
      loadScene("block-compact-shortcut");
      return resolveAll().items.some(function (row) {
        return row.outcome === "Block" && row.id === "topStatusBar";
      });
    });
    check("4. withdrawal reachability", function () {
      loadScene("block-withdrawal");
      const r = resolveAll();
      return r.issues.some(function (issue) {
        return issue.outcome === "Block" && /取款/.test(issue.reason);
      });
    });
    check("5. VIP reachability", function () {
      loadScene("block-vip");
      return resolveAll().blockCount > 0;
    });
    check("6. installation reachability", function () {
      loadScene("block-install");
      return resolveAll().blockCount > 0;
    });
    check("7. cross-theme R0 warning", function () {
      loadScene("warn-cross-r0");
      const row = resolveAll().items.find(function (item) {
        return item.id === "popupStyle";
      });
      return row.outcome === "Warn";
    });
    check("8. cross-theme R2 review", function () {
      loadScene("review-cross-r2");
      const row = resolveAll().items.find(function (item) {
        return item.id === "vipCard";
      });
      return row.outcome === "Review";
    });
    check("9. unsupported safe auto-resolution", function () {
      loadScene("auto-safe");
      const row = resolveAll().items.find(function (item) {
        return item.id === "popupStyle";
      });
      return (
        row.outcome === "Auto-resolve" &&
        row.resolved === "样式一" &&
        JSON.stringify(row.requested) !== JSON.stringify(row.resolved)
      );
    });
    check("10. unsupported unsafe block", function () {
      loadScene("block-unsafe");
      const row = resolveAll().items.find(function (item) {
        return item.id === "searchPagination";
      });
      return row.outcome === "Block";
    });
    check("11. logged-out balance privacy", function () {
      loadScene("privacy-logged-out");
      return NGStudio.testPlayer(function (t) {
        return (
          !t.root.querySelector("[data-balance]") &&
          !/970\.80/.test(t.root.textContent)
        );
      });
    });
    check("12. responsive header is a design QA gate", function () {
      loadScene("responsive-header");
      return NGStudio.testPlayer(function (t) {
        return [320, 375, 390, 480].every(function (width) {
          t.root.style.width = width + "px";
          return [1, 2, 3, 4, 5].every(function (style) {
            t.config.styles.header = style;
            t.player.setConfig(t.config);
            const h = t.root.querySelector(".p-header");
            return h.scrollWidth <= h.clientWidth + 1;
          });
        });
      });
    });
    check("13. cancel restores current live", function () {
      loadScene("block-sidebar");
      cancelDraft();
      return (
        JSON.stringify(state.draft) ===
          JSON.stringify(state.published.objects) &&
        state.theme === state.published.theme
      );
    });
    check("14. stale draft blocks apply", function () {
      loadScene("live-ng");
      state.published.version += 1;
      return resolveAll().canApply === false;
    });
    check("15. valid save updates this tenant site Live directly", function () {
      loadScene("live-ng");
      state.draft.gameLayout.mode = "SET";
      state.draft.gameLayout.value = "样式二";
      const beforeVersion = state.published.version;
      return (
        applyDraft(true) &&
        state.published.version === beforeVersion + 1 &&
        state.published.objects.gameLayout.value === "样式二" &&
        !document.getElementById("history-drawer") &&
        typeof rollbackTo === "undefined"
      );
    });
    check("16. alternate has no unspecified SET option", function () {
      return (
        byId.alternateButton.options.indexOf("未指定") === -1 &&
        themeDefaultFor("alternateButton", "NG") === null
      );
    });
    check("17. alternate SET requires complete spec", function () {
      loadScene("block-alt-missing");
      return resolveAll().items.some(function (row) {
        return (
          row.id === "alternateButton" &&
          row.outcome === "Block" &&
          /明确选择/.test(row.reasons.join(" "))
        );
      });
    });
    check("18. alternate header respects auth compact mode", function () {
      loadScene("block-alt-header");
      return resolveAll().items.some(function (row) {
        return (
          row.id === "alternateButton" &&
          row.outcome === "Block" &&
          /登入前顶部状态列为 简洁/.test(row.reasons.join(" "))
        );
      });
    });
    check("19. alternate nav replacement keeps count and Reviews", function () {
      loadScene("review-alt-nav");
      const r = resolveAll();
      const row = r.items.find(function (item) {
        return item.id === "alternateButton";
      });
      return (
        row.outcome === "Review" &&
        navFor(r.values, "loggedIn").length ===
          effectiveNav(r.values, "loggedIn").length &&
        effectiveNav(r.values, "loggedIn")[2] === "客服"
      );
    });
    check("20. alternate target is never implicit support", function () {
      loadScene("alt-no-implicit-cs");
      const r = resolveAll();
      return csHosts(r.values, "loggedIn").every(function (host) {
        return host.indexOf("替代按钮") !== 0;
      });
    });
    check("21. acknowledgement is bound to resolver context", function () {
      loadScene("review-cross-r2");
      state.acks.review.vipCard = true;
      const before = acknowledgementContext();
      state.draft.gameLayout.mode = "SET";
      state.draft.gameLayout.value = "样式二";
      invalidateAcknowledgementsIfChanged(before);
      return (
        !state.acks.review.vipCard && Object.keys(state.acks.auto).length === 0
      );
    });
    check("22. unavailable capability rejects new SET", function () {
      loadScene("block-unavailable-new");
      const row = resolveAll().items.find(function (item) {
        return item.id === "vipCard";
      });
      return (
        row.outcome === "Block" &&
        row.inactive &&
        /不可为上游未启用能力建立新的 SET/.test(row.reasons.join(" "))
      );
    });
    check(
      "23. existing Live unavailable override stays inactive Review",
      function () {
        const previousPublished = clone(state.published.objects.vipCard);
        loadScene("review-unavailable-live");
        const row = resolveAll().items.find(function (item) {
          return item.id === "vipCard";
        });
        const ok =
          row.outcome === "Review" &&
          row.inactive &&
          /不会自动恢复/.test(row.reasons.join(" "));
        state.published.objects.vipCard = previousPublished;
        return ok;
      },
    );
    check(
      "24. theme change does not silently resize SET navigation",
      function () {
        loadScene("block-theme-count");
        const row = resolveAll().items.find(function (item) {
          return item.id === "bottomNav";
        });
        return (
          row.outcome === "Block" &&
          row.reasons.some(function (reason) {
            return /4 个槽位/.test(reason);
          })
        );
      },
    );
    check(
      "25. invalid draft blocks and preserves last-known-good",
      function () {
        loadScene("block-invalid-draft");
        const before = JSON.stringify(state.ui.lastKnownGood);
        const r = resolveAll();
        return (
          !r.canApply &&
          r.items.some(function (row) {
            return row.id === "gameLayout" && row.outcome === "Block";
          }) &&
          JSON.stringify(state.ui.lastKnownGood) === before
        );
      },
    );
    check("26. synthetic tenants keep isolated lifecycle state", function () {
      const first = state.tenantId;
      const other = first === "tenant-a" ? "tenant-b" : "tenant-a";
      state.draft.gameLayout.mode = "SET";
      state.draft.gameLayout.value = "样式二";
      tenantStores[first] = snapshotState();
      switchTenant(other);
      const otherIsolated =
        state.draft.gameLayout.mode !== "SET" ||
        state.draft.gameLayout.value !== "样式二";
      switchTenant(first);
      return (
        otherIsolated &&
        state.draft.gameLayout.mode === "SET" &&
        state.draft.gameLayout.value === "样式二"
      );
    });
    check("27. cancel restores current Live", function () {
      state.draft.gameLayout.mode = "SET";
      state.draft.gameLayout.value = "样式二";
      cancelDraft();
      return (
        JSON.stringify(state.draft) === JSON.stringify(state.published.objects)
      );
    });
    check(
      "28. all semantic object IDs use English dot-separated lowerCamelCase",
      function () {
        return CATALOG.every(function (item) {
          return (
            /^[a-z][A-Za-z0-9]*$/.test(item.id) &&
            /^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)+$/.test(
              SEMANTIC_IDS[item.id],
            )
          );
        });
      },
    );
    check("29. language switch preserves unsaved configuration", function () {
      state.draft.gameLayout.mode = "SET";
      state.draft.gameLayout.value = "样式二";
      const before = JSON.stringify(state.draft);
      state.uiLocale = "en";
      renderAll();
      return JSON.stringify(state.draft) === before && state.uiLocale === "en";
    });
    check(
      "30. English interface has no untranslated visible text",
      function () {
        state.uiLocale = "en";
        state.selectedId = "themeColor";
        renderAll();
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          ),
          bad = [];
        while (walker.nextNode()) {
          const node = walker.currentNode,
            p = node.parentElement;
          if (
            !p ||
            /^(SCRIPT|STYLE)$/.test(p.tagName) ||
            !p.checkVisibility() ||
            p.closest("#checks-drawer,#diff-drawer,#confirm-modal")
          )
            continue;
          if (/[\u3400-\u9fff]/.test(node.nodeValue))
            bad.push(node.nodeValue.trim());
        }
        if (bad.length)
          throw new Error("Untranslated: " + [...new Set(bad)].join(" | "));
        return true;
      },
    );
    check("31. catalog expands to 28 and theme stays out of tree", function () {
      const visible = filteredCatalog(resolveAll());
      return (
        CATALOG.length === 28 &&
        visible.every(function (item) {
          return item.id !== "theme";
        }) &&
        Object.keys(SEMANTIC_IDS).length === 28
      );
    });
    check("32. footer is preset layout only", function () {
      const item = byId.footerStyle;
      state.selectedId = "footerStyle";
      renderDetail(resolveAll());
      return (
        item.type === "single-select" &&
        item.options.join("/") === "样式一/样式二/样式三/样式四" &&
        !item.supportsOff &&
        !els.detail.querySelector("textarea") &&
        !els.detail.querySelector('input[type="url"]') &&
        SEMANTIC_IDS.footerStyle === "global.footerStyle"
      );
    });
    check("33. brand mark is fixed and tenant-safe", function () {
      const item = byId.brandMark;
      state.selectedId = "brandMark";
      renderDetail(resolveAll());
      return (
        state.draft.brandMark.mode === "FIXED" &&
        item.type === "fixed-readonly" &&
        !els.detail.querySelector('input[type="file"]') &&
        !els.detail.querySelector('[data-mode="SET"]') &&
        !els.detail.querySelector('[data-mode="OFF"]')
      );
    });
    check("34. unsupported new option visibly auto-resolves", function () {
      switchTheme("WG");
      state.draft.carouselStyle.mode = "SET";
      state.draft.carouselStyle.value = "轮播Banner";
      const row = resolveAll().items.find(function (item) {
        return item.id === "carouselStyle";
      });
      return (
        row.outcome === "Auto-resolve" &&
        row.requested === "轮播Banner" &&
        row.resolved === "通用Banner" &&
        !state.acks.auto.carouselStyle
      );
    });
    check("35. new visual selectors never offer OFF", function () {
      return [
        "carouselStyle",
        "footerStyle",
        "profileLayout",
        "authVisual",
        "buttonStyle",
        "gameIconStyle",
      ].every(function (id) {
        return byId[id].supportsOff === false;
      });
    });
    check("36. new preview surfaces are represented", function () {
      loadScene("live-ng");
      return NGStudio.testPlayer(function (t) {
        const home =
          !!t.root.querySelector(".p-carousel") &&
          !!t.root.querySelector(".p-footer") &&
          !!t.root.querySelector('[data-p="flag"]');
        t.config.page = "登入注册";
        t.player.setConfig(t.config);
        return (
          home && !!t.root.querySelector('.p-auth-form input[type="password"]')
        );
      });
    });
    window.NGChecks(check, {
      state,
      loadScene,
      switchTheme,
      inheritDraft,
      resolveAll,
      applyDraft,
      cancelDraft,
      snapshotState,
      switchTenant,
      tenantStores,
      clone,
    });
    restoreState(saved);
    Object.keys(tenantStores).forEach(function (key) {
      delete tenantStores[key];
    });
    Object.keys(savedStores).forEach(function (key) {
      tenantStores[key] = savedStores[key];
    });
    state.ui.checks = results;
    els.checks.className = "drawer open";
    els.checks.innerHTML =
      '<div class="drawer-panel"><h2 id="checks-title">运行检查</h2><table><thead><tr><th>#</th><th>场景</th><th>结果</th><th>详情</th></tr></thead><tbody>' +
      results
        .map(function (row, index) {
          return (
            "<tr><td>" +
            (index + 1) +
            "</td><td>" +
            (state.uiLocale === "zh"
              ? CHECK_NAMES_ZH[row.name] || row.name
              : row.name) +
            "</td><td><span class='badge " +
            (row.ok ? "badge-allow" : "badge-block") +
            "'>" +
            (row.ok ? "pass" : "fail") +
            "</span></td><td>" +
            row.detail +
            "</td></tr>"
          );
        })
        .join("") +
      '</tbody></table><button type="button" class="btn" data-action="close-drawers">关闭</button></div>';
  }

  function applyDraft(silent) {
    const resolved = resolveAll();
    if (!resolved.canApply || state.expectedVersion !== state.published.version)
      return false;
    const entry = {
      version: state.published.version + 1,
      theme: state.theme,
      objects: clone(state.draft),
      at: new Date().toISOString(),
      tenantId: state.tenantId,
      valid: true,
      label: "本站 Live · 主题 " + state.theme,
    };
    state.published = clone(entry);
    state.expectedVersion = entry.version;
    state.ui.lastKnownGood = clone(entry);
    state.ui.invalidApplied = false;
    state.ui.fallbackMessage =
      "已保存本地示例。刷新页面会重置；请导出配置留存。";
    if (!silent) renderAll();
    return true;
  }

  function beginLiveSave() {
    const frozenContext = acknowledgementContext();
    const frozenDraftVersion = state.draftVersion;
    state.ui.loadingApply = true;
    renderAll();
    setTimeout(function () {
      state.ui.loadingApply = false;
      if (
        frozenContext !== acknowledgementContext() ||
        frozenDraftVersion !== state.draftVersion
      ) {
        state.ui.fallbackMessage =
          "储存期间设定或检查条件已改变；本站 Live 未更新，请重新检查。";
      } else {
        applyDraft();
      }
      renderAll();
    }, 400);
  }

  function cancelDraft() {
    state.theme = state.published.theme;
    state.draft = clone(state.published.objects);
    state.acks = { auto: {}, review: {} };
    state.draft.theme.value = state.theme;
    state.ui.fallbackMessage = "已恢复上次保存的本地示例。";
  }

  function resetObject(id) {
    const theme = state.theme;
    const fresh = inheritDraft(theme)[id];
    state.draft[id] = fresh;
    delete state.acks.auto[id];
    delete state.acks.review[id];
  }

  let lastLocalizedLocale;
  function renderAll(opts) {
    opts = opts || {};
    const positions = [...document.querySelectorAll(".studio-editor-scroll,.studio-nav-scroll,#tree,#object-detail,#preview-pane,main,body")].filter(el=>el.scrollTop || el.scrollLeft).map(el=>[el,el.scrollTop,el.scrollLeft]);
    const resolved = resolveAll();
    window.NGStudio.tree(resolved);
    if (!(opts.reuseDetail && window.NGStudio.syncStyleSelection(resolved)))
      renderDetail(resolved);
    renderPreview(resolved);
    if (els.tenant) els.tenant.value = state.tenantId;
    if (els.uiLanguage) els.uiLanguage.value = state.uiLocale;
    if (els.theme) els.theme.value = state.theme;
    const contentSel = document.getElementById("content-select");
    if (contentSel) contentSel.value = state.preview.content;
    const installSel = document.getElementById("install-select");
    if (installSel)
      installSel.value = state.preview.installEnabled ? "on" : "off";
    const capSel = document.getElementById("capability-select");
    if (capSel) capSel.value = state.preview.unavailableCapability || "";
    if (lastLocalizedLocale !== state.uiLocale) {
      localizeInterface();
      lastLocalizedLocale = state.uiLocale;
    }
    window.NGStudio.finish(resolved);
    els.detail.querySelectorAll(".ux-help").forEach(function (el) { el.remove(); });
    const selectedIssue = resolved.items.find(row => row.id === state.selectedId && row.outcome !== "Allow");
    if (selectedIssue) {
      const help=document.createElement("div"); help.className="ux-help";
      const heading=document.createElement("strong"); heading.textContent=state.uiLocale === "en" ? "How to continue" : "如何完成設定";
      help.append(heading,document.createTextNode(window.NGCurrent.guidance(selectedIssue.id,selectedIssue.reasons)));
      els.detail.append(help);
    }
    positions.forEach(([el,top,left])=>{if(el.isConnected){el.scrollTop=top;el.scrollLeft=left;}});
    return resolved;
  }

  function closeDrawers() {
    els.diff.className = "drawer";
    els.checks.className = "drawer";
    els.confirm.className = "modal";
  }

  function confirmModal(title, body, okAction) {
    els.confirm.className = "modal open";
    els.confirm.innerHTML =
      '<div class="modal-panel simple-confirm"><h2 id="confirm-title">' +
      title +
      "</h2><p>" +
      body +
      '</p><div class="cluster"><button type="button" class="btn btn-brand" data-ok="' +
      okAction +
      '">确认</button><button type="button" class="btn" data-action="close-drawers">返回</button></div></div>';
    localizeInterface();
  }

  if (els.theme)
    els.theme.innerHTML = THEMES.map(function (theme) {
      return "<option>" + theme + "</option>";
    }).join("");
  if (els.scene)
    els.scene.innerHTML = [
      ["", "选择示范场景"],
      ["live-ng", "Allow · Live NG 默认"],
      ["block-sidebar", "Block · 侧边栏宿主冲突"],
      ["block-compact-shortcut", "Block · 简洁顶栏快捷"],
      ["block-withdrawal", "Block · 取款不可达"],
      ["block-vip", "Block · VIP 不可达"],
      ["block-install", "Block · 安装入口"],
      ["warn-cross-r0", "Warn · 跨主题 R0"],
      ["review-cross-r2", "Review · 跨主题 R2"],
      ["auto-safe", "Auto-resolve · GAME 弹窗回退"],
      ["block-unsafe", "Block · GAME 搜索无回退"],
      ["responsive-header", "Design QA · 320–480 响应式顶栏"],
      ["axure-nav", "Review · Axure钱包我的"],
      ["block-alt-missing", "Block · 替代按钮缺少能力"],
      ["block-alt-header", "Block · 替代按钮顶栏冲突"],
      ["review-alt-nav", "Review · 替代按钮置换导航"],
      ["alt-no-implicit-cs", "Allow · 不隐式当作客服"],
      ["block-unavailable-new", "Block · 未启用能力新 SET"],
      ["review-unavailable-live", "Review · 本站 Live 覆盖未生效"],
      ["block-theme-count", "Block · 换主题槽数不符"],
      ["block-invalid-draft", "Block · 无效草稿"],
      ["privacy-logged-out", "Allow · 登入前无余额"],
    ]
      .map(function (row) {
        return '<option value="' + row[0] + '">' + row[1] + "</option>";
      })
      .join("");

  document.addEventListener("change", function (event) {
    if (event.target.dataset.current || event.target.dataset.studio) return;
    const ackContextBefore = acknowledgementContext();
    const target = event.target;
    if (target.closest("[data-studio]")) return;
    if (target.id === "ui-language-select") {
      state.uiLocale = target.value;
      renderAll();
      return;
    }
    if (target.id === "tenant-select") {
      if (dirty()) {
        confirmModal(
          "本站设定尚未储存",
          "切换合成租户不会共用任何设定。当前站点未储存的修改会留在其页面内存中，不会写入另一站点。",
          "tenant:" + target.value,
        );
        target.value = state.tenantId;
        return;
      }
      switchTenant(target.value);
      renderAll();
      return;
    }
    if (target.id === "theme-select") {
      if (dirty()) {
        confirmModal(
          "主题修改尚未储存",
          "切换主题将载入新主题默认，并保留现有明确指定／关闭值重新检查；导航不会被静默截断或补位。",
          "theme:" + target.value,
        );
        target.value = state.theme;
        return;
      }
      switchTheme(target.value);
    }
    if (target.id === "scene-select" && target.value) loadScene(target.value);
    if (target.id === "stress-select")
      document.documentElement.setAttribute("data-stress", target.value);
    if (target.id === "object-search") state.search = target.value;
    if (target.id === "vp-select")
      state.preview.viewport =
        target.value === "desktop" ? "desktop" : Number(target.value);
    if (target.id === "auth-select") state.preview.auth = target.value;
    if (target.id === "page-select") state.preview.page = target.value;
    if (target.id === "content-select") state.preview.content = target.value;
    if (target.id === "install-select")
      state.preview.installEnabled = target.value === "on";
    if (target.id === "capability-select")
      state.preview.unavailableCapability = target.value;
    if (target.name && state.filters.hasOwnProperty(target.name))
      state.filters[target.name] = target.checked;
    if (target.getAttribute("data-action") === "nav-slot") {
      const authKey = target.getAttribute("data-auth");
      const index = Number(target.getAttribute("data-index"));
      state.draft.bottomNav.mode = "SET";
      state.draft.bottomNav.value[authKey][index] = target.value;
      state.draft.bottomNav.extra.preset[authKey] = "custom";
    }
    if (target.getAttribute("data-action") === "alt-slot") {
      state.draft.alternateButton.mode = "SET";
      ensureAlternateSpec().navSlot[target.getAttribute("data-auth")] =
        target.value;
    }
    if (target.getAttribute("data-action") === "alt-capability") {
      state.draft.alternateButton.mode = "SET";
      ensureAlternateSpec().target = target.value;
    }
    if (target.getAttribute("data-action") === "alt-auth") {
      state.draft.alternateButton.mode = "SET";
      ensureAlternateSpec().authScope = target.value;
    }
    if (target.getAttribute("data-action") === "ack-auto")
      state.acks.auto[target.getAttribute("data-id")] = target.checked;
    if (target.getAttribute("data-action") === "ack-review")
      state.acks.review[target.getAttribute("data-id")] = target.checked;
    invalidateAcknowledgementsIfChanged(ackContextBefore);
    renderAll();
  });

  document.addEventListener("input", function (event) {
    if (event.target.id === "object-search") {
      state.search = event.target.value;
      renderAll();
    }
  });

  document.addEventListener("click", function (event) {
    const btn = event.target.closest("[data-action], [data-ok]");
    if (!btn || btn.closest("[data-studio]") || btn.tagName !== "BUTTON") return;
    const ackContextBefore = acknowledgementContext();
    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (action === "ack-auto") state.acks.auto[id] = btn.checked;
    if (action === "ack-review") state.acks.review[id] = btn.checked;
    if (action === "select") {
      state.selectedId = id;
      window.NGStudio.focusPage(id);
      if (
        byId[id] &&
        state.collapsedPages &&
        state.collapsedPages[byId[id].page]
      ) {
        state.collapsedPages[byId[id].page] = false;
      }
    }
    if (action === "toggle-page") {
      const page = btn.getAttribute("data-page");
      state.collapsedPages = state.collapsedPages || {};
      state.collapsedPages[page] = !state.collapsedPages[page];
      renderAll();
      return;
    }
    if (action === "set-mode") {
      state.draft[id].mode = btn.getAttribute("data-mode");
      if (btn.getAttribute("data-mode") === "INHERIT") {
        state.draft[id].value = themeDefaultFor(id, state.theme);
        state.draft[id].sourceTheme = state.theme;
      }
      if (
        btn.getAttribute("data-mode") === "SET" &&
        (state.draft[id].value === undefined || state.draft[id].value === null)
      ) {
        state.draft[id].value = themeDefaultFor(id, state.theme);
      }
      if (id === "alternateButton" && btn.getAttribute("data-mode") === "SET")
        ensureAlternateSpec();
    }
    if (action === "set-value") {
      const raw = decodeURIComponent(btn.getAttribute("data-value"));
      if (id === "theme") {
        switchTheme(raw);
      } else if (id.indexOf("topStatusBar.") === 0) {
        const key = id.split(".")[1];
        state.draft.topStatusBar.mode = "SET";
        state.draft.topStatusBar.value[key] = raw;
      } else if (id === "alternateButton.placement") {
        if (raw === "关闭" && byId.alternateButton.supportsOff) {
          state.draft.alternateButton.mode = "OFF";
          state.draft.alternateButton.value = null;
        } else {
          state.draft.alternateButton.mode = "SET";
          ensureAlternateSpec().placement = raw;
        }
      } else {
        if (raw === "关闭" && byId[id].supportsOff) {
          state.draft[id].mode = "OFF";
          state.draft[id].value = null;
        } else {
          state.draft[id].mode = "SET";
          state.draft[id].value = raw;
        }
      }
    }
    if (action === "set-source") {
      state.draft[id].mode = "SET";
      state.draft[id].sourceTheme = btn.getAttribute("data-theme");
    }
    if (action === "nav-up" || action === "nav-down") {
      const authKey = btn.getAttribute("data-auth");
      const index = Number(btn.getAttribute("data-index"));
      const arr = state.draft.bottomNav.value[authKey];
      const swap = action === "nav-up" ? index - 1 : index + 1;
      if (swap >= 0 && swap < arr.length) {
        const tmp = arr[index];
        arr[index] = arr[swap];
        arr[swap] = tmp;
        state.draft.bottomNav.mode = "SET";
        state.draft.bottomNav.extra.preset[authKey] = "custom";
      }
    }
    if (action === "nav-live") {
      const authKey = btn.getAttribute("data-auth");
      state.draft.bottomNav.mode = "SET";
      state.draft.bottomNav.value[authKey] = themeDefaultFor(
        "bottomNav",
        state.theme,
      )[authKey];
      state.draft.bottomNav.extra.preset[authKey] = "theme";
    }
    if (action === "nav-axure") {
      const authKey = btn.getAttribute("data-auth");
      state.draft.bottomNav.mode = "SET";
      state.draft.bottomNav.value[authKey] = AXURE_NAV.slice();
      state.draft.bottomNav.extra.preset[authKey] = "axure";
    }
    if (action === "toggle-dev-panel") {
      const panel = document.getElementById("dev-floating-panel");
      if (panel) {
        panel.classList.toggle("is-open");
        const toggleBtn = panel.querySelector(".dev-panel-toggle");
        if (toggleBtn) {
          toggleBtn.setAttribute(
            "aria-expanded",
            panel.classList.contains("is-open") ? "true" : "false",
          );
        }
      }
      return;
    }
    if (action === "reset-object") resetObject(state.selectedId);
    if (action === "reset-page")
      CATALOG.filter(function (item) {
        return item.id !== "theme" && item.page === byId[state.selectedId].page;
      }).forEach(function (item) {
        resetObject(item.id);
      });
    if (action === "reset-all") {
      state.draft = inheritDraft(state.theme);
      state.acks = { auto: {}, review: {} };
    }
    if (action === "cancel") {
      if (dirty()) {
        confirmModal(
          "取消未储存修改",
          "恢复此租户上次保存的本地示例，包括颜色、样式与玩家可选范围。",
          "cancel",
        );
        return;
      }
      cancelDraft();
    }
    if (action === "preview-nav")
      state.preview.page = btn.getAttribute("data-page");
    if (action === "apply") {
      if (window.NGStudio && window.NGStudio.confirmSave) {
        window.NGStudio.confirmSave(resolveAll());
        return;
      }
      confirmModal(
        "保存修改",
        "保存本站主题、颜色、组件样式与玩家可选范围。",
        "apply-live",
      );
      return;
    }
    if (action === "open-diff") {
      if (window.NGStudio && window.NGStudio.diff) {
        window.NGStudio.diff(resolveAll());
        return;
      }
    }
    if (action === "open-checks") runChecks();
    if (action === "close-drawers") closeDrawers();
    if (action === "simulate-stale") state.published.version += 1;
    if (action === "simulate-stale-preview") state.preview.stale = true;
    if (action === "simulate-invalid") {
      state.ui.invalidApplied = true;
      state.ui.fallbackMessage =
        "无效已套用配置已回退 last-known-good（模拟，非现网缓存）。";
      state.theme = state.ui.lastKnownGood.theme;
      state.draft = clone(state.ui.lastKnownGood.objects);
    }
    if (action === "clear-sim") {
      state.expectedVersion = state.published.version;
      state.preview.stale = false;
      state.ui.invalidApplied = false;
      state.ui.fallbackMessage = "";
    }
    if (btn.getAttribute("data-ok")) {
      const ok = btn.getAttribute("data-ok");
      if (ok.indexOf("theme:") === 0) {
        switchTheme(ok.slice(6));
      }
      if (ok.indexOf("tenant:") === 0) {
        switchTenant(ok.slice(7));
        closeDrawers();
        renderAll();
        return;
      }
      if (ok === "cancel") cancelDraft();
      if (ok === "apply-live") {
        closeDrawers();
        beginLiveSave();
        return;
      }
      closeDrawers();
    }
    invalidateAcknowledgementsIfChanged(ackContextBefore);
    if (
      action &&
      action !== "select" &&
      action !== "preview-nav" &&
      action.indexOf("open-") !== 0 &&
      action !== "close-drawers" &&
      action !== "ack-auto" &&
      action !== "ack-review"
    )
      state.draftVersion += 1;
    renderAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawers();
  });

  window.NGStudio.attach({
    state,
    localizedText,
    CATALOG,
    byId,
    els,
    resolveAll,
    renderAll,
    resetObject,
    switchTheme,
    dirty,
    clone,
    themeDefaultFor,
    effectiveNav,
    snapshotState,
    restoreState,
    applyDraft,
    cancelDraft,
    closeDrawers,
  });
  tenantStores["tenant-a"] = snapshotState();
  tenantStores["tenant-b"] = initialTenantSnapshot("tenant-b", "合成租户 B");
  renderAll();
})();
