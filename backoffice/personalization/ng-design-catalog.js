/* Figma Customize 147:1112 → reusable NG visual variants. Runtime examples only. */
(function () {
  "use strict";
  const names = ["样式一", "样式二", "样式三", "样式四", "样式五", "样式六"];
  const families = {
    gameLayout: {
      key: "category",
      label: "游戏分类",
      en: "Game categories",
      titles: ["侧边分类", "立体旋转", "搜索优先", "立体页签", "紧凑分类"],
      english: [
        "Side rail",
        "3D carousel",
        "Search first",
        "Raised tabs",
        "Compact chips",
      ],
      nodes: ["147:6191", "147:6478", "147:7058", "147:7501", "147:7281"],
      notes: [
        "左侧分类与游戏区并排。",
        "分类沿弧线切换，选中项居中放大。",
        "收起分类，以搜索与筛选开始浏览。",
        "立体图标页签，分类可横向滑动。",
        "两行分类入口，点击搜索展开输入框。",
      ],
    },
    topStatusBar: {
      key: "header",
      label: "顶部状态栏",
      en: "Header",
      titles: ["居中品牌", "分区按钮", "圆形入口", "双层工具栏", "双侧工具栏"],
      english: [
        "Centered brand",
        "Split actions",
        "Round actions",
        "Two-level toolbar",
        "Split toolbar",
      ],
      nodes: ["147:13467", "147:13923", "147:14385", "147:14616", "147:15070"],
      notes: [
        "品牌居中，菜单与余额分列两侧。",
        "左侧品牌，右侧登录、语言与菜单。",
        "圆形图标入口，账户按钮突出显示。",
        "品牌与账户在上，常用功能在下。",
        "双层结构，语言与菜单分列两端。",
      ],
    },
    sidebar: {
      key: "sidebar",
      label: "侧边栏",
      en: "Sidebar",
      titles: ["分组按钮", "折叠菜单", "图标侧轨", "图标总览", "分栏导航"],
      english: [
        "Grouped buttons",
        "Accordion",
        "Icon rail",
        "Icon overview",
        "Split navigation",
      ],
      nodes: ["147:19692", "147:22001", "147:21210", "147:23430", "147:23845"],
      notes: [
        "分组入口与底部资讯链接。",
        "主分类展开子分类。",
        "先显示图标，选择后展开文字与内容。",
        "游戏、活动与资讯集中展示。",
        "左侧选择分类，右侧展示子项目。",
      ],
    },
    shortcuts: {
      key: "shortcuts",
      label: "快速选单",
      en: "Quick menu",
      titles: ["纵向展开", "环形选单", "弧形选单", "网格选单"],
      english: ["Vertical dock", "Radial menu", "Arc menu", "Grid menu"],
      nodes: ["147:28005", "147:29039", "147:28445", "147:28759"],
      notes: [
        "从浮动入口展开纵向功能。",
        "点击后在中央展开环形选单。",
        "沿弧形排列，可切换更多入口。",
        "从右侧展开网格，内容可滚动。",
      ],
    },
    gameGridStyle: {
      key: "grid",
      label: "游戏区排版",
      en: "Game-card layout",
      titles: ["双行横滑", "主打游戏", "可调卡片大小"],
      english: ["Two-row carousel", "Featured game", "Adjustable density"],
      nodes: ["147:33473", "147:34724", "147:34056"],
      notes: [
        "每组展示两行，更多游戏横向滑动。",
        "首张主打游戏放大，其余双行排列。",
        "玩家可切换大卡、标准、小卡。",
      ],
    },
    searchPagination: {
      key: "search",
      label: "搜索栏",
      en: "Search & filters",
      titles: [
        "展开搜索",
        "组合搜索",
        "下拉筛选",
        "底部筛选",
        "长面板筛选",
        "吸底筛选",
      ],
      english: [
        "Expanding search",
        "Combined filters",
        "Dropdown filters",
        "Bottom sheet",
        "Tall filter sheet",
        "Sticky filter dock",
      ],
      nodes: [
        "147:38308",
        "147:39057",
        "147:42588",
        "147:40671",
        "147:40983",
        "147:41847",
      ],
      notes: [
        "输入时展开搜索，暂时收起厂商。",
        "最近、收藏与厂商可组合筛选示例游戏。",
        "输入即搜索，筛选条件确认后生效。",
        "筛选从底部展开。",
        "大面积筛选面板，厂商网格可滚动。",
        "原筛选栏离开画面时吸附底部；离开游戏区后隐藏。",
      ],
    },
    carouselStyle: {
      key: "carousel",
      label: "轮播图",
      en: "Banner carousel",
      titles: ["底部缩略图", "纵向叠卡", "左右叠卡", "右侧缩略图", "文字标签"],
      english: [
        "Bottom thumbnails",
        "Vertical stack",
        "Side cards",
        "Side thumbnails",
        "Text tabs",
      ],
      nodes: ["147:48717", "147:49359", "147:49671", "147:49032", "147:49970"],
      notes: [
        "点选底部缩略图切换。",
        "上下切换，右侧显示当前位置。",
        "左右卡片滑入中央并放大。",
        "点选右侧缩略图，更多缩略图可滚动。",
        "满宽展示，底部文字标签切换。",
      ],
    },
    topDownloadBar: {
      key: "download",
      label: "下载栏",
      en: "Download bar",
      titles: ["简洁提示", "提示与按钮", "圆角胶囊", "标题与说明"],
      english: [
        "Compact prompt",
        "Prompt + button",
        "Pill banner",
        "Title + description",
      ],
      nodes: ["147:31572", "147:31816", "147:32060", "147:32316"],
      notes: [
        "紧凑图标与单行提示。",
        "增加清晰下载按钮。",
        "立体图标与胶囊容器。",
        "标题、说明与下载入口分层呈现。",
      ],
    },
  };
  const palettes = {
    BDOK: {
      id: "BDOK",
      label: "绿黑",
      en: "Green / dark",
      accent: "#75eb92",
      accent2: "#a9e782",
      bg: "#202222",
      panel: "#292c2b",
      raised: "#3e4140",
      text: "#ffffff",
      muted: "#adb7ba",
      onAccent: "#183b25",
      source: true,
    },
    橙白: {
      id: "橙白",
      label: "橙白",
      en: "Orange / white",
      accent: "#f48d16",
      accent2: "#ffd900",
      bg: "#ebecf3",
      panel: "#ffffff",
      raised: "#f1f2f7",
      text: "#1c1e23",
      muted: "#707580",
      onAccent: "#472604",
      source: true,
    },
    藍白: {
      id: "藍白",
      label: "藍白",
      en: "Blue / white",
      accent: "#4781ff",
      accent2: "#47b5ff",
      bg: "#ebecf3",
      panel: "#ffffff",
      raised: "#f1f2f7",
      text: "#1c1e23",
      muted: "#707580",
      onAccent: "#ffffff",
      source: true,
    },
    BDAK: {
      id: "BDAK",
      label: "BDAK",
      en: "BDAK",
      accent: "#ba9cff",
      accent2: "#e3d5ff",
      bg: "#f3f1f8",
      panel: "#ffffff",
      raised: "#e9e4f3",
      text: "#282137",
      muted: "#746880",
      onAccent: "#2a1947",
      source: false,
    },
    BDLKK: {
      id: "BDLKK",
      label: "BDLKK",
      en: "BDLKK",
      accent: "#efb44e",
      accent2: "#ffd683",
      bg: "#191d28",
      panel: "#242b3c",
      raised: "#323e53",
      text: "#f8fafc",
      muted: "#b0bbce",
      onAccent: "#392708",
      source: false,
    },
  };
  const themeColors = {
    NG: ["BDOK", "橙白", "藍白", "BDAK", "BDLKK"],
    WG: ["BDAK", "BDOK", "BDLKK"],
    GAME: ["BDLKK", "BDOK", "BDAK"],
  };
  const clone = (value) => JSON.parse(JSON.stringify(value));
  function palette(value) {
    return palettes[value === "蓝白" ? "藍白" : value] || palettes.BDOK;
  }
  function cssVars(value) {
    const p = palette(value);
    return Object.entries(p)
      .filter(([k]) =>
        [
          "accent",
          "accent2",
          "bg",
          "panel",
          "raised",
          "text",
          "muted",
          "onAccent",
        ].includes(k),
      )
      .map(([k, v]) => "--p-" + k + ":" + v)
      .join(";");
  }
  function styleNumber(id, draft, theme) {
    if (id === "gameLayout" || id === "gameGridStyle")
      return Math.max(1, names.indexOf(draft.value) + 1);
    const design = draft.extra && draft.extra.design;
    return design && design.mode === "SET" && design.sourceTheme === theme
      ? design.value
      : 1;
  }
  function defaultPolicy() {
    return {
      themes: ["NG"],
      colors: { NG: ["BDOK", "橙白", "藍白"], WG: ["BDAK"], GAME: ["BDLKK"] },
      defaults: { NG: "BDOK", WG: "BDAK", GAME: "BDLKK" },
    };
  }
  function policy(draft) {
    return clone(draft.theme.extra.playerChoices || defaultPolicy());
  }
  function extendCatalog(catalog, defaults) {
    Object.entries(families).forEach(([id, f]) => {
      const item = catalog.find((x) => x.id === id);
      if (item) item.label = f.label;
    });
    const categories = catalog.find((x) => x.id === "gameLayout");
    categories.playerEffect =
      "改变分类入口的排列方式；游戏卡片排列由独立的游戏区排版控制。";
    categories.evidence =
      "User-confirmed / Figma / Prototype-only 2026-09-07：游戏分类组件设计的五种样式。保留 gameLayout 旧 ID 兼容既有草稿；卡片排版拆为 gameGridStyle。";
    const color = catalog.find((x) => x.id === "themeColor");
    color.options = ["BDOK", "BDAK", "BDLKK", "橙白", "藍白"];
    color.themeOptions = themeColors;
    color.support = { NG: true, WG: true, GAME: true };
    color.sourceThemeSelectable = false;
    color.evidence =
      "User-confirmed 2026-09-07 / Prototype-only：NG 新增橙白与藍白，Figma 主色 #f48d16 / #4781ff。BDOK 对应既有绿黑预览；BDAK、BDLKK 为旧原型示意色，不是本 Figma 设计。";
    const grid = {
      id: "gameGridStyle",
      page: "首页",
      label: "游戏区排版",
      type: "single-select",
      options: names.slice(0, 3),
      required: true,
      supportsOff: false,
      risk: "R0",
      sourceThemeSelectable: false,
      evidence:
        "Figma / Prototype-only 2026-09-07：游戏区排版设计，3 个样式；独立于游戏分类。",
      playerEffect: "调整卡片排列与大小。",
      dependencies: "游戏分类、搜索。",
      fallback: "跟随当前主题默认。",
      support: { NG: true, WG: true, GAME: true },
      defaults: { NG: names[0], WG: names[0], GAME: names[0] },
    };
    catalog.splice(
      catalog.findIndex((x) => x.id === "gameLayout") + 1,
      0,
      grid,
    );
    Object.values(defaults).forEach((d) => (d.gameGridStyle = names[0]));
  }
  function validateDraft(draft, theme, color) {
    const errors = [];
    const p = draft.theme.extra.playerChoices;
    if (p) {
      if (
        !Array.isArray(p.themes) ||
        !p.themes.length ||
        !p.themes.includes(theme) ||
        new Set(p.themes).size !== p.themes.length
      )
        errors.push("玩家可选主题必须包含本站默认主题，且不得为空或重复。");
      if (Array.isArray(p.themes))
        p.themes.forEach((n) => {
          const allowed = themeColors[n],
            colors = p.colors?.[n],
            def = p.defaults?.[n];
          if (
            !allowed ||
            !Array.isArray(colors) ||
            !colors.length ||
            new Set(colors).size !== colors.length ||
            colors.some((c) => !allowed.includes(c)) ||
            !colors.includes(def)
          )
            errors.push(n + " 的玩家颜色与默认值无效。");
        });
      if (!p.colors?.[theme]?.includes(color) || p.defaults?.[theme] !== color)
        errors.push("本站默认颜色必须与玩家范围中的默认值一致。");
    }
    Object.entries(families).forEach(([id, f]) => {
      const v = draft[id]?.extra?.design;
      if (
        v &&
        (!["INHERIT", "SET"].includes(v.mode) ||
          (v.mode === "SET" &&
            (!Number.isInteger(v.value) ||
              v.value < 1 ||
              v.value > f.titles.length ||
              !themeColors[v.sourceTheme])))
      )
        errors.push(f.label + " 的视觉样式无效。");
    });
    return errors;
  }
  window.NGDesign = {
    families,
    names,
    palettes,
    themeColors,
    palette,
    cssVars,
    clone,
    styleNumber,
    policy,
    defaultPolicy,
    extendCatalog,
    validateDraft,
  };
})();
