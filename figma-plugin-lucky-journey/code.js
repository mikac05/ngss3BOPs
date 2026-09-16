// Lucky Journey Player Prototype Builder for Figma
(async function() {
  figma.notify('正在加载字体与构建好运探索季原型...', { timeout: 2000 });

  // 1. Load fonts
  try {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
  } catch (e) {
    console.warn('Inter font load fallback', e);
  }

  function rgb(r, g, b, a = 1) {
    return {
      type: 'SOLID',
      color: { r: r / 255, g: g / 255, b: b / 255 },
      opacity: a
    };
  }

  const C = {
    bg: rgb(18, 15, 36),
    cardBg: rgb(30, 26, 58),
    cardBorder: rgb(65, 54, 110),
    gold: rgb(255, 193, 37),
    goldBright: rgb(255, 223, 80),
    goldDark: rgb(180, 119, 14),
    purple: rgb(155, 89, 182),
    purpleDark: rgb(85, 40, 115),
    teal: rgb(26, 188, 156),
    white: rgb(255, 255, 255),
    whiteMuted: rgb(215, 210, 235),
    dim: rgb(140, 135, 165),
    grayBg: rgb(38, 45, 61),
    btnGold: rgb(233, 185, 96),
    btnGoldText: rgb(49, 34, 71),
    btnPurple: rgb(142, 68, 173),
    modalBg: rgb(24, 21, 48),
    modalBorder: rgb(227, 183, 99)
  };

  function createText(parent, str, x, y, size = 12, weight = 'Regular', color = C.white, align = 'LEFT') {
    const t = figma.createText();
    t.fontName = { family: 'Inter', style: weight };
    t.characters = String(str);
    t.fontSize = size;
    t.fills = [color];
    t.textAlignHorizontal = align;
    parent.appendChild(t);
    t.x = x;
    t.y = y;
    return t;
  }

  function createRect(parent, x, y, w, h, fill, radius = 0, stroke = null, strokeWidth = 1) {
    const r = figma.createRectangle();
    r.x = x;
    r.y = y;
    r.resize(w, h);
    r.fills = fill ? [fill] : [];
    r.cornerRadius = radius;
    if (stroke) {
      r.strokes = [stroke];
      r.strokeWeight = strokeWidth;
    }
    parent.appendChild(r);
    return r;
  }

  function drawWheel(parent, cx, cy, r = 110, activeSector = -1) {
    const outer = figma.createEllipse();
    outer.x = cx - r - 8;
    outer.y = cy - r - 8;
    outer.resize((r + 8) * 2, (r + 8) * 2);
    outer.fills = [C.cardBg];
    outer.strokes = [C.gold];
    outer.strokeWeight = 4;
    parent.appendChild(outer);

    const inner = figma.createEllipse();
    inner.x = cx - r;
    inner.y = cy - r;
    inner.resize(r * 2, r * 2);
    inner.fills = [C.bg];
    inner.strokes = [C.cardBorder];
    inner.strokeWeight = 2;
    parent.appendChild(inner);

    // Draw 8 light dots
    for (let i = 0; i < 8; i++) {
      const ang = (i * 45) * Math.PI / 180;
      const dot = figma.createEllipse();
      dot.x = cx + (r + 4) * Math.cos(ang) - 3;
      dot.y = cy + (r + 4) * Math.sin(ang) - 3;
      dot.resize(6, 6);
      dot.fills = [i % 2 === 0 ? C.goldBright : C.white];
      parent.appendChild(dot);
    }

    // Sector items label
    const sectors = [
      { name: '金币', color: C.gold, icon: '💰' },
      { name: '谢谢', color: C.dim, icon: '🎁' },
      { name: '宝石', color: C.purple, icon: '💎' },
      { name: '谢谢', color: C.dim, icon: '🎁' },
      { name: '星钻', color: C.teal, icon: '⭐' },
      { name: '金币', color: C.gold, icon: '💰' },
      { name: '宝石', color: C.purple, icon: '💎' },
      { name: '谢谢', color: C.dim, icon: '🎁' }
    ];

    for (let i = 0; i < 8; i++) {
      const ang = (i * 45 + 22.5) * Math.PI / 180;
      const tx = cx + (r * 0.62) * Math.cos(ang);
      const ty = cy + (r * 0.62) * Math.sin(ang);
      createText(parent, sectors[i].icon, tx - 10, ty - 14, 14, 'Regular', C.white, 'CENTER');
      createText(parent, sectors[i].name, tx - 14, ty + 2, 9, 'Bold', sectors[i].color, 'CENTER');
    }

    // Center needle / hub
    const hub = figma.createEllipse();
    hub.x = cx - 22;
    hub.y = cy - 22;
    hub.resize(44, 44);
    hub.fills = [C.goldDark];
    hub.strokes = [C.goldBright];
    hub.strokeWeight = 3;
    parent.appendChild(hub);

    createText(parent, '✦', cx - 7, cy - 10, 16, 'Bold', C.white, 'CENTER');
  }

  function buildCommonHeader(frame, title, time) {
    createRect(frame, 0, 0, 390, 48, C.cardBg, 0, C.cardBorder);
    createText(frame, '‹ 返回', 16, 14, 13, 'Medium', C.whiteMuted);
    createText(frame, title, 145, 13, 16, 'Bold', C.white, 'CENTER');
    createText(frame, '规则 ⓘ', 334, 15, 12, 'Regular', C.goldBright);
    createRect(frame, 16, 56, 358, 26, rgb(35, 30, 68), 6);
    createText(frame, '⏱ ' + time, 24, 62, 11, 'Regular', C.whiteMuted);
  }

  function buildHeroCard(frame, progressPct, cashEarned, cashTotal, statusText) {
    createRect(frame, 16, 90, 358, 106, C.cardBg, 14, C.cardBorder, 1.5);
    createText(frame, '活动定额奖金', 32, 102, 12, 'Regular', C.whiteMuted);
    createText(frame, '¥ ' + cashEarned.toFixed(2), 32, 120, 24, 'Bold', C.goldBright);
    createText(frame, '/ 目标 ¥' + cashTotal.toFixed(2), 140, 130, 12, 'Regular', C.dim);
    createText(frame, statusText, 32, 172, 11, 'Medium', progressPct >= 100 ? C.goldBright : progressPct > 80 ? C.teal : C.dim);

    // Progress bar track
    createRect(frame, 32, 152, 326, 14, rgb(15, 13, 30), 7);
    const barWidth = Math.max(0, Math.min(326, 326 * (progressPct / 100)));
    if (barWidth > 0) {
      createRect(frame, 32, 152, barWidth, 14, C.gold, 7);
    }
    createText(frame, progressPct.toFixed(4) + '%', 290, 172, 11, 'Bold', C.white, 'RIGHT');
  }

  function buildCollectBar(frame, coin, gem, star) {
    createRect(frame, 16, 204, 358, 46, rgb(25, 21, 50), 10, C.cardBorder);
    // 3 columns
    createText(frame, '💰 金币 ' + coin, 32, 220, 11, 'Medium', C.gold);
    createText(frame, '💎 宝石 ' + gem, 156, 220, 11, 'Medium', C.purple);
    createText(frame, '⭐ 星钻 ' + star, 276, 220, 11, 'Medium', C.teal);
  }

  function buildTasks(frame, yStart, freeBtn, friendBtn, depProgress, betProgress) {
    createText(frame, '获取抽奖次数', 20, yStart, 14, 'Bold', C.white);
    
    // 1. Free
    createRect(frame, 16, yStart + 22, 358, 48, C.cardBg, 10, C.cardBorder);
    createText(frame, '每日免费', 32, yStart + 32, 13, 'Bold', C.white);
    createText(frame, '每天回访即可免费领取 1 次', 32, yStart + 49, 10, 'Regular', C.dim);
    createRect(frame, 290, yStart + 32, 70, 28, freeBtn.bg, 6);
    createText(frame, freeBtn.text, 304, yStart + 39, 11, 'Bold', freeBtn.fg, 'CENTER');

    // 2. Friend
    createRect(frame, 16, yStart + 76, 358, 48, C.cardBg, 10, C.cardBorder);
    createText(frame, '好友助力', 32, yStart + 86, 13, 'Bold', C.white);
    createText(frame, '专属链接邀请好友达标得 1 次', 32, yStart + 103, 10, 'Regular', C.dim);
    createRect(frame, 290, yStart + 86, 70, 28, friendBtn.bg, 6);
    createText(frame, friendBtn.text, 304, yStart + 93, 11, 'Bold', friendBtn.fg, 'CENTER');

    // 3. Deposit Task
    createRect(frame, 16, yStart + 130, 358, 48, C.cardBg, 10, C.cardBorder);
    createText(frame, '充值金额 (' + depProgress + ')', 32, yStart + 140, 13, 'Bold', C.white);
    createText(frame, '累计充值达到 100 自动加 1 次', 32, yStart + 157, 10, 'Regular', C.dim);
    createRect(frame, 290, yStart + 140, 70, 28, C.btnPurple, 6);
    createText(frame, '去充值', 308, yStart + 147, 11, 'Bold', C.white, 'CENTER');

    // 4. Bet Task
    createRect(frame, 16, yStart + 184, 358, 48, C.cardBg, 10, C.cardBorder);
    createText(frame, '下注金额 (' + betProgress + ')', 32, yStart + 194, 13, 'Bold', C.white);
    createText(frame, '累计有效下注达到 50 自动加 1 次', 32, yStart + 211, 10, 'Regular', C.dim);
    createRect(frame, 290, yStart + 194, 70, 28, C.btnPurple, 6);
    createText(frame, '去下注', 308, yStart + 201, 11, 'Bold', C.white, 'CENTER');
  }

  // ==========================================
  // SCREEN 1: 未参加态
  // ==========================================
  const s1 = figma.createFrame();
  s1.name = '📱 01-活动主页-未参加 (Unjoined)';
  s1.resize(390, 844);
  s1.x = 0; s1.y = 0;
  s1.fills = [C.bg];
  figma.currentPage.appendChild(s1);

  buildCommonHeader(s1, '好运探索季', '含参加日共 7 天有效');
  buildHeroCard(s1, 0, 0, 5, '尚未参加活动，点击下方按钮开启探索');
  drawWheel(s1, 195, 365, 105);
  createRect(s1, 120, 488, 150, 26, rgb(35, 30, 68), 13);
  createText(s1, '抽奖次数 0 次', 154, 494, 12, 'Bold', C.whiteMuted);

  createRect(s1, 24, 524, 342, 46, C.btnGold, 10);
  createText(s1, '参加活动', 165, 537, 16, 'Bold', C.btnGoldText, 'CENTER');

  buildTasks(s1, 584, { bg: C.grayBg, fg: C.dim, text: '待开启' }, { bg: C.grayBg, fg: C.dim, text: '待开启' }, '0/100', '0/50');

  // ==========================================
  // SCREEN 2: 首转爆击态 (90.25%)
  // ==========================================
  const s2 = figma.createFrame();
  s2.name = '📱 02-活动主页-首转爆击 (Active - 90.25%)';
  s2.resize(390, 844);
  s2.x = 430; s2.y = 0;
  s2.fills = [C.bg];
  figma.currentPage.appendChild(s2);

  buildCommonHeader(s2, '好运探索季', '活动进行中 · 剩余 6 天');
  buildHeroCard(s2, 90.25, 4.51, 5, '首转爆击大推进！距离提现仅一步之遥');
  buildCollectBar(s2, 902500, 0, 0);
  drawWheel(s2, 195, 375, 105);
  createRect(s2, 120, 498, 150, 26, rgb(35, 30, 68), 13);
  createText(s2, '抽奖次数 1 次', 154, 504, 12, 'Bold', C.goldBright);

  createRect(s2, 24, 534, 342, 46, C.btnGold, 10);
  createText(s2, '立即抽奖 (消耗 1 次)', 132, 547, 16, 'Bold', C.btnGoldText, 'CENTER');

  buildTasks(s2, 594, { bg: C.btnPurple, fg: C.white, text: '领取' }, { bg: C.btnPurple, fg: C.white, text: '邀请' }, '20/100', '15/50');

  // ==========================================
  // SCREEN 3: 临近完成态 (99.85%)
  // ==========================================
  const s3 = figma.createFrame();
  s3.name = '📱 03-活动主页-临近完成 (Near Finish - 99.85%)';
  s3.resize(390, 844);
  s3.x = 860; s3.y = 0;
  s3.fills = [C.bg];
  figma.currentPage.appendChild(s3);

  buildCommonHeader(s3, '好运探索季', '活动进行中 · 剩余 3 天');
  buildHeroCard(s3, 99.85, 4.99, 5, '🔥 仅差 0.1500% 即可全额提现！');
  buildCollectBar(s3, 985000, 12000, 1500);
  drawWheel(s3, 195, 375, 105);
  createRect(s3, 120, 498, 150, 26, rgb(50, 20, 30), 13);
  createText(s3, '抽奖次数 0 次', 154, 504, 12, 'Bold', rgb(255, 120, 120));

  createRect(s3, 24, 534, 342, 46, C.btnPurple, 10);
  createText(s3, '获取抽奖次数 ⚡', 142, 547, 16, 'Bold', C.white, 'CENTER');

  buildTasks(s3, 594, { bg: C.grayBg, fg: C.dim, text: '已领' }, { bg: C.gold, fg: C.btnGoldText, text: '急需助力' }, '80/100', '40/50');

  // ==========================================
  // SCREEN 4: 转满待领取态 (100%)
  // ==========================================
  const s4 = figma.createFrame();
  s4.name = '📱 04-活动主页-转满待领 (Completed - 100%)';
  s4.resize(390, 844);
  s4.x = 1290; s4.y = 0;
  s4.fills = [C.bg];
  figma.currentPage.appendChild(s4);

  buildCommonHeader(s4, '好运探索季', '🎉 已达成 100% 提现');
  buildHeroCard(s4, 100.00, 5.00, 5, '✨ 恭喜！进度已满，点击领取现金大奖');
  buildCollectBar(s4, 985000, 13000, 2000);
  drawWheel(s4, 195, 375, 105);
  createRect(s4, 120, 498, 150, 26, rgb(30, 60, 40), 13);
  createText(s4, '转盘已圆满完成', 142, 504, 12, 'Bold', C.teal);

  createRect(s4, 24, 534, 342, 46, C.goldBright, 10);
  createText(s4, '🎉 立即领取 5.00 现金', 125, 547, 16, 'Bold', C.btnGoldText, 'CENTER');

  buildTasks(s4, 594, { bg: C.grayBg, fg: C.dim, text: '已完成' }, { bg: C.grayBg, fg: C.dim, text: '已完成' }, '已达成', '已达成');

  // ==========================================
  // MODAL 5: 中奖结果大弹窗
  // ==========================================
  const m5 = figma.createFrame();
  m5.name = '🎁 05-弹窗-中奖结果 (Prize Popup)';
  m5.resize(390, 844);
  m5.x = 0; m5.y = 900;
  m5.fills = [rgb(10, 8, 22, 0.88)];
  figma.currentPage.appendChild(m5);

  // Dialog box
  createRect(m5, 30, 240, 330, 360, C.modalBg, 20, C.modalBorder, 2);
  
  // Icon glow badge
  const bCircle = figma.createEllipse();
  bCircle.x = 155; bCircle.y = 200;
  bCircle.resize(80, 80);
  bCircle.fills = [rgb(75, 45, 110)];
  bCircle.strokes = [C.modalBorder];
  bCircle.strokeWeight = 3;
  m5.appendChild(bCircle);
  createText(m5, '⭐', 180, 222, 36, 'Regular', C.white, 'CENTER');

  createText(m5, '星钻丰收！', 195, 296, 22, 'Bold', C.goldBright, 'CENTER');
  createText(m5, '+ 5,000 星钻', 195, 328, 20, 'Bold', C.white, 'CENTER');
  createText(m5, '好运探索推进中，距离解锁大奖更近一步', 195, 360, 12, 'Regular', C.whiteMuted, 'CENTER');

  createRect(m5, 54, 396, 282, 54, rgb(18, 15, 38), 10, C.cardBorder);
  createText(m5, '本次解锁提升 +0.5000%', 195, 408, 12, 'Bold', C.teal, 'CENTER');
  createText(m5, '当前总解锁进度: 90.7500%', 195, 428, 11, 'Regular', C.dim, 'CENTER');

  createRect(m5, 54, 476, 282, 44, C.btnGold, 10);
  createText(m5, '收下惊喜', 195, 489, 15, 'Bold', C.btnGoldText, 'CENTER');

  // ==========================================
  // MODAL 6: 专属好友邀请弹窗
  // ==========================================
  const m6 = figma.createFrame();
  m6.name = '👥 06-弹窗-专属好友邀请 (Exclusive Referral)';
  m6.resize(390, 844);
  m6.x = 430; m6.y = 900;
  m6.fills = [rgb(10, 8, 22, 0.88)];
  figma.currentPage.appendChild(m6);

  createRect(m6, 25, 200, 340, 440, C.modalBg, 20, C.cardBorder, 2);
  createText(m6, '专属好友邀请', 170, 224, 18, 'Bold', C.white);
  createText(m6, '✕', 330, 224, 16, 'Bold', C.dim);

  createRect(m6, 45, 260, 300, 28, rgb(45, 25, 75), 6, C.purple);
  createText(m6, '活动专属识别渠道 · 精准溯源', 195, 266, 11, 'Medium', C.goldBright, 'CENTER');

  const desc = createText(m6, '此分享链接内嵌活动专属识别参数 act=lucky-journey 与来源标 src=lj_wheel。好友注册达标，系统秒级自动加次至本活动中，与常规推广互不冲突。', 45, 302, 11, 'Regular', C.whiteMuted);
  desc.resize(300, 50);

  createRect(m6, 45, 366, 300, 44, rgb(15, 12, 32), 8, C.cardBorder);
  createText(m6, 'https://ngss.game/reg?act=lucky-journey&src=lj_wheel', 55, 381, 10, 'Regular', C.dim);

  createRect(m6, 45, 424, 300, 42, C.btnGold, 8);
  createText(m6, '复制专属链接', 195, 437, 14, 'Bold', C.btnGoldText, 'CENTER');

  // 3 Feature items
  createRect(m6, 45, 484, 300, 34, rgb(32, 27, 60), 6);
  createText(m6, '🎯 专属独立来源  (内嵌 src=lj_wheel 渠道标记)', 55, 494, 11, 'Regular', C.whiteMuted);

  createRect(m6, 45, 526, 300, 34, rgb(32, 27, 60), 6);
  createText(m6, '⚡ 达标即时派发  (好友注册/充值达标秒级加次)', 55, 536, 11, 'Regular', C.whiteMuted);

  createRect(m6, 45, 568, 300, 34, rgb(32, 27, 60), 6);
  createText(m6, '🛡️ 防重复与冲突  (与常态推广返佣独立结算)', 55, 578, 11, 'Regular', C.whiteMuted);

  // ==========================================
  // SPEC 7: UI 设计规范与开发交接卡片
  // ==========================================
  const s7 = figma.createFrame();
  s7.name = '📑 07-规范-UI设计附注与开发交接 (Specs & Guidelines)';
  s7.resize(850, 844);
  s7.x = 860; s7.y = 900;
  s7.fills = [rgb(15, 12, 30)];
  figma.currentPage.appendChild(s7);

  createText(s7, '好运探索季 (Lucky Journey) 玩家端 UI 设计与交接规范', 32, 28, 22, 'Bold', C.white);
  createText(s7, '本规范定义了玩家端 6 大核心画面结构、转盘扇区物理约束、心流状态机与切图规格。', 32, 58, 13, 'Regular', C.dim);

  // Box 1: Colors & Tokens
  createRect(s7, 32, 90, 380, 220, C.cardBg, 12, C.cardBorder);
  createText(s7, '🎨 1. 色彩与视觉调性 Tokens', 48, 106, 15, 'Bold', C.goldBright);
  createText(s7, '• 背景基底色: #120F24 (深邃夜幕暗夜蓝)', 48, 134, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 卡片背景色: #1E1A3A / 边框 #41366E', 48, 156, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 核心强调金: #FFC125 (主按钮、进度高光)', 48, 178, 12, 'Regular', C.gold);
  createText(s7, '• 辅助神秘紫: #9B59B6 (任务、宝石元素)', 48, 200, 12, 'Regular', C.purple);
  createText(s7, '• 辅助星芒青: #1ABC9C (完成提示、星钻)', 48, 222, 12, 'Regular', C.teal);
  createText(s7, '• 质感建议: 沿用星空大转盘金属包边与微光流体', 48, 244, 12, 'Regular', C.dim);

  // Box 2: 8 Sector & Max 6 Chars Constraint
  createRect(s7, 436, 90, 380, 220, C.cardBg, 12, C.cardBorder);
  createText(s7, '🎡 2. 转盘几何与 6 字物理极限 (重要)', 452, 106, 15, 'Bold', rgb(255, 120, 120));
  createText(s7, '• 8 等分 45° 扇区顺时针排列:', 452, 134, 12, 'Bold', C.white);
  createText(s7, '  [金币, 谢谢参与, 宝石, 谢谢参与, 星钻, 金币, 宝石, 谢谢参与]', 452, 154, 11, 'Regular', C.dim);
  createText(s7, '• 扇区有效弧长仅 50~61px，名称严禁超过 6 字！', 452, 178, 12, 'Bold', rgb(255, 120, 120));
  createText(s7, '• 排版适配: 1~4 字常规 10px 粗体；', 452, 200, 12, 'Regular', C.whiteMuted);
  createText(s7, '  5~6 字自动微缩至 8.5px 且字间距收紧 -0.5px。', 452, 222, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 中心指针居中固定，底盘顺时针旋转停转。', 452, 244, 12, 'Regular', C.dim);

  // Box 3: Flow & Payout
  createRect(s7, 32, 330, 380, 230, C.cardBg, 12, C.cardBorder);
  createText(s7, '📈 3. 最刺激自适应心流算法', 48, 346, 15, 'Bold', C.goldBright);
  createText(s7, '• 首转爆击: 直接冲到 88%~94% (极速快砍)', 48, 374, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 中段逼近: 自适应微调推进至 99.8% 悬念区', 48, 396, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 细砍冲刺: 小幅推进，谢谢参与不减进度', 48, 418, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 末转保底: 第 N 次必定抽中道具补满 100%', 48, 440, 12, 'Regular', C.teal);
  createText(s7, '• 派奖钱包: 锁定为现金钱包 (Cash)，无视分层', 48, 462, 12, 'Regular', C.gold);
  createText(s7, '• 领取模式: 支持 auto 自动派发与 manual 手动领取', 48, 484, 12, 'Regular', C.dim);

  // Box 4: Asset Delivery Checklist
  createRect(s7, 436, 330, 380, 230, C.cardBg, 12, C.cardBorder);
  createText(s7, '📦 4. UI 设计切图交付清单 (@2x / @3x)', 452, 346, 15, 'Bold', C.goldBright);
  createText(s7, '• 转盘底盘: wheel_disc_bg.png (508x508)', 452, 374, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 中心指针: wheel_pointer.png (120x120)', 452, 396, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 4 类奖品切图 (64x64): 谢谢参与、金币、宝石、星钻', 452, 418, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 中奖弹窗高清主图: popup_reward_star.png (128x128)', 452, 440, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 任务图标 (40x40): 签到日历、好友握手、打靶任务', 452, 462, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 按钮底纹: 金色高光流体微光动画九宫格', 452, 484, 12, 'Regular', C.dim);

  // Box 5: Online Prototype & Repository Sync
  createRect(s7, 32, 580, 784, 140, C.cardBg, 12, C.cardBorder);
  createText(s7, '🔗 5. 在线体验与协同链接', 48, 598, 15, 'Bold', C.teal);
  createText(s7, '• 玩家端在线交互原型: https://mikac05.github.io/ngss3BOPs/backoffice/lucky-journey/v3-review/player.html', 48, 626, 12, 'Regular', C.white);
  createText(s7, '• 后台管理原型: https://mikac05.github.io/ngss3BOPs/backoffice/lucky-journey/v3-review/index.html', 48, 648, 12, 'Regular', C.white);
  createText(s7, '• 演算规则与风控文档: https://mikac05.github.io/ngss3BOPs/backoffice/lucky-journey/v3-review/guide.html', 48, 670, 12, 'Regular', C.whiteMuted);
  createText(s7, '• 原型代码仓库: mikac05/ngss3BOPs (branch: main)', 48, 692, 12, 'Regular', C.dim);

  // 6. Select all and zoom into view
  const allNodes = [s1, s2, s3, s4, m5, m6, s7];
  figma.currentPage.selection = allNodes;
  figma.viewport.scrollAndZoomIntoView(allNodes);

  figma.notify('🎉 好运探索季 6 大原型画面与 UI 设计交接规范已成功生成至画布！', { timeout: 5000 });
})();
