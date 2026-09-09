/* One persistent DOM shell. Each renderer owns only its component region. */
(function () {
  "use strict";
  const D = window.NGDesign;
  const esc = (v) =>
    String(v == null ? "" : v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function asset(group, key) {
    return (window.NG_ASSETS[group] || {})[key] || "";
  }
  function img(group, key, cls = "p-icon") {
    const src = asset(group, key);
    return src
      ? '<img class="' +
        cls +
        '" src="' +
        src +
        '" alt="" loading="lazy" decoding="async">'
      : "";
  }
  const icons = {
    menu: ["header-2", "imgMenuHamburger"],
    language: ["header-2", "imgIconLanuage"],
    home: ["grid-1", "imgVuesaxBoldHome2"],
    user: ["grid-1", "imgVuesaxBoldUser"],
    wallet: ["grid-1", "imgVuesaxBoldEmptyWallet"],
    gift: ["grid-1", "imgGift"],
    search: ["category-1", "imgFrame1321318559"],
    filter: ["category-1", "imgIconFilter"],
    recent: ["category-1", "imgIcon"],
    favorite: ["category-1", "imgIcon1"],
    vip: ["category-1", "imgVuesaxBulkCrown"],
    report: ["category-1", "imgVuesaxBulkChart2"],
    task: ["category-1", "imgVuesaxBulkClipboardText"],
    trade: ["category-1", "imgVuesaxBulkCardPos"],
    game: ["sidebar-3", "imgMenuIcon1"],
    info: ["sidebar-3", "imgMenuIcon4"],
    download: ["download-4", "imgGroup1321318458"],
  };
  function icon(name) {
    const a = icons[name] || icons.game;
    return (
      '<span class="p-glyph" aria-hidden="true" style="--glyph:url(' +
      asset(...a) +
      ')"></span>'
    );
  }
  const categories = [
    [
      "ALL",
      "全部",
      "All",
      "imgFrame10",
      "img8221F507F2C94F2A8C5997Fb0A6B8C432",
    ],
    [
      "hot",
      "热门",
      "Hot",
      "imgFrame11",
      "imgF31902A8Ee644F0DB24DFa01D1770Ced1",
    ],
    [
      "featured",
      "精选",
      "Featured",
      "imgFrame1",
      "img8221F507F2C94F2A8C5997Fb0A6B8C432",
    ],
    ["slots", "电子", "Slots", "imgFrame4", "imgSlot3XD8044D2C"],
    ["sports", "体育", "Sports", "imgFrame6", "imgSoccer3X0Ac516B7"],
    ["live", "视讯", "Live", "imgFrame9", "imgCasino3X9Bbe1A6F"],
    ["fish", "捕鱼", "Fishing", "imgFrame5", "imgFish3X378322Ef"],
    ["board", "棋牌", "Table", "imgFrame7", "imgBoard3X3585A11A1"],
    ["lotto", "彩票", "Lottery", "imgFrame2", "imgLotto3XE0B1E5E7"],
    ["esport", "电竞", "Esports", "imgFrame8", "imgEsport3XBdeb9Aef"],
  ];
  const covers = [
    "game-pussy-castle.png",
    "game-rising-medusa.png",
    "game-vegas-tycoon.png",
    "game-dragons-rivalry.png",
    "game-fortune-wild.png",
    "game-western-duel.png",
  ];
  const titles = [
    "Pussy Castle",
    "Rising Medusa",
    "Vegas Tycoon",
    "Dragon’s Rivalry",
    "Fortune Wild",
    "Western Duel",
  ];
  const games = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    title: titles[i % 6],
    file: covers[i % 6],
    provider: ["EVO", "CQ9", "FC", "MG", "JILI"][i % 5],
    category: [
      "hot",
      "featured",
      "slots",
      "sports",
      "live",
      "fish",
      "board",
      "lotto",
      "esport",
    ][i % 9],
    recent: i % 3 === 0,
    favorite: i % 4 === 0,
  }));
  const banners = [
    [
      "棋牌游戏",
      "Table games",
      "imgF72D44D5Afff8880F002B8A4B3Bd8C243Ebb9F68757E6GEpNbWFw12002",
    ],
    [
      "电子游戏",
      "Slot games",
      "imgB9B41F00Dc1649C18Ccd39Bec99D5108560922Cda05B4WFirNkFw12001",
    ],
    [
      "捕鱼游戏",
      "Fishing games",
      "imgEa1E117707D63555371Bf4438D46Ec35C82Fedc03C104Nqja3J1",
    ],
    [
      "彩票游戏",
      "Lottery games",
      "img3B44C08B88B590059Bbe16F45312536030822Dfc7126BGtHh741",
    ],
    [
      "视讯游戏",
      "Live games",
      "imgD418Cedd1Fe77188Fc90F0B34836D643D99Af43125CdaMqBcnK1",
    ],
  ];
  const providers = [
    "EVO",
    "CQ9",
    "FC",
    "MG",
    "JILI",
    "PG",
    "YB",
    "JB",
    "HB",
    "MT",
    "RT",
    "BNG",
    "PNG",
    "PP",
    "R88",
    "PS",
    "EVOPLAY",
    "YGG",
    "BGAMING",
    "WMS",
    "NS",
    "SW",
    "AUX",
  ];
  const btn = (action, label, body, extra = "") =>
    '<button type="button" data-p="' +
    action +
    '" aria-label="' +
    esc(label) +
    '" ' +
    extra +
    ">" +
    body +
    "</button>";
  function text(c, zh, en) {
    return c.locale === "en" ? en : zh;
  }
  function targetPage(target) {
    return (
      {
        取款: "提款",
        登录: "登入注册",
        注册: "登入注册",
        "钱包/纪录": "钱包",
        个人中心: "账户",
        "VIP 页入口": "VIP",
        活动入口: "活动",
      }[target] || target
    );
  }
  function capabilityButton(c, target, cls = "") {
    const labels = {
      客服: "Support",
      设置: "Settings",
      个人中心: "Account",
      站内信: "Inbox",
      用户验证: "Verification",
      "VIP 页入口": "VIP",
      "App download": "Download app",
      充值: "Deposit",
      取款: "Withdraw",
    };
    return btn(
      target === "App download" ? "download" : "page",
      text(c, target, labels[target] || target),
      text(c, target, labels[target] || target),
      'class="' + cls + '" data-page="' + EAttribute(targetPage(target)) + '"',
    );
  }
  function EAttribute(value) {
    return esc(value);
  }
  function alternate(c, placement) {
    const a = c.values.alternateSpec;
    return !c.values.alternateDisabled &&
      a &&
      a.target &&
      a.placement === placement &&
      (a.authScope === "both" || a.authScope === c.auth)
      ? capabilityButton(c, a.target, "p-alternate-entry")
      : "";
  }
  function headerLinks(c) {
    const mode = (c.values.topStatusBar || {})[c.auth];
    if (mode === "简洁") return "";
    const links =
      (c.values.shortcuts === "状态列按钮"
        ? ["充值", "取款", "客服"].map((n) => capabilityButton(c, n)).join("")
        : "") + alternate(c, "顶部状态列");
    return links ? '<nav class="p-header-links">' + links + "</nav>" : "";
  }
  function addons(c) {
    return (
      (c.install && c.values.downloadFAB === "开启" && !c.downloadClosed
        ? btn(
            "download",
            text(c, "下载 App", "Download app"),
            icon("download"),
            'class="p-download-fab"',
          )
        : "") + alternate(c, "浮动收折")
    );
  }
  function brand(c) {
    return c.theme === "NG"
      ? '<span class="p-logo p-logo-asset" aria-label="NG LOGO"><span class="p-logo-letters"></span><span class="p-logo-accent"></span></span>'
      : '<span class="p-logo" aria-label="' +
          esc(c.theme + " LOGO") +
          '"><b>' +
          esc(c.theme) +
          "</b> LOGO</span>";
  }
  function header(c) {
    const s = c.styles.header,
      mode = (c.values.topStatusBar || {})[c.auth] || "全部功能";
    const menu =
      c.values.sidebar !== "关闭" && !c.values.sidebarDisabled
        ? btn("sidebar", text(c, "打开侧边栏", "Open sidebar"), icon("menu"))
        : "";
    const language = btn(
      "page",
      text(c, "语言与外观", "Language and appearance"),
      icon("language"),
      'data-page="设置"',
    );
    const balance =
      c.auth === "loggedIn"
        ? btn(
            "page",
            text(c, "钱包余额", "Wallet balance"),
            '<span class="p-coin">$</span><span data-balance>970.80<small>0</small></span><b>+</b>',
            'class="p-balance" data-page="钱包"',
          )
        : '<div class="p-auth">' +
          btn(
            "page",
            text(c, "登录", "Log in"),
            text(c, "登录", "Log in"),
            'data-page="登入注册"',
          ) +
          btn(
            "page",
            text(c, "注册", "Register"),
            text(c, "注册", "Register"),
            'data-page="登入注册"',
          ) +
          "</div>";
    const reward = btn(
      "page",
      text(c, "奖励中心", "Rewards"),
      '<img class="p-icon" src="assets/home-green-black/treasure-chest.png" alt="">',
      'data-page="活动"',
    );
    const full = mode === "全部功能";
    const tools =
      menu +
      (full ? language : "") +
      (c.install
        ? btn("download", text(c, "下载 App", "Download app"), icon("download"))
        : "") +
      btn("page", "VIP", img("shortcuts-2", "imgImage101"), 'data-page="VIP"');
    return (
      '<header class="p-header p-header-' +
      s +
      " p-header-mode-" +
      (mode === "简洁" ? "compact" : "full") +
      '">' +
      (s === 1
        ? '<div class="p-head-left">' +
          menu +
          (full ? reward : "") +
          "</div>" +
          brand(c) +
          balance
        : s === 3
          ? menu +
            brand(c) +
            '<div class="p-head-right">' +
            (full
              ? language +
                btn(
                  "page",
                  text(c, "客服", "Support"),
                  img("header-3", "imgFrame1321316479"),
                  'data-page="客服"',
                )
              : "") +
            btn(
              "page",
              text(c, "账户", "Account"),
              icon("user"),
              'class="p-round" data-page="账户"',
            ) +
            "</div>"
          : '<div class="p-header-line">' +
            brand(c) +
            balance +
            (s === 2 ? language + menu : "") +
            "</div>") +
      (s >= 4 ? '<div class="p-toolbar">' + tools + "</div>" : "") +
      "</header>" +
      headerLinks(c)
    );
  }
  function download(c) {
    if (!c.install || c.values.topDownloadBar !== "开启" || c.downloadClosed)
      return "";
    const s = c.styles.download;
    return (
      '<div class="p-download p-download-' +
      s +
      '">' +
      (s === 3
        ? img("download-3", "imgDownloadGreen1", "p-download-art")
        : icon("download")) +
      '<div class="p-download-copy">' +
      (s === 4
        ? "<strong>" + text(c, "下载通知", "Get the app") + "</strong>"
        : "") +
      "<span>" +
      text(
        c,
        "下载安装手机 App，赢取更大奖励！",
        "Play on the go. Get our mobile app.",
      ) +
      "</span></div>" +
      btn(
        "download",
        text(c, "下载", "Download"),
        text(c, "下载", "Download"),
        'class="p-download-cta"',
      ) +
      btn(
        "close-download",
        text(c, "关闭下载提示", "Dismiss download prompt"),
        "×",
        'class="p-close"',
      ) +
      "</div>"
    );
  }
  function bannerCard(c, i, cls = "") {
    const b = banners[(i + banners.length) % banners.length];
    return (
      '<div class="p-banner-card ' +
      cls +
      '"><div><span>' +
      text(c, b[0], b[1]) +
      "</span><strong>" +
      text(c, "欢迎来赢大奖！", "Your next favourite awaits") +
      "</strong>" +
      btn(
        "page",
        text(c, "更多奖励", "View offers"),
        text(c, "更多奖励", "View offers"),
        'data-page="活动"',
      ) +
      "</div>" +
      img("carousel-1", b[2], "p-banner-art") +
      "</div>"
    );
  }
  function carousel(c) {
    const s = c.styles.carousel,
      i = c.banner || 0;
    const thumbs = banners
      .map((b, n) =>
        btn(
          "banner",
          text(c, b[0], b[1]),
          s === 5
            ? text(
                c,
                ["首次充值", "每日反水", "捕鱼大奖", "注册好礼", "VIP 专属"][n],
                ["Welcome", "Cashback", "Jackpot", "Join us", "VIP"][n],
              )
            : img("carousel-1", b[2]),
          'data-index="' +
            n +
            '" aria-pressed="' +
            (i === n) +
            '" class="' +
            (i === n ? "active" : "") +
            '"',
        ),
      )
      .join("");
    return (
      '<section class="p-carousel p-carousel-' +
      s +
      '" aria-label="' +
      text(c, "活动轮播图", "Promotion banners") +
      '">' +
      '<div class="p-banner-stage">' +
      (s === 2 || s === 3 || s === 7 || s === 8
        ? bannerCard(c, i - 1, "p-banner-before") +
          bannerCard(c, i + 1, "p-banner-after")
        : "") +
      bannerCard(c, i, "p-banner-current") +
      "</div>" +
      (s === 1 || s === 4 || s === 5
        ? '<div class="p-banner-choices">' + thumbs + "</div>"
        : '<div class="p-banner-dots">' +
          banners
            .map((_, n) =>
              btn(
                "banner",
                text(c, "第 " + (n + 1) + " 张", "Banner " + (n + 1)),
                n === i ? "━" : "•",
                'data-index="' + n + '" aria-pressed="' + (n === i) + '"',
              ),
            )
            .join("") +
          "</div>") +
      '<div class="p-banner-arrows">' +
      btn("banner-prev", text(c, "上一张", "Previous banner"), "‹") +
      btn("banner-next", text(c, "下一张", "Next banner"), "›") +
      "</div></section>"
    );
  }
  function quickbar(c) {
    if (c.auth !== "loggedIn") return "";
    return (
      '<nav class="p-quickbar" aria-label="' +
      text(c, "资金与常用功能", "Wallet and shortcuts") +
      '"><div>' +
      btn(
        "page",
        text(c, "充值", "Deposit"),
        text(c, "充值", "Deposit"),
        'data-page="充值" class="p-primary"',
      ) +
      btn(
        "page",
        text(c, "提款", "Withdraw"),
        text(c, "提款", "Withdraw"),
        'data-page="提款"',
      ) +
      "</div><div>" +
      [
        ["VIP", "vip"],
        ["待办", "task"],
        ["报表", "report"],
        ["交易", "trade"],
      ]
        .map(([n, i]) =>
          btn(
            "page",
            text(
              c,
              n,
              { VIP: "VIP", 待办: "Tasks", 报表: "Reports", 交易: "History" }[
                n
              ],
            ),
            icon(i) +
              "<small>" +
              text(
                c,
                n,
                { VIP: "VIP", 待办: "Tasks", 报表: "Reports", 交易: "History" }[
                  n
                ],
              ) +
              "</small>",
            'data-page="' + (n === "VIP" ? "VIP" : "钱包") + '"',
          ),
        )
        .join("") +
      "</div></nav>"
    );
  }
  function categoryButtons(c) {
    if (c.styles.category >= 6) {
      const actual = c.styles.category;
      const base = actual === 7 ? 1 : actual === 10 ? 4 : 5;
      return categoryButtons({...c,styles:{...c.styles,category:base}}).replace('p-categories-' + base, 'p-categories-' + actual);
    }
    const s = c.styles.category,
      display = c.values.categoryButtons;
    if (s === 3) return "";
    const list = categories
      .map((cat, i) =>
        btn(
          "category",
          text(c, cat[1], cat[2]),
          (display === "仅名称"
            ? ""
            : s === 4 || s === 2
              ? img("grid-1", cat[4])
              : '<span class="p-glyph" style="--glyph:url(' +
                asset("category-1", cat[3]) +
                ')"></span>') +
            (display === "仅图示"
              ? ""
              : "<span>" + text(c, cat[1], cat[2]) + "</span>"),
          'data-category="' +
            cat[0] +
            '" aria-pressed="' +
            (c.category === cat[0]) +
            '" class="' +
            (c.category === cat[0] ? "active" : "") +
            '" style="--order:' +
            i +
            (s === 2 ? orbitStyle(c, i) : "") +
            '"',
        ),
      )
      .join("");
    return (
      '<nav class="p-categories p-categories-' +
      s +
      '" aria-label="' +
      text(c, "游戏分类", "Game categories") +
      '">' +
      (s === 2
        ? btn("category-prev", text(c, "上个分类", "Previous category"), "‹")
        : "") +
      (s === 5
        ? btn(
            "focus-search",
            text(c, "展开搜索", "Expand search"),
            icon("search"),
            'class="p-category-search"',
          )
        : "") +
      '<div class="p-category-list">' +
      list +
      "</div>" +
      (s === 2
        ? btn("category-next", text(c, "下个分类", "Next category"), "›")
        : "") +
      "</nav>"
    );
  }
  function orbitStyle(c, index) {
    const active = Math.max(
      0,
      categories.findIndex((n) => n[0] === c.category),
    );
    const distance = ((index - active + 15) % 10) - 5;
    return (
      ";--offset:" +
      distance * 50 +
      "px;--rise:" +
      Math.abs(distance) * 8 +
      "px;--scale:" +
      (1 - Math.abs(distance) * 0.16) +
      ";--rotate:" +
      distance * -15 +
      "deg;visibility:" +
      (Math.abs(distance) > 2 ? "hidden" : "visible")
    );
  }
  function search(c) {
    const s = c.styles.search;
    const flag = (name, zh, en) =>
      btn(
        "flag",
        text(c, zh, en),
        icon(name) + text(c, zh, en),
        'data-flag="' +
          name +
          '" aria-pressed="' +
          !!c[name] +
          '" class="' +
          (c[name] ? "active" : "") +
          '"',
      );
    if (s === 6)
      return (
        '<div class="p-search p-search-6">' +
        btn(
          "filter",
          text(c, "游戏分类", "Game categories"),
          icon("game") + text(c, "游戏分类", "Categories"),
        ) +
        flag("recent", "最近", "Recent") +
        flag("favorite", "收藏", "Favorites") +
        btn(
          "filter",
          text(c, "筛选厂商", "Filter providers"),
          icon("filter") + text(c, "筛选厂商", "Providers"),
        ) +
        "</div>"
      );
    return (
      '<div class="p-search p-search-' +
      s +
      '"><div class="p-search-main"><label>' +
      icon("search") +
      '<input type="search" aria-label="' +
      text(c, "搜索游戏", "Search games") +
      '" placeholder="' +
      text(c, "搜索游戏", "Search games") +
      '" value="' +
      esc(c.query || "") +
      '"></label>' +
      (s <= 2
        ? flag("recent", "最近", "Recent") +
          flag("favorite", "收藏", "Favorites")
        : "") +
      btn("filter", text(c, "打开筛选", "Open filters"), icon("filter")) +
      "</div>" +
      (s <= 2
        ? '<div class="p-provider-strip"><span>' +
          text(c, "厂商", "Providers") +
          "</span>" +
          providers
            .slice(0, 7)
            .map((p) =>
              btn(
                "provider",
                p,
                p,
                'data-provider="' +
                  p +
                  '" aria-pressed="' +
                  c.providers.includes(p) +
                  '" class="' +
                  (c.providers.includes(p) ? "active" : "") +
                  '"',
              ),
            )
            .join("") +
          "</div>"
        : "") +
      (c.providers.length || c.recent || c.favorite
        ? '<div class="p-filter-tags">' +
          (c.recent ? "<span>" + text(c, "最近", "Recent") + "</span>" : "") +
          (c.favorite
            ? "<span>" + text(c, "收藏", "Favorites") + "</span>"
            : "") +
          c.providers.map((p) => "<span>" + p + "</span>").join("") +
          btn("clear-filters", text(c, "清除条件", "Clear filters"), "×") +
          "</div>"
        : "") +
      "</div>"
    );
  }
  function filtered(c) {
    return games.filter(
      (g) =>
        (c.category === "ALL" || g.category === c.category) &&
        (!c.query || g.title.toLowerCase().includes(c.query.toLowerCase())) &&
        (!c.recent || g.recent) &&
        (!c.favorite || g.favorite) &&
        (!c.providers.length || c.providers.includes(g.provider)),
    );
  }
  function gameCard(c, g) {
    return btn(
      "game",
      g.title,
      '<img src="assets/home-green-black/' +
        g.file +
        '" alt="' +
        esc(g.title) +
        '" loading="lazy" decoding="async">' +
        (c.values.gameIconStyle === "附厂商标签"
          ? "<small>" + g.provider + "</small>"
          : ""),
      'class="p-game-card" data-game="' + g.id + '"',
    );
  }
  function grid(c) {
    if (c.content === "loading")
      return (
        '<div class="p-skeleton" aria-label="' +
        text(c, "载入中", "Loading") +
        '">' +
        Array(8).fill("<i></i>").join("") +
        "</div>"
      );
    if (c.content === "error")
      return (
        '<div class="p-empty">' +
        text(c, "暂时无法载入游戏", "Unable to load games") +
        btn("retry", text(c, "重试", "Retry"), text(c, "重试", "Retry")) +
        "</div>"
      );
    const list = c.content === "empty" ? [] : filtered(c),
      s = c.styles.grid;
    if (!list.length)
      return (
        '<div class="p-empty"><strong>' +
        text(c, "没有符合的游戏", "No matching games") +
        "</strong><p>" +
        text(
          c,
          "试试其他关键词或清除筛选。",
          "Try another term or clear your filters.",
        ) +
        "</p>" +
        btn(
          "clear-filters",
          text(c, "清除筛选", "Clear filters"),
          text(c, "清除筛选", "Clear filters"),
        ) +
        "</div>"
      );
    const groups = c.thumbnail
      ? [["热门", "Hot", list.slice(0, 8)]]
      : c.query ||
          c.recent ||
          c.favorite ||
          c.providers.length ||
          c.category !== "ALL"
        ? [["搜索结果", "Results", list]]
        : [
            ["热门", "Hot", list.slice(0, 12)],
            ["精选", "Featured", list.slice(8, 20)],
            ["电子", "Slots", list.slice(16, 30)],
          ];
    return (
      '<div class="p-games p-grid-' +
      s +
      '" data-density="' +
      c.density +
      '">' +
      (s === 3
        ? '<div class="p-density">' +
          [2, 3, 4]
            .map((n) =>
              btn(
                "density",
                text(
                  c,
                  ["大卡", "标准", "小卡"][n - 2],
                  ["Large", "Standard", "Small"][n - 2],
                ),
                text(
                  c,
                  ["大卡", "标准", "小卡"][n - 2],
                  ["Large", "Standard", "Small"][n - 2],
                ),
                'data-density="' +
                  n +
                  '" aria-pressed="' +
                  (c.density === n) +
                  '"',
              ),
            )
            .join("") +
          "</div>"
        : "") +
      groups
        .map(
          ([zh, en, arr]) =>
            '<section class="p-game-group"><header><strong>' +
            text(c, zh, en) +
            "</strong><span>" +
            arr.length +
            " " +
            text(c, "款", "games") +
            "</span>" +
            btn("more", text(c, "更多", "More"), text(c, "更多", "More")) +
            '</header><div class="p-card-row" style="--columns:' +
            (s === 3 ? c.density : c.styles.category === 1 ? 3 : 4) +
            '">' +
            arr.map((g) => gameCard(c, g)).join("") +
            "</div></section>",
        )
        .join("") +
      "</div>"
    );
  }
  function sidebar(c) {
    const s = c.styles.sidebar,
      active = c.sidebarGroup || "games";
    const cats = categories
      .slice(1)
      .map((cat) =>
        btn(
          "category",
          text(c, cat[1], cat[2]),
          '<span class="p-glyph" style="--glyph:url(' +
            asset("category-1", cat[3]) +
            ')"></span><span>' +
            text(c, cat[1], cat[2]) +
            "</span>",
          'data-category="' + cat[0] + '"',
        ),
      )
      .join("");
    const promos = [
      ["轮盘活动", "Wheel", "imgImage85"],
      ["红包活动", "Rewards", "imgImage92"],
      ["VIP中心", "VIP", "imgImage101"],
      ["促销活动", "Offers", "imgImage98"],
    ]
      .map(([zh, en, key]) =>
        btn(
          "page",
          text(c, zh, en),
          img("shortcuts-2", key) + "<span>" + text(c, zh, en) + "</span>",
          'data-page="' + (en === "VIP" ? "VIP" : "活动") + '"',
        ),
      )
      .join("");
    const infos = [
      ["关于我们", "About"],
      ["帮助中心", "Help"],
      ["联系我们", "Contact"],
    ]
      .map(([zh, en]) =>
        btn(
          "page",
          text(c, zh, en),
          icon("info") + text(c, zh, en),
          'data-page="客服"',
        ),
      )
      .join("");
    const groups = [
      ["games", "游戏分类", "Games", cats],
      ["promos", "活动中心", "Promotions", promos],
      ["info", "资讯中心", "Information", infos],
    ];
    return (
      '<aside class="p-sidebar p-sidebar-' +
      s +
      " " +
      (s === 3 && !c.sidebarExpanded ? "p-collapsed " : "") +
      (c.values.sidebar === "右方" ? "p-right" : "p-left") +
      '" role="dialog" aria-modal="true" aria-label="' +
      text(c, "侧边栏", "Sidebar") +
      '">' +
      '<div class="p-sidebar-top">' +
      (c.auth === "loggedIn" && s >= 4
        ? '<div class="p-member">' +
          icon("user") +
          "<div><strong>" +
          text(c, "示例玩家", "Demo player") +
          "</strong><small>VIP 1</small></div></div>"
        : brand(c)) +
      btn("sidebar", text(c, "关闭侧边栏", "Close sidebar"), "×") +
      "</div>" +
      (s === 3 || s === 5
        ? '<nav class="p-side-tabs">' +
          groups
            .map(([k, zh, en]) =>
              btn(
                "sidebar-group",
                text(c, zh, en),
                icon(k === "games" ? "game" : k === "promos" ? "gift" : "info"),
                'data-group="' + k + '" aria-pressed="' + (active === k) + '"',
              ),
            )
            .join("") +
          "</nav>"
        : "") +
      '<div class="p-sidebar-content">' +
      (s === 2
        ? btn(
            "page",
            text(c, "首页", "Home"),
            text(c, "首页", "Home"),
            'data-page="首页"',
          )
        : "") +
      groups
        .map(([k, zh, en, html]) =>
          (s === 3 || s === 5) && active !== k
            ? ""
            : s === 2
              ? "<details " +
                (c.sidebarExpanded ? "open" : "") +
                "><summary>" +
                text(c, zh, en) +
                '</summary><div class="p-side-grid">' +
                html +
                "</div></details>"
              : "<section><h4>" +
                text(c, zh, en) +
                '</h4><div class="p-side-grid">' +
                html +
                "</div></section>",
        )
        .join("") +
      (c.values.shortcuts === "侧边栏内"
        ? '<div class="p-side-grid">' +
          [
            ["充值", "Deposit"],
            ["提款", "Withdraw"],
            ["客服", "Support"],
          ]
            .map(([zh, en]) =>
              btn(
                "page",
                text(c, zh, en),
                text(c, zh, en),
                'data-page="' + zh + '"',
              ),
            )
            .join("") +
          "</div>"
        : "") +
      '</div><div class="p-sidebar-bottom">' +
      btn(
        "page",
        text(c, "语言与外观", "Language and appearance"),
        icon("language") + text(c, "语言与外观", "Language & appearance"),
        'data-page="设置"',
      ) +
      "</div></aside>"
    );
  }
  function floating(c) {
    const s = c.styles.shortcuts,
      open = c.quick;
    if (!["浮动并列", "浮动收折"].includes(c.values.shortcuts)) return "";
    const keys =
      s === 2
        ? [
            "imgImage85",
            "imgImage92",
            "imgImage101",
            "imgImage98",
            "imgImage97",
            "imgImage95",
          ]
        : [
            "imgTurntable1",
            "imgRedenvelop1",
            "imgFa98Ab82B34Cfdda9C4F0C9745C39A95A6B19377A417E2CdYfa1",
            "imgA2585575C0Cd182E8678Ad1665A60Ac323B8037D27F41Go4AaxFw12001",
            "img4A2C07262184Dd7888Ab9163Faa3Ef61F3F044Fcd93E7NX7SBk1",
          ];
    const labels =
      c.locale === "en"
        ? ["Wheel", "Rewards", "VIP", "Deposit", "Inbox", "Support"]
        : ["轮盘", "红包", "VIP", "充值", "站内信", "客服"];
    return (
      '<div class="p-floating p-floating-' +
      s +
      " " +
      (open ? "is-open" : "") +
      '">' +
      (open
        ? '<div class="p-float-items">' +
          keys
            .map((k, i) =>
              btn(
                "page",
                labels[i],
                img(s === 2 ? "shortcuts-2" : "shortcuts-3", k),
                'data-page="' +
                  ["活动", "活动", "VIP", "充值", "站内信", "客服"][i] +
                  '" style="--i:' +
                  i +
                  '"',
              ),
            )
            .join("") +
          "</div>"
        : "") +
      btn(
        "quick",
        text(
          c,
          open ? "收起快速选单" : "打开快速选单",
          open ? "Close quick menu" : "Open quick menu",
        ),
        open ? "×" : img("shortcuts-2", "imgImage85"),
        'class="p-float-toggle" aria-expanded="' + open + '"',
      ) +
      "</div>"
    );
  }
  function filters(c) {
    const s = c.styles.search,
      d = c.filterDraft || {
        recent: c.recent,
        favorite: c.favorite,
        providers: c.providers,
      };
    return (
      '<section class="p-filter-panel p-filter-panel-' +
      s +
      '" role="dialog" aria-modal="' +
      (s >= 4) +
      '" aria-label="' +
      text(c, "筛选", "Filters") +
      '"><header><strong>' +
      text(c, "筛选", "Filters") +
      "</strong>" +
      btn("close-filter", text(c, "关闭筛选", "Close filters"), "×") +
      "</header>" +
      "<h4>" +
      text(c, "搜索类别", "Search type") +
      '</h4><div class="p-filter-options">' +
      [
        ["recent", "最近", "Recent"],
        ["favorite", "收藏", "Favorites"],
      ]
        .map(([k, zh, en]) =>
          btn(
            "draft-flag",
            text(c, zh, en),
            text(c, zh, en),
            'data-flag="' + k + '" aria-pressed="' + d[k] + '"',
          ),
        )
        .join("") +
      "</div>" +
      "<h4>" +
      text(c, "厂商", "Providers") +
      '</h4><div class="p-filter-options p-provider-grid">' +
      (s === 5 ? providers : providers.slice(0, 8))
        .map((p) =>
          btn(
            "draft-provider",
            p,
            p,
            'data-provider="' +
              p +
              '" aria-pressed="' +
              d.providers.includes(p) +
              '"',
          ),
        )
        .join("") +
      "</div>" +
      "<footer>" +
      btn(
        "clear-draft",
        text(c, "取消选取", "Clear selection"),
        text(c, "取消选取", "Clear selection"),
      ) +
      btn(
        "apply-filter",
        text(c, "应用", "Apply"),
        text(c, "应用", "Apply"),
        'class="p-primary"',
      ) +
      "</footer></section>"
    );
  }
  function footer(c) {
    if (window.NGCurrent) return NGCurrent.footer(c);
    const s = c.values.footerStyle;
    return (
      '<footer class="p-footer p-footer-' +
      D.names.indexOf(s) +
      '"><div>' +
      ["关于我们", "帮助中心", "联系我们"]
        .map((n) =>
          btn(
            "page",
            text(
              c,
              n,
              { 关于我们: "About", 帮助中心: "Help", 联系我们: "Contact" }[n],
            ),
            text(
              c,
              n,
              { 关于我们: "About", 帮助中心: "Help", 联系我们: "Contact" }[n],
            ),
            'data-page="客服"',
          ),
        )
        .join("") +
      "</div><small>© " +
      esc(c.theme) +
      " · " +
      text(c, "理性娱乐", "Play responsibly") +
      "</small></footer>"
    );
  }
  function bottom(c) {
    if (c.theme === "NG" && window.NGPageComponents) return NGPageComponents.bottom(c);
    const nav = c.nav || ["首页", "活动", "推广", "VIP", "账户"];
    const map = {
      首页: ["Home", "home"],
      活动: ["Promotions", "gift"],
      推广: ["Affiliate", "gift"],
      VIP: ["VIP", "vip"],
      账户: ["Account", "user"],
      我的: ["Me", "user"],
      钱包: ["Wallet", "wallet"],
      客服: ["Support", "info"],
    };
    return (
      '<nav class="p-bottom" aria-label="' +
      text(c, "主导航", "Primary navigation") +
      '">' +
      nav
        .map((n) =>
          btn(
            "page",
            text(c, n, (map[n] || [n])[0]),
            icon((map[n] || ["", "user"])[1]) +
              "<span>" +
              text(c, n, (map[n] || [n])[0]) +
              "</span>",
            'data-page="' +
              n +
              '" aria-current="' +
              (c.page === n ? "page" : "false") +
              '"',
          ),
        )
        .join("") +
      "</nav>"
    );
  }
  function secondary(c) {
    const page = c.page,
      v = c.values,
      zh = c.locale !== "en",
      t = (z, e) => text(c, z, e);
    const protectedPages = [
      "钱包",
      "充值",
      "提款",
      "账户",
      "我的",
      "站内信",
      "VIP",
      "用户验证",
    ];
    if (c.auth !== "loggedIn" && protectedPages.includes(page))
      return (
        '<div class="p-secondary"><h2>' +
        t("登录后继续", "Log in to continue") +
        "</h2><p>" +
        t(
          "登录后查看账户与钱包信息。",
          "Sign in to view your account and wallet.",
        ) +
        "</p>" +
        btn(
          "page",
          t("登录", "Log in"),
          t("登录", "Log in"),
          'data-page="登入注册" class="p-primary"',
        ) +
        "</div>"
      );
    if (c.theme === "NG" && window.NGPageComponents) {
      const page = NGPageComponents.render(c);
      if (page !== null) return page;
    }
    const currentPage = window.NGCurrent?.page(c);
    if (currentPage !== null && currentPage !== undefined) return currentPage;
    let html = "";
    if (page === "登入注册")
      html =
        '<div class="p-auth-form p-auth-' +
        esc(v.authVisual) +
        '"><h2>' +
        t("欢迎回来", "Welcome back") +
        "</h2><label>" +
        t("账户", "Account") +
        '<input autocomplete="off" placeholder="' +
        t("输入账户", "Account name") +
        '"></label><label>' +
        t("密码", "Password") +
        '<input type="password" autocomplete="off" placeholder="' +
        t("输入密码", "Password") +
        '"></label>' +
        btn(
          "demo-login",
          t("示例登录", "Demo sign-in"),
          t("登录", "Log in"),
          'class="p-primary"',
        ) +
        "<p>" +
        t(
          "仅演示视觉，不提交登录信息。",
          "Visual demo. No credentials are submitted.",
        ) +
        "</p></div>";
    else if (page === "账户" || page === "我的")
      html =
        '<div class="p-profile p-profile-' +
        D.names.indexOf(v.profileLayout) +
        '"><h2>' +
        t("示例玩家", "Demo player") +
        "</h2>" +
        (v.vipCard !== "隐藏VIP资讯"
          ? '<div class="p-vip-card ' +
            (v.vipCard === "仅显示徽章" ? "compact" : "") +
            '"><b>VIP 1</b>' +
            (v.vipCard === "完整卡片"
              ? '<progress value="35" max="100"></progress><span>' +
                t("等级进度示例", "Example level progress") +
                "</span>"
              : "") +
            "</div>"
          : "") +
        [
          ["钱包", "Wallet"],
          ["充值", "Deposit"],
          ["提款", "Withdraw"],
          ["VIP", "VIP"],
          ["站内信", "Inbox"],
          ["设置", "Settings"],
          ["客服", "Support"],
          ["用户验证", "Verification"],
        ]
          .map(([p, e]) =>
            btn(
              "page",
              t(p, e),
              icon("user") + t(p, e) + "<span>›</span>",
              'data-page="' + p + '"',
            ),
          )
          .join("") +
        "</div>";
    else if (page === "充值" || page === "提款")
      html =
        "<h2>" +
        t(page, page === "充值" ? "Deposit" : "Withdraw") +
        '</h2><div class="p-payment ' +
        (v.depositPage === "额度优先" ? "amount-first" : "") +
        '"><div class="p-payment-method"><h4>' +
        t("选择方式", "Method") +
        "</h4>" +
        btn("select-method", "Bank", "Bank") +
        btn("select-method", "E-wallet", "E-wallet") +
        '</div><div class="p-payment-amount"><label>' +
        t("金额", "Amount") +
        '<input inputmode="decimal" aria-label="' +
        t("金额", "Amount") +
        '" placeholder="0.00" ' +
        (v.amountAutoInput === "自动" ? 'value="100"' : "") +
        "></label>" +
        (v.amountAutoInput === "按钮"
          ? "<div>" +
            [100, 300, 500]
              .map((n) =>
                btn("amount", String(n), String(n), 'data-amount="' + n + '"'),
              )
              .join("") +
            "</div>"
          : "") +
        "</div></div>" +
        btn(
          "demo-submit",
          t("继续", "Continue"),
          t("继续", "Continue"),
          'class="p-primary"',
        ) +
        '<p class="p-note">' +
        t(
          "金额与方式为示例；不执行交易。",
          "Example amounts and methods. No transaction is made.",
        ) +
        "</p>";
    else if (page === "钱包")
      html =
        "<h2>" +
        t("钱包", "Wallet") +
        '</h2><div class="p-wallet-card"><span>' +
        t("示例余额", "Demo balance") +
        "</span><strong data-balance>970.80</strong>" +
        btn(
          "page",
          t("充值", "Deposit"),
          t("充值", "Deposit"),
          'data-page="充值" class="p-primary"',
        ) +
        btn(
          "page",
          t("提款", "Withdraw"),
          t("提款", "Withdraw"),
          'data-page="提款"',
        ) +
        "</div><h3>" +
        t("交易记录", "History") +
        "</h3>" +
        (v.recordsDisplay === "下拉"
          ? "<label>" +
            t("记录类型", "Record type") +
            "<select><option>" +
            t("全部", "All") +
            "</option><option>" +
            t("充值", "Deposits") +
            "</option></select></label>"
          : "") +
        [1, 2, 3]
          .map(
            (i) =>
              "<details " +
              (v.recordsDisplay === "下拉" ? "open" : "") +
              "><summary>" +
              t("示例记录", "Example record") +
              " #" +
              i +
              "</summary><p>" +
              t("已完成 · 合成记录", "Completed · Synthetic record") +
              "</p></details>",
          )
          .join("");
    else if (page === "VIP")
      html =
        '<h2>VIP</h2><div class="p-vip-levels ' +
        (v.vipPage === "卡片" ? "cards" : "table") +
        '">' +
        [1, 2, 3, 4]
          .map(
            (i) =>
              "<div><b>VIP " +
              i +
              "</b><span>" +
              t("权益展示示例", "Example benefits") +
              "</span>" +
              btn(
                "demo-submit",
                t("查看权益", "View benefits"),
                t("查看权益", "View benefits"),
              ) +
              "</div>",
          )
          .join("") +
        "</div>";
    else if (page === "站内信")
      html =
        "<h2>" +
        t("站内信", "Inbox") +
        "</h2>" +
        [1, 2]
          .map(
            (i) =>
              "<details " +
              (i === 1 || v.inbox === "列表" ? "open" : "") +
              "><summary>" +
              t(
                i === 1 ? "未读 · 欢迎加入" : "已读 · 活动通知",
                i === 1 ? "Unread · Welcome" : "Read · Promotion update",
              ) +
              "</summary><p>" +
              t("这里是示例通知内容。", "This is an example notification.") +
              "</p></details>",
          )
          .join("");
    else if (page === "用户验证")
      html =
        "<h2>" +
        t("用户验证", "Verification") +
        '</h2><div class="p-verify ' +
        (v.userVerification === "多步" ? "steps" : "") +
        '">' +
        [1, 2, 3]
          .map(
            (i) =>
              "<div><b>" +
              i +
              "</b><span>" +
              t("上游验证项目", "Upstream verification item") +
              "</span></div>",
          )
          .join("") +
        "</div>";
    else if (page === "设置")
      html =
        "<h2>" +
        t("设置", "Settings") +
        "</h2><label>" +
        t("语言", "Language") +
        '<select data-player-language><option value="zh" ' +
        (zh ? "selected" : "") +
        '>简体中文</option><option value="en" ' +
        (!zh ? "selected" : "") +
        ">English</option></select></label>" +
        appearance(c);
    else if (page === "客服")
      html =
        "<h2>" +
        t("帮助与客服", "Help & support") +
        "</h2><details open><summary>" +
        t("如何联系我们？", "How can I contact support?") +
        "</summary><p>" +
        t(
          "此处展示本站已配置的客服渠道。",
          "Your configured support channels appear here.",
        ) +
        "</p></details>" +
        btn(
          "demo-submit",
          t("在线客服", "Live support"),
          t("在线客服", "Live support"),
          'class="p-primary"',
        );
    else
      html =
        "<h2>" +
        t(page, { 活动: "Promotions", 推广: "Affiliate" }[page] || page) +
        "</h2>" +
        bannerCard(c, 1) +
        btn(
          "demo-submit",
          t("查看详情", "View details"),
          t("查看详情", "View details"),
          'class="p-primary"',
        );
    return (
      '<div class="p-secondary">' +
      btn(
        "page",
        t("返回首页", "Back to home"),
        "‹ " + t("首页", "Home"),
        'data-page="首页" class="p-back"',
      ) +
      html +
      "</div>"
    );
  }
  function appearance(c) {
    const p = c.policy || D.defaultPolicy(),
      choices = p.themes || [],
      colors = p.colors[c.theme] || [];
    return (
      '<section class="p-appearance"><h3>' +
      text(c, "外观", "Appearance") +
      "</h3>" +
      (choices.length > 1
        ? "<label>" +
          text(c, "主题", "Theme") +
          "<select data-player-theme>" +
          choices
            .map(
              (n) =>
                "<option " +
                (n === c.theme ? "selected" : "") +
                ">" +
                n +
                "</option>",
            )
            .join("") +
          "</select></label>"
        : "<p>" +
          text(c, "本站主题由管理员固定为 ", "Theme set by your site: ") +
          esc(c.theme) +
          "</p>") +
      (colors.length > 1
        ? '<div class="p-player-colors">' +
          colors
            .map((n) =>
              btn(
                "player-color",
                text(c, D.palette(n).label, D.palette(n).en),
                '<i style="background:' +
                  D.palette(n).accent +
                  '"></i>' +
                  text(c, D.palette(n).label, D.palette(n).en),
                'data-color="' + n + '" aria-pressed="' + (c.color === n) + '"',
              ),
            )
            .join("") +
          "</div>"
        : "<p>" +
          text(c, "本站颜色由管理员固定。", "Color is fixed by your site.") +
          "</p>") +
      "</section>"
    );
  }
  class Player {
    constructor(root, onNavigate) {
      this.root = root;
      this.onNavigate = onNavigate;
      this.signatures = {};
      this.local = {
        category: "ALL",
        query: "",
        providers: [],
        recent: false,
        favorite: false,
        density: 3,
        banner: 0,
        quick: false,
        sidebar: false,
        sidebarGroup: "games",
        sheet: false,
        downloadClosed: false,
      };
      root.classList.add("ng-player");
      root.setAttribute("data-name", "H5玩家");
      root.innerHTML =
        '<div class="p-scroll" data-name="页面内容"><div data-slot="header" data-name="顶部状态栏"></div><div data-slot="download" data-name="下载栏"></div><main data-name="主内容"><div data-slot="home" data-name="首页"><div data-slot="carousel" data-name="轮播图"></div><div data-slot="quickbar" data-name="资金快捷区"></div><section class="p-game-region" data-name="游戏区"><div data-slot="category" data-name="游戏分类"></div><div class="p-game-content" data-name="游戏内容"><div data-slot="search" data-name="搜索栏"></div><div data-slot="grid" data-name="游戏排列"></div></div></section><div data-slot="footer" data-name="页尾"></div></div><div data-slot="secondary" data-name="内页"></div></main></div><div data-slot="bottom" data-name="底部导航"></div><div data-slot="floating" data-name="快速选单"></div><div data-slot="addons" data-name="浮动入口"></div><div data-slot="overlay" data-name="弹层"></div><div class="p-toast" role="status" data-name="提示"></div>';
      this.slots = Object.fromEntries(
        [...root.querySelectorAll("[data-slot]")].map((n) => [
          n.dataset.slot,
          n,
        ]),
      );
      root.addEventListener("click", (e) => this.click(e));
      root.addEventListener("input", (e) => {
        if (e.target.matches("[data-page-field]")) {
          this.local[e.target.dataset.pageField] = e.target.value;
          if (e.target.dataset.pageField === "amount") {
            const credit = this.slots.secondary.querySelector("[data-credit]");
            if (credit) credit.textContent = e.target.value || "0.00";
          }
          if (window.NGPageComponents) this.signatures.secondary = JSON.stringify(NGPageComponents.signature(this.current()));
        }
        if (e.target.type === "search") {
          this.local.query = e.target.value;
          this.updateGrid();
        }
      });
      root.addEventListener("change", (e) => {
        if (e.target.matches("[data-player-theme]"))
          this.playerChoice({ theme: e.target.value });
        if (e.target.matches("[data-player-language]")) {
          this.local.locale = e.target.value;
          this.render();
        }
      });
      root.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.local.sheet = this.local.sidebar = this.local.quick = false;
          this.render();
        }
        if (e.key === "Tab") this.trapFocus(e);
      });
      root
        .querySelector(".p-scroll")
        .addEventListener("scroll", () => this.stickySearch(), {
          passive: true,
        });
    }
    patch(slot, key, fn) {
      const sig = JSON.stringify(key);
      if (this.signatures[slot] !== sig) {
        this.signatures[slot] = sig;
        this.slots[slot].innerHTML = fn();
      }
    }
    setConfig(config) {
      if (this.config && this.config.tenantId !== config.tenantId) {
        this.local = {
          category: "ALL",
          query: "",
          providers: [],
          recent: false,
          favorite: false,
          density: 3,
          banner: 0,
          quick: false,
          sidebar: false,
          sheet: false,
          downloadClosed: false,
        };
      }
      const policyKey = JSON.stringify([
        config.tenantId,
        config.theme,
        config.color,
        config.policy,
      ]);
      if (policyKey !== this.policyKey) {
        delete this.local.theme;
        delete this.local.color;
        this.policyKey = policyKey;
      }
      const appearanceKey=JSON.stringify(config.previewAppearance || null);
      if (this.previewAppearanceKey !== appearanceKey) {
        this.previewAppearanceKey=appearanceKey;
        delete this.local.theme; delete this.local.color;
        const choice=config.previewAppearance;
        if(choice && config.policy?.themes.includes(choice.theme) && config.policy.colors[choice.theme]?.includes(choice.color)) Object.assign(this.local,choice);
      }
      if (
        this.config &&
        JSON.stringify(this.config.styles) !== JSON.stringify(config.styles)
      ) {
        this.local.sheet = false;
        if (this.config.styles.download !== config.styles.download)
          this.local.downloadClosed = false;
        if (this.config.styles.sidebar !== config.styles.sidebar)
          this.local.sidebarExpanded = false;
      }
      if (
        config.focus !== this.lastFocus ||
        (this.config && this.config.page !== config.page)
      ) {
        this.local.sidebar = this.local.quick = this.local.sheet = false;
      }
      if (config.values.sidebar === "关闭" || config.values.sidebarDisabled)
        this.local.sidebar = false;
      if (
        config.focus === "sidebar" &&
        config.values.sidebar !== "关闭" &&
        (this.lastFocus !== "sidebar" ||
          this.config?.values.sidebarDisabled ||
          this.config?.styles.sidebar !== config.styles.sidebar)
      )
        this.local.sidebar = true;
      if (
        config.focus === "shortcuts" &&
        (this.lastFocus !== "shortcuts" ||
          this.config?.styles.shortcuts !== config.styles.shortcuts)
      )
        this.local.quick = true;
      if (config.focus !== "sidebar") this.local.sidebar = false;
      if (this.lastFocus === "popupStyle" && config.focus !== "popupStyle") this.local.sheet = false;
      if (config.focus === "popupStyle" && (this.lastFocus !== "popupStyle" || this.config?.styles.popup !== config.styles.popup)) {
        this.local.sheet = true;
        this.local.filterDraft = {
          providers: [],
          recent: false,
          favorite: false,
        };
      }
      const focusChanged = config.focus !== this.lastFocus,
        pageChanged = this.config && this.config.page !== config.page;
      this.lastFocus = config.focus;
      this.config = config;
      this.render();
      if (focusChanged || pageChanged) {
        const scroll = this.root.querySelector(".p-scroll"),
          region = this.root.querySelector(".p-game-region");
        const gameFocus =
          [
            "gameLayout",
            "gameGridStyle",
            "searchPagination",
            "categoryButtons",
            "gameIconStyle",
          ].includes(config.focus) && config.page === "首页";
        scroll.scrollTop = gameFocus
          ? scroll.scrollTop +
            region.getBoundingClientRect().top -
            scroll.getBoundingClientRect().top -
            8
          : 0;
      }
    }
    current() {
      const c = Object.assign({}, this.config, this.local);
      if (c.theme !== this.config.theme) {
        c.styles = {
          category: 1,
          header: 1,
          sidebar: 1,
          shortcuts: 1,
          grid: 1,
          search: 1,
          carousel: 1,
          download: 1,
        };
        c.nav =
          c.theme === "WG"
            ? ["首页", "活动", "钱包", "账户"]
            : c.theme === "GAME"
              ? ["首页", "钱包", "账户"]
              : this.config.nav;
      }
      return c;
    }
    render() {
      if (!this.config) return;
      const c = this.current(),
        v = c.values;
      // Preserve sizing assigned by hosts and test fixtures; color changes touch tokens only.
      D.cssVars(c.color)
        .split(";")
        .forEach((pair) => {
          const [key, value] = pair.split(":");
          this.root.style.setProperty(key, value);
        });
      this.root.dataset.theme = c.theme;
      this.root.dataset.activePage = c.page;
      this.root.dataset.category = c.styles.category;
      this.root.dataset.button = v.buttonStyle;
      this.root.dataset.icon = v.gameIconStyle;
      this.root.dataset.popup = v.popupStyle;
      this.root.dataset.grid = c.styles.grid;
      this.root.dataset.carouselMode = v.carouselStyle;
      this.patch(
        "header",
        [
          c.styles.header,
          c.auth,
          c.locale,
          c.theme,
          v.topStatusBar,
          v.sidebar,
          v.sidebarDisabled,
          v.shortcuts,
          v.alternateSpec,
          c.install,
        ],
        () => header(c),
      );
      this.patch(
        "download",
        [
          c.styles.download,
          c.current?.topDownloadBar?.content,
          c.install,
          v.topDownloadBar,
          c.downloadClosed,
          c.locale,
        ],
        () => NGCurrent.download(c, download(c)),
      );
      this.patch("carousel", [c.styles.carousel, c.banner, c.locale], () =>
        carousel(c),
      );
      this.patch("quickbar", [c.auth, c.locale, c.current?.gameLayout?.home], () => NGCurrent.home(c, quickbar(c)));
      this.patch(
        "category",
        [c.styles.category, c.category, c.locale, v.categoryButtons],
        () => categoryButtons(c),
      );
      this.patch(
        "search",
        [c.styles.search, c.locale, c.providers, c.recent, c.favorite],
        () => search(c),
      );
      this.updateGrid();
      this.patch("footer", [v.footerStyle, c.styles.footer, c.locale, c.theme], () => footer(c));
      this.patch("bottom", [c.nav, c.page, c.auth, c.locale, c.theme, c.styles.bottom, c.appReplacement, c.current?.bottomNav?.appReplacement, c.current?.bottomNav?.appReplacementEnabled], () => bottom({...c, nav: NGCurrent.navPreview(c)}));
      this.patch(
        "addons",
        [
          c.install,
          v.downloadFAB,
          c.downloadClosed,
          v.alternateSpec,
          v.alternateDisabled,
          c.auth,
          c.locale,
        ],
        () => addons(c),
      );
      this.patch(
        "secondary",
        c.theme === "NG" && window.NGPageComponents?.signature(c) || [c.page, c.auth, c.locale, c.theme, c.color, c.policy, v],
        () => (c.page === "首页" ? "" : secondary(c)),
      );
      this.slots.home.hidden = c.page !== "首页";
      this.slots.secondary.hidden = c.page === "首页";
      this.patch(
        "floating",
        [c.styles.shortcuts, c.quick, v.shortcuts, c.page, c.locale],
        () => (c.page === "首页" ? floating(c) : ""),
      );
      this.patch(
        "overlay",
        [
          c.sidebar,
          c.styles.sidebar,
          c.sidebarGroup,
          c.sidebarExpanded,
          c.sheet,
          c.filterDraft,
          c.focus,
          c.styles.popup,
          c.popupTab,
          c.styles.search,
          c.auth,
          c.locale,
          v.sidebar,
          v.shortcuts,
        ],
        () => {
          if (c.sidebar && v.sidebar !== "关闭" && !v.sidebarDisabled)
            return (
              btn(
                "sidebar",
                text(c, "关闭侧边栏", "Close sidebar"),
                "",
                'class="p-scrim"',
              ) + sidebar(c)
            );
          if (c.sheet && c.focus === "popupStyle") return btn("close-filter", text(c,"关闭弹窗","Close dialog"), "", 'class="p-scrim"') + NGCurrent.popup(c);
          if (c.sheet)
            return (
              btn(
                "close-filter",
                text(c, "关闭筛选", "Close filters"),
                "",
                'class="p-scrim"',
              ) + filters(c)
            );
          return "";
        },
      );
      const modal = !!(
        c.sidebar ||
        c.sheet ||
        (c.quick && c.styles.shortcuts === 2)
      );
      this.root.querySelector(".p-scroll").inert = modal;
      this.slots.bottom.inert = modal;
      this.stickySearch();
    }
    updateGrid() {
      const c = this.current();
      this.patch(
        "grid",
        [
          c.styles.grid,
          c.styles.category,
          c.category,
          c.query,
          c.providers,
          c.recent,
          c.favorite,
          c.density,
          c.content,
          c.locale,
          c.values.gameIconStyle,
        ],
        () => grid(c),
      );
    }
    stickySearch() {
      if (!this.config) return;
      const bar = this.slots.search,
        region = this.root.querySelector(".p-game-region"),
        r = region.getBoundingClientRect(),
        s = this.root.getBoundingClientRect();
      const sticky =
        this.current().styles.search === 6 &&
        r.top < s.top + 10 &&
        r.bottom > s.bottom - 90 &&
        this.current().page === "首页";
      bar.classList.toggle("p-stuck", sticky);
    }
    playerChoice(change) {
      const p = this.config.policy || D.defaultPolicy(),
        theme = change.theme || this.local.theme || this.config.theme;
      if (!p.themes.includes(theme)) return;
      const colors = p.colors[theme] || [],
        color =
          change.color ||
          (theme === this.config.theme ? this.config.color : p.defaults[theme]);
      if (!colors.includes(color)) return;
      Object.assign(this.local, { theme, color });
      this.render();
    }
    toast(message) {
      const n = this.root.querySelector(".p-toast");
      n.textContent = message;
      n.classList.add("show");
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => n.classList.remove("show"), 2600);
    }
    trapFocus(e) {
      const modal =
        this.slots.overlay.querySelector('[role="dialog"],.p-sidebar') ||
        this.slots.floating.querySelector(".p-floating-2.is-open");
      if (!modal) return;
      const list = [
        ...modal.querySelectorAll("button,input,select,summary"),
      ].filter((n) => n.getClientRects().length);
      if (!list.length) return;
      if (e.shiftKey && document.activeElement === list[0]) {
        e.preventDefault();
        list.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === list.at(-1)) {
        e.preventDefault();
        list[0].focus();
      }
    }
    click(e) {
      const b = e.target.closest("[data-p]");
      if (!b || !this.root.contains(b)) return;
      if (window.NGPageComponents?.handle(this, b)) return;
      const a = b.dataset.p,
        c = this.current(),
        l = this.local,
        t = (z, en) => text(c, z, en);
      let render = true;
      if (a === "current-popup-tab") l.popupTab = Number(b.dataset.index);
      if (a === "page") {
        if (["登录","注册"].includes(b.dataset.page)) l.authTab = b.dataset.page === "注册" ? 1 : 0;
        l.sidebar = l.quick = l.sheet = false;
        if (this.onNavigate) this.onNavigate(targetPage(b.dataset.page));
        else this.config.page = targetPage(b.dataset.page);
      }
      if (a === "sidebar") l.sidebar = !l.sidebar;
      if (a === "sidebar-group") {
        l.sidebarGroup = b.dataset.group;
        l.sidebarExpanded = true;
      }
      if (a === "quick") l.quick = !l.quick;
      if (a === "category") {
        l.category = b.dataset.category;
        l.sidebar = false;
      }
      if (a === "category-next" || a === "category-prev") {
        const i = categories.findIndex((x) => x[0] === l.category);
        l.category =
          categories[
            (i + (a === "category-next" ? 1 : -1) + categories.length) %
              categories.length
          ][0];
      }
      if (a === "banner") l.banner = Number(b.dataset.index);
      if (a === "banner-next" || a === "banner-prev")
        l.banner =
          (l.banner + (a === "banner-next" ? 1 : -1) + banners.length) %
          banners.length;
      if (a === "density") l.density = Number(b.dataset.density);
      if (a === "flag") l[b.dataset.flag] = !l[b.dataset.flag];
      if (a === "provider") {
        const p = b.dataset.provider;
        l.providers = l.providers.includes(p)
          ? l.providers.filter((x) => x !== p)
          : [...l.providers, p];
      }
      if (a === "filter") {
        l.sheet = !l.sheet;
        l.filterDraft = {
          providers: l.providers.slice(),
          recent: l.recent,
          favorite: l.favorite,
        };
      }
      if (a === "close-filter") l.sheet = false;
      if (a === "draft-flag")
        l.filterDraft[b.dataset.flag] = !l.filterDraft[b.dataset.flag];
      if (a === "draft-provider") {
        const p = b.dataset.provider,
          d = l.filterDraft;
        d.providers = d.providers.includes(p)
          ? d.providers.filter((x) => x !== p)
          : [...d.providers, p];
      }
      if (a === "clear-draft")
        l.filterDraft = { providers: [], recent: false, favorite: false };
      if (a === "apply-filter") {
        Object.assign(l, l.filterDraft);
        l.sheet = false;
      }
      if (a === "clear-filters") {
        l.query = "";
        l.providers = [];
        l.recent = l.favorite = false;
        const input = this.slots.search.querySelector("input");
        if (input) input.value = "";
      }
      if (a === "close-download") l.downloadClosed = true;
      if (a === "player-color") this.playerChoice({ color: b.dataset.color });
      if (a === "focus-search") {
        this.slots.search.querySelector("input")?.focus();
        render = false;
      }
      if (a === "amount") {
        const input = this.slots.secondary.querySelector(
          '[inputmode="decimal"]',
        );
        if (input) input.value = b.dataset.amount;
        render = false;
      }
      if (a === "select-method") {
        b.parentElement
          .querySelectorAll("button")
          .forEach((n) => n.setAttribute("aria-pressed", String(n === b)));
        render = false;
      }
      if (a === "more") {
        const row = b.closest(".p-game-group")?.querySelector(".p-card-row");
        if (row)
          row.scrollBy({ left: row.clientWidth * 0.8, behavior: "smooth" });
        render = false;
      }
      if (a === "retry") {
        this.config.content = "normal";
      }
      if (["game", "demo-submit", "demo-login", "download"].includes(a)) {
        this.toast(
          t(
            a === "game"
              ? "游戏展示示例，不启动真实游戏。"
              : a === "download"
                ? "下载入口示例，不安装应用。"
                : "交互示例，不提交资料或交易。",
            a === "game"
              ? "Demo game card. No real game launches."
              : a === "download"
                ? "Demo download entry. No app is installed."
                : "Demo interaction. No data or transaction is submitted.",
          ),
        );
        render = false;
      }
      if (render) {
        this.render();
        if (a === "filter" || a === "sidebar")
          this.slots.overlay.querySelector("button,summary")?.focus();
      }
    }
  }
  function thumbnail(family, style, color) {
    const c = {
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
        topStatusBar: { loggedIn: "全部功能" },
        sidebar: "左方",
        shortcuts: "浮动并列",
        categoryButtons: "图示+名称",
        topDownloadBar: "开启",
        gameIconStyle: "标准",
      },
      theme: "NG",
      color,
      auth: "loggedIn",
      locale: "zh",
      category: "ALL",
      providers: [],
      density: 3,
      banner: 0,
      install: true,
      quick: true,
      thumbnail: true,
      sidebarGroup: "games",
      sidebarExpanded: true,
    };
    c.styles[family] = style;
    const functions = {
      category: categoryButtons,
      header,
      sidebar,
      shortcuts: floating,
      grid,
      search,
      carousel,
      download,
    };
    const content =
      family === "category"
        ? '<section class="p-game-region"><div>' +
          categoryButtons(c) +
          '</div><div class="p-game-content">' +
          search(c) +
          grid(c) +
          "</div></section>"
        : functions[family](c);
    return (
      '<div class="ng-player p-mini p-mini-' +
      family +
      '" data-name="样式预览 · ' +
      family +
      " " +
      style +
      '" data-variant="' +
      style +
      '" data-category="' +
      c.styles.category +
      '" style="' +
      D.cssVars(color) +
      '"><div class="p-mini-canvas" data-name="缩略画布">' +
      content +
      "</div></div>"
    );
  }
  window.NGPlayer = { Player, thumbnail, esc, icon };
})();
