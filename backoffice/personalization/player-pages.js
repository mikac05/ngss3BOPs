/* Shared page primitives and region renderers; synthetic, browser-local interactions only. */
(function () {
  "use strict";
  const D = NGDesign,
    { esc: E, icon } = NGPlayer;
  const t = (c, zh, en) => (c.locale === "en" ? en : zh);
  const button = (action, content, attrs = "", cls = "") =>
    `<button type="button" data-p="${action}" class="${cls}" ${attrs}>${content}</button>`;
  const link = (c, page, en, glyph = "", cls = "") =>
    button(
      "page",
      (glyph ? icon(glyph) : "") + `<span>${t(c, page, en)}</span>`,
      `data-page="${page}" aria-label="${E(t(c, page, en))}"`,
      cls,
    );
  const title = (c, zh, en) =>
    `<div class="pp-title">${link(c, "首页", "Home", "home")}<h2>${t(c, zh, en)}</h2>${link(c, "客服", "Support", "info")}</div>`;
  const brand = () =>
    '<span class="p-logo-asset" aria-label="NGSS"><span class="p-logo-letters"></span><span class="p-logo-accent"></span></span>';
  const tabs = (c, action, labels, selected) =>
    `<div class="pp-tabs" role="group">${labels.map(([zh, en], i) => button(action, t(c, zh, en), `data-index="${i}" aria-pressed="${selected === i}"`)).join("")}</div>`;
  const progress = (c, value = 35) =>
    `<div class="pp-progress"><progress aria-label="${t(c, "等级进度", "Level progress")}" value="${value}" max="100"></progress><small>${t(c, "当前进度", "Current progress")} ${value}%</small></div>`;
  const money = (c) =>
    `<span>${t(c, "总余额", "Total balance")}</span><div class="pp-money"><strong data-balance>970.80</strong>${button("pp-refresh", "↻", `aria-label="${t(c, "刷新余额", "Refresh balance")}"`)}</div>`;
  const walletActions = (c) =>
    `<div class="pp-wallet-actions">${link(c, "充值", "Deposit", "wallet")}${link(c, "提款", "Withdraw", "trade")}${link(c, "钱包", "History", "report")}</div>`;
  const pageClass = (key, n, html) =>
    `<section class="pp-page pp-${key} pp-${key}-${n}" data-page-variant="${key}-${n}">${html}</section>`;
  function auth(c) {
    const n = c.styles.auth || 1,
      register = c.authTab === 1,
      code = !register && c.authMethod === 1;
    const artwork = c.media?.[register ? "register" : "login"];
    const safeImage =
      typeof artwork === "string" &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(artwork)
        ? artwork
        : "";
    const art = `<img class="pp-auth-image" src="${safeImage || "assets/ng-design/" + (n === 1 ? "auth-ensemble.webp" : n === 4 ? "1beb95363e651bdb7ed2.webp" : "auth-miner.webp")}" alt="" loading="lazy" decoding="async">`;
    const field = (zh, en, type = "text", suffix = "") =>
      `<label class="pp-field"><span>${t(c, zh, en)}</span><div>${icon(type === "password" ? "info" : "user")}<input data-auth-field type="${type}" autocomplete="off" placeholder="${t(c, zh, en)}">${suffix}</div></label>`;
    const form =
      `<div class="pp-auth-heading"><small>${t(c, register ? "开启新的体验" : "WELCOME BACK", register ? "JOIN US" : "WELCOME BACK")}</small><h2>${t(c, register ? "注册账户" : "欢迎回来", register ? "Create account" : "Welcome back")}</h2></div>` +
      tabs(
        c,
        "pp-auth-tab",
        [
          ["登录", "Log in"],
          ["注册", "Register"],
        ],
        register ? 1 : 0,
      ) +
      (!register
        ? tabs(
            c,
            "pp-auth-method",
            [
              ["密码登录", "Password"],
              ["验证码登录", "Verification code"],
            ],
            code ? 1 : 0,
          )
        : "") +
      field(code ? "手机号码" : "账户", code ? "Mobile number" : "Account") +
      field(
        code ? "验证码" : "密码",
        code ? "Verification code" : "Password",
        code ? "text" : "password",
        code ? button("demo-submit", t(c, "获取", "Get code")) : "",
      ) +
      (register
        ? field("确认密码", "Confirm password", "password") +
          '<label class="pp-agree"><input type="checkbox">' +
          t(c, "我已阅读并同意服务条款", "I agree to the terms of service") +
          "</label>"
        : `<div class="pp-auth-options"><label><input type="checkbox">${t(c, "记住账户", "Remember account")}</label>${button("demo-submit", t(c, "忘记密码？", "Forgot password?"))}</div>`) +
      button(
        "demo-login",
        t(c, register ? "注册" : "登录", register ? "Register" : "Log in"),
        "",
        "p-primary pp-submit",
      ) +
      `<div class="pp-auth-support">${link(c, "客服", "Contact support", "info")}</div>`;
    return pageClass(
      "auth",
      n,
      `<div class="pp-auth-top">${brand()}${link(c, "首页", "Home", "home")}</div><div class="pp-auth-hero">${n === 3 ? brand() : art}</div><div class="pp-auth-body p-auth-form">${form}</div>`,
    );
  }
  function deposit(c) {
    const n = c.styles.deposit || 1,
      m = c.methodIndex || 0,
      amount = c.amount ?? (c.values.amountAutoInput === "自动" ? "100" : "");
    const methods = [
      ["电子钱包", "E-wallet", "wallet"],
      ["银行转账", "Bank transfer", "trade"],
      ["加密货币", "Crypto", "game"],
    ];
    const channelOptions = [1, 2]
      .map(
        (n) =>
          `<option value="${n}" ${Number(c.channel || 1) === n ? "selected" : ""}>${t(c, methods[m][0], methods[m][1])} 0${n}</option>`,
      )
      .join("");
    const method = `<section class="pp-card p-payment-method"><h3>${t(c, "支付方式", "Payment method")}</h3><div class="pp-methods">${methods.map(([zh, en, i], j) => button("pp-method", icon(i) + `<span>${t(c, zh, en)}</span>`, `data-index="${j}" aria-pressed="${m === j}"`)).join("")}</div><label class="pp-field"><span>${t(c, "充值通道", "Deposit channel")}</span><select data-page-field="channel">${channelOptions}</select></label></section>`;
    const entry = `<section class="pp-card p-payment-amount"><h3>${t(c, "充值金额", "Deposit amount")}</h3><label class="pp-field"><span>${t(c, "输入金额", "Enter amount")}</span><input data-page-field="amount" inputmode="decimal" value="${E(amount)}" placeholder="0.00"></label>${c.values.amountAutoInput === "按钮" ? `<div class="pp-amounts">${[100, 300, 500, 1000, 2000, 5000].map((x) => button("pp-amount", String(x), `data-amount="${x}" aria-pressed="${String(amount) === String(x)}"`)).join("")}</div>` : ""}<div class="pp-receipt"><span>${t(c, "预计到账", "Estimated credit")}</span><b data-credit>${amount ? E(amount) : "0.00"}</b></div></section>`;
    const form = `<div class="pp-deposit-form ${c.values.depositPage === "额度优先" ? "amount-first" : ""}">${method}${entry}</div>${button("demo-submit", t(c, "确认充值", "Confirm deposit"), "", "p-primary pp-submit")}<details class="pp-card pp-help" open><summary>${t(c, "充值说明", "Deposit information")}</summary><p>${t(c, "请选择可用通道，核对金额后再继续。处理时间及可用额度以通道提示为准。", "Select an available channel and review the amount. Processing time and limits are shown by the channel.")}</p></details>`;
    return pageClass(
      "deposit",
      n,
      title(c, "钱包", "Wallet") +
        `<div class="pp-balance">${money(c)}${n === 1 ? "" : walletActions(c)}</div>` +
        tabs(
          c,
          "pp-wallet-tab",
          [
            ["充值", "Deposit"],
            ["提款", "Withdraw"],
            ["记录", "History"],
          ],
          c.page === "钱包" ? 2 : c.page === "提款" ? 1 : 0,
        ) +
        (c.page === "钱包"
          ? records(c)
          : c.page === "提款"
            ? withdraw(c)
            : form),
    );
  }
  function records(c) {
    const list = [1, 2, 3]
      .map(
        (n) =>
          `<details class="pp-record" ${c.values.recordsDisplay === "下拉" ? "open" : ""}><summary><span>${t(c, "充值", "Deposit")} #DEMO0${n}<small>2026-09-07 · 10:3${n}</small></span><b>+100.00</b></summary><p>${t(c, "已完成 · 示例记录", "Completed · Example record")}</p></details>`,
      )
      .join("");
    return `<section class="pp-card"><h3>${t(c, "交易记录", "Transaction history")}</h3>${c.values.recordsDisplay === "下拉" ? '<label class="pp-field"><span>' + t(c, "记录类型", "Record type") + "</span><select><option>" + t(c, "全部", "All") + "</option><option>" + t(c, "充值", "Deposit") + "</option></select></label>" : ""}${list}</section>`;
  }
  function withdraw(c) {
    return `<section class="pp-card"><h3>${t(c, "提款账户", "Withdrawal account")}</h3><label class="pp-field"><span>${t(c, "选择已验证账户", "Select verified account")}</span><select><option>${t(c, "示例银行账户", "Example bank account")} · •• 1024</option></select></label><label class="pp-field"><span>${t(c, "提款金额", "Withdrawal amount")}</span><input inputmode="decimal" placeholder="0.00"></label></section>${button("demo-submit", t(c, "下一步", "Continue"), "", "p-primary pp-submit")}`;
  }
  function vipCard(c) {
    if (c.values.vipCard === "隐藏VIP资讯") return "";
    return `<section class="pp-member-card ${c.values.vipCard === "仅显示徽章" ? "pp-badge-only" : ""}">${icon("vip")}<div><b>VIP 3</b>${c.values.vipCard === "完整卡片" ? progress(c) : ""}</div>${link(c, "VIP", "Benefits")}</section>`;
  }
  function profile(c) {
    const n = c.styles.profile || 1;
    const entries = [
      ["VIP", "VIP", "vip"],
      ["站内信", "Inbox", "task"],
      ["活动", "Promotions", "gift"],
      ["推广", "Affiliate", "report"],
      ["用户验证", "Verification", "user"],
      ["设置", "Settings", "language"],
      ["客服", "Support", "info"],
      ["钱包", "History", "wallet"],
      ["代理中心", "Agent center", "user"], ["报表", "Reports", "report"],
      ["语言", "Language", "language"], ["交易", "Transactions", "trade"],
      ["投注", "Bets", "game"], ["活跃度", "Activity", "gift"],
      ["建议反馈", "Feedback", "info"], ["关于", "About", "info"],
    ];
    const identity = `<div class="pp-identity"><span class="pp-avatar">${icon("user")}</span><div><b>${t(c, "示例玩家", "Demo player")}</b><small>ID · DEMO1024</small></div>${link(c, "设置", "Settings", "info")}</div>`;
    const balance = `<div class="pp-balance">${money(c)}${walletActions(c)}</div>`;
    return pageClass(
      "profile",
      n,
      (n === 4 ? identity + vipCard(c) + balance
        : n === 5 ? identity + vipCard(c) + '<div class="current-wallet-balances"><div><span>' + t(c,"现金钱包","Cash wallet") + '</span><strong>970.80</strong></div><div><span>' + t(c,"彩金钱包","Bonus wallet") + '</span><strong>120.00</strong></div></div>' + walletActions(c)
        : identity + balance + vipCard(c)) +
        `<div class="pp-account-menu">${entries.map(([zh, en, i]) => link(c, zh, en, i)).join("")}</div><div class="pp-account-bottom">${link(c, "设置", "Language & appearance", "language")}${button("demo-submit", t(c, "退出登录", "Log out"))}</div>`,
    );
  }
  function vip(c) {
    const n = c.styles.vip || 1,
      level = c.vipLevel ?? 3;
    const benefits = [
      ["升级奖励", "Level reward", "gift"],
      ["每周奖励", "Weekly reward", "wallet"],
      ["每月奖励", "Monthly reward", "trade"],
      ["生日礼遇", "Birthday gift", "gift"],
      ["专属客服", "Dedicated support", "info"],
      ["专属活动", "VIP promotions", "vip"],
    ];
    const hero = `<div class="pp-vip-hero">${icon("vip")}<div><small>${t(c, "当前等级", "Current level")}</small><h2>VIP 3</h2></div>${progress(c)}</div>`;
    const selector = `<div class="pp-level-selector" aria-label="${t(c, "查看等级权益", "Explore level benefits")}">${[1, 2, 3, 4, 5, 6].map((x) => button("pp-vip-level", icon("vip") + `<b>VIP ${x}</b>`, `data-level="${x}" aria-pressed="${level === x}"`)).join("")}</div>`;
    const list = `<section class="pp-card"><div class="pp-section-title"><h3>VIP ${level} · ${t(c, "等级权益", "Benefits")}</h3><small>${t(c, "权益示例", "Example benefits")}</small></div><div class="pp-benefits">${benefits.map(([zh, en, i], j) => `<div class="pp-benefit">${icon(i)}<div><b>${t(c, zh, en)}</b><small>${t(c, "以账户权益为准", "Subject to account eligibility")}</small></div><strong>${j < 4 ? (level * (j + 1) * 10).toFixed(2) : "—"}</strong></div>`).join("")}</div></section>`;
    return pageClass(
      "vip",
      n,
      title(c, "VIP", "VIP") +
        hero +
        selector +
        list +
        `<details class="pp-card pp-help"><summary>${t(c, "等级规则", "Level rules")}</summary><p>${t(c, "等级、升级条件与奖励由账户服务提供。此处演示不同等级的呈现方式。", "Levels, requirements and rewards come from the account service. This view demonstrates their presentation.")}</p></details>`,
    );
  }
  function inbox(c) {
    const n = c.styles.inbox || 1,
      filter = c.inboxFilter || 0;
    const messages = [
      [
        "欢迎加入",
        "Welcome",
        "账户已准备就绪，前往个人中心完善资料。",
        "Your account is ready. Complete your profile in the account center.",
        0,
      ],
      [
        "账户安全提醒",
        "Account security",
        "请妥善保管账户信息，并定期检查登录记录。",
        "Keep your account details safe and review your login history.",
        0,
      ],
      [
        "活动通知",
        "Promotion update",
        "新的活动内容已更新，前往活动页了解详情。",
        "New promotions are available. Visit Promotions for details.",
        1,
      ],
      [
        "系统维护公告",
        "Maintenance notice",
        "感谢您的耐心等候，服务现已恢复。",
        "Thank you for your patience. Service has resumed.",
        2,
      ],
    ];
    const selected = messages
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => filter === 0 || m[4] === filter - 1);
    const list =
      c.content === "empty"
        ? `<div class="pp-empty">${icon("task")}<h3>${t(c, "暂无消息", "No messages")}</h3><p>${t(c, "新消息将显示在这里。", "New messages will appear here.")}</p></div>`
        : selected
            .map(({ m, i }) => {
              const unread = !(c.readMessages || []).includes(i) && i < 2;
              const expanded =
                c.openMessage === i ||
                (n === 3 && !(c.values.inbox === "已读收折" && !unread));
              return `<article class="pp-message ${unread ? "unread" : ""}">${button("pp-message", `<span class="pp-message-icon">${icon(m[4] === 1 ? "gift" : "task")}</span><span><b>${t(c, m[0], m[1])}</b><small>2026-09-0${7 - i} · 10:30</small></span><i>${unread ? "●" : "›"}</i>`, `data-index="${i}" aria-expanded="${expanded}"`)}${n === 3 || expanded ? `<p ${expanded ? "" : "class=pp-message-excerpt"}>${t(c, m[2], m[3])}</p>` : ""}</article>`;
            })
            .join("");
    return pageClass(
      "inbox",
      n,
      title(c, "消息中心", "Messages") +
        tabs(
          c,
          "pp-inbox-filter",
          [
            ["全部", "All"],
            ["通知", "Notices"],
            ["活动", "Promotions"],
            ["公告", "Announcements"],
          ],
          filter,
        ) +
        `<div class="pp-inbox-toolbar"><span>${t(c, "最近消息", "Recent messages")}</span>${button("pp-read-all", t(c, "全部已读", "Mark all read"))}</div><div class="pp-messages">${list}</div>`,
    );
  }
  function bottom(c) {
    const n = c.styles.bottom || 1,
      nav = c.nav || ["首页", "活动", "推广", "VIP", "账户"];
    const map = {
      首页: ["Home", "home"],
      活动: ["Promotions", "gift"],
      推广: ["Affiliate", "report"],
      VIP: ["VIP", "vip"],
      账户: ["Account", "user"],
      我的: ["Me", "user"],
      钱包: ["Wallet", "wallet"],
      客服: ["Support", "info"],
    };
    return `<nav class="p-bottom pp-bottom pp-bottom-${n}" aria-label="${t(c, "主导航", "Primary navigation")}">${nav
      .map((p, i) => {
        const [,en,g] = NGCurrent.navInfo(p);
        return button(
          p === "APP下载" ? "download" : "page",
          `<span class="pp-nav-icon">${icon(g)}</span><span>${t(c, p, en)}</span>`,
          `data-page="${p}" aria-current="${NGCurrent.canonical(c.page) === NGCurrent.canonical(p) ? "page" : "false"}"`,
          i === Math.floor(nav.length / 2) ? "pp-nav-center" : "",
        );
      })
      .join("")}</nav>`;
  }
  const routes = {
    登入注册: "auth",
    充值: "deposit",
    钱包: "deposit",
    提款: "deposit",
    账户: "profile",
    我的: "profile",
    VIP: "vip",
    站内信: "inbox",
  };
  const renders = { auth, deposit, profile, vip, inbox, bottom };
  function render(c) {
    const key = routes[c.page];
    if (!key) return null;
    if (
      key !== "auth" &&
      ["loading", "error", "empty"].includes(c.content) &&
      !(key === "inbox" && c.content === "empty")
    )
      return pageClass(
        key,
        c.styles[key] || 1,
        title(
          c,
          c.page,
          {
            账户: "Account",
            VIP: "VIP",
            充值: "Deposit",
            钱包: "Wallet",
            提款: "Withdraw",
            站内信: "Messages",
          }[c.page] || c.page,
        ) +
          (c.content === "loading"
            ? `<div class="pp-skeleton" role="status" aria-label="${t(c, "加载中", "Loading")}"><i></i><i></i><i></i><p>${t(c, "正在加载…", "Loading…")}</p></div>`
            : `<div class="pp-empty">${icon("task")}<h3>${t(c, c.content === "error" ? "暂时无法加载" : "暂无内容", c.content === "error" ? "Unable to load" : "No content yet")}</h3><p>${t(c, c.content === "error" ? "请重试。" : "内容更新后会显示在这里。", c.content === "error" ? "Please try again." : "Updates will appear here.")}</p>${c.content === "error" ? button("retry", t(c, "重新加载", "Try again"), "", "p-primary") : ""}</div>`),
      );
    return renders[key](c);
  }
  function signature(c) {
    const key = routes[c.page];
    const values = {
      auth: [],
      deposit: ["depositPage", "amountAutoInput", "recordsDisplay"],
      profile: ["vipCard"],
      vip: [],
      inbox: ["inbox"],
    };
    return key
      ? [
          key,
          c.page,
          c.auth,
          c.locale,
          c.theme,
          c.styles[key],
          c.content,
          (values[key] || []).map((k) => c.values[k]),
          c.authTab,
          c.authMethod,
          c.methodIndex,
          c.amount,
          c.channel,
          c.vipLevel,
          c.inboxFilter,
          c.openMessage,
          c.readMessages,
          key === "auth" ? c.media : null,
        ]
      : null;
  }
  function handle(player, b) {
    const a = b.dataset.p,
      l = player.local;
    if (!a.startsWith("pp-")) return false;
    const focusKey = {
      "pp-auth-tab": "authTab",
      "pp-auth-method": "authMethod",
      "pp-method": "methodIndex",
      "pp-inbox-filter": "inboxFilter",
    }[a];
    if (focusKey) l[focusKey] = Number(b.dataset.index);
    if (a === "pp-method") delete l.channel;
    if (a === "pp-wallet-tab") {
      const page = ["充值", "提款", "钱包"][Number(b.dataset.index)];
      if (player.onNavigate) player.onNavigate(page);
      else {
        player.config.page = page;
        player.render();
      }
      return true;
    }
    if (a === "pp-amount") l.amount = b.dataset.amount;
    if (a === "pp-vip-level") l.vipLevel = Number(b.dataset.level);
    if (a === "pp-message") {
      l.openMessage =
        l.openMessage === Number(b.dataset.index)
          ? null
          : Number(b.dataset.index);
      if (l.openMessage !== null)
        l.readMessages = [
          ...new Set([...(l.readMessages || []), l.openMessage]),
        ];
    }
    if (a === "pp-read-all") l.readMessages = [0, 1, 2, 3];
    if (a === "pp-refresh") {
      player.toast(
        t(player.current(), "示例余额已刷新", "Example balance refreshed"),
      );
      return true;
    }
    player.render();
    const match = [
      ...player.slots.secondary.querySelectorAll(`[data-p="${a}"]`),
    ].find(
      (x) =>
        (x.dataset.index || x.dataset.level || x.dataset.amount) ===
        (b.dataset.index || b.dataset.level || b.dataset.amount),
    );
    match?.focus({ preventScroll: true });
    return true;
  }
  function thumbnail(key, n, color) {
    const c = {
      styles: { [key]: n },
      values: { amountAutoInput: "按钮", vipCard: "完整卡片" },
      theme: "NG",
      color,
      locale: "zh",
      auth: "loggedIn",
      page: Object.keys(routes).find((p) => routes[p] === key) || "首页",
    };
    return `<div class="ng-player p-mini pp-mini pp-mini-${key}" data-name="页面样式 · ${key} ${n}" data-variant="${n}" style="${D.cssVars(color)}"><div class="p-mini-canvas" data-name="缩略画布">${renders[key](c)}</div></div>`;
  }
  window.NGPageComponents = {
    render,
    bottom,
    thumbnail,
    signature,
    handle,
    routes,
  };
})();
