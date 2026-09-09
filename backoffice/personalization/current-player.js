/* Shared current-layout previews: no live content, credentials, or transaction requests. */
(function () {
  "use strict";
  const C = NGCurrent,
    D = NGDesign,
    { esc: E, icon } = NGPlayer;
  const t = (c, zh, en) => (c.locale === "en" ? en : zh);
  const button = (a, body, attrs = "", cls = "") =>
    `<button type="button" data-p="${a}" class="${cls}" ${attrs}>${body}</button>`;
  const link = (c, page, en, g = "info") =>
    button(
      "page",
      icon(g) + `<span>${t(c, page, en)}</span>`,
      `data-page="${E(page)}"`,
    );
  C.download = (c, base) => {
    const d = c.current?.topDownloadBar?.content;
    if (!base || !d) return base;
    const el = document.createElement("div");
    el.innerHTML = base;
    const banner = el.firstElementChild;
    if (/^#[0-9a-f]{6}$/i.test(d.background || "")) {
      banner.dataset.customBackground = "true";
      banner.style.backgroundColor = d.background;
      const rgb = d.background
        .slice(1)
        .match(/../g)
        .map((x) => parseInt(x, 16) / 255)
        .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
      banner.style.color =
        0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.179
          ? "#111111"
          : "#ffffff";
    }
    const copy = el.querySelector(".p-download-copy span");
    if (copy && typeof d.copy === "string") copy.textContent = d.copy;
    if (C.safeImage(d.left)) {
      const image = document.createElement("img");
      image.className = "current-download-image current-download-left";
      image.alt = "";
      image.src = d.left;
      banner.firstElementChild.replaceWith(image);
    }
    if (C.safeImage(d.right)) {
      const image = document.createElement("img");
      image.className = "current-download-image";
      image.alt = "";
      image.src = d.right;
      banner.querySelector(".p-download-cta").before(image);
    }
    return el.innerHTML;
  };
  C.footer = (c) => {
    const n =
        c.styles.footer ||
        Math.max(1, D.names.indexOf(c.values.footerStyle) + 1),
      first = n === 3 ? "活动" : "VIP";
    const links = (
      n < 3
        ? [
            ["活动", "Promotions"],
            ["关于我们", "About"],
            ["帮助中心", "Help"],
            ["联系我们", "Contact"],
          ]
        : [
            [first, first === "VIP" ? "VIP" : "Promotions"],
            ["关于我们", "About"],
            ["帮助中心", "Help"],
            ["联系我们", "Contact"],
          ]
    )
      .map(([p, en]) => link(c, p, en))
      .join("");
    return `<footer class="p-footer current-footer current-footer-${n}"><div class="current-footer-links">${links}</div><section><h3>${t(c, "加入我们", "Join us")}</h3><div class="current-socials">${["Facebook", "Telegram", "WhatsApp", "Instagram", "X", "YouTube"].map((x) => button("page", `<span>${x.slice(0, 1)}</span>`, `data-page="${x}" aria-label="${x}"`)).join("")}</div></section><section><h3>${t(c, "游戏合作商", "Game partners")}</h3><div class="current-partners">${["Partner A", "Partner B", "Partner C", "Partner D", "Partner E", "Partner F"].map((x) => `<span>${x}</span>`).join("")}</div></section><section><h3>${t(c, "站点介绍", "Site introduction")}</h3><p>${t(c, "欢迎来到本站。游戏、活动与服务信息由各内容模块提供。", "Welcome. Games, promotions and service information are provided by their content modules.")}</p><strong class="current-footer-brand">NGSS</strong></section></footer>`;
  };
  C.popup = (c) => {
    const n =
        c.styles.popup || Math.max(1, D.names.indexOf(c.values.popupStyle) + 1),
      tab = c.popupTab || 0;
    const titles = [
      ["公告", "Notices"],
      ["活动", "Promotions"],
      ["消息", "Messages"],
    ];
    return `<section class="current-popup current-popup-${n}" role="dialog" aria-modal="true" aria-label="${t(c, "信息中心", "Information center")}"><header><h2>${t(c, "信息中心", "Information center")}</h2>${button("close-filter", "×", `aria-label="${t(c, "关闭", "Close")}"`)}</header><div class="current-popup-layout"><nav aria-label="${t(c, "信息分类", "Information categories")}">${titles.map(([zh, en], i) => button("current-popup-tab", t(c, zh, en), `data-index="${i}" aria-pressed="${tab === i}"`)).join("")}</nav><div class="current-popup-content"><span class="current-popup-mark">${icon(tab === 1 ? "gift" : "task")}</span><h3>${t(c, titles[tab][0], titles[tab][1])}</h3><p>${t(c, ["欢迎来到本站，最新消息将在这里显示。", "查看当前活动的参与方式与说明。", "登录后查看个人消息与通知。"][tab], ["Welcome. Latest notices appear here.", "Explore promotions and participation details.", "Sign in to read personal messages."][tab])}</p>${link(c, tab === 1 ? "活动" : tab === 2 ? "站内信" : "首页", tab === 1 ? "View promotions" : tab === 2 ? "Messages" : "Home")}</div></div></section>`;
  };
  C.promotions = (c) =>
    `<div class="current-home-promotions">${link(c, "活动", "Promotions", "gift")}${link(c, "推广", "Referrals", "report")}</div>`;
  C.home = (c, base) => {
    const h = c.current?.gameLayout?.home || {};
    return (
      (h.promotions ? C.promotions(c) : "") + (h.quick === false ? "" : base)
    );
  };
  C.page = (c) => {
    const p = c.page,
      protectedPages = ["返水", "任务", "代理中心", "利息宝"];
    const definitions = {
      发现: [
        "Discover",
        "search",
        "发现精选内容与常用入口。",
        "Explore selected content and useful entries.",
        [
          ["活动", "Promotions"],
          ["首页", "Browse games"],
        ],
      ],
      免费试玩: [
        "Free demo",
        "game",
        "选择示例游戏了解界面。",
        "Explore the interface with example games.",
        [["首页", "Browse games"]],
      ],
      返水: [
        "Cashback",
        "wallet",
        "返水记录与可领取状态显示在这里。",
        "Cashback records and availability appear here.",
        [["钱包", "Wallet"]],
      ],
      任务: [
        "Tasks",
        "task",
        "任务列表、参与条件与进度显示在这里。",
        "Task requirements and progress appear here.",
        [["活动", "Promotions"]],
      ],
      分享: [
        "Share",
        "gift",
        "分享入口与邀请信息。",
        "Sharing and invitation information.",
        [["推广", "Referrals"]],
      ],
      代理中心: [
        "Agent center",
        "user",
        "代理资料、团队与报表入口。",
        "Agent information, team and reports.",
        [["推广", "Referrals"]],
      ],
      利息宝: [
        "Savings",
        "wallet",
        "余额与产品说明的展示入口。",
        "Entry for balances and product information.",
        [["钱包", "Wallet"]],
      ],
      关于我们: ["About", "info", "本站介绍。", "About this site.", []],
      帮助中心: [
        "Help",
        "info",
        "常见问题与使用说明。",
        "Frequently asked questions and guidance.",
        [["客服", "Support"]],
      ],
      联系我们: [
        "Contact",
        "info",
        "联系本站客服。",
        "Contact site support.",
        [["客服", "Support"]],
      ],
      语言: [
        "Language",
        "language",
        "选择显示语言。",
        "Choose a display language.",
        [["设置", "Settings"]],
      ],
      报表: [
        "Reports",
        "report",
        "查看账户报表。",
        "View account reports.",
        [["钱包", "Wallet"]],
      ],
      交易: [
        "Transactions",
        "trade",
        "查看交易记录。",
        "View transaction records.",
        [["钱包", "Wallet"]],
      ],
      投注: [
        "Bets",
        "game",
        "查看投注记录。",
        "View bet records.",
        [["钱包", "Wallet"]],
      ],
      活跃度: [
        "Activity",
        "gift",
        "查看账户活跃度。",
        "View account activity.",
        [],
      ],
      建议反馈: [
        "Feedback",
        "info",
        "联系本站提供建议。",
        "Contact us with your feedback.",
        [["客服", "Support"]],
      ],
      关于: [
        "About",
        "info",
        "本站介绍。",
        "About this site.",
        [["关于我们", "About us"]],
      ],
    };
    if (
      [
        "Facebook",
        "Telegram",
        "WhatsApp",
        "Instagram",
        "X",
        "YouTube",
      ].includes(p)
    )
      return `<section class="p-secondary"><h2>${p}</h2><p>${t(c, "社群链接由站点内容管理提供。", "Social links are supplied by site content management.")}</p></section>`;
    const def = definitions[p];
    if (!def) return null;
    if (protectedPages.includes(p) && c.auth !== "loggedIn")
      return `<section class="p-secondary"><h2>${t(c, "登录后继续", "Log in to continue")}</h2>${link(c, "登录", "Log in", "user")}</section>`;
    return `<section class="p-secondary current-destination" data-destination="${E(p)}">${icon(def[1])}<h2>${t(c, p, def[0])}</h2><p>${t(c, def[2], def[3])}</p>${c.content === "loading" ? `<p role="status">${t(c, "正在加载…", "Loading…")}</p>` : c.content === "error" ? button("retry", t(c, "重新加载", "Retry")) : c.content === "empty" ? `<p>${t(c, "暂无内容", "No content yet")}</p>` : def[4].map(([page, en]) => link(c, page, en)).join("")}</section>`;
  };
  C.thumbnail = (key, n, color) => {
    if (!["footer", "popup"].includes(key)) return null;
    const c = {
      styles: { [key]: n },
      values: {},
      locale: "zh",
      auth: "loggedIn",
    };
    return `<div class="ng-player p-mini current-mini" style="${D.cssVars(color)}"><div class="p-mini-canvas">${key === "footer" ? C.footer(c) : C.popup(c)}</div></div>`;
  };
  C.reviewThumbnail = (id, row, theme, color, base) => {
    if (id !== "topDownloadBar") return base;
    const el = document.createElement("div");
    el.innerHTML = base;
    const banner = el.querySelector(".p-download");
    if (banner)
      banner.outerHTML = C.download(
        { current: { topDownloadBar: row.extra || {} } },
        banner.outerHTML,
      );
    return el.innerHTML;
  };
})();
