/* Current-admin parity, 2026-09-09. UI-observed choices; all player data is synthetic. */
(function () {
  "use strict";
  const D = window.NGDesign;
  const nav = [
    ["首页", "Home", "home"],
    ["活动", "Promotions", "gift"],
    ["登录", "Log in", "user"],
    ["注册", "Register", "user"],
    ["钱包", "Wallet", "wallet"],
    ["我的", "Account", "user"],
    ["VIP", "VIP", "vip"],
    ["APP下载", "Download app", "download"],
    ["充值", "Deposit", "wallet"],
    ["提款", "Withdraw", "trade"],
    ["客服", "Support", "info"],
    ["发现", "Discover", "search"],
    ["免费试玩", "Free demo", "game"],
    ["返水", "Cashback", "wallet"],
    ["任务", "Tasks", "task"],
    ["分享", "Share", "gift"],
    ["推广", "Referrals", "report"],
    ["代理中心", "Agent center", "user"],
    ["利息宝", "Savings", "wallet"],
  ];
  const canonical = (v) => (v === "账户" ? "我的" : v);
  const navInfo = (v) =>
    nav.find((x) => x[0] === canonical(v)) || [v, v, "info"];
  const counts = {};
  const add = (id, titles, english, notes) => {
    const f = D.allFamilies()[id];
    counts[id] = f.titles.length;
    f.currentStart = f.titles.length;
    f.titles.push(...titles);
    f.english.push(...english);
    f.notes.push(...notes);
  };
  add(
    "carouselStyle",
    ["单幅横幅", "并排小横幅", "居中露边"],
    ["Single banner", "Small banners", "Peek carousel"],
    [
      "现行样式 1：单幅横幅与位置指示。",
      "现行样式 2：多张小横幅并列。",
      "现行样式 3：中央主图与左右露边。",
    ],
  );
  add(
    "profileLayout",
    ["信息分组", "双钱包卡片", "资金快捷网格", "VIP 权益卡"],
    [
      "Grouped account",
      "Wallet cards",
      "Wallet action grid",
      "VIP benefit card",
    ],
    [
      "现行样式 1：身份、VIP、资金与功能分组。",
      "现行样式 2：现金与彩金以独立卡片呈现。",
      "现行样式 3：资金操作与常用功能以网格展示。",
      "现行样式 4：常用功能下方突出 VIP 卡片。",
    ],
  );
  add(
    "bottomNav",
    ["圆形凸起线框", "多边形凸起实心", "圆角选中线框", "胶囊选中实心"],
    [
      "Raised outline circle",
      "Raised solid polygon",
      "Rounded outline selection",
      "Solid pill selection",
    ],
    [
      "现行样式 1：中央圆形凸起，线框图标。",
      "现行样式 2：中央多边形凸起，实心图标。",
      "现行样式 3：选中项圆角底色，线框图标。",
      "现行样式 4：选中项胶囊底色，实心图标。",
    ],
  );
  const family = (key, label, en, titles, english, notes) => ({
    key,
    label,
    en,
    titles,
    english,
    notes,
    currentStart: 0,
    page: "首页",
  });
  D.pageFamilies.footerStyle = family(
    "footer",
    "页尾内容",
    "Footer",
    ["分组列表", "文字导航", "图标导航", "分区卡片"],
    ["Grouped links", "Text navigation", "Icon navigation", "Section cards"],
    [
      "现行样式 1：信息列表、社群、合作商与站点介绍。",
      "现行样式 2：横向文字入口与开放式内容分区。",
      "现行样式 3：图标导航与居中社群、合作商。",
      "现行样式 4：信息、社群、合作商及介绍独立成卡。",
    ],
  );
  D.pageFamilies.popupStyle = family(
    "popup",
    "弹窗",
    "Dialogs",
    ["顶部页签", "侧边导航", "底部页签"],
    ["Top tabs", "Side navigation", "Bottom tabs"],
    [
      "现行样式 1：顶部切换分类，内容在下方。",
      "现行样式 2：左侧分类，右侧内容。",
      "现行样式 3：内容在上方，分类切换在下方。",
    ],
  );
  // Home compositions are assembled from independently selected components.
  add(
    "gameLayout",
    [
      "现行无分类列",
      "现行侧边分类",
      "现行横向分类",
      "现行紧凑横排",
      "现行菱形分类",
    ],
    [
      "Current list",
      "Current side rail",
      "Current horizontal tabs",
      "Current compact tabs",
      "Current diamond tabs",
    ],
    [
      "首页样式 1：游戏分组为主。",
      "首页样式 2：侧边分类与游戏并列。",
      "首页样式 3：横向分类与资金快捷入口。",
      "首页样式 4：紧凑横向分类。",
      "首页样式 5：菱形分类；活动摘要可在独立子分类开启。",
    ],
  );
  add(
    "gameGridStyle",
    ["现行标准网格"],
    ["Current standard grid"],
    ["现行首页使用的标准游戏卡片网格。"],
  );
  while (D.names.length < 10)
    D.names.push("样式" + ["七", "八", "九", "十"][D.names.length - 6]);
  const priorStyleNumber = D.styleNumber;
  D.styleNumber = (id, draft, theme) => {
    if (["footerStyle", "popupStyle"].includes(id) && !draft.extra?.design)
      return Math.max(1, D.names.indexOf(draft.value) + 1);
    return priorStyleNumber(id, draft, theme);
  };
  const baseExtend = D.extendCatalog;
  D.extendCatalog = (catalog, defaults) => {
    baseExtend(catalog, defaults);
    for (const id of ["gameLayout", "gameGridStyle"]) {
      const item = catalog.find((x) => x.id === id);
      item.options = D.names.slice(0, D.families[id].titles.length);
    }
    for (const [id, count] of [
      ["footerStyle", 4],
      ["popupStyle", 3],
    ]) {
      const item = catalog.find((x) => x.id === id);
      item.options = D.names.slice(0, count);
      if (item.themeOptions) item.themeOptions.NG = item.options.slice();
    }
    catalog.find((x) => x.id === "alternateButton").prototypeSupport = {
      NG: true,
    };
    catalog.find((x) => x.id === "bottomNav").options = nav.map((x) => x[0]);
  };
  const priorValidate = D.validateDraft;
  D.validateDraft = (draft, theme, color, context = {}) => {
    const errors = priorValidate(draft, theme, color);
    const b = draft.bottomNav;
    for (const auth of ["loggedOut", "loggedIn"]) {
      const slots = b?.value?.[auth] || [];
      if (slots.some((x) => !nav.some((n) => n[0] === canonical(x))))
        errors.push("导航含有未知功能。");
      const alreadyChecked = context.checkedNav?.[auth];
      const sameCheckedSlots = Array.isArray(alreadyChecked) && JSON.stringify(slots.map(canonical)) === JSON.stringify(alreadyChecked.map(canonical));
      if (!sameCheckedSlots && new Set(slots.map(canonical)).size !== slots.length)
        errors.push("导航功能不可重复；我的与账户为同一入口。");
      const replacement = replacementEnabled(b?.extra, auth)
        ? b?.extra?.appReplacement?.[auth]
        : null;
      if (
        replacementEnabled(b?.extra, auth) &&
        (!replacement || replacement === "APP下载")
      )
        errors.push("App 替代已开启，请选择不同的替代功能。");
      if (replacement && !nav.some((n) => n[0] === replacement))
        errors.push("App 替代入口无效。");
      if (
        replacement &&
        replacement !== "APP下载" &&
        slots.some((x) => canonical(x) === replacement) &&
        slots.includes("APP下载")
      )
        errors.push("App 替代功能与本组导航重复，请选择其他功能。");
    }
    const d = draft.topDownloadBar?.extra?.content;
    if (d) {
      if (
        typeof d.copy !== "undefined" &&
        (typeof d.copy !== "string" || !d.copy.trim() || d.copy.length > 500)
      )
        errors.push("下载文案需填写 1–500 个字符。");
      if (d.background && !/^#[0-9a-f]{6}$/i.test(d.background))
        errors.push("下载栏背景色须为六位 HEX 色码。");
      for (const key of ["left", "right"])
        if (d[key] && !safeImage(d[key])) errors.push("下载栏图片格式无效。");
    }
    return [...new Set(errors)];
  };
  const safeImage = (x) =>
    typeof x === "string" &&
    x.length <= 3 * 1024 * 1024 &&
    /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(x);
  const homeCompositions = [
    ["分组游戏", "Game groups", 6, false, false],
    ["侧边分类", "Side categories", 7, true, false],
    ["横向分类", "Horizontal categories", 8, true, false],
    ["紧凑分类", "Compact categories", 9, false, false],
    ["活动与菱形分类", "Promotions & diamonds", 10, true, true],
  ];
  let api, picker, returnFocus;
  const state = () => api.state;
  const t = (zh, en) => (state().uiLocale === "en" ? en : zh);
  const E = (x) => window.NGPlayer.esc(String(x ?? ""));
  const icon = (x) => window.NGPlayer.icon(x);
  const btn = (a, label, attrs = "", cls = "studio-text-btn") =>
    `<button type="button" class="${cls}" data-current="${a}" ${attrs}>${label}</button>`;
  const touch = () => {
    state().draftVersion++;
    state().acks = { auto: {}, review: {} };
    api.renderAll();
  };
  const note = (msg) => {
    const n = document.getElementById("studio-status");
    n.textContent = msg;
    n.classList.add("show");
  };

  function navEditor() {
    const b = state().draft.bottomNav;
    return (
      ["loggedOut", "loggedIn"]
        .map((auth) => {
          const slots = b.value[auth],
            replacement = b.extra.appReplacement?.[auth],
            enabled = replacementEnabled(b.extra, auth);
          return `<section class="current-auth"><div class="studio-card-title"><h4>${t(auth === "loggedOut" ? "登录前" : "登录后", auth === "loggedOut" ? "Signed out" : "Signed in")}</h4>${btn("preview-auth", t("预览", "Preview"), `data-auth="${auth}"`)}${btn("reset-nav", t("恢复本组默认", "Reset group"), `data-auth="${auth}"`)}</div><div class="current-nav-slots">${slots.map((v, i) => `<div class="current-nav-slot">${btn("pick", `<span class="current-slot-number">${i + 1}</span>${icon(navInfo(v)[2])}<strong>${t(canonical(v), navInfo(v)[1])}</strong>`, `data-auth="${auth}" data-slot="${i}" aria-label="${t("更换第 " + (i + 1) + " 个入口", "Change entry " + (i + 1))}"`, "current-slot-choice")}<div class="current-slot-order">${btn("move", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"/></svg>', `data-auth="${auth}" data-slot="${i}" data-direction="-1" ${i === 0 ? "disabled" : ""} aria-label="${t("向前移动", "Move earlier")}"`)}${btn("move", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5"/></svg>', `data-auth="${auth}" data-slot="${i}" data-direction="1" ${i === slots.length - 1 ? "disabled" : ""} aria-label="${t("向后移动", "Move later")}"`)}</div></div>`).join("")}</div><div class="current-replacement"><div><strong>${t("App 下载替代入口", "App replacement")}</strong><p>${t(slots.includes("APP下载") ? "替代本组的 App 下载槽位，不增加导航数量。" : "本组没有 App 下载入口；加入后替代设置才会适用。", slots.includes("APP下载") ? "Replaces this group’s App slot without adding a slot." : "Add an App download entry to use this setting.")}</p></div><label class="studio-switch"><input type="checkbox" data-current="replacement-enabled" data-auth="${auth}" ${enabled ? "checked" : ""}><span></span><b>${t(enabled ? "开启" : "关闭", enabled ? "On" : "Off")}</b></label></div>${enabled ? `<div class="current-replacement-choice">${btn("pick", replacement && replacement !== "APP下载" ? icon(navInfo(replacement)[2]) + t(replacement, navInfo(replacement)[1]) : t("选择替代功能", "Choose entry"), `data-auth="${auth}" data-slot="replacement"`, "btn")}</div>` : ""}</section>`;
        })
        .join("") +
      `<p class="studio-caption">${t("每个入口只保留一份。外观与功能独立保存，调整顺序不会改变入口含义。", "Each entry is unique. Style and destinations are independent; reordering preserves destinations.")}</p><details class="current-preview-options"><summary>${t("预览 App 替代状态", "Preview App replacement state")}</summary><p>${t("仅演示替代后的导航；正式触发条件尚待确认。", "Demonstrates the resulting navigation only; the runtime trigger is not yet confirmed.")}</p><label><input type="checkbox" data-current="replacement-preview" ${state().preview.appReplacement ? "checked" : ""}>${t("在预览中替代 App 下载入口", "Replace the App entry in preview")}</label></details>`
    );
  }

  function replacementEnabled(extra, auth) {
    return (
      extra?.appReplacementEnabled?.[auth] ??
      (!!extra?.appReplacement?.[auth] &&
        extra.appReplacement[auth] !== "APP下载")
    );
  }
  const homeSections = {
    quick: ["资金快捷区", "Wallet shortcuts"],
    promotions: ["活动摘要", "Promotion summary"],
  };
  function homeChanged(key) {
    const current=state().draft.gameLayout.extra.home || {}, saved=state().published.objects.gameLayout.extra.home || {};
    return (key === "quick" ? current.quick !== false : !!current.promotions) !== (key === "quick" ? saved.quick !== false : !!saved.promotions);
  }
  function homeTree(q) {
    return Object.entries(homeSections)
      .filter(([key, n]) => key !== "quick" && (!q || n.join(" ").toLowerCase().includes(q)))
      .map(([key, n]) =>
        btn(
          "home-section",
          `<span>${t(...n)}</span>${homeChanged(key) ? `<span class="studio-nav-meta"><span class="ux-modified-icon" aria-label="已修改" title="已修改">✎</span></span>` : ""}`,
          `data-key="${key}" data-name="${E(t(...n))}" ${state().ui.homeSection === key ? 'aria-current="true"' : ""}`,
          "studio-nav-item" + (state().ui.homeSection === key ? " active" : "") + (homeChanged(key) ? " is-modified" : ""),
        ),
      )
      .join("");
  }
  function homePanel() {
    const key = state().ui.homeSection,
      h = state().draft.gameLayout.extra.home || {},
      enabled = key === "quick" ? h.quick !== false : !!h.promotions;
    api.els.detail.setAttribute("data-studio-localized", "");
    api.els.detail.innerHTML = `<div class="studio-section-head" data-name="组件标题"><div><span class="studio-eyebrow">02 / HOME COMPONENTS</span><h2>${t(...homeSections[key])}</h2><p>${t(key === "quick" ? "控制首页资金操作与常用功能快捷区的显示。" : "控制首页活动与推广摘要的显示。", key === "quick" ? "Show wallet actions and frequently used shortcuts on Home." : "Show promotion and referral summaries on Home.")}</p></div></div><section class="studio-card"><div class="studio-visibility"><strong>${t("显示此区块", "Show this section")}</strong><label class="studio-switch"><input type="checkbox" data-current="home-${key}" ${enabled ? "checked" : ""}><span></span><b>${t(enabled ? "开启" : "关闭", enabled ? "On" : "Off")}</b></label></div><p class="studio-caption">${t("独立保存显示设置；切换游戏分类或网格样式时保留此选择。", "Saved independently and preserved when switching category or grid styles.")}</p></section>`;
  }
  function alternatePanel() {
    const row = state().draft.alternateButton,
      spec = row.value || {},
      enabled = row.mode === "SET";
    const targets = [
      ["客服", "Support"],
      ["设置", "Settings"],
      ["个人中心", "Account"],
      ["站内信", "Inbox"],
      ["用户验证", "Verification"],
      ["VIP 页入口", "VIP"],
      ["App download", "Download app"],
      ["充值", "Deposit"],
      ["取款", "Withdraw"],
    ];
    const placements = [
      [
        "浮动收折",
        "Floating entry",
        "在页面侧边显示入口。",
        "Show an entry beside the page.",
      ],
      [
        "顶部状态列",
        "Header",
        "放入顶部功能列。",
        "Use the header action area.",
      ],
      [
        "底部导航自选槽位",
        "Navigation slot",
        "替换现有槽位，不增加按钮。",
        "Replace an existing slot without adding buttons.",
      ],
    ];
    const scopes =
      spec.authScope === "both" || !spec.authScope
        ? ["loggedOut", "loggedIn"]
        : [spec.authScope];
    api.els.detail.setAttribute("data-studio-localized", "");
    api.els.detail.innerHTML = `<div class="studio-section-head"><div><span class="studio-eyebrow">04 / NAVIGATION & ENTRIES</span><h2>${t("替代按钮", "Alternate entry")}</h2><p>${t("将一个功能入口放到指定位置；适合补充或调整现有入口的位置。", "Place a feature entry in a chosen location to supplement or reposition existing access.")}</p></div></div><section class="studio-card"><div class="studio-visibility"><strong>${t("功能开关", "Enable entry")}</strong><label class="studio-switch"><input type="checkbox" data-current="alt-enabled" ${enabled ? "checked" : ""}><span></span><b>${t(enabled ? "开启" : "关闭", enabled ? "On" : "Off")}</b></label></div></section><section class="studio-card"><div class="studio-card-title"><h3>${t("入口位置", "Location")}</h3></div><div class="current-placement-grid">${placements.map(([v, en, desc, ed]) => `<button type="button" class="current-placement ${enabled && spec.placement === v ? "is-selected" : ""}" data-action="set-value" data-id="alternateButton.placement" data-value="${encodeURIComponent(v)}" aria-pressed="${enabled && spec.placement === v}"><strong>${t(v, en)}</strong><small>${t(desc, ed)}</small></button>`).join("")}</div><p class="studio-caption">${t("直接选择位置即可开启；入口功能需明确选择。", "Selecting a location enables the entry. Choose its destination explicitly.")}</p></section>${
      enabled
        ? `<section class="studio-card current-fields"><label class="current-field"><span>${t("入口功能", "Destination")}</span><select data-action="alt-capability"><option value="">${t("选择功能", "Choose a feature")}</option>${targets.map(([v, en]) => `<option value="${v}" ${spec.target === v ? "selected" : ""}>${t(v, en)}</option>`).join("")}</select></label><label class="current-field"><span>${t("显示范围", "Visibility")}</span><select data-action="alt-auth">${[
            ["both", "登录前与登录后", "Both"],
            ["loggedOut", "登录前", "Signed out"],
            ["loggedIn", "登录后", "Signed in"],
          ]
            .map(
              ([v, zh, en]) =>
                `<option value="${v}" ${(spec.authScope || "both") === v ? "selected" : ""}>${t(zh, en)}</option>`,
            )
            .join("")}</select></label>${
            spec.placement === "底部导航自选槽位"
              ? scopes
                  .map(
                    (auth) =>
                      `<label class="current-field"><span>${t(auth === "loggedOut" ? "登录前槽位" : "登录后槽位", auth === "loggedOut" ? "Signed-out slot" : "Signed-in slot")}</span><select data-action="alt-slot" data-auth="${auth}"><option value="">${t("选择要替换的位置", "Choose the slot to replace")}</option>${state()
                        .draft.bottomNav.value[auth].map(
                          (v, i) =>
                            `<option value="${i}" ${String(spec.navSlot?.[auth]) === String(i) ? "selected" : ""}>${i + 1} · ${t(canonical(v), navInfo(v)[1])}</option>`,
                        )
                        .join("")}</select></label>`,
                  )
                  .join("")
              : ""
          }</section>`
        : ""
    }`;
    const outcome = api
      .resolveAll()
      .items.find((x) => x.id === "alternateButton");
    if (outcome.outcome !== "Allow")
      api.els.detail.insertAdjacentHTML(
        "beforeend",
        `<section class="studio-card"><h3>${t("配置检查", "Configuration check")}</h3><ul class="current-check-reasons">${outcome.reasons.map((x) => `<li>${E(state().uiLocale === "en" ? api.localizedText(x) : x)}</li>`).join("")}</ul>${outcome.outcome === "Review" ? `<label><input type="checkbox" data-action="ack-review" data-id="alternateButton" ${state().acks.review.alternateButton ? "checked" : ""}>${t("我已确认替换槽位及受影响入口", "I have reviewed the replaced slot and affected entries")}</label>` : ""}</section>`,
      );
  }

  function downloadEditor() {
    const d = state().draft.topDownloadBar.extra.content || {};
    return `<div class="current-fields"><label class="current-field"><span>${t("宣传文案", "Promotional copy")}</span><textarea data-current="download-copy" maxlength="500" rows="3" placeholder="${t("输入下载提示文案", "Enter download prompt")}">${E(d.copy ?? t("下载安装手机 App，赢取更大奖励！", "Play on the go. Get our mobile app."))}</textarea><small>${t("最多 500 字；切换样式保留内容。", "Up to 500 characters. Content is preserved when switching styles.")}</small></label><div class="current-image-fields">${["left", "right"].map((key, i) => `<div class="current-field"><span>${t(i === 0 ? "左侧图片" : "右侧图片", i === 0 ? "Left image" : "Right image")}</span><label class="current-upload">${safeImage(d[key]) ? `<img src="${d[key]}" alt="${t("已选择图片", "Selected image")}">` : `<span aria-hidden="true">＋</span>`}<span>${t("选择图片", "Choose image")}</span><input type="file" accept="image/jpeg,image/png,image/gif,image/webp" data-current="download-image" data-key="${key}" aria-label="${t(i === 0 ? "上传左侧图片" : "上传右侧图片", i === 0 ? "Upload left image" : "Upload right image")}"></label>${btn("clear-image", t("恢复默认图片", "Reset image"), `data-key="${key}" ${d[key] ? "" : "disabled"}`)}</div>`).join("")}</div><small class="studio-muted">JPG / PNG / GIF / WebP · ≤ 2 MB</small><div class="current-field"><span>${t("下载栏背景", "Banner background")}</span><div class="current-color-row"><input type="color" data-current="download-color" value="${E(d.background || D.palette(api.resolveAll().values.themeColor).panel)}" aria-label="${t("下载栏背景色", "Banner background color")}"><code>${E(d.background || t("跟随主题", "Theme default"))}</code>${btn("reset-background", t("跟随主题", "Use theme default"), "", "studio-text-btn")}</div></div></div>`;
  }
  function closePicker() {
    document.getElementById("current-picker")?.remove();
    for (const el of document.querySelectorAll("[data-current-inert]")) {
      el.inert = false;
      el.removeAttribute("data-current-inert");
    }
    returnFocus?.focus({preventScroll:true});
    picker = null;
  }
  function openPicker(auth, slot, source) {
    picker = { auth, slot };
    returnFocus = source;
    const slots = state().draft.bottomNav.value[auth],
      chosen =
        slot === "replacement"
          ? state().draft.bottomNav.extra.appReplacement?.[auth] || "APP下载"
          : slots[Number(slot)];
    document.getElementById("current-picker")?.remove();
    const el = document.createElement("div");
    el.id = "current-picker";
    el.className = "current-modal";
    el.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="current-picker-title" class="current-picker-panel"><div class="studio-card-title"><h2 id="current-picker-title">${t(slot === "replacement" ? "选择 App 替代入口" : "选择导航功能", slot === "replacement" ? "Choose App replacement" : "Choose navigation entry")}</h2>${btn("close-picker", "×", `aria-label="${t("关闭", "Close")}"`)}</div><label class="current-field"><span>${t("搜索功能", "Search entries")}</span><input type="search" data-current="nav-search" placeholder="${t("名称或关键词", "Name or keyword")}"></label><div class="current-picker-grid">${nav
      .map(([v, en, g]) => {
        const used =
          (slot === "replacement" && v === "APP下载") ||
          slots.some(
            (x, i) =>
              canonical(x) === v &&
              (slot === "replacement" ? v !== "APP下载" : i !== Number(slot)),
          );
        return btn(
          "choose",
          `${icon(g)}<strong>${t(v, en)}</strong><small>${used ? t("已在本组使用", "Already in this group") : canonical(chosen) === v ? t("当前选择", "Selected") : ""}</small>`,
          `data-value="${v}" data-search="${v} ${en.toLowerCase()}" ${used ? "disabled" : ""} aria-pressed="${canonical(chosen) === v}"`,
          "current-picker-item",
        );
      })
      .join(
        "",
      )}</div><p class="current-no-results" hidden>${t("没有匹配的功能。", "No matching entries.")}</p></section>`;
    for (const child of document.body.children) {
      if (!child.inert && !["SCRIPT", "STYLE"].includes(child.tagName)) {
        child.inert = true;
        child.setAttribute("data-current-inert", "");
      }
    }
    document.body.append(el);
    el.querySelector("input").focus();
  }
  function attach(a) {
    api = a;
    document.addEventListener("input", (e) => {
      if (e.target.dataset.current !== "nav-search") return;
      const q = e.target.value.trim().toLowerCase(),
        box = document.getElementById("current-picker");
      let visible = 0;
      box.querySelectorAll("[data-search]").forEach((b) => {
        b.hidden = !b.dataset.search.includes(q);
        if (!b.hidden) visible++;
      });
      box.querySelector(".current-no-results").hidden = !!visible;
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-current]");
      if (!b || b.tagName !== "BUTTON") return;
      const { current: action, auth, slot, key } = b.dataset;
      if (action === "home-section") {
        state().ui.homeSection = key;
        state().selectedId = "gameLayout";
        state().preview.page = "首页";
        api.renderAll();
        return;
      }
      if (action === "close-picker") {
        closePicker();
        return;
      }
      if (action === "pick") {
        openPicker(auth, slot, b);
        return;
      }
      if (action === "choose") {
        if (!picker) return;
        const focus = { ...picker };
        const row = state().draft.bottomNav;
        if (picker.slot === "replacement") {
          row.extra.appReplacement ||= {};
          row.extra.appReplacement[picker.auth] = b.dataset.value;
          row.extra.appReplacementEnabled ||= {};
          row.extra.appReplacementEnabled[picker.auth] = true;
        } else {
          row.mode = "SET";
          row.value[picker.auth][Number(picker.slot)] = b.dataset.value;
          row.extra.preset ||= {};
          row.extra.preset[picker.auth] = "custom";
        }
        closePicker();
        touch();
        document
          .querySelector(
            `[data-current="pick"][data-auth="${focus.auth}"][data-slot="${focus.slot}"]`,
          )
          ?.focus({preventScroll:true});
        return;
      }
      if (action === "preview-auth") {
        state().preview.auth = auth;
        state().preview.page = "首页";
        api.renderAll();
        return;
      }
      if (action === "move") {
        const oldCards = [...b.closest(".current-nav-slots").children];
        const oldPositions = oldCards.map(el=>el.getBoundingClientRect().left);
        const row = state().draft.bottomNav,
          arr = row.value[auth],
          i = Number(slot),
          j = i + Number(b.dataset.direction);
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        row.mode = "SET";
        row.extra.preset[auth] = "custom";
        touch();
        const newCards = [...document.querySelector(`[data-current="move"][data-auth="${auth}"]`).closest(".current-nav-slots").children];
        if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) [i,j].forEach((index)=>{
          const from=index===i ? j : i, el=newCards[index];
          el.animate?.([{transform:`translateX(${oldPositions[from]-el.getBoundingClientRect().left}px)`,opacity:.7},{transform:"translateX(0)",opacity:1}],{duration:240,easing:"cubic-bezier(.2,.8,.2,1)"});
        });
        document.querySelector(`[data-current="move"][data-auth="${auth}"][data-slot="${j}"][data-direction="${b.dataset.direction}"]`)?.focus({preventScroll:true});
        return;
      }
      if (action === "reset-nav") {
        const row = state().draft.bottomNav;
        row.value[auth] = api.clone(
          api.themeDefaultFor("bottomNav", state().theme)[auth],
        );
        row.mode = "SET";
        if (row.extra.appReplacement) delete row.extra.appReplacement[auth];
        if (row.extra.appReplacementEnabled)
          delete row.extra.appReplacementEnabled[auth];
        row.extra.preset[auth] = "theme";
        touch();
        return;
      }
      if (action === "clear-image" || action === "reset-background") {
        const d = state().draft.topDownloadBar.extra.content;
        if (d) delete d[action === "clear-image" ? key : "background"];
        touch();
      }
    });
    document.addEventListener("change", async (e) => {
      const b = e.target,
        action = b.dataset.current;
      if (!action) return;
      if (action === "replacement-enabled") {
        const row = state().draft.bottomNav;
        row.extra.appReplacementEnabled ||= {};
        row.extra.appReplacementEnabled[b.dataset.auth] = b.checked;
        state().draftVersion++; state().acks={auto:{},review:{}};
        const section=b.closest(".current-auth");
        section.querySelector(".current-replacement-choice")?.remove();
        b.closest("label").querySelector("b").textContent=t(b.checked ? "开启" : "关闭",b.checked ? "On" : "Off");
        if(b.checked) {
          const target=row.extra.appReplacement?.[b.dataset.auth];
          section.insertAdjacentHTML("beforeend",`<div class="current-replacement-choice">${btn("pick",target && target!=="APP下载" ? icon(navInfo(target)[2])+t(target,navInfo(target)[1]) : t("选择替代功能","Choose entry"),`data-auth="${b.dataset.auth}" data-slot="replacement"`,"btn")}</div>`);
        }
        const resolved=api.resolveAll();
        window.NGStudio.tree(resolved);window.NGStudio.preview(resolved);window.NGStudio.finish(resolved);
        b.focus({preventScroll:true});
        return;
      }
      if (action === "alt-enabled") {
        const row = state().draft.alternateButton;
        row.mode = b.checked ? "SET" : "OFF";
        row.value ||= {
          placement: "",
          target: "",
          authScope: "both",
          navSlot: { loggedOut: "", loggedIn: "" },
        };
        touch();
        return;
      }
      if (action === "replacement-preview") {
        state().preview.appReplacement = b.checked;
        api.renderAll();
        return;
      }
      if (action === "home-quick" || action === "home-promotions") {
        const row = state().draft.gameLayout;
        row.extra.home ||= {};
        row.extra.home[action === "home-quick" ? "quick" : "promotions"] =
          b.checked;
        delete row.extra.home.preset;
        touch();
        return;
      }
      if (
        !["download-copy", "download-color", "download-image"].includes(action)
      )
        return;
      const row = state().draft.topDownloadBar;
      if (action === "download-image") {
        const file = b.files?.[0],
          tenant = state().tenantId,
          version = state().draftVersion;
        if (!file) return;
        if (
          !/^image\/(jpeg|png|gif|webp)$/.test(file.type) ||
          file.size > 2 * 1024 * 1024
        ) {
          note(
            t(
              "请选择 2 MB 以内的 JPG、PNG、GIF 或 WebP。",
              "Choose JPG, PNG, GIF or WebP up to 2 MB.",
            ),
          );
          b.value = "";
          return;
        }
        const data = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = () => resolve(null);
          r.readAsDataURL(file);
        });
        const valid =
          data &&
          (await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img.width > 0 && img.height > 0);
            img.onerror = () => resolve(false);
            img.src = data;
          }));
        if (tenant !== state().tenantId || version !== state().draftVersion) {
          note(
            t(
              "草稿已变化，请重新选择图片。",
              "The draft changed. Please select the image again.",
            ),
          );
          return;
        }
        if (!valid || !safeImage(data)) {
          note(t("无法读取这张图片。", "Cannot read this image."));
          b.value = "";
          return;
        }
        row.extra.content ||= {};
        row.extra.content[b.dataset.key] = data;
      } else {
        row.extra.content ||= {};
        row.extra.content[action === "download-copy" ? "copy" : "background"] =
          b.value;
      }
      touch();
    });
    document.addEventListener("keydown", (e) => {
      const modal = document.getElementById("current-picker");
      if (!modal) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closePicker();
      }
      if (e.key === "Tab") {
        const items = [
          ...modal.querySelectorAll("button:not(:disabled),input"),
        ].filter((x) => !x.hidden);
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    document.addEventListener(
      "click",
      (e) => {
        if (e.target.closest('[data-action="select"]'))
          state().ui.homeSection = null;
      },
      true,
    );
  }

  const descriptions = {
    recordsDisplay:["选择玩家查看钱包与交易记录时的展示方式。","Choose how wallet and transaction history is displayed."],
    amountAutoInput:["选择充值金额的快捷填写方式，减少玩家重复输入。","Choose how deposit amount shortcuts fill the amount field."],
    vipCard:["设置个人中心 VIP 卡片的显示方式。","Choose how the VIP card appears in the account page."],
    userVerification:["设置验证入口的呈现方式；验证要求由站点业务设置决定。","Choose how verification is presented; site rules determine requirements."],
    buttonStyle:["统一玩家页面按钮的外观；按钮原有功能保持不变。","Choose a consistent appearance for player action buttons."],
    gameIconStyle:["设置游戏图标的形状与展示方式。","Choose the appearance of game icons."],
  };
  function description(id,fallback) { return descriptions[id] ? t(...descriptions[id]) : E(fallback || t("选择适合本站的展示方式，右侧预览会同步更新。","Choose an option and inspect it in the preview.")); }
  function guidance(id,reasons) {
    const raw=reasons.join("；");
    const hints=[];
    if (/替代|alternate/i.test(raw) || id==="alternateButton") hints.push(t("请选择入口位置、入口功能和显示范围。使用底部导航时，另选要替换的槽位；使用顶部列时，请将该登录状态的顶栏改为完整样式。","Choose a location, destination and visibility scope. For navigation choose a slot; for a header entry use a full header."));
    if (/App|安装|下载/.test(raw)) hints.push(t("检查下载栏及底部导航，保留一个可用的 App 下载入口。若已开启 App 替代，请选择不同且未重复的功能；不需要替代时关闭开关。","Keep an available App download entry. Choose a unique replacement destination, or turn replacement off."));
    if (/重复|导航|槽/.test(raw) || id==="bottomNav") hints.push(t("打开底部导航，分别检查登录前与登录后：每个位置都要有功能，同一组不能重复。","Check both signed-out and signed-in navigation: fill each slot with a unique feature."));
    if (/不可达|可达|入口|宿主|侧边栏/.test(raw)) hints.push(t("为提示中缺少的功能保留入口：可在底部导航、顶部状态列或替代按钮中设置。关闭侧边栏前，请先把其中的快捷入口移到其他位置。","Keep access to the affected feature in navigation, header or an alternate entry. Move sidebar shortcuts before hiding the sidebar."));
    if (/颜色|主题|样式|支持|支援|选项|必填|无效/.test(raw)) hints.push(t("回到对应设置，选择清单内的可用选项；不确定时点击恢复默认。必需组件请保持开启。","Choose an available option in this setting, or restore its default. Keep required components enabled."));
    if (/图片|文案|HEX/.test(raw)) hints.push(t("检查下载栏内容：填写文案，使用颜色选择器，并上传 2 MB 以内可读取的 JPG、PNG、GIF 或 WebP。","Check banner copy, use the color picker and upload a readable image under 2 MB."));
    return hints.length ? hints.join(" ") : t("打开此设置，检查提示涉及的选项并重新选择；可使用恢复默认。若仍无法保存，请将此提示提供给站点管理员。","Open this setting and reselect the affected options, or restore defaults. If the issue remains, share this message with your site administrator.");
  }

  window.NGCurrent = {
    description, guidance,
    nav,
    canonical,
    navInfo,
    counts,
    homeCompositions,
    replacementEnabled,
    homeTree,
    homePanel,
    alternatePanel,
    safeImage,
    attach,
    navEditor,
    downloadEditor,
    homeControls: (resolved) => {
      const value = resolved.values.categoryButtons;
      const quick = state().draft.gameLayout.extra.home?.quick !== false;
      return `<div class="studio-detail-fields"><div class="studio-detail-field"><strong id="game-category-label">${t("分类按钮", "Category buttons")}</strong><div class="studio-option-group" role="group" aria-labelledby="game-category-label">${["图示+名称","仅名称","仅图示"].map((v,i)=>`<button type="button" class="btn ${v===value ? "is-selected" : ""}" data-action="set-value" data-id="categoryButtons" data-value="${encodeURIComponent(v)}" aria-pressed="${v===value}">${t(v,["Icon + label","Label only","Icon only"][i])}</button>`).join("")}</div></div><div class="studio-detail-field studio-detail-toggle"><div><strong>${t("资金快捷区", "Wallet shortcuts")}</strong><p class="studio-caption">${t("在游戏区显示资金操作快捷入口。", "Show wallet actions in the game area.")}</p></div><label class="studio-switch"><input type="checkbox" data-current="home-quick" aria-label="${t("资金快捷区", "Wallet shortcuts")}" ${quick ? "checked" : ""}><span></span><b>${t(quick ? "开启" : "关闭",quick ? "On" : "Off")}</b></label></div></div><p class="studio-caption">${t("切换游戏样式时保留这些选择。", "These choices remain when changing game styles.")}</p>`;
    },
    navPreview: (config) =>
      config.appReplacement &&
      replacementEnabled(config.current?.bottomNav, config.auth)
        ? config.nav.map((x) =>
            x === "APP下载"
              ? config.current?.bottomNav?.appReplacement?.[config.auth] || x
              : x,
          )
        : config.nav,
  };
})();
