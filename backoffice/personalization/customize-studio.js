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
    noticeTimer,
    lastSentConfig = "";
  const s = () => api.state,
    tx = (zh, en) => (s().uiLocale === "en" ? en : zh);
  const themeName = (n) =>
    n === "NG"
      ? tx("NG (默认)", "NG (Default)")
      : n === "PH"
        ? tx("菲律宾", "Philippines")
        : n === "IN"
          ? tx("印度", "India")
          : n === "SF"
            ? tx("星空", "Starfield")
            : n;
  const sourceURL = (node) =>
    "https://www.figma.com/design/15tSa9kHMmOouSzZ4mb8oE/Mika-Temp?node-id=" +
    node.replace(":", "-");
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
  const thumbnails = new Map();
  function cachedThumbnail(id, f, n, color) {
    const boundTheme=color==="PHPINK"?"PH":color==="INPLACEHOLDER"?"IN":color==="SFPURPLE"?"SF":"NG";
    if(boundTheme!=="NG") {
      const part=({topStatusBar:"header",carouselStyle:"carousel",gameLayout:"category",gameGridStyle:"grid",bottomNav:"nav",shortcuts:"shortcuts"})[id];
      return part ? `<img class="source-theme-thumbnail" src="assets/source-themes/${boundTheme}-${part}.webp" alt="${boundTheme} ${E(f.label)}">` : `<div class="source-theme-bound"><strong>${boundTheme}</strong><span>${tx("本主题默认样式","Theme default style")}</span></div>`;
    }
    const key = JSON.stringify([id, n, color]);
    if (!thumbnails.has(key)) {
      if (thumbnails.size >= 256)
        thumbnails.delete(thumbnails.keys().next().value);
      thumbnails.set(
        key,
        NGCurrent.thumbnail(f.key, n, color) ??
          (D.pageFamilies[id]
            ? window.NGPageComponents
            : window.NGPlayer
          ).thumbnail(f.key, n, color),
      );
    }
    return thumbnails.get(key);
  }
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
  function touch(opts) {
    s().draftVersion++;
    s().acks = { auto: {}, review: {} };
    s().ui.fallbackMessage = "";
    api.renderAll(opts);
  }
  function styleCardName(f, i) {
    if(s().theme!=="NG")return s().theme+" · "+tx("样式1","Style 1");
    const current = i >= (f.currentStart || 99);
    const name = current
      ? tx(
          "样式" + (i - f.currentStart + 1) + "（现行）",
          "Style " + (i + 1) + " (Current)",
        )
      : tx(D.names[i], "Style " + (i + 1));
    return name + " · " + tx(f.titles[i], f.english[i]);
  }
  function syncStyleSelection(r) {
    const id = s().selectedId,
      f = D.allFamilies()[id],
      row = s().draft[id],
      grid = api.els.detail.querySelector(".studio-style-grid");
    if (!f || !row || !grid) return false;
    const current = D.styleNumber(
      id,
      { ...row, value: r.values[id] },
      s().theme,
    );
    const hidden =
      row.mode === "OFF" ||
      row.value === "关闭" ||
      (id === "sidebar" && r.values.sidebarDisabled) ||
      (id === "topDownloadBar" && r.values.topDownloadBar !== "开启");
    if (hidden) return false;
    grid.querySelectorAll(".studio-style-card").forEach((card, i) => {
      const on = current === i + 1;
      card.classList.toggle("active", on);
      const btn = card.querySelector("[data-studio='style']");
      if (!btn) return;
      btn.setAttribute("aria-pressed", String(on));
      const mark = btn.querySelector("i");
      if (mark) mark.textContent = on ? "✓" : "";
    });
    const caption = api.els.detail.querySelector(
      ".studio-style-grid + .studio-caption",
    );
    if (caption)
      caption.textContent = tx(
        f.notes[current - 1],
        "Selected: " +
          f.english[current - 1] +
          ". Try it in the interactive preview.",
      );
    const inherit = api.els.detail.querySelector(".studio-inherit");
    if (inherit) {
      const custom = ["gameLayout", "gameGridStyle"].includes(id)
        ? row.mode === "SET"
        : row.extra.design?.mode === "SET";
      inherit
        .querySelector(".studio-dot")
        ?.classList.toggle("dot-custom", custom);
      inherit
        .querySelector(".studio-dot")
        ?.classList.toggle("dot-inherit", !custom);
      const label = inherit.querySelector(".studio-inherit-info span:last-child");
      if (label)
        label.textContent = tx(
          custom ? "已自定义本站配置" : "跟随 NG 默认",
          custom ? "Custom style" : "Using NG default",
        );
      const reset = inherit.querySelector('[data-studio="reset-style"]');
      if (custom && !reset)
        inherit.insertAdjacentHTML(
          "beforeend",
          action(
            "reset-style",
            tx("恢复默认", "Reset style"),
            'data-id="' + id + '"',
            "studio-text-btn",
          ),
        );
      else if (!custom && reset) reset.remove();
    }
    return true;
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
  function editableItem(id,r) {
    if(["theme","themeColor","bottomNav","gameLayout","authVisual"].includes(id))return true;
    if(D.availableStyleIndices(s().theme,id).length>1)return true;
    const item=api.byId[id],row=s().draft[id];
    if(!item || ["FIXED","DERIVED"].includes(row.mode))return false;
    const opts=item.themeOptions?.[s().theme] || item.options || [];
    if(Array.isArray(opts) ? opts.filter(v=>v!=="关闭").length>1 : Object.values(opts).some(values=>values.length>1))return true;
    const choices=Array.isArray(opts)?opts:Object.values(opts).flat();
    if(item.supportsOff && choices.some(v=>v!=="关闭" && v!=null)) return true;
    return false;
  }
  function tree(r) {
    if(!editableItem(s().selectedId,r) && !s().ui.homeSection)s().selectedId="themeColor";
    const q = s().search.toLowerCase().trim();
    const ids = Object.keys(D.families);
    const row = (id) => {
      if(!editableItem(id,r))return "";
      const item = api.byId[id],
        label =
          id === "themeColor"
            ? tx("主题与颜色", "Theme & colors")
            : tx(
                D.pageFamilies[id]?.label || item.label,
                D.allFamilies()[id]?.en || englishLabels[id] || item.label,
              );
      if (q && !(label + " " + id + " " + item.page + (id === "gameLayout" ? " 分类按钮 资金快捷区 category buttons wallet shortcuts" : "")).toLowerCase().includes(q))
        return "";
      const issue = r.items.find((n) => n.id === id);
      const changed =
        isChanged(id) || (id === "gameLayout" && isChanged("categoryButtons")) || (id === "themeColor" && isChanged("theme"));
      return (
        '<button type="button" data-name="' +
        E(label) +
        '" class="studio-nav-item ' +
        ((s().selectedId === id && !s().ui.homeSection) ||
        (id === "themeColor" && s().selectedId === "theme")
          ? "active"
          : "") +
        (changed ? " is-modified" : "") +
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
            ? '<span class="ux-modified-icon" aria-label="已修改" title="已修改">✎</span>'
            : D.allFamilies()[id]
              ? (s().theme !== "NG" ? 1 : D.allFamilies()[id].titles.length)
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
    const groups = [
      ["01 · 基础外观", "01 · FOUNDATION", ["themeColor"]],
      [
        "02 · 首页组件",
        "02 · HOME COMPONENTS",
        [
          "topStatusBar",
          "topDownloadBar",
          "carouselStyle",
          "gameLayout",
          "gameGridStyle",
          "searchPagination",
          "footerStyle",
        ],
      ],
      [
        "03 · 页面组件",
        "03 · PAGE COMPONENTS",
        [
          "authVisual",
          "depositPage",
          "profileLayout",
          "vipPage",
          "inbox",
          "popupStyle",
        ],
      ],
      [
        "04 · 导航与功能入口",
        "04 · NAVIGATION & ENTRIES",
        ["bottomNav", "sidebar", "shortcuts", "alternateButton"],
      ],
      [
        "05 · 更多功能设置",
        "05 · MORE SETTINGS",
        [
          "recordsDisplay",
          "amountAutoInput",
          "vipCard",
          "userVerification",
          "buttonStyle",
          "gameIconStyle",
        ],
      ],
    ];
    let html = groups
      .map(([zh, en, list], i) => {
        const content = list
          .map(
            (id) =>
              row(id) + (id === "gameGridStyle" ? NGCurrent.homeTree(q) : ""),
          )
          .join("");
        const collapsed = !q && !!s().ui.collapsedGroups?.[i];
        return content
          ? `<section class="ux-nav-group" data-name="${E(tx(zh, en))}">${action("collapse-group", `<span>${tx(zh, en)}</span><span aria-hidden="true">${collapsed ? "›" : "⌄"}</span>`, `data-group="${i}" aria-expanded="${!collapsed}"`, "studio-nav-heading")}<div data-name="${E(tx(zh, en))} 项目" ${collapsed ? "hidden" : ""}>${content}</div></section>`
          : "";
      })
      .join("");
    if (q && !html.includes("studio-nav-item"))
      html =
        '<p class="studio-muted">' +
        tx("没有匹配的设置。", "No matching settings.") +
        "</p>";
    if (api.els.tree.dataset.markup === html) return;
    api.els.tree.innerHTML = html;
    api.els.tree.dataset.markup = html;
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
      ["NG", "PH", "IN", "SF"]
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
          tx(
            "既有示意色 · 非本 Figma 设计",
            "Legacy colors · outside this Figma design",
          ) +
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
      ["NG", "PH", "IN", "SF"]
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
                  n + " 默认配色",
                  n + " default color",
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
      ""
    );
  }
  function detail(r, legacy) {
    const id = s().selectedId,
      f = D.allFamilies()[id],
      row = s().draft[id];
    api.els.detail.removeAttribute("data-studio-localized");
    if (s().ui.homeSection && id === "gameLayout") {
      NGCurrent.homePanel();
      return;
    }
    if (id === "alternateButton") {
      NGCurrent.alternatePanel();
      return;
    }
    if (id === "themeColor" || id === "theme") {
      api.els.detail.setAttribute("data-studio-localized", "");
      api.els.detail.innerHTML = themePanel();
      return;
    }
    if (!f) {
      legacy(r);
      const panel = api.els.detail.querySelector(".evidence-risk-panel");
      if (panel) {
        const d = document.createElement("details");
        d.className = "studio-disclosure";
        d.innerHTML =
          "<summary>" +
          tx("开发说明与证据", "Developer notes & evidence") +
          "</summary>";
        panel.replaceWith(d);
        d.append(panel);
      }
      api.els.detail
        .querySelector("h2")
        ?.querySelectorAll(".badge,.help-tip")
        .forEach((n) => n.remove());
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
    const supportsOff = Boolean(api.byId[id]?.supportsOff);
    const isOff =
      row.mode === "OFF" ||
      row.value === "关闭" ||
      (id === "sidebar" && r.values.sidebarDisabled) ||
      (id === "topDownloadBar" && r.values.topDownloadBar !== "开启");
    const hidden = supportsOff && isOff;
    const source = D.allFamilies()[id],
      chosen = source.notes[current - 1];

    const lockSidebar = id === "sidebar" && s().draft.shortcuts?.value === "侧边栏内" && !hidden;
    const switchLocked = lockSidebar;
    const switchTooltip = lockSidebar
        ? tx("快捷入口设于侧边栏内时不可关闭侧边栏", "Shortcuts are hosted in sidebar; cannot turn off sidebar")
        : "";

    const styleIndices = D.availableStyleIndices(s().theme,id).map(n=>n-1);

    // Harvest legacy functional controls
    legacy(r);
    const legacyHTML = api.els.detail.innerHTML;
    api.els.detail.setAttribute("data-studio-localized", "");

    api.els.detail.innerHTML =
      '<div class="studio-section-head" data-name="组件标题"><div><span class="studio-eyebrow">' +
      (D.pageFamilies[id] ? "03 / PAGE COMPONENTS" : "02 / HOME COMPONENTS") +
      "</span><h2>" +
      tx(f.label, f.en) +
      "</h2><p>" +
      tx(
        "按步骤从上到下完成组件启用、视觉样式与功能业务设置。",
        "Configure component status, visual style, and behavior step by step.",
      ) +
      "</p></div></div>" +
      // STEP 1: 状态与开关
      '<section class="studio-card studio-step-card" data-name="状态与开关"><div class="studio-card-title"><span class="studio-step">1</span><h3>' +
      tx("状态与开关", "Status & Switch") +
      "</h3></div>" +
      (supportsOff
        ? '<div class="studio-visibility studio-visibility-card' +
          (hidden ? " is-off" : " is-on") +
          (switchLocked ? " is-locked" : "") +
          '"><div class="studio-switch-desc"><strong>' +
          tx("向玩家展示此组件", "Show this component to players") +
          "</strong><span>" +
          tx(
            hidden
              ? "目前关闭。打开开关后，玩家首页会显示侧栏或此组件。"
              : "目前开启。关闭后此组件不会出现在玩家端。",
            hidden
              ? "Off. Turn on to show this component to players."
              : "On. Turn off to hide this component from players.",
          ) +
          '</span></div><label class="studio-switch studio-switch-lg"' +
          (switchTooltip ? ' title="' + E(switchTooltip) + '"' : "") +
          '><input type="checkbox" data-studio="visibility" data-id="' +
          id +
          '" ' +
          (!hidden ? "checked" : "") +
          (switchLocked ? " disabled" : "") +
          '><span></span><b data-on="' +
          tx("已开启", "On") +
          '" data-off="' +
          tx("已关闭", "Off") +
          '">' +
          tx(hidden ? "已关闭" : "已开启", hidden ? "Off" : "On") +
          "</b></label></div>"
        : '<div class="studio-visibility studio-visibility-card is-permanent"><div class="studio-switch-desc"><strong>' +
          tx("常驻基础组件", "Permanent Core Component") +
          "</strong><span>" +
          tx(
            "此为系统常驻基础组件，默认开启",
            "Core component, permanently active",
          ) +
          '</span></div><span class="studio-status-tag-active">' +
          tx("常驻开启", "Active") +
          "</span></div>") +
      '<div class="studio-inherit"><div class="studio-inherit-info"><span class="studio-dot ' +
      (custom ? "dot-custom" : "dot-inherit") +
      '"></span><span>' +
      tx(
        custom ? "已自定义本站配置" : "跟随 " + s().theme + " 默认",
        custom ? "Custom style" : "Using " + s().theme + " default",
      ) +
      "</span></div>" +
      (custom
        ? action(
            "reset-style",
            tx("恢复默认", "Reset style"),
            'data-id="' + id + '"',
            "studio-text-btn",
          )
        : "") +
      "</div></section>" +
      // STEP 2: 视觉样式选择
      '<section class="studio-card studio-step-card ' +
      (hidden ? "studio-card-disabled" : "") +
      '" data-name="视觉样式选择"><div class="studio-card-title"><span class="studio-step">2</span><h3>' +
      tx("视觉样式选择", "Visual Style Selection") +
      '</h3><span class="studio-count">' +
      styleIndices.length +
      " " +
      tx("款样式", "styles") +
      "</span></div>" +
      (hidden
        ? '<div class="studio-callout studio-callout-disabled"><span class="studio-callout-icon">🚫</span><div><strong>' +
          tx("组件已在上方关闭", "Component is disabled above") +
          "</strong><p>" +
          tx(
            "如需选择并切换视觉样式，请先在上方「标题旁的开关」中开启此组件（或直接点击下方样式开启）。",
            "Enable the component in the header control to choose visual styles.",
          ) +
          "</div></div>"
        : "") +
      '<div class="studio-style-grid ' +
      (hidden ? "is-dimmed" : "") +
      '" data-name="样式清单">' +
      styleIndices
        .map(
          (i) => {
            const title = f.titles[i];
            return (
            '<div class="studio-style-card ' +
            (current === i + 1 && !hidden ? "active" : "") +
            '" data-name="' +
            E(styleCardName(f, i)) +
            '"><div class="studio-style-image" inert aria-hidden="true" data-name="样式缩略图">' +
            cachedThumbnail(id, f, i + 1, r.values.themeColor) +
            "</div>" +
            action(
              "style",
              "<span><strong>" +
                tx(
                  i >= f.currentStart
                    ? "样式" + (i - f.currentStart + 1) + "（现行）"
                    : D.names[i],
                  "Style " +
                    (i + 1) +
                    (i >= f.currentStart ? " (Current)" : ""),
                ) +
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
            "</div>"
            );
          },
        )
        .join("") +
      "</div>" +
      '<p class="studio-caption">' +
      (hidden
        ? tx(
            "点击任一样式卡片可直接开启并应用该样式。",
            "Clicking any style will also enable this component.",
          )
        : tx(
            f.notes[current - 1] || chosen || "",
            "Selected: " +
              (f.english[current - 1] || "") +
              ". Try it in the interactive preview.",
          )) +
      "</p></section>" +
      // STEP 3: 细部设置
      '<section class="studio-card studio-step-card ' +
      (hidden ? "studio-card-disabled" : "") +
      '" data-name="细部设置"><div class="studio-card-title"><span class="studio-step">3</span><h3>' +
      tx("细部设置", "Detailed settings") +
      "</h3></div>" +
      (hidden
        ? '<div class="studio-callout studio-callout-disabled"><span class="studio-callout-icon">🚫</span><div><strong>' +
          tx("组件已在上方关闭", "Component is disabled above") +
          "</strong><p>" +
          tx(
            "细部设置随组件关闭而停用。",
            "Functional settings are disabled while the component is turned off.",
          ) +
          "</div></div>"
        : '<div class="studio-function-editor">' + legacyHTML + "</div>") +
      "</section>";

    // Clean up Step 3 functional settings
    const lg = api.els.detail.querySelector(".studio-function-editor");
    if (lg) {
      lg.querySelector("h2")?.remove();
      lg.querySelector("p.tiny")?.remove();
      lg.querySelector(".evidence-risk-panel")?.remove();
      // Remove redundant "状态与覆盖" panel (Step 1 already handles status & reset)
      lg.querySelector(".panel:first-child")?.remove();

      // Remove internal debug panels like "来源主题（混合主题演示）" and clean up redundant headers
      lg.querySelectorAll(".panel").forEach((p) => {
        const title = p.querySelector("h3")?.textContent || "";
        if (title.includes("来源主题") || title.includes("混合主题")) {
          p.remove();
        } else if (title.trim() === "選項" || title.trim() === "Value") {
          p.querySelector("h3")?.remove();
        }
      });

      // REMOVE ANY "关闭" BUTTON/OPTION FROM STEP 3! (Closing is done exclusively in Step 1)
      lg.querySelectorAll("button, label").forEach((btn) => {
        const txt = btn.textContent.trim();
        if (
          txt === "关闭" ||
          txt === "已覆盖主题默认（关闭）" ||
          btn.dataset.value === "关闭" ||
          btn.dataset.mode === "OFF"
        ) {
          btn.remove();
        }
      });

      if (id === "gameLayout") {
        lg.innerHTML = NGCurrent.homeControls(r);
      } else if (id === "bottomNav") {
        lg.innerHTML = NGCurrent.navEditor();
      } else if (id === "topDownloadBar") {
        lg.innerHTML = s().theme === "NG" ? NGCurrent.downloadEditor() : `<p class="studio-caption">${tx("使用本主题的下载入口，配色与图示随主题固定。","Uses this theme’s download entry with its fixed colors and artwork.")}</p>`;
      } else if (["gameGridStyle", "carouselStyle"].includes(id)) {
        lg.innerHTML =
          '<div class="studio-function-empty"><span class="studio-empty-icon">✓</span><div><strong>' +
          tx("当前组件无需额外业务参数", "No extra parameters required") +
          "</strong><p>" +
          tx(
            "该组件展示完全由「步骤 2」所选视觉样式呈现，已更新草稿预览，保存后才应用。",
            "This component is fully driven by the visual style selected in Step 2.",
          ) +
          "</p></div></div>";
      } else if (id === "topDownloadBar") {
        lg.innerHTML =
          '<div class="studio-function-empty"><span class="studio-empty-icon">✓</span><div><strong>' +
          tx("下载横幅已开启", "Download banner enabled") +
          "</strong><p>" +
          tx(
            "提示文案与下载 CTA 按钮已按所选样式就绪，展示效果与所选样式保持同步。",
            "Banner prompt copy and CTA are configured and synced with the chosen style.",
          ) +
          "</p></div></div>";
      } else if (["authVisual", "profileLayout", "vipPage"].includes(id)) {
        if (id === "authVisual" && current !== 3) {
          lg.innerHTML =
            '<div class="studio-media-fields">' +
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
            '<p class="studio-muted">PNG / JPG / WebP · ≤ 2 MB</p></div>';
        } else {
          lg.innerHTML =
            '<div class="studio-function-empty"><span class="studio-empty-icon">✓</span><div><strong>' +
            tx("页面版式已就绪", "Page layout ready") +
            "</strong><p>" +
            tx(
              "该页面结构完全由「步骤 2」所选视觉样式呈现，无需额外设置。",
              "This page layout is fully defined by the style selected in Step 2.",
            ) +
            "</p></div></div>";
        }
      }

      if (
        !lg.innerHTML.trim() ||
        !lg.querySelector(
          "button, input, select, textarea, .studio-function-empty, .studio-media-fields",
        )
      ) {
        lg.innerHTML =
          '<div class="studio-function-empty"><span class="studio-empty-icon">✓</span><div><strong>' +
          tx("当前组件无需额外业务参数", "No extra parameters required") +
          "</strong><p>" +
          tx(
            "该组件展示完全由「步骤 2」所选视觉样式呈现，已更新草稿预览，保存后才应用。",
            "This component is fully driven by the visual style selected in Step 2.",
          ) +
          "</p></div></div>";
      }
    }
    if (["popupStyle", "footerStyle"].includes(id)) api.els.detail.querySelectorAll(".studio-step-card")[2]?.remove();
  }
  function preview(r) {
    const pane = api.els.preview;
    pane.setAttribute("data-studio-localized", "");
    if (!frame || !pane.contains(frame)) {
      pane.innerHTML =
        '<div id="studio-preview-tools" data-name="预览工具"></div><div class="studio-preview-stage" data-name="H5画布"><div class="studio-device" data-name="H5设备"><iframe src="player-home-preview.html?v=controls-20260909-13" title="交互式玩家预览" class="home-preview-frame" data-name="H5玩家预览"></iframe></div></div><div class="studio-preview-bottom"><div id="studio-preview-note" data-name="预览说明"></div><div id="ux-size-tools" data-name="预览尺寸"></div></div>';
      frame = pane.querySelector("iframe");
      frameReady = false;
      frame.addEventListener("load", () => {
        frameReady = true;
        lastSentConfig = "";
        sendConfig();
      });
    }
    const vp = Number(s().preview.viewport) || 390,
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
    const policy = readPolicy(),
      choice = s().preview.appearance;
    const theme =
      choice && policy.themes.includes(choice.theme) ? choice.theme : s().theme;
    const color =
      choice && policy.colors[theme]?.includes(choice.color)
        ? choice.color
        : policy.defaults[theme];
    const options = (values, current, label) =>
      values
        .map(
          (v) =>
            `<option value="${E(String(v))}" ${v === current ? "selected" : ""}>${E(label(v))}</option>`,
        )
        .join("");
    const markup = `<div class="studio-preview-title"><h2>${tx("预览", "Preview")}</h2><div class="ux-auth-segments" role="group" aria-label="${tx("预览登录状态","Preview sign-in state")}">${["loggedOut","loggedIn"].map(auth=>action("preview-auth",tx(auth==="loggedOut" ? "登录前" : "登录后",auth==="loggedOut" ? "Signed out" : "Signed in"),`data-auth="${auth}" aria-pressed="${s().preview.auth===auth}"`,"ux-auth-option")).join("")}</div></div><div class="ux-preview-selects"><label>${tx("页面", "Page")}<select id="page-select">${options(pages, s().preview.page, (v) => tx(v, en[v]))}</select></label><label><span class="ux-player-choice-tip" tabindex="0" data-tip="${tx("玩家可选配色。仅切换预览，不修改本站默认。","Player-selectable colors. Changes the preview only, not site defaults.")}">${tx("配色", "Color")}</span><select data-studio="preview-color-select" ${policy.colors[theme].length===1 ? "disabled" : ""}>${options(policy.colors[theme], color, colorName)}</select></label><label><span class="ux-player-choice-tip" tabindex="0" data-tip="${tx("玩家可选主题。仅切换预览，不修改本站默认。","Player-selectable themes. Changes the preview only, not site defaults.")}">${tx("主题", "Theme")}</span><select data-studio="preview-theme-select" ${policy.themes.length === 1 ? "disabled" : ""}>${options(policy.themes, theme, (v) => v)}</select></label></div>`;
    const toolbar = pane.querySelector("#studio-preview-tools");
    if (toolbar.dataset.markup !== markup) {
      toolbar.innerHTML = markup;
      toolbar.dataset.markup = markup;
    }
    const sizes = [320, 375, 390, 480],
      custom = s().ui.customViewport || !sizes.includes(vp);
    const sizeMarkup = `<label>${tx("宽度", "Width")}<select data-studio="preview-size" aria-label="${tx("预览尺寸", "Preview size")}">${options(sizes, custom ? null : vp, (v) => v + " px")}<option value="custom" ${custom ? "selected" : ""}>${tx("自定义", "Custom")}</option></select></label>${custom ? `<label><input type="number" data-studio="preview-width" min="280" max="1920" step="1" value="${vp}" aria-label="${tx("自定义宽度", "Custom width")}"> px</label>` : ""}<span class="ux-width-help">${custom ? "280–1920 px" : ""}</span>`;
    const sizeTools = pane.querySelector("#ux-size-tools");
    if (sizeTools.dataset.markup !== sizeMarkup) {
      sizeTools.innerHTML = sizeMarkup;
      sizeTools.dataset.markup = sizeMarkup;
    }
    const device = pane.querySelector(".studio-device");
    device.style.width = vp + "px";
    device.style.maxWidth = "none";
    device.classList.toggle("is-desktop", vp > 480);
    pane.querySelector("#studio-preview-note").innerHTML =
      '<p class="studio-preview-caption">' +
      E(s().theme + " · " + colorName(r.values.themeColor)) +
      "</p>";
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
      themeDefaults: Object.fromEntries(["NG","PH","IN","SF"].map(theme=>[theme,Object.fromEntries(api.CATALOG.map(item=>[item.id,api.themeDefaultFor(item.id,theme)]))])),
      color: r.values.themeColor,
      styles,
      media: s().draft.authVisual.extra.media || {},
      current: Object.fromEntries(
        Object.entries(s().draft).map(([key, row]) => [key, row.extra || {}]),
      ),
      appReplacement: !!s().preview.appReplacement,
      previewAppearance: s().preview.appearance || null,
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
    const serialized = JSON.stringify(config);
    if (frameReady && config && serialized !== lastSentConfig) {
      lastSentConfig = serialized;
      frame.contentWindow.postMessage(
        { type: "ngss3-preview-config", config },
        location.protocol === "file:" ? "*" : location.origin,
      );
    }
  }
  function finish(r) {
    const appH1 = document.querySelector(".app-header h1");
    if (appH1) appH1.textContent = tx("网站外观", "Site appearance");
    const introP = document.querySelector(".studio-intro p");
    if (introP)
      introP.textContent = tx(
        "从主题到每个细节，打造属于本站的外观。",
        "From the theme to the details. Make this site your own.",
      );
    const demo = document.querySelector(".studio-demo");
    if (demo)
      demo.textContent = tx(
        "本地交互原型 · 不连接正式站点",
        "Local prototype · no production connection",
      );
    const version = api.els.version;
    version.textContent = tx(api.dirty() ? "有未发布修改" : "已发布", api.dirty() ? "Unpublished changes" : "Published");
    api.els.apply.textContent = tx(s().ui.loadingApply ? "正在发布…" : "发布", s().ui.loadingApply ? "Publishing…" : "Publish");
    api.els.apply.disabled = !r.canApply || s().ui.loadingApply;
    api.els.apply.setAttribute("aria-disabled",String(api.els.apply.disabled));
    api.els.apply.title = r.canApply ? "" : tx("当前设置暂时无法发布，请查看提示。","Publishing is unavailable. See the notice.");
    let notice=document.getElementById("studio-settings-notice");
    if(!notice){notice=document.createElement("div");notice.id="studio-settings-notice";notice.setAttribute("role","status");notice.setAttribute("aria-live","polite");api.els.detail.before(notice);}
    const blocked=r.items.filter(row=>row.outcome==='Block'||row.outcome==='Auto-resolve');
    const message=!r.canApply ? blocked.flatMap(row=>row.reasons).map(reason=>s().uiLocale==='en'?api.localizedText(reason):reason).join('；') : s().ui.fallbackMessage;
    notice.replaceChildren();notice.hidden=!message;
    if(message){const text=document.createElement("span");text.textContent=message;notice.append(text);if(!r.canApply && !s().preview.stale){const reload=document.createElement("button");reload.type="button";reload.textContent=tx("重新载入已发布设置","Reload published settings");reload.onclick=()=>{if(api.dirty()&&!window.confirm(tx("重新载入会放弃尚未发布的修改，是否继续？","Reloading discards unpublished changes. Continue?")))return;api.cancelDraft();s().expectedVersion=s().published.version;s().ui.invalidApplied=false;s().preview.stale=false;s().ui.fallbackMessage="";api.renderAll();};notice.append(reload);}if(s().preview.stale){const refresh=document.createElement("button");refresh.type="button";refresh.textContent=tx("刷新预览","Refresh preview");refresh.onclick=()=>{s().preview.stale=false;s().ui.fallbackMessage="";api.renderAll();};notice.append(refresh);}const dismiss=document.createElement("button");dismiss.type="button";dismiss.textContent="×";dismiss.setAttribute("aria-label",tx("关闭提示","Dismiss notice"));dismiss.disabled=!r.canApply;dismiss.onclick=()=>{s().ui.fallbackMessage="";api.renderAll();};notice.append(dismiss);}
    const validation = api.els.validation;
    validation.hidden = true;
    validation.replaceChildren();
    if (lastPanel !== s().selectedId) {
      document.querySelector(".studio-editor-scroll").scrollTop = 0;
      lastPanel = s().selectedId;
    }
    api.els.detail
      .querySelectorAll(".studio-function-empty")
      .forEach((el) => el.closest(".studio-step-card")?.remove());
    api.els.detail.querySelectorAll('.studio-style-select small,.current-slot-choice strong').forEach(el=>{el.title=el.textContent;});
    headerControls(r);
    document.querySelectorAll('.studio-theme-art').forEach(el=>{const theme=["PH","IN","SF"].find(n=>el.classList.contains("theme-"+n));if(theme){el.style.background=`url("assets/source-themes/${theme}-home.webp") center top / cover`;el.replaceChildren();}});
  }

  function headerControls(r) {
    const detail=api.els.detail, id=s().selectedId, row=s().draft[id], item=api.byId[id];
    detail.querySelectorAll(".evidence-risk-panel,.studio-disclosure").forEach(el=>el.remove());
    const h=detail.querySelector("h2"); if(!h || !row)return;
    let head=detail.querySelector(".studio-section-head");
    if(!head){head=document.createElement("div");head.className="studio-section-head";h.before(head);const inner=document.createElement("div");head.append(inner);inner.append(h);}
    h.querySelectorAll('.badge,.help-tip').forEach(el=>el.remove());
    if(head.querySelector('.ux-header-actions'))return;
    const controls=document.createElement("div");controls.className="ux-header-actions";
    const homeKey=s().ui.homeSection;
    const custom=homeKey ? Object.prototype.hasOwnProperty.call(row.extra?.home || {},homeKey) : row.mode==="SET" || row.mode==="OFF" || row.extra?.design?.mode==="SET" || !!row.extra?.content || !!row.extra?.appReplacementEnabled;
    const locked=["FIXED","DERIVED"].includes(row.mode);
    const status=locked ? tx("系统管理此设置","Managed by the system") : custom ? tx("已覆盖：本站使用自订设置","Override: this site uses custom settings") : tx("默认：跟随主题设置","Default: follows the theme");
    controls.innerHTML=`<span class="ux-header-icon ${custom ? "is-custom" : ""}" tabindex="0" role="img" aria-label="${status}" data-tip="${status}">${locked ? "◇" : custom ? "✎" : "◉"}</span>`;
    const oldReset=detail.querySelector('[data-studio="reset-style"]');
    if(custom && !locked && !["theme","themeColor"].includes(id)){
      const reset=oldReset || document.createElement("button");
      if(!oldReset){reset.type="button";reset.dataset.studio=homeKey ? "header-home-reset" : "header-reset";reset.dataset.id=id;}
      reset.className="ux-header-icon";reset.textContent="↶";
      const tip=oldReset ? tx("恢复默认样式，保留内容设置","Restore default style; keep content") : tx("恢复此项目的主题默认设置","Restore this item’s theme default");
      reset.dataset.tip=tip;reset.setAttribute("aria-label",tip);controls.append(reset);
    }
    head.append(controls);
    detail.querySelectorAll('.studio-step').forEach((el,i)=>el.textContent=i+1);
  }

  function badgeClass(outcome) {
    return (
      {
        Allow: "badge-allow",
        Warn: "badge-warn",
        "Auto-resolve": "badge-auto",
        Review: "badge-review",
        Block: "badge-block",
      }[outcome] || "badge-warn"
    );
  }

  function isItemChanged(id) {
    if (id === "theme") {
      return (
        s().theme !== s().published.theme ||
        JSON.stringify(s().draft.theme) !==
          JSON.stringify(s().published.objects.theme)
      );
    }
    if (id === "themeColor") {
      const savedColor =
        s().published.objects.themeColor?.value ||
        api.themeDefaultFor("themeColor", s().published.theme);
      const currentColor = selectedColor();
      return (
        savedColor !== currentColor ||
        JSON.stringify(s().draft.themeColor) !==
          JSON.stringify(s().published.objects.themeColor)
      );
    }
    return (
      JSON.stringify(s().draft[id]) !==
      JSON.stringify(s().published.objects[id])
    );
  }

  function renderSideThumb(id, isAfter, theme, color, row, r) {
    const isHomeFamily = Boolean(D.families[id]);
    const isPageFamily = Boolean(D.pageFamilies[id]);

    if (isHomeFamily) {
      const f = D.families[id];
      const style = D.styleNumber(id, row, theme);
      const styleTitle =
        f.titles[style - 1] || tx(D.names[style - 1], "Style " + style);
      const isOff = row.mode === "OFF" || row.value === "关闭";
      const isSidebarDisabled =
        id === "sidebar" &&
        ((isAfter && r.values.sidebarDisabled) ||
          (!isAfter && s().published.objects.sidebarDisabled));
      const isHidden = isOff || isSidebarDisabled;
      const thumbHtml = window.NGPlayer.thumbnail(f.key, style, color);

      return (
        '<div class="review-thumb-box">' +
        thumbHtml +
        (isHidden
          ? '<div class="review-hidden-overlay"><span>🚫</span><b>' +
            tx("已关闭 / 隐藏", "Hidden / OFF") +
            "</b></div>"
          : "") +
        '</div><div class="review-thumb-caption"><span class="review-style-badge">' +
        tx(D.names[style - 1] || "样式 " + style, "Style " + style) +
        '</span><span class="review-style-name">' +
        E(styleTitle) +
        "</span>" +
        (isHidden
          ? '<span class="review-off-badge">' +
            tx("未启用", "Disabled") +
            "</span>"
          : "") +
        "</div>"
      );
    }

    if (isPageFamily) {
      const pf = D.pageFamilies[id];
      const style = D.styleNumber(id, row, theme);
      const styleTitle = pf.titles[style - 1] || "样式 " + style;
      const isHidden = row.mode === "OFF" || row.value === "关闭";
      const thumbHtml =
        NGCurrent.thumbnail(pf.key, style, color) ??
        window.NGPageComponents.thumbnail(pf.key, style, color);

      return (
        '<div class="review-thumb-box">' +
        thumbHtml +
        (isHidden
          ? '<div class="review-hidden-overlay"><span>🚫</span><b>' +
            tx("已关闭 / 隐藏", "Hidden / OFF") +
            "</b></div>"
          : "") +
        '</div><div class="review-thumb-caption"><span class="review-style-badge">' +
        tx("样式 " + style, "Style " + style) +
        '</span><span class="review-style-name">' +
        E(styleTitle) +
        "</span>" +
        (isHidden
          ? '<span class="review-off-badge">' +
            tx("未启用", "Disabled") +
            "</span>"
          : "") +
        "</div>"
      );
    }

    if (id === "themeColor") {
      const p = D.palette(color);
      return (
        '<div class="review-thumb-box review-color-thumb" style="--rc-accent:' +
        p.accent +
        ";--rc-bg:" +
        p.bg +
        ';"><div class="review-color-preview-card"><div class="review-color-sample-header"><span class="review-color-dot" style="background:' +
        p.accent +
        ';"></span><span class="review-color-card-title">' +
        E(colorName(color)) +
        '</span></div><div class="review-color-swatch-box" style="background:' +
        p.accent +
        ';"><span class="review-color-hex">' +
        p.accent +
        '</span></div><div class="review-color-mock-btn" style="background:' +
        p.accent +
        ';color:#fff;">' +
        tx("按钮主色", "Primary button") +
        '</div></div></div><div class="review-thumb-caption"><span class="review-style-badge" style="background:' +
        p.accent +
        "22;color:" +
        p.accent +
        ";border:1px solid " +
        p.accent +
        '44;">' +
        color +
        '</span><span class="review-style-name">' +
        E(colorName(color)) +
        " (" +
        p.accent +
        ")</span></div>"
      );
    }

    if (id === "theme") {
      return (
        '<div class="review-thumb-box review-theme-thumb"><div class="review-theme-preview-card"><span class="studio-theme-art theme-' +
        theme +
        '"><i></i><i></i><i></i></span><div class="review-theme-card-info"><strong class="review-theme-code">' +
        theme +
        '</strong><span class="review-theme-title">' +
        themeName(theme) +
        '</span></div></div></div><div class="review-thumb-caption"><span class="review-style-badge">' +
        theme +
        '</span><span class="review-style-name">' +
        themeName(theme) +
        "</span></div>"
      );
    }

    if (id === "bottomNav") {
      const navSlots =
        (row.value && row.value.loggedIn) ||
        (Array.isArray(row.value)
          ? row.value
          : ["首页", "活动", "推广", "VIP", "账户"]);
      return (
        '<div class="review-thumb-box review-nav-thumb"><div class="review-nav-bar-preview">' +
        navSlots
          .map(
            (slot, idx) =>
              '<div class="review-nav-slot ' +
              (idx === 0 ? "active" : "") +
              '"><div class="review-nav-slot-icon"></div><span class="review-nav-slot-text">' +
              E(slot) +
              "</span></div>",
          )
          .join("") +
        '</div></div><div class="review-thumb-caption"><span class="review-style-badge">' +
        row.mode +
        '</span><span class="review-style-name">' +
        navSlots.map(E).join(" · ") +
        "</span></div>"
      );
    }

    const valText =
      typeof row.value === "object"
        ? JSON.stringify(row.value)
        : (row.value ??
          (row.mode === "OFF"
            ? tx("已关闭", "Disabled")
            : tx("跟随主题默认", "Theme default")));

    const modeLabel =
      row.mode === "INHERIT"
        ? tx("跟随默认", "Inherit")
        : row.mode === "OFF"
          ? tx("已关闭", "Disabled")
          : tx("自定义", "Custom");

    return (
      '<div class="review-thumb-box review-generic-thumb"><div class="review-generic-card"><div class="review-generic-mode-tag tag-' +
      (row.mode || "inherit").toLowerCase() +
      '">' +
      modeLabel +
      '</div><div class="review-generic-val">' +
      E(valText) +
      "</div>" +
      (row.sourceTheme
        ? '<div class="review-generic-source">' +
          tx("来源主题: ", "Source: ") +
          row.sourceTheme +
          "</div>"
        : "") +
      '</div></div><div class="review-thumb-caption"><span class="review-style-badge">' +
      modeLabel +
      '</span><span class="review-style-name">' +
      E(valText) +
      "</span></div>"
    );
  }

  function describeDetail(id, row, theme, color) {
    if (!row) return "";
    const parts = [];
    if (id === "theme") {
      const p = row.extra?.playerChoices || D.defaultPolicy();
      if (p.themes && p.themes.length > 1) {
        parts.push(tx("可选主题: ", "Selectable: ") + p.themes.join(", "));
      }
    } else if (id === "topStatusBar") {
      if (typeof row.value === "object" && row.value !== null) {
        const segs = [];
        if (row.value.loggedIn) {
          segs.push(
            tx("登入后: ", "Logged in: ") +
              "<strong>" +
              E(row.value.loggedIn) +
              "</strong>",
          );
        }
        if (row.value.loggedOut) {
          segs.push(
            tx("登入前: ", "Logged out: ") +
              "<strong>" +
              E(row.value.loggedOut) +
              "</strong>",
          );
        }
        if (segs.length) parts.push(segs.join(" · "));
      }
    } else if (id === "topDownloadBar" && row.extra?.content) {
      const content = row.extra.content;
      if (content.copy !== undefined)
        parts.push(tx("文案：", "Copy: ") + E(content.copy));
      if (content.background)
        parts.push(tx("背景：", "Background: ") + E(content.background));
      if (content.left || content.right)
        parts.push(tx("已设置下载栏图片", "Custom download images"));
    } else if (id === "bottomNav") {
      for (const auth of ["loggedOut", "loggedIn"]) {
        parts.push(
          tx(
            auth === "loggedOut" ? "登录前：" : "登录后：",
            auth === "loggedOut" ? "Signed out: " : "Signed in: ",
          ) + E((row.value?.[auth] || []).join(" · ")),
        );
        parts.push(
          tx("App 替代：", "App replacement: ") +
            (NGCurrent.replacementEnabled(row.extra, auth)
              ? E(
                  row.extra.appReplacement?.[auth] ||
                    tx("待选择", "Choose entry"),
                )
              : tx("关闭", "Off")),
        );
      }
    } else if (id === "gameLayout" && row.extra?.home) {
      parts.push(
        tx("资金快捷区：", "Wallet shortcuts: ") +
          tx(
            row.extra.home.quick === false ? "隐藏" : "显示",
            row.extra.home.quick === false ? "Hidden" : "Visible",
          ),
      );
      parts.push(
        tx("活动摘要：", "Promotions: ") +
          tx(
            row.extra.home.promotions ? "显示" : "隐藏",
            row.extra.home.promotions ? "Visible" : "Hidden",
          ),
      );
    } else if (id === "alternateButton") {
      if (
        typeof row.value === "object" &&
        row.value !== null &&
        row.value.target
      ) {
        parts.push(
          tx("承载能力: ", "Capability: ") +
            "<strong>" +
            E(row.value.target) +
            "</strong>",
        );
      }
    }
    return parts.join(" · ");
  }

  function showReviewModal(r, isSaving) {
    if (!r) r = api.resolveAll();
    const changedItems = api.CATALOG.filter((item) => {
      if (item.id === "downloadFAB" || item.id === "brandMark") return false;
      return isItemChanged(item.id);
    });

    const published = s().published;
    const canApply = r.canApply;
    const itemsWithIssues = r.items || [];
    const issues = r.issues || [];

    api.els.confirm.className = "modal open";
    api.els.confirm.setAttribute("data-studio-localized", "");

    let cardsHtml = "";
    if (changedItems.length === 0) {
      cardsHtml =
        '<div class="review-empty-box"><div class="review-empty-icon">✓</div><h3>' +
        tx("没有未保存的修改", "No Unsaved Changes") +
        "</h3><p>" +
        tx(
          "当前工作区草稿与本站已生效的 Live 配置完全一致，无需重复保存。",
          "Current workspace draft matches the published live configuration exactly.",
        ) +
        '</p><button type="button" class="btn btn-brand" data-action="close-drawers">' +
        tx("返回工作台", "Back to Workspace") +
        "</button></div>";
    } else {
      cardsHtml = changedItems
        .map((item) => {
          const id = item.id;
          const beforeRow = published.objects[id] || {
            mode: "INHERIT",
            value: null,
          };
          const afterRow = s().draft[id] || { mode: "INHERIT", value: null };
          const beforeTheme = published.theme;
          const afterTheme = s().theme;
          const beforeColor =
            published.objects.themeColor?.value ||
            api.themeDefaultFor("themeColor", beforeTheme);
          const afterColor = selectedColor();

          const beforeThumb = renderSideThumb(
            id,
            false,
            beforeTheme,
            beforeColor,
            beforeRow,
            r,
          );
          const afterThumb = renderSideThumb(
            id,
            true,
            afterTheme,
            afterColor,
            afterRow,
            r,
          );

          const beforeMeta = describeDetail(
            id,
            beforeRow,
            beforeTheme,
            beforeColor,
          );
          const afterMeta = describeDetail(
            id,
            afterRow,
            afterTheme,
            afterColor,
          );

          const rowIssue = itemsWithIssues.find((entry) => entry.id === id);
          let alertHtml = "";
          if(rowIssue && ["Block","Auto-resolve"].includes(rowIssue.outcome)) {
            alertHtml='<div class="review-card-alert alert-block"><div class="review-alert-text">'+rowIssue.reasons.map(E).join("；")+'</div></div>';
          }

          let changeTag = tx("已修改", "Modified");
          if (beforeRow.mode !== afterRow.mode) {
            const modeName =
              afterRow.mode === "OFF"
                ? tx("已关闭", "Disabled")
                : afterRow.mode === "INHERIT"
                  ? tx("跟随默认", "Inherit")
                  : tx("已开启", "Enabled");
            changeTag = tx("状态变更为 " + modeName, "Status: " + modeName);
          } else if (id === "themeColor") {
            changeTag = tx("主色调变更", "Color changed");
          } else if (id === "theme") {
            changeTag = tx("主题变更", "Theme switched");
          } else if (D.families[id] || D.pageFamilies[id]) {
            changeTag = tx("样式已切换", "Style changed");
          }

          return (
            '<div class="review-change-card" data-item-id="' +
            id +
            '"><div class="review-card-header"><div class="review-card-title-wrap"><span class="review-page-chip">' +
            E(item.page || tx("基础设置", "General")) +
            '</span><h3 class="review-item-title">' +
            E(item.label) +
            '</h3></div><div class="review-card-badges"><span class="review-change-tag">' +
            changeTag +
            '</span></div></div><div class="review-compare-grid"><div class="review-compare-col review-col-before"><div class="review-col-header"><span class="review-col-dot dot-saved"></span><span class="review-col-label">' +
            tx("当前", "Current") +
            "</span></div>" +
            beforeThumb +
            (beforeMeta
              ? '<div class="review-col-meta">' + beforeMeta + "</div>"
              : "") +
            '</div><div class="review-divider"><div class="review-arrow-circle" title="' +
            tx("变更为", "Changes to") +
            '">➔</div></div><div class="review-compare-col review-col-after"><div class="review-col-header"><span class="review-col-dot dot-draft"></span><span class="review-col-label">' +
            tx("变更后", "After change") +
            "</span></div>" +
            afterThumb +
            (afterMeta
              ? '<div class="review-col-meta">' + afterMeta + "</div>"
              : "") +
            "</div></div>" +
            alertHtml +
            "</div>"
          );
        })
        .join("");
    }

    const titleText = isSaving
      ? tx("发布前确认", "Review before publishing")
      : tx("配置差异对比审阅", "Configuration Diff Review");

    const bannerText = isSaving
      ? canApply
        ? tx(
            "请核对修改，确认无误后点击右下角「确认发布」。",
            "Review your changes, then click Confirm publish at the bottom right.",
          )
        : tx(
            "当前设置暂时无法发布，请关闭此窗口，按页面提示恢复后重试。",
            "Publishing is unavailable. Close this window and follow the page notice to recover.",
          )
      : tx(
          "以下列出当前草稿与本站已生效配置之间的所有差异项与视觉效果对比。",
          "Below is a side-by-side visual and data comparison of all differences between published live settings and your current draft.",
        );

    api.els.confirm.innerHTML =
      '<div class="modal-panel review-modal-panel"><div class="review-header"><div class="review-header-left"><div class="review-header-title-row"><span class="review-header-icon">' +
      (isSaving ? "📋" : "🔍") +
      '</span><h2 id="confirm-title">' +
      titleText +
      '</h2></div><div class="review-header-sub"><span class="review-pill pill-count">' +
      tx(
        "共 " + changedItems.length + " 项修改",
        changedItems.length + " changes",
      ) +
      '</span></div></div><div class="review-header-right"><div class="review-check-pill ' +
      (canApply ? "is-pass" : "is-block") +
      '"><span class="review-check-icon">' +
      (canApply ? "✓" : "✕") +
      "</span><span>" +
      (canApply
        ? tx("可发布", "Ready to publish")
        : tx("存在阻挡项 · 无法保存", "Blocked · Cannot Save")) +
      '</span></div><button type="button" class="review-close-btn" data-action="close-drawers" aria-label="' +
      tx("关闭", "Close") +
      '">✕</button></div></div><div class="review-summary-banner ' +
      (canApply ? "banner-pass" : "banner-block") +
      '"><div class="review-summary-icon">' +
      (canApply ? "💡" : "⚠️") +
      '</div><div class="review-summary-text">' +
      bannerText +
      '</div></div><div class="review-body">' +
      cardsHtml +
      '</div><div class="review-footer"><div class="review-footer-left">' +
      action(
        "export",
        '<span class="btn-icon">📥</span> ' +
          tx("导出当前配置 JSON", "Export JSON"),
        "",
        "btn btn-export-diff",
      ) +
      '</div><div class="review-footer-right"><button type="button" class="btn btn-secondary" data-action="close-drawers">' +
      tx("返回继续修改", "Back to edit") +
      "</button>" +
      (isSaving
        ? '<button type="button" class="btn btn-brand btn-save-confirm ' +
          (canApply ? "" : "is-disabled") +
          '" data-ok="apply-live" ' +
          (canApply ? "" : 'disabled aria-disabled="true"') +
          '><span class="btn-icon">💾</span> ' +
          tx("确认发布", "Confirm publish") +
          "</button>"
        : '<button type="button" class="btn btn-brand ' +
          (canApply ? "" : "is-disabled") +
          '" data-ok="apply-live" ' +
          (canApply ? "" : 'disabled aria-disabled="true"') +
          ">" +
          tx("去保存到本站", "Save to live") +
          "</button>") +
      "</div></div></div>";
  }

  function diff(r) {
    showReviewModal(r || api.resolveAll(), false);
  }

  function confirmSave(r) {
    showReviewModal(r || api.resolveAll(), true);
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
      const wasHidden =
        row.mode === "OFF" ||
        row.value === "关闭" ||
        (id === "topDownloadBar" && row.value !== "开启");
      if (["gameLayout", "gameGridStyle"].includes(id)) {
        row.mode = "SET";
        row.value = D.names[n - 1];
        row.sourceTheme = s().theme;
      } else
        row.extra.design = { mode: "SET", value: n, sourceTheme: s().theme };
      if (id === "sidebar") {
        row.mode = "SET";
        row.value =
          s().theme === "NG"
            ? n === 1
              ? "右方"
              : "左方"
            : api.enableValueFor("sidebar", s().theme);
        row.sourceTheme = s().theme;
      }
      if (id === "topDownloadBar") {
        row.mode = "SET";
        row.value = "开启";
        row.sourceTheme = s().theme;
      }
      focusPage(id);
      if (
        !wasHidden &&
        api.els.detail.querySelector(
          '.studio-style-select[data-id="' + id + '"]',
        )
      ) {
        s().draftVersion++;
        s().acks = { auto: {}, review: {} };
        s().ui.fallbackMessage = "";
        api.renderAll({ reuseDetail: true });
        mutate = false;
      }
    } else if (a === "header-home-reset") {
      delete s().draft.gameLayout.extra.home[s().ui.homeSection];
    } else if (a === "header-reset") {
      api.resetObject(id);
    } else if (a === "reset-image") {
      if (s().draft.authVisual.extra.media)
        delete s().draft.authVisual.extra.media[b.dataset.media];
    } else if (a === "reset-style") {
      if (["gameLayout", "gameGridStyle"].includes(id)) {
        const extra = s().draft[id].extra;
        api.resetObject(id);
        s().draft[id].extra = extra;
        delete extra.design;
      } else delete s().draft[id].extra.design;
    } else if (a === "collapse-group") {
      s().ui.collapsedGroups ||= {};
      s().ui.collapsedGroups[b.dataset.group] =
        !s().ui.collapsedGroups[b.dataset.group];
      api.renderAll();
      mutate = false;
    } else if (a === "check-filter" || a === "check-close") {
      s().ui.checkFilter =
        a === "check-close" || s().ui.checkFilter === b.dataset.outcome
          ? null
          : b.dataset.outcome;
      finish(api.resolveAll());
      if (s().ui.checkFilter)
        api.els.validation.scrollIntoView?.({ block: "nearest" });
      mutate = false;
    } else if (a === "preview-auth") {
      s().preview.auth=b.dataset.auth; preview(api.resolveAll()); mutate=false;
    } else if (a === "preview-default") {
      delete s().preview.appearance;
      api.renderAll();
      mutate = false;
    } else if (a === "player-settings") {
      api.els.preview
        .querySelector('[data-studio="preview-color-select"]')
        ?.focus({ preventScroll: true });
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
    if(a==="header-visible") {
      const row=s().draft[b.dataset.id];row.mode=b.checked ? "SET" : "OFF";
      if(b.checked) row.value=api.enableValueFor(b.dataset.id,s().theme);
      else {
        row.value=null;
        if(b.dataset.id==="topDownloadBar") s().preview.installEnabled=false;
      }
      touch();return;
    }
    if (a === "auth-image") {
      const file = b.files?.[0],
        tenant = s().tenantId,
        version = s().draftVersion;
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2097152) {
        announce(
          tx(
            "请选择 2 MB 以内的 PNG、JPG 或 WebP。",
            "Choose PNG, JPG or WebP under 2 MB.",
          ),
        );
        return;
      }
      const data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      if (!data) return;
      const valid = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = data;
      });
      if (tenant !== s().tenantId || version !== s().draftVersion) return;
      if (!valid) {
        announce(
          tx(
            "图片无法读取，请重新选择。",
            "Cannot read image. Choose another.",
          ),
        );
        return;
      }
      s().draft.authVisual.extra.media ||= {};
      s().draft.authVisual.extra.media[b.dataset.media] = data;
      touch();
      return;
    }
    if (a === "preview-auth-switch") {
      s().preview.auth = b.checked ? "loggedIn" : "loggedOut";
      api.renderAll();
      return;
    }
    if (a === "preview-size") {
      s().ui.customViewport = b.value === "custom";
      if (b.value !== "custom") s().preview.viewport = Number(b.value);
      api.renderAll();
      return;
    }
    if (a === "preview-width") {
      const width = Number(b.value);
      if (!b.value || !Number.isInteger(width) || width < 280 || width > 1920) {
        b.setCustomValidity(
          tx(
            "请输入 280–1920 之间的整数。",
            "Enter an integer from 280 to 1920.",
          ),
        );
        b.reportValidity();
        return;
      }
      b.setCustomValidity("");
      s().preview.viewport = width;
      api.renderAll();
      return;
    }
    if (a === "preview-theme-select" || a === "preview-color-select") {
      const theme =
          a === "preview-theme-select"
            ? b.value
            : s().preview.appearance?.theme || s().theme,
        color = a === "preview-color-select" ? b.value : p.defaults[theme];
      if (p.themes.includes(theme) && p.colors[theme]?.includes(color))
        s().preview.appearance = { theme, color };
      api.renderAll();
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
      const id = b.dataset.id;
      if (id === "sidebar" && s().draft.shortcuts?.value === "侧边栏内" && !b.checked) {
        b.checked = true;
        return;
      }
      const row = s().draft[id];
      row.mode = b.checked ? "SET" : "OFF";
      row.value = b.checked
        ? api.enableValueFor(id, s().theme)
        : null;
      row.sourceTheme = s().theme;
      if (id === "topDownloadBar" && !b.checked) s().preview.installEnabled = false;
    } else return;
    touch();
  }
  function attach(a) {
    api = a;
    window.NGSelectionGuard?.attach(a);
    if (window.NGCurrent && typeof window.NGCurrent.attach === "function") {
      window.NGCurrent.attach(a);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    window.addEventListener("message", (e) => {
      if (!frame || e.source !== frame.contentWindow) return;
      if (location.protocol !== "file:" && e.origin !== location.origin) return;
      if (e.data?.type === "ngss3-preview-ready") {
        frameReady = true;
        lastSentConfig = "";
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
  window.NGStudio = {
    attach,
    tree,
    detail,
    preview,
    finish,
    diff,
    confirmSave,
    focusPage,
    readPolicy,
    syncStyleSelection,
  };
})();
