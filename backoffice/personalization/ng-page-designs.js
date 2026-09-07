/* Non-home NG families. Source: hlTfe3BQv3dkk09sC2nIj2 / ngss3元件組件.
   Visual choices are independent of the existing resolver's functional values. */
(function () {
  "use strict";
  const D = window.NGDesign;
  const family = (key, label, en, page, node, titles, english, notes) => ({
    key,
    label,
    en,
    page,
    node,
    titles,
    english,
    notes,
    sourceFile: "hlTfe3BQv3dkk09sC2nIj2",
  });
  D.pageFamilies = {
    authVisual: family(
      "auth",
      "登录注册",
      "Sign in & registration",
      "登入注册",
      "838:7449",
      ["插画分区", "背景渐隐", "品牌居中", "轻量圆角"],
      [
        "Illustrated panel",
        "Fading background",
        "Centered brand",
        "Soft rounded form",
      ],
      [
        "插画在上，表单独立成区。",
        "背景渐隐至表单，文字保持清晰。",
        "品牌居中，登录与注册使用一致的表单结构。",
        "柔和渐变与圆角按钮，支持切换登录方式。",
      ],
    ),
    depositPage: family(
      "deposit",
      "钱包充值",
      "Wallet & deposit",
      "充值",
      "436:6663",
      ["分组表单", "图标渠道", "紧凑分栏"],
      ["Grouped form", "Icon methods", "Compact split layout"],
      [
        "余额、渠道、金额依序分组。",
        "图标渠道横向排列，金额快捷按钮集中展示。",
        "余额与操作分栏，充值表单更紧凑。",
      ],
    ),
    profileLayout: family(
      "profile",
      "个人中心",
      "Account center",
      "账户",
      "473:14976",
      ["居中账户", "图标总览", "钱包概览"],
      ["Centered account", "Icon overview", "Wallet overview"],
      [
        "头像与余额居中，常用功能分组排列。",
        "账户信息紧凑展示，功能以图标网格展开。",
        "余额与资金入口优先，其他功能使用清晰列表。",
      ],
    ),
    vipPage: family(
      "vip",
      "VIP 页面",
      "VIP page",
      "VIP",
      "729:8096",
      ["徽章总览", "等级卡片", "权益网格"],
      ["Badge overview", "Level cards", "Benefit grid"],
      [
        "等级徽章与进度居中，权益分类展示。",
        "横向选择等级，权益以列表展示。",
        "等级进度置顶，权益以两列卡片展示。",
      ],
    ),
    inbox: family(
      "inbox",
      "站内信",
      "Inbox",
      "站内信",
      "838:4636",
      ["分类卡片", "紧凑列表", "摘要列表"],
      ["Category cards", "Compact list", "Message summaries"],
      [
        "图标分类与独立消息卡片。",
        "分类页签与紧凑行，点击查看内容。",
        "直接显示消息摘要，详情可展开。",
      ],
    ),
    bottomNav: family(
      "bottom",
      "底部导航",
      "Bottom navigation",
      "首页",
      "838:8320",
      ["悬起圆钮", "居中凸起", "弧形底座", "立体底座", "简洁平铺"],
      [
        "Floating circle",
        "Raised center",
        "Curved dock",
        "Raised dock",
        "Flat navigation",
      ],
      [
        "中间入口突出，其他入口保持等距。",
        "中央入口抬高，使用圆角容器。",
        "中央入口与弧形容器相连。",
        "立体底座强调中央入口。",
        "图标与文字均匀平铺，选中态使用主题色。",
      ],
    ),
  };
  D.allFamilies = () => ({ ...D.families, ...D.pageFamilies });
  const oldValidate = D.validateDraft;
  D.validateDraft = function (draft, theme, color) {
    const errors = oldValidate(draft, theme, color);
    Object.entries(D.pageFamilies).forEach(([id, f]) => {
      const d = draft[id]?.extra?.design;
      if (
        d &&
        (d.mode !== "SET" ||
          !Number.isInteger(d.value) ||
          d.value < 1 ||
          d.value > f.titles.length ||
          d.sourceTheme !== "NG")
      )
        errors.push(f.label + " 的视觉样式无效。");
    });
    return errors;
  };
})();
