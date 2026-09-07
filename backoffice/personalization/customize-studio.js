/* Manager UI: edits the existing resolver's draft, including explicit player allowlists. */
(function () {
  "use strict";
  const D = window.NGDesign,
    E = window.NGPlayer.esc;
  let api,
    frame,
    config,
    frameReady = false,
    lastPanel = "",
    noticeTimer;
  const s = () => api.state,
    tx = (zh, en) => (s().uiLocale === "en" ? en : zh);
  const themeName = (n) =>
    n === "NG"
      ? tx("58 款样式", "58 styles")
      : tx("设计待补", "Design pending");
  const action = (a, label, attrs = "", cls = "btn") =>
    '<button type="button" class="' +
    cls +
    '" data-studio="' +
    a +
    '" ' +
    attrs +
    ">" +
    label +
    "</button>";
  const colorName = (n) => tx(D.palette(n).label, D.palette(n).en);
  const englishLabels = {
    categoryButtons: "Category buttons",
    depositPage: "Deposit page",
    recordsDisplay: "History display",
    amountAutoInput: "Amount shortcuts",
    vipCard: "VIP card",
    vipPage: "VIP page",
    inbox: "Inbox",
    userVerification: "Verification",
    bottomNav: "Bottom navigation",
    popupStyle: "Dialogs",
    alternateButton: "Alternate entry",
    footerStyle: "Footer",
    profileLayout: "Account page",
    authVisual: "Sign-in appearance",
    brandMark: "Site brand",
    buttonStyle: "Buttons",
    gameIconStyle: "Game cards",
  };
  function selectedColor() {
    return api.resolveAll().values.themeColor;
  }
  function readPolicy() {
    const p = D.policy(s().draft);
    p.themes = p.themes.filter((n) => D.themeColors[n]);
    if (!p.themes.includes(s().theme)) p.themes.unshift(s().theme);
    p.defaults[s().theme] = selectedColor();
    p.themes.forEach((n) => {
      p.colors[n] = (p.colors[n] || []).filter((c) =>
        D.themeColors[n].includes(c),
      );
      if (!p.colors[n].includes(p.defaults[n]))
        p.colors[n].unshift(p.defaults[n]);
    });
    return p;
  }
  function savePolicy(p) {
    s().draft.theme.extra.playerChoices = p;
  }
  function touch() {
    s().draftVersion++;
    s().acks = { auto: {}, review: {} };
    s().ui.fallbackMessage = "";
    api.renderAll();
  }
  function announce(msg) {
    const n = document.getElementById("studio-status");
    n.textContent = msg;
    n.classList.add("show");
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => n.classList.remove("show"), 3000);
  }
  function isChanged(id) {
    return (
      JSON.stringify(s().draft[id]) !==
      JSON.stringify(s().published.objects[id])
    );
  }
  function focusPage(id) {
    const map = {
      authVisual: "登入注册",
      depositPage: "充值",
      amountAutoInput: "充值",
      recordsDisplay: "钱包",
      vipCard: "账户",
      profileLayout: "账户",
      vipPage: "VIP",
      inbox: "站内信",
      userVerification: "用户验证",
      themeColor: "首页",
      theme: "首页",
    };
    s().preview.page =
      D.pageFamilies[id]?.page || (D.families[id] ? "首页" : map[id] || "首页");
  }
  function tree(r) {
    const q = s().search.toLowerCase().trim();
    const ids = Object.keys(D.families);
    const row = (id) => {
      const item = api.byId[id],
        label =
          id === "themeColor"
            ? tx("主题与颜色", "Theme & colors")
            : tx(
                D.pageFamilies[id]?.label || item.label,
                D.allFamilies()[id]?.en || englishLabels[id] || item.label,
              );
      if (q && !(label + " " + id + " " + item.page).toLowerCase().includes(q))
        return "";
      const issue = r.items.find((n) => n.id === id);
      return (
        '<button type="button" class="studio-nav-item ' +
        (s().selectedId === id ||
        (id === "themeColor" && s().selectedId === "theme")
          ? "active"
          : "") +
        '" data-action="select" data-id="' +
        id +
        '" ' +
        (s().selectedId === id ? 'aria-current="true"' : "") +
        "><span>" +
        E(label) +
        '</span><span class="studio-nav-meta">' +
        (issue.outcome === "Block"
          ? "!"
          : isChanged(id) || (id === "themeColor" && isChanged("theme"))
            ? "●"
            : D.allFamilies()[id]
              ? D.allFamilies()[id].titles.length
              : "") +
        "</span></button>"
      );
    };
    const other = api.CATALOG.filter(
      (i) =>
        !ids.includes(i.id) &&
        !D.pageFamilies[i.id] &&
        !["theme", "themeColor", "brandMark", "downloadFAB"].includes(i.id),
    );
    api.els.tree.setAttribute("data-studio-localized", "");
    api.els.tree.innerHTML =
      '<div class="studio-nav-heading">01 · ' +
      tx("基础外观", "FOUNDATION") +
      "</div>" +
      row("themeColor") +
      '<div class="studio-nav-heading">02 · ' +
      tx("首页组件", "HOME COMPONENTS") +
      " <span>37</span></div>" +
      ids.map(row).join("") +
      '<div class="studio-nav-heading">03 · ' +
      tx("页面组件", "PAGE COMPONENTS") +
      " <span>21</span></div>" +
      Object.keys(D.pageFamilies).map(row).join("") +
      '<details class="studio-other" ' +
      (q || other.some((i) => i.id === s().selectedId) ? "open" : "") +
      "><summary>04 · " +
      tx("更多功能设置", "MORE SETTINGS") +
      "</summary>" +
      other.map((i) => row(i.id)).join("") +
      "</details>";
    if (q && !api.els.tree.querySelector("button"))
      api.els.tree.innerHTML =
        '<p class="studio-muted">' +
        tx("没有匹配的设置。", "No matching settings.") +
        "</p>";
  }
  function colorButton(n, current) {
    const p = D.palette(n);
    return action(
      "color",
      '<span class="studio-swatch" style="--swatch:' +
        p.accent +
        ";--surface:" +
        p.bg +
        '"></span><span>' +
        E(colorName(n)) +
        '</span><span class="studio-check">' +
        (current === n ? "✓" : "") +
        "</span>",
      'data-color="' + n + '" aria-pressed="' + (current === n) + '"',
      "studio-color " + (current === n ? "active" : ""),
    );
  }
  function themePanel() {
    const current = selectedColor(),
      p = readPolicy(),
      colorOptions = D.themeColors[s().theme],
      main = colorOptions.filter((n) => D.palette(n).source),
      legacy = colorOptions.filter((n) => !D.palette(n).source);
    return (
      '<div class="studio-section-head"><div><span class="studio-eyebrow">01 / FOUNDATION</span><h2>' +
      tx("主题与颜色", "Theme & colors") +
      "</h2><p>" +
      tx(
        "先设定本站默认外观，再决定玩家可选范围。",
        "Set the site default, then choose what players can change.",
      ) +
      "</p></div></div>" +
      '<section class="studio-card"><div class="studio-card-title"><span class="studio-step">1</span><h3>' +
      tx("本站默认主题", "Default theme") +
      '</h3></div><div class="studio-themes">' +
      ["NG", "WG", "GAME"]
        .map((n) =>
          action(
            "theme",
            '<span class="studio-theme-art theme-' +
              n +
              '"><i></i><i></i><i></i></span><strong>' +
              n +
              "</strong><small>" +
              themeName(n) +
              "</small>",
            'data-theme="' + n + '" aria-pressed="' + (n === s().theme) + '"',
            "studio-theme " + (n === s().theme ? "active" : ""),
          ),
        )
        .join("") +
      "</div></section>" +
      '<section class="studio-card"><div class="studio-card-title"><span class="studio-step">2</span><h3>' +
      tx("本站默认颜色", "Default color") +
      "</h3>" +
      action(
        "reset-color",
        tx("跟随主题", "Use theme default"),
        "",
        "studio-text-btn",
      ) +
      '</div><div class="studio-colors">' +
      main.map((n) => colorButton(n, current)).join("") +
      "</div>" +
      (legacy.length
        ? '<details class="studio-legacy-colors"><summary>' +
          tx("更多颜色", "More colors") +
          '</summary><div class="studio-colors">' +
          legacy.map((n) => colorButton(n, current)).join("") +
          "</div></details>"
        : "") +
      "</section>" +
      '<section class="studio-card"><div class="studio-card-title"><span class="studio-step">3</span><h3>' +
      tx("玩家可选范围", "Player choices") +
      '</h3></div><p class="studio-muted">' +
      tx(
        "勾选可用主题与颜色；只留一个选项即可锁定。默认值必须保留。",
        "Enable themes and colors. Keep one option to lock it. The default must remain enabled.",
      ) +
      '</p><div class="studio-policy">' +
      ["NG", "WG", "GAME"]
        .map((n) => {
          const enabled = p.themes.includes(n),
            isDefault = n === s().theme;
          return (
            '<div class="studio-policy-theme"><label class="studio-check-label"><input type="checkbox" data-studio="allow-theme" data-theme="' +
            n +
            '" ' +
            (enabled ? "checked" : "") +
            " " +
            (isDefault ? "disabled" : "") +
            "><strong>" +
            n +
            "</strong><span>" +
            tx(
              isDefault ? "本站默认" : themeName(n),
              isDefault ? "Site default" : themeName(n),
            ) +
            "</span></label>" +
            (enabled
              ? '<div class="studio-policy-colors">' +
                D.themeColors[n]
                  .map(
                    (c) =>
                      '<label class="studio-check-label ' +
                      (p.colors[n].includes(c) ? "active" : "") +
                      '"><input type="checkbox" data-studio="allow-color" data-theme="' +
                      n +
                      '" data-color="' +
                      c +
                      '" ' +
                      (p.colors[n].includes(c) ? "checked" : "") +
                      " " +
                      (p.defaults[n] === c ? "disabled" : "") +
                      '><i style="background:' +
                      D.palette(c).accent +
                      '"></i>' +
                      colorName(c) +
                      (p.defaults[n] === c
                        ? "<small>" + tx("默认", "Default") + "</small>"
                        : "") +
                      "</label>",
                  )
                  .join("") +
                "</div>"
              : "") +
            (enabled && !isDefault
              ? '<label class="studio-policy-default">' +
                tx(
                  "切换至 " + n + " 时使用",
                  "Default when switching to " + n,
                ) +
                '<select data-studio="policy-default" data-theme="' +
                n +
                '">' +
                p.colors[n]
                  .map(
                    (c) =>
                      '<option value="' +
                      c +
                      '" ' +
                      (p.defaults[n] === c ? "selected" : "") +
                      ">" +
                      colorName(c) +
                      "</option>",
                  )
                  .join("") +
                "</select></label>"
              : "") +
            "</div>"
          );
        })
        .join("") +
      '</div><div class="studio-policy-result"><div><strong>' +
      tx(
        p.themes.length === 1
          ? "主题已锁定为 " + p.themes[0]
          : "玩家可选 " + p.themes.length + " 个主题",
        p.themes.length === 1
          ? "Theme locked to " + p.themes[0]
          : p.themes.length + " player themes",
      ) +
      "</strong><span>" +
      tx(
        s().theme + " 开放 " + p.colors[s().theme].length + " 种颜色",
        p.colors[s().theme].length + " colors available for " + s().theme,
      ) +
      "</span></div>" +
      action(
        "player-settings",
        tx("预览玩家选项 ↗", "Preview player choices ↗"),
        "",
        "studio-text-btn",
      ) +
      "</div></section>" +
      '<div class="studio-next">' +
      action(
        "next",
        tx("下一步：调整首页组件 →", "Next: customize components →"),
        "",
        "btn btn-brand",
      ) +
      "</div>"
    );
  }
  function detail(r, legacy) {
    const id = s().selectedId,
      f = D.allFamilies()[id],
      row = s().draft[id];
    api.els.detail.removeAttribute("data-studio-localized");
    if (id === "themeColor" || id === "theme") {
      api.els.detail.setAttribute("data-studio-localized", "");
      api.els.detail.innerHTML = themePanel();
      return;
    }
    if (!f || s().theme !== "NG") {
      legacy(r);
      const panel = api.els.detail.querySelector(".evidence-risk-panel");
      panel?.remove();
      api.els.detail
        .querySelector("h2")
        ?.querySelectorAll(".badge,.help-tip")
        .forEach((n) => n.remove());
      if (f) {
        const note = document.createElement("p");
        note.className = "studio-callout";
        note.textContent = tx(
          "此 Figma 文件仅定义 NG。" + s().theme + " 暂使用既有原型设置。",
          "This Figma file defines NG only. " +
            s().theme +
            " uses the existing prototype controls.",
        );
        api.els.detail.prepend(note);
      }
      return;
    }
    const current = D.styleNumber(
        id,
        { ...row, value: r.values[id] },
        s().theme,
      ),
      custom = ["gameLayout", "gameGridStyle"].includes(id)
        ? row.mode === "SET"
        : row.extra.design?.mode === "SET";
    const hidden =
      (id === "sidebar" && r.values.sidebarDisabled) ||
      (id === "topDownloadBar" && r.values.topDownloadBar !== "开启");
    const source = D.allFamilies()[id],
      chosen = source.notes[current - 1];
    // Reuse the semantic editor inside a disclosure; visual variants remain independent.
    legacy(r);
    const legacyHTML = api.els.detail.innerHTML;
    api.els.detail.setAttribute("data-studio-localized", "");
    api.els.detail.innerHTML =
      '<div class="studio-section-head"><div><span class="studio-eyebrow">' +
      (D.pageFamilies[id] ? "03 / PAGE COMPONENTS" : "02 / HOME COMPONENTS") +
      "</span><h2>" +
      tx(f.label, f.en) +
      "</h2><p>" +
      tx("选择样式，即时查看效果。", "Choose a style to update its preview.") +
      '</p></div><span class="studio-count">' +
      f.titles.length +
      " " +
      tx("款样式", "styles") +
      "</span></div>" +
      '<div class="studio-inherit"><span>' +
      tx(
        custom ? "已自定义" : "跟随 NG 默认",
        custom ? "Custom style" : "Using NG default",
      ) +
      "</span>" +
      action(
        "reset-style",
        tx("恢复默认", "Reset style"),
        'data-id="' + id + '"',
        "studio-text-btn",
      ) +
      "</div>" +
      (["sidebar", "topDownloadBar"].includes(id)
        ? '<div class="studio-visibility"><span>' +
          tx("在本站显示", "Show on this site") +
          '</span><label class="studio-switch"><input type="checkbox" data-studio="visibility" data-id="' +
          id +
          '" ' +
          (!hidden ? "checked" : "") +
          "><span></span><b>" +
          tx(hidden ? "已隐藏" : "已显示", hidden ? "Hidden" : "Visible") +
          "</b></label></div>"
        : "") +
      '<div class="studio-style-grid">' +
      f.titles
        .map(
          (title, i) =>
            '<div class="studio-style-card ' +
            (current === i + 1 && !hidden ? "active" : "") +
            '"><div class="studio-style-image" inert aria-hidden="true">' +
            (D.pageFamilies[id]
              ? window.NGPageComponents
              : window.NGPlayer
            ).thumbnail(f.key, i + 1, selectedColor()) +
            "</div>" +
            action(
              "style",
              "<span><strong>" +
                tx(D.names[i], "Style " + (i + 1)) +
                "</strong><small>" +
                tx(title, f.english[i]) +
                "</small></span><i>" +
                (current === i + 1 && !hidden ? "✓" : "") +
                "</i>",
              'data-id="' +
                id +
                '" data-style="' +
                (i + 1) +
                '" aria-pressed="' +
                (current === i + 1 && !hidden) +
                '" aria-label="' +
                E(
                  tx(
                    D.names[i] + " · " + title,
                    "Style " + (i + 1) + " · " + f.english[i],
                  ),
                ) +
                '"',
              "studio-style-select",
            ) +
            "</div>",
        )
        .join("") +
      "</div>" +
      '<p class="studio-caption">' +
      (hidden
        ? tx(
            "选择任一样式会开启此组件。",
            "Choosing a style also shows this component.",
          )
        : tx(
            chosen,
            "Selected: " +
              f.english[current - 1] +
              ". Try it in the interactive preview.",
          )) +
      "</p>" +
      '<details class="studio-disclosure"><summary>' +
      tx("显示与功能设置", "Display & behavior") +
      '</summary><div class="studio-legacy-editor">' +
      legacyHTML +
      "</div></details>";
    // The legacy heading/state is redundant here, but all functional choices remain available.
    const lg = api.els.detail.querySelector(".studio-legacy-editor");
    if (["authVisual", "profileLayout", "vipPage"].includes(id))
      lg.closest("details").remove();
    lg.querySelector("h2")?.remove();
    lg.querySelector("p.tiny")?.remove();
    lg.querySelector(".evidence-risk-panel")?.remove();
    if (["gameLayout", "gameGridStyle"].includes(id)) {
      lg.innerHTML =
        "<p>" +
        tx(
          "分类按钮的图标与文字可在「页面与功能 → 分类按钮」中调整。",
          "Change category labels and icons under Pages & functions → Category buttons.",
        ) +
        "</p>";
    }
    if (id === "authVisual" && current !== 3) {
      api.els.detail.insertAdjacentHTML(
        "beforeend",
        '<details class="studio-disclosure"><summary>' +
          tx("登录与注册配图", "Login & registration artwork") +
          '</summary><div class="studio-media-fields">' +
          ["login", "register"]
            .map(
              (key) =>
                "<div><label><strong>" +
                tx(
                  key === "login" ? "登录配图" : "注册配图",
                  key === "login" ? "Login artwork" : "Registration artwork",
                ) +
                '</strong><input type="file" accept="image/png,image/jpeg,image/webp" data-studio="auth-image" data-media="' +
                key +
                '"></label>' +
                action(
                  "reset-image",
                  tx("恢复配图", "Reset artwork"),
                  'data-media="' + key + '"',
                  "studio-text-btn",
                ) +
                "</div>",
            )
            .join("") +
          '<p class="studio-muted">PNG / JPG / WebP · ≤ 2 MB</p></div></details>',
      );
    }
  }
  function preview(r) {
    const pane = api.els.preview;
    pane.setAttribute("data-studio-localized", "");
    if (!frame || !pane.contains(frame)) {
      pane.innerHTML =
        '<div id="studio-preview-tools"></div><div class="studio-preview-stage"><div class="studio-device"><iframe src="player-home-preview.html?v=pages-20260907-6" title="交互式玩家预览" class="home-preview-frame"></iframe></div></div><div id="studio-preview-note"></div>';
      frame = pane.querySelector("iframe");
      frameReady = false;
      frame.addEventListener("load", () => {
        frameReady = true;
        sendConfig();
      });
    }
    const vp = [320, 375, 390, 480].includes(Number(s().preview.viewport))
        ? Number(s().preview.viewport)
        : 390,
      pages = [
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
        "用户验证",
        "设置",
        "客服",
      ];
    const en = {
      首页: "Home",
      登入注册: "Sign in",
      活动: "Promotions",
      推广: "Affiliate",
      VIP: "VIP",
      账户: "Account",
      钱包: "Wallet",
      充值: "Deposit",
      提款: "Withdraw",
      站内信: "Inbox",
      用户验证: "Verification",
      设置: "Settings",
      客服: "Support",
    };
    pane.querySelector("#studio-preview-tools").innerHTML =
      '<div class="studio-preview-title"><div><span class="studio-live-dot"></span><h2>' +
      tx("预览", "Preview") +
      "</h2></div>" +
      action(
        "player-settings",
        tx("玩家外观", "Player appearance"),
        "",
        "studio-text-btn",
      ) +
      '</div><div class="studio-preview-controls"><label>' +
      tx("尺寸", "Width") +
      '<select id="vp-select">' +
      [320, 375, 390, 480]
        .map(
          (v) =>
            '<option value="' +
            v +
            '" ' +
            (String(vp) === String(v) ? "selected" : "") +
            ">" +
            (v + " px") +
            "</option>",
        )
        .join("") +
      "</select></label><label>" +
      tx("玩家状态", "Player state") +
      '<select id="auth-select"><option value="loggedOut" ' +
      (s().preview.auth === "loggedOut" ? "selected" : "") +
      ">" +
      tx("未登录", "Signed out") +
      '</option><option value="loggedIn" ' +
      (s().preview.auth === "loggedIn" ? "selected" : "") +
      ">" +
      tx("已登录", "Signed in") +
      "</option></select></label><label>" +
      tx("页面", "Page") +
      '<select id="page-select">' +
      pages
        .map(
          (n) =>
            '<option value="' +
            n +
            '" ' +
            (s().preview.page === n ? "selected" : "") +
            ">" +
            tx(n, en[n]) +
            "</option>",
        )
        .join("") +
      "</select></label></div>";
    const device = pane.querySelector(".studio-device");
    device.style.width = vp + "px";

    pane.querySelector("#studio-preview-note").innerHTML =
      '<p class="studio-preview-caption">' +
      E(s().theme + " · " + colorName(r.values.themeColor)) +
      "<span>" +
      tx("手机网页 · 可交互", "Mobile web · interactive") +
      "</span></p>" +
      (s().theme !== "NG"
        ? '<p class="studio-callout">' +
          tx(
            "此主题为既有原型示意，未采用本 Figma 的专属设计。",
            "This theme is a legacy prototype; its own Figma design is pending.",
          ) +
          "</p>"
        : "");
    const styles = {};
    Object.entries(D.allFamilies()).forEach(([id, f]) => {
      styles[f.key] = D.styleNumber(
        id,
        { ...s().draft[id], value: r.values[id] },
        s().theme,
      );
    });
    config = {
      schemaVersion: 1,
      tenantId: s().tenantId,
      theme: s().theme,
      color: r.values.themeColor,
      styles,
      media: s().draft.authVisual.extra.media || {},
      values: r.values,
      auth: s().preview.auth,
      locale: s().uiLocale,
      nav: api.effectiveNav(r.values, s().preview.auth),
      page: s().preview.page,
      content: s().preview.content,
      install:
        s().preview.installEnabled &&
        s().preview.unavailableCapability !== "App download",
      policy: readPolicy(),
      focus: s().selectedId,
    };
    sendConfig();
  }
  function sendConfig() {
    if (frameReady && config)
      frame.contentWindow.postMessage(
        { type: "ngss3-preview-config", config },
        location.protocol === "file:" ? "*" : location.origin,
      );
  }
  function finish(r) {
    const collapsed = document.body.classList.contains("sidebar-collapsed");
    const navigationToggle = document.querySelector(".backoffice-collapse");
    navigationToggle.setAttribute("aria-expanded", String(!collapsed));
    navigationToggle.setAttribute(
      "aria-label",
      tx(
        collapsed ? "展开后台导航" : "收起后台导航",
        collapsed ? "Expand navigation" : "Collapse navigation",
      ),
    );
    document.querySelector(".backoffice-sidebar").inert = collapsed;
    document.querySelector(".app-header h1").textContent = tx(
      "个性化改版",
      "Personalization redesign",
    );
    document.title = tx(
      "个性化改版 · NGSS管理系统",
      "Personalization redesign · NGSS Admin",
    );
    api.els.version.textContent = tx(
      api.dirty() ? "有未保存修改" : "已保存",
      api.dirty() ? "Unsaved changes" : "Saved",
    );
    api.els.apply.textContent = tx(
      s().ui.loadingApply ? "正在保存…" : "保存",
      s().ui.loadingApply ? "Saving…" : "Save",
    );
    const saveDisabled = !api.dirty() || !r.canApply || s().ui.loadingApply;
    api.els.apply.disabled = saveDisabled;
    api.els.apply.setAttribute("aria-disabled", String(saveDisabled));
    document.querySelector('[data-action="cancel"]').disabled =
      !api.dirty() || s().ui.loadingApply;
    const validation = api.els.validation,
      full = validation.innerHTML;
    validation.setAttribute("data-studio-localized", "");
    validation.innerHTML =
      '<details class="studio-validation-detail" ' +
      (!r.canApply ? "open" : "") +
      '><summary><span class="studio-validation-dot ' +
      (!r.canApply ? "blocked" : "") +
      '"></span><strong>' +
      tx(
        r.canApply ? "检查通过" : "有设置需要处理",
        r.canApply
          ? "Checks passed — ready to save"
          : "Some settings need attention",
      ) +
      "</strong><span>" +
      tx("查看检查详情", "View details") +
      "</span></summary>" +
      full +
      "</details>" +
      (s().ui.fallbackMessage
        ? '<p class="studio-save-message" role="status">' +
          E(api.localizedText(s().ui.fallbackMessage)) +
          "</p>"
        : "");
    if (lastPanel !== s().selectedId) {
      document.querySelector(".studio-editor-scroll").scrollTop = 0;
      lastPanel = s().selectedId;
    }
  }
  function diff() {
    const rows = api.CATALOG.filter((i) => isChanged(i.id));
    const describe = (id, row) => {
      if (!row) return "—";
      const parts = [row.mode];
      if (id === "theme") {
        const p = row.extra.playerChoices || D.defaultPolicy();
        parts.push(
          row.value,
          tx("玩家主题：", "Player themes: ") + p.themes.join(", "),
        );
        p.themes.forEach((n) =>
          parts.push(n + ": " + p.colors[n].map(colorName).join(", ")),
        );
      } else {
        parts.push(
          typeof row.value === "object"
            ? JSON.stringify(row.value)
            : colorNameIf(id, row.value),
        );
        if (row.extra.design)
          parts.push(tx("视觉样式 ", "Visual style ") + row.extra.design.value);
      }
      return parts.map(E).join("<br>");
    };
    api.els.diff.className = "drawer open";
    api.els.diff.setAttribute("data-studio-localized", "");
    api.els.diff.innerHTML =
      '<div class="drawer-panel"><div class="studio-card-title"><h2 id="diff-title">' +
      tx("未保存修改", "Unsaved changes") +
      '</h2><button class="btn" data-action="close-drawers">' +
      tx("关闭", "Close") +
      "</button></div><p>" +
      tx(
        "对比上次保存的设置与当前修改。",
        "Compare saved settings with your current changes.",
      ) +
      "</p>" +
      (rows.length
        ? "<table><thead><tr><th>" +
          tx("设置", "Setting") +
          "</th><th>" +
          tx("已保存", "Saved") +
          "</th><th>" +
          tx("当前草稿", "Draft") +
          "</th></tr></thead><tbody>" +
          rows
            .map(
              (i) =>
                "<tr><td>" +
                E(i.label) +
                "</td><td>" +
                describe(i.id, s().published.objects[i.id]) +
                "</td><td>" +
                describe(i.id, s().draft[i.id]) +
                "</td></tr>",
            )
            .join("") +
          "</tbody></table>"
        : "<p>" + tx("没有未保存修改。", "No unsaved changes.") + "</p>") +
      action("export", tx("导出当前配置", "Export current configuration")) +
      "</div>";
  }
  function colorNameIf(id, value) {
    return id === "themeColor" ? colorName(value) : (value ?? "—");
  }
  function onClick(e) {
    const b = e.target.closest("[data-studio]");
    if (!b || b.tagName !== "BUTTON") return;
    const a = b.dataset.studio,
      id = b.dataset.id;
    let mutate = true;
    if (a === "toggle-sidebar") {
      const collapsed = document.body.classList.toggle("sidebar-collapsed");
      document.querySelector(".backoffice-sidebar").inert = collapsed;
      b.setAttribute("aria-expanded", String(!collapsed));
      b.setAttribute(
        "aria-label",
        tx(
          collapsed ? "展开后台导航" : "收起后台导航",
          collapsed ? "Expand navigation" : "Collapse navigation",
        ),
      );
      return;
    }
    if (a === "theme") {
      const n = b.dataset.theme;
      if (n === s().theme) return;
      const p = readPolicy();
      api.switchTheme(n);
      api.resetObject("themeColor");
      if (!p.themes.includes(n)) p.themes.push(n);
      p.defaults[n] = api.themeDefaultFor("themeColor", n);
      if (!p.colors[n].includes(p.defaults[n]))
        p.colors[n].unshift(p.defaults[n]);
      savePolicy(p);
      s().selectedId = "themeColor";
      s().preview.page = "首页";
    } else if (a === "color") {
      const row = s().draft.themeColor;
      row.mode = "SET";
      row.value = b.dataset.color;
      row.sourceTheme = s().theme;
      savePolicy(readPolicy());
    } else if (a === "reset-color") {
      api.resetObject("themeColor");
      savePolicy(readPolicy());
    } else if (a === "style") {
      const n = Number(b.dataset.style),
        row = s().draft[id];
      if (["gameLayout", "gameGridStyle"].includes(id)) {
        row.mode = "SET";
        row.value = D.names[n - 1];
        row.sourceTheme = s().theme;
      } else
        row.extra.design = { mode: "SET", value: n, sourceTheme: s().theme };
      if (id === "sidebar") {
        row.mode = "SET";
        row.value = n === 1 ? "右方" : "左方";
        row.sourceTheme = s().theme;
      }
      if (id === "topDownloadBar") {
        row.mode = "SET";
        row.value = "开启";
        row.sourceTheme = s().theme;
      }
      focusPage(id);
    } else if (a === "reset-image") {
      if (s().draft.authVisual.extra.media)
        delete s().draft.authVisual.extra.media[b.dataset.media];
    } else if (a === "reset-style") {
      if (["gameLayout", "gameGridStyle"].includes(id)) api.resetObject(id);
      else delete s().draft[id].extra.design;
    } else if (a === "player-settings") {
      s().preview.page = "设置";
      api.renderAll();
      mutate = false;
    } else if (a === "next") {
      s().selectedId = "gameLayout";
      focusPage("gameLayout");
      api.renderAll();
      mutate = false;
    } else if (a === "export") {
      const exportData = {
        schemaVersion: 1,
        status: "Prototype-only",
        source: { fileKey: "15tSa9kHMmOouSzZ4mb8oE", pageId: "147:1112" },
        tenantId: s().tenantId,
        theme: s().theme,
        playerChoices: readPolicy(),
        objects: s().draft,
        preview: config,
        validation: { canSaveExample: api.resolveAll().canApply },
        note: "Synthetic local example. Backend capability validation, authorization and persistence are required before production use.",
      };
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "ng-customize-" + s().tenantId + ".json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      announce(tx("配置已导出。", "Configuration exported."));
      mutate = false;
    } else mutate = false;
    if (mutate) touch();
  }
  async function onChange(e) {
    const b = e.target;
    if (!b.dataset.studio) return;
    const a = b.dataset.studio,
      n = b.dataset.theme,
      p = readPolicy();
    if (a === "auth-image") {
      const file = b.files?.[0],
        tenant = s().tenantId;
      if (!file) return;
      if (
        !/^(image\/png|image\/jpeg|image\/webp)$/.test(file.type) ||
        file.size > 2 * 1024 * 1024
      ) {
        announce(
          tx(
            "请选择 2 MB 以内的 PNG、JPG 或 WebP。",
            "Choose a PNG, JPG or WebP under 2 MB.",
          ),
        );
        b.value = "";
        return;
      }
      const data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      if (!data || s().tenantId !== tenant) return;
      const valid = await new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image.width > 0 && image.height > 0);
        image.onerror = () => resolve(false);
        image.src = data;
      });
      if (!valid || s().tenantId !== tenant) {
        announce(tx("图片无法读取。", "Cannot read this image."));
        return;
      }
      s().draft.authVisual.extra.media ||= {};
      s().draft.authVisual.extra.media[b.dataset.media] = data;
      touch();
      return;
    }
    if (a === "allow-theme") {
      if (n === s().theme) return;
      p.themes = b.checked
        ? [...new Set([...p.themes, n])]
        : p.themes.filter((t) => t !== n);
      savePolicy(p);
    } else if (a === "allow-color") {
      const color = b.dataset.color;
      if (color === p.defaults[n]) return;
      p.colors[n] = b.checked
        ? [...new Set([...p.colors[n], color])]
        : p.colors[n].filter((c) => c !== color);
      savePolicy(p);
    } else if (a === "policy-default") {
      if (!p.colors[n].includes(b.value)) return;
      p.defaults[n] = b.value;
      savePolicy(p);
    } else if (a === "visibility") {
      const row = s().draft[b.dataset.id];
      row.mode = b.checked ? "SET" : "OFF";
      row.value = b.checked
        ? b.dataset.id === "sidebar"
          ? "左方"
          : "开启"
        : null;
      row.sourceTheme = s().theme;
    } else return;
    touch();
  }
  function attach(a) {
    api = a;
    const section = new URLSearchParams(location.search).get("section");
    if (section && api.byId[section]) {
      s().selectedId = section;
      focusPage(section);
    }
    // Fit component thumbnails to the PC editor column without manager breakpoints.
    const editor = document.querySelector(".studio-editor-scroll");
    new ResizeObserver(() => {
      const compact = editor.clientWidth < 520;
      editor.classList.toggle("studio-compact-editor", compact);
      const available = (editor.clientWidth - 56) / (compact ? 1 : 2) - 22;
      editor.style.setProperty(
        "--thumbnail-scale",
        Math.min(0.6, available / 390),
      );
      editor.style.setProperty(
        "--page-thumbnail-scale",
        Math.min(0.4, available / 390),
      );
    }).observe(editor);
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    window.addEventListener("message", (e) => {
      if (!frame || e.source !== frame.contentWindow) return;
      if (location.protocol !== "file:" && e.origin !== location.origin) return;
      if (e.data?.type === "ngss3-preview-ready") {
        frameReady = true;
        sendConfig();
      }
      if (
        e.data?.type === "ngss3-preview-navigation" &&
        typeof e.data.page === "string"
      ) {
        s().preview.page = e.data.page;
        api.renderAll();
      }
    });
    window.addEventListener("beforeunload", (e) => {
      if (api.dirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }
  function testPlayer(fn) {
    preview(api.resolveAll());
    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;left:-3000px;top:0;width:390px;height:650px";
    document.body.append(root);
    try {
      const c = D.clone(config),
        player = new NGPlayer.Player(root);
      player.setConfig(c);
      return fn({ root, player, config: c });
    } finally {
      root.remove();
    }
  }
  window.NGStudio = {
    attach,
    tree,
    detail,
    preview,
    finish,
    diff,
    focusPage,
    readPolicy,
    testPlayer,
  };
})();
