# Customize Theme Refine — Implementable Contract (CUST-P2)

- **Document:** `backoffice/personalization/THEME-REFINE-CONTRACT.md`
- **Companion JSON:** `backoffice/personalization/THEME-REFINE-CONTRACT.json`
- **Branch:** `dev/customize-theme-refine`
- **Workspace:** `C:/Users/NGSS/Documents/ngss3BOPs`
- **Status:** **Frozen Contract for P3 Implementation** (`t_5c4cee91`)
- **Authority:** Synthesized from `THEME-REFINE-PACKET.md`, `THEME-REFINE-INVENTORY.md` (P0), and `THEME-REFINE-FIGMA.md` (P1C canonical harvest `t_5f6623c7`).

---

## 1. Theme Registry

All runtime surfaces must list **only** these four theme keys: `NG`, `PH`, `IN`, `SF`.
Legacy keys `WG` and `GAME` are completely removed.

| Key | Label (ZH) | Label (EN) | Default Palette ID | Primary Hex | Figma File Key | Figma Node ID | Option Policy | Status |
|---|---|---|---|---|---|---|---|---|
| `NG` | NG | NG | `BDOK` | `#75eb92` | Existing catalog | N/A | Multi-option (existing catalog) | **Ready** |
| `PH` | 菲律宾 | Philippines | `PHPINK` | `#ff0055` | `DnNve2QZ22LEFCqDWuuAMl` | `873:153335` | Exactly 1 option per component | **Ready** (tokens proven; visual structure fallback to NG default) |
| `IN` | 印度 | India | `INPLACEHOLDER` | *(BLANK — deferred)* | `XrzIsJfYarVffSI34zIwC4` | `2078:305348` | Exactly 1 placeholder option per component | **Deferred** (View-seat cap hit; tokens blank; no guessed chrome) |
| `SF` | 星空 | Starfield | `SFPURPLE` | `#7e00fd` | `wHQsrb1CATZNliip44FdNf` | `20:3700` | Exactly 1 option per component | **Ready** (tokens + home layout proven; page frames sparse) |

### 1.1 Registry Rules
1. **Single Enum Authority:** `THEMES = ["NG", "PH", "IN", "SF"]` in `customize-core.js`.
2. **Key Replacement:** `GAME` is replaced by `IN`. `WG` is dropped.
3. **No Cross-Theme Mixing:** Each theme exposes its own bound options. The studio UI must never display a union list containing options from another theme.

---

## 2. Palettes & Color System

### 2.1 NG Palettes (Prune WG/GAME Legacy)
- **Decision:** Drop `BDAK` and `BDLKK` from `themeColors.NG`.
- `themeColors.NG` is strictly source Figma palettes: `["BDOK", "橙白", "藍白"]`.
- `palettes.BDOK`: Accent `#75eb92`, Accent2 `#a9e782`, BG `#202222`, Panel `#292c2b`, Raised `#3e4140`, Text `#ffffff`, Muted `#adb7ba`, onAccent `#183b25`.
- `palettes.橙白`: Accent `#f48d16`, Accent2 `#ffd900`, BG `#ebecf3`, Panel `#ffffff`, Raised `#f1f2f7`, Text `#1c1e23`, Muted `#707580`, onAccent `#472604`.
- `palettes.藍白`: Accent `#4781ff`, Accent2 `#47b5ff`, BG `#ebecf3`, Panel `#ffffff`, Raised `#f1f2f7`, Text `#1c1e23`, Muted `#707580`, onAccent `#ffffff`.

### 2.2 PH Palette (`PHPINK`) — Canonical MCP Tokens
- **ID:** `PHPINK`
- **Label:** `菲律宾粉` / `Philippines Pink`
- **Accent (Primary):** `#ff0055` (`Basic/Primary_Pink/50`)
- **Accent2 (Secondary Gold):** `#f79908` (`Basic/Secendary_gold/50`)
- **BG:** `#ffffff` (`Backgrounds/Primary`)
- **Panel:** `#ffffff`
- **Raised:** `#ffccdd` (`Basic/Primary_Pink/90`)
- **Text:** `#201330` (`Main Color/main7`)
- **Muted:** `#00000066` (`Basic/neutral-black/neutral-black-40`)
- **onAccent:** `#ffffff`
- **source:** `true`
- **Supporting CSS Token Notes for P3:**
  - Gold accents: `#f79908` (gold 50), `#fcc136` (gold 60), `#fdd880` (gold 70)
  - Dark accents: `#330011` (Pink 10), `#201330` (main7)
  - Corner radius: `corner/s` = 8px, `corner/m` = 12px, `corner/full` = 120px
  - Typography: Roboto Regular/Medium, sizes 12px, 14px, 16px
  - Blur & Shadow: Drop shadow `#27000059` (0px, 8px, 8px, 0px), background blur 16px

### 2.3 SF Palette (`SFPURPLE`) — Canonical MCP Tokens
- **ID:** `SFPURPLE`
- **Label:** `星空紫` / `Starfield Purple`
- **Accent (Primary):** `#7e00fd` (`Primary Purple/Purple 50` — **not** `#8b5cf6`)
- **Accent2 (Pink Accent):** `#e100ff` (`Primary Pink/Pink 50`)
- **BG:** `#0f0c20` (Dark starfield canvas)
- **Panel:** `#1c1635`
- **Raised:** `#2c2350`
- **Text:** `#ffffff` (`Neutral white/white 100%`)
- **Muted:** `#c8c5d8` (`Gray/gray`)
- **onAccent:** `#ffffff`
- **source:** `true`
- **Gradient Note:** MCP variable `紫色渐变` returned empty; P3 must use flat `#7e00fd` with `#e100ff` accents, not an unverified CSS gradient.

### 2.4 IN Palette (`INPLACEHOLDER`) — Deferred / Blank
- **ID:** `INPLACEHOLDER`
- **Label:** `印度(待补)` / `India (Deferred)`
- **Accent (Primary):** `""` (BLANK — do not guess)
- **Accent2:** `""`
- **BG:** `""`
- **Panel:** `""`
- **Raised:** `""`
- **Text:** `""`
- **Muted:** `""`
- **onAccent:** `""`
- **source:** `true`
- **deferred:** `true`
- **Rule for P3:** Do **not** paint India chrome. Do **not** copy GAME `BDLKK` / `#efb44e`. Palette tokens remain unstyled empty strings until a Full Figma seat quota re-harvests node `2078:305348`.

### 2.5 `NGDesign.themeColors` & `NGDesign.defaultPolicy()`
```javascript
const themeColors = {
  NG: ["BDOK", "橙白", "藍白"],
  PH: ["PHPINK"],
  IN: ["INPLACEHOLDER"],
  SF: ["SFPURPLE"],
};

function defaultPolicy() {
  return {
    themes: ["NG"],
    colors: {
      NG: ["BDOK", "橙白", "藍白"],
      PH: ["PHPINK"],
      IN: ["INPLACEHOLDER"],
      SF: ["SFPURPLE"],
    },
    defaults: {
      NG: "BDOK",
      PH: "PHPINK",
      IN: "INPLACEHOLDER",
      SF: "SFPURPLE",
    },
  };
}
```

---

## 3. Per-Component Option Tables (All 28 CATALOG IDs)

For every component:
- **NG:** Multi-option set from existing catalog / families.
- **PH:** Single option bound (`length === 1`). If MCP-named, use Figma token; if Unobserved, bind the NG default string and mark `unobserved`.
- **IN:** Single placeholder option bound (`length === 1`). Option string equals NG default string, marked `deferred-blank-tokens`.
- **SF:** Single option bound (`length === 1`). Use MCP-harvested layer/variable where available; fallback to NG default string if unobserved.

| # | Catalog ID | Component Label | NG Option Set | PH (Single Option) | IN (Single Placeholder) | SF (Single Option) | Classification | Evidence & Mapping Source |
|---|---|---|---|---|---|---|---|---|
| 1 | `theme` | 主题 | `["NG"]` | `PH` | `IN` | `SF` | MCP-named | Packet enum; SF frames `星空版-*`; PH file confirmed; IN file unread. |
| 2 | `themeColor` | 主题颜色 | `["BDOK", "橙白", "藍白"]` | `PHPINK` (`#ff0055`) | `INPLACEHOLDER` *(blank)* | `SFPURPLE` (`#7e00fd`) | MCP-named PH+SF; Blank IN | Harvest §2. Mint `PHPINK` & `SFPURPLE`. IN is deferred placeholder. |
| 3 | `categoryButtons` | 分类按钮 | `["图示+名称", "仅图示", "仅名称"]` | `图示+名称` *(unobserved)* | `图示+名称` *(deferred)* | `图示+名称` | SF MCP-named | SF node `20:3700`: 56 categories with `中文名` + vendor marks (CQ9/PG/PP...). |
| 4 | `topStatusBar` | 顶部状态列 | Out: `["基本功能", "全部功能", "简洁"]`<br>In: `["全部功能", "简洁", "钱包专注"]` | Out: `基本功能`<br>In: `全部功能` *(unobserved)* | Out: `基本功能`<br>In: `全部功能` *(deferred)* | Out: `基本功能`<br>In: `全部功能` | SF MCP-named | SF LoggedOut `20:3701` (`登录`/`注册`/logo); LoggedIn `30:1256` (`dollar-circle`/`add`/`970.8`). |
| 5 | `sidebar` | 侧边栏 | `["关闭", "左方", "右方"]` | `关闭` *(unobserved)* | `关闭` *(deferred)* | `关闭` | SF MCP-named (absence) | No sidebar or drawer frame in SF section `20:3700`. |
| 6 | `shortcuts` | 快捷按钮 | `["浮动并列", "浮动收折", "状态列按钮", "侧边栏内"]` | `浮动并列` *(unobserved)* | `浮动并列` *(deferred)* | `浮动并列` | SF MCP-named | SF Layer `icon_chat` floating on home page. |
| 7 | `gameLayout` | 游戏排版 | 10 styles (`样式一`–`样式五`, `现行一`–`现行五`) | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式五` (紧凑分类) | SF MCP-named | SF `热门` chip + horizontal vendor rows + `更多` = NG visual family 紧凑分类 = `样式五`. |
| 8 | `gameGridStyle` | 游戏区排版 | 4 styles (`样式一`–`样式三`, `现行一`) | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式一` *(unobserved-detail)* | SF Unobserved-detail | Game masks present; sparse XML does not distinguish grid card layout. |
| 9 | `searchPagination` | 搜索/分页 | 6 visual styles (`搜索列`, `分頁`, `搜索+分頁`...) | `搜索列` *(unobserved)* | `搜索列` *(deferred)* | `搜索列` *(unobserved)* | Unobserved | Node `20:3700` has no standalone search layer. |
| 10 | `topDownloadBar` | 顶部下载栏 | `["开启", "关闭"]` | `开启` *(unobserved)* | `开启` *(deferred)* | `开启` | SF MCP-named | SF `Download App1` ×8, `iOS版`, `Android版`. |
| 11 | `downloadFAB` | 下载FAB | `["开启", "关闭"]` (derived) | `开启` (derived) | `开启` (derived) | `开启` (derived) | Derived | Catalog `derivedFrom: topDownloadBar`. |
| 12 | `depositPage` | 充值页 | `["方式优先", "金额优先", "快捷模式"]` | `方式优先` *(unobserved)* | `方式优先` *(deferred)* | `方式优先` *(unobserved)* | Unobserved | Harvested node covers 首页 only. |
| 13 | `recordsDisplay` | 纪录顯示 | `["下拉", "分页", "卡片"]` | `下拉` *(unobserved)* | `下拉` *(deferred)* | `下拉` *(unobserved)* | Unobserved | Not present in harvested home section. |
| 14 | `amountAutoInput` | 额度自动输入 | `["按钮", "滑杆", "关闭"]` | `按钮` *(unobserved)* | `按钮` *(deferred)* | `按钮` *(unobserved)* | Unobserved | Not present in harvested home section. |
| 15 | `vipCard` | 显示VIP卡片 | `["完整卡片", "紧凑卡片", "隐藏VIP资讯"]` | `完整卡片` *(unobserved)* | `完整卡片` *(deferred)* | `完整卡片` *(unobserved)* | Unobserved | VIP is present as nav/list item, not profile card variant. |
| 16 | `vipPage` | VIP页 | `["表格", "等级卡片", "特权清单"]` | `表格` *(unobserved)* | `表格` *(deferred)* | `表格` *(unobserved)* | Unobserved | No VIP subpage frame in harvested node. |
| 17 | `inbox` | 站内信 | `["列表", "分类Tab", "对话流"]` | `列表` *(unobserved)* | `列表` *(deferred)* | `列表` *(unobserved)* | Unobserved | Not present in harvested home section. |
| 18 | `userVerification` | 用户验证 | `["列表", "步骤向导", "分块卡片"]` | `列表` *(unobserved)* | `列表` *(deferred)* | `列表` *(unobserved)* | Unobserved | Not present in harvested home section. |
| 19 | `bottomNav` | 底部导航 | 5-slot `LIVE_NAV`: `["首页","活动","推广","VIP","账户"]` | 5-slot: `["首页","活动","推广","VIP","账户"]` *(unobserved)* | 5-slot: `["首页","活动","推广","VIP","账户"]` *(deferred)* | 5-slot: `["首页","活动","VIP","钱包","我的"]` | SF MCP-named; PH/IN Unobserved | SF frames `首页`, `活动`, `VIP`, `钱包`, `我的` / `个人中心`. PH/IN use 5-slot placeholder; GAME 3-slot dead. |
| 20 | `popupStyle` | 弹窗样式 | `["样式一", "样式二", "样式三"]` | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式一` *(unobserved)* | Unobserved | Not present in harvested home section. |
| 21 | `alternateButton` | 替代按钮 | `["关闭", "浮动胶囊", "悬浮圆钮", "底部导航自选槽位"]` | `关闭` *(unobserved)* | `关闭` *(deferred)* | `关闭` | SF MCP-named (absence) | No alternate button host in SF home layout. |
| 22 | `carouselStyle` | 轮播样式 | 8 visual styles (`通用Banner`, `小Banner`...) | `通用Banner` *(unobserved)* | `通用Banner` *(deferred)* | `通用Banner` | SF MCP-named | SF Home hero `20:3703` banner (`最高奖励` / `$88888`). |
| 23 | `footerStyle` | 页尾内容 | 4 visual styles (`样式一`–`样式四`) | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式一` | SF MCP-named | SF frame `35:11771` (TikTok, telegram, WhatsApp, providers, 18+). |
| 24 | `profileLayout` | 个人中心版面 | 9 visual styles (`样式一`–`样式五`, `现行一`–`现行四`) | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式一` *(unobserved)* | Unobserved | Frame `171:11621` is activity list, not a profile layout. |
| 25 | `authVisual` | 登入注册视觉 | 4 visual styles (`简洁框`, `插画框`...) | `简洁框` *(unobserved)* | `简洁框` *(deferred)* | `简洁框` *(unobserved)* | Unobserved | Only header chips present; modal unobserved. |
| 26 | `brandMark` | 品牌标志 | `["本站品牌标志（固定）"]` | `本站品牌标志（固定）` | `本站品牌标志（固定）` | `本站品牌标志（固定）` | MCP-named | Fixed read-only logo item. |
| 27 | `buttonStyle` | 按钮样式 | 4 visual styles (`样式一`–`样式四`) | `样式一` *(unobserved)* | `样式一` *(deferred)* | `样式一` *(unobserved-detail)* | SF Unobserved-detail | Login/register chips 50×24px; XML has no button fill token. |
| 28 | `gameIconStyle` | 游戏图标 | `["标准", "极简"]` | `标准` *(unobserved)* | `标准` *(deferred)* | `标准` | SF MCP-named | Full-color vendor marks (PG, CQ9, JILI), not 极简. |

---

### 3.1 Visual Families Specification (16 Families)

In `NGDesign.families`, `NGDesign.pageFamilies`, and `current-config.js`:
- For **NG**: Keeps the full array of titles (5–10 titles per family).
- For **PH**: Exactly 1 title per family (`title[0]`, style index `value = 1`).
- For **IN**: Exactly 1 title per family (`title[0]`, style index `value = 1`, marked `deferred-blank-tokens`).
- For **SF**:
  - `gameLayout`: Exactly 1 title, mapped to `样式五` / 紧凑分类 (style index `value = 5`).
  - `bottomNav`: Exactly 1 title, mapped to 5-slot `首页/活动/VIP/钱包/我的` (style index `value = 1` in SF-scoped family).
  - All other 14 families: Exactly 1 title (`title[0]`, style index `value = 1`).

### 3.2 Bottom Navigation Counts & Presets
- **Slot Counts:**
  ```javascript
  const THEME_NAV_COUNTS = { NG: 5, PH: 5, IN: 5, SF: 5 };
  ```
- **Presets:**
  ```javascript
  const THEME_NAV_DEFAULTS = {
    NG: {
      loggedOut: ["首页", "活动", "推广", "VIP", "账户"],
      loggedIn:  ["首页", "活动", "推广", "VIP", "账户"],
    },
    PH: {
      loggedOut: ["首页", "活动", "推广", "VIP", "账户"],
      loggedIn:  ["首页", "活动", "推广", "VIP", "账户"],
    },
    IN: {
      loggedOut: ["首页", "活动", "推广", "VIP", "账户"],
      loggedIn:  ["首页", "活动", "推广", "VIP", "账户"],
    },
    SF: {
      loggedOut: ["首页", "活动", "VIP", "钱包", "我的"],
      loggedIn:  ["首页", "活动", "VIP", "钱包", "我的"],
    },
  };
  ```
- **Player Override Cleanup:** In `player-components.js`, **delete** the WG/GAME hardcoded nav swaps:
  ```javascript
  // DELETE THESE LINES in player-components.js Player.current():
  // if (c.theme === "WG") c.nav = ["首页", "活动", "钱包", "账户"];
  // if (c.theme === "GAME") c.nav = ["首页", "钱包", "账户"];
  ```
  All four themes (`NG`, `PH`, `IN`, `SF`) strictly render `config.nav` directly without theme-conditional player hijacking.

---

## 4. Theme-Binding & UI Scoping Rules

### 4.1 Strict Theme-Scoping (No Cross-Theme Mixing)
1. **Catalog Options Binding:**
   Every catalog entry must provide:
   ```javascript
   item.themeOptions = {
     NG: [...], // existing NG options array
     PH: [...], // length 1 array
     IN: [...], // length 1 array
     SF: [...]  // length 1 array
   };
   ```
2. **Studio Editor Rendering:**
   - In `customize-studio.js` (`renderLegacyDetail` and detail panels), options buttons must be generated from `item.themeOptions[state.theme]`.
   - The union array `item.options` must **not** be rendered to the user.
   - The style grid (`.studio-style-grid`) must display only the style cards belonging to `state.theme`. For `PH`, `IN`, and `SF`, exactly **1 style card** is rendered with count badge `1 款样式`.
   - Delete the legacy callout:
     ```javascript
     // DELETE: "此 Figma 文件仅定义 NG。{theme} 暂使用既有原型设置。"
     ```
   - Delete `sourceThemeSelectable: true` and the “来源主题（混合主题演示）” button row.
3. **Draft Validation:**
   - In `ng-page-designs.js` line 129:
     ```javascript
     // REPLACE:
     // d.sourceTheme !== "NG"
     // WITH:
     // !["NG", "PH", "IN", "SF"].includes(d.sourceTheme) || d.sourceTheme !== theme
     ```
   - When editing under `state.theme`, any visual style must match `d.sourceTheme === state.theme`.
4. **Hidden Tree Items:**
   - Keep hidden from the left navigation tree (`customize-studio.js`):
     - `theme` (controlled only via foundation Theme Panel)
     - `brandMark` (fixed read-only)
     - `downloadFAB` (derived automatically from `topDownloadBar`)

---

## 5. Entry-Reachability Constraints (Replacing Checks)

### 5.1 UX Shift: Proactive Constraint vs. Reactive Block
Instead of allowing invalid states and failing during `runChecks` or popping a `Block` issue in the validation drawer, the studio UI must **disable or hide** controls that would eliminate a required entry surface.

### 5.2 Explicit Constraint Matrix

| # | Conflict / Illegal Combination | Proactive Constraint (Disable / Hide) | Required Entry Preserved | Implementation Location |
|---|---|---|---|---|
| 1 | `topDownloadBar` set to "关闭" while App download capability is enabled | **Disable or hide "关闭"** on `topDownloadBar` switch. (Switch locked to "开启" with tooltip: `App 下载能力开启时不可关闭安装入口`). | App 安装入口 (Top bar & derived FAB) | `customize-studio.js` (visibility switch handler) |
| 2 | `vipCard` set to "隐藏VIP资讯" while no VIP surface exists in `bottomNav` or `alternateButton` | **Disable "隐藏VIP资讯"** option button in `vipCard` editor when VIP is absent from nav and alternate button. | VIP 可见表面 (VIP card or nav slot) | `customize-studio.js` (radio option renderer & state change) |
| 3 | `shortcuts` placement set to "侧边栏内" while `sidebar` is "关闭" | In `shortcuts` placement: **disable or hide "侧边栏内"** when `sidebar === "关闭"`. In `sidebar`: **disable closing sidebar** if shortcuts are currently hosted inside it. | 快捷入口 (Shortcuts) | `customize-studio.js` (shortcuts & sidebar option buttons) |
| 4 | `topStatusBar` set to "简洁" while `shortcuts` set to "状态列按钮" | In `shortcuts`: **disable "状态列按钮"** if top bar is "简洁". In `topStatusBar`: **disable "简洁"** if shortcuts host is "状态列按钮". | 取款 / 状态列快捷操作 | `customize-studio.js` (header & shortcuts editors) |
| 5 | Bottom nav edit that removes the last surface for a `CAPABILITIES` item | In bottom nav slot editor: **disable removing or replacing** a slot if it is the sole remaining surface for that capability across the site. | 核心受保护能力 (首页, 活动, VIP, 钱包, 账户) | `customize-studio.js` (bottomNav slot selector) |
| 6 | `alternateButton` mode `SET` with empty target (`target === ""`) | In `alternateButton`: **disable the "开启/SET" toggle** until a valid capability is selected in the dropdown, or auto-default target to the first declared capability (e.g. "客服"). | 替代按钮完整性 (No dead alternate button) | `customize-studio.js` (alternateButton placement/target editor) |

### 5.3 Safety Net & Deletion Scope
- **Keep:** `resolveAll()` validation logic as a background sanity check.
- **Keep:** `#validation-pane` (`renderValidation`) and `#diff-drawer` (`confirmSave` / diff preview).
- **Delete:**
  1. `customize-checks.js` (delete file or omit script tag).
  2. `runChecks()` (checks 1–36 in `customize-core.js`).
  3. `#checks-drawer` (remove modal dialog from `index.html`).
  4. Button `data-action="open-checks"` (remove from `index.html`).
  5. `CHECK_NAMES_ZH` dictionary in `customize-core.js`.
  6. `window.NGChecks` call site in `customize-core.js`.
  7. `NGStudio.testPlayer` in `customize-studio.js` (used only by regression checks).
  8. WG/GAME demo scenes in `customize-core.js` (`loadScene`).

---

## 6. Draft Migration Rules (In-Memory & Exported JSON)

There is no remote server database; migration applies to in-memory `state`, localStorage, and imported JSON drafts:

### 6.1 Theme Key Rewriting
1. If `theme === "WG"`:
   - Map `theme` $\to$ `"NG"`.
   - Rewrite any `sourceTheme === "WG"` to `"NG"`.
   - If `themeColor === "BDAK"`, reset to `"BDOK"`.
2. If `theme === "GAME"`:
   - Map `theme` $\to$ `"IN"`.
   - Rewrite any `sourceTheme === "GAME"` to `"IN"`.
   - Reset `themeColor` to `"INPLACEHOLDER"`.
   - Reset all component options and visual styles to `IN` defaults (length 1 placeholder options).
   - Drop the GAME 3-slot bottom navigation; reset to the IN 5-slot nav (`LIVE_NAV`).

### 6.2 `playerChoices` Policy Migration
When loading `draft.theme.extra.playerChoices`:
```javascript
function migratePlayerChoices(p) {
  if (!p) return defaultPolicy();
  // 1. Rewrite themes
  p.themes = (p.themes || [])
    .filter((t) => t !== "WG")
    .map((t) => (t === "GAME" ? "IN" : t));
  if (!p.themes.includes("NG")) p.themes.unshift("NG");
  p.themes = [...new Set(p.themes)].filter((t) => ["NG", "PH", "IN", "SF"].includes(t));

  // 2. Clean colors
  delete p.colors.WG;
  if (p.colors.GAME) {
    p.colors.IN = ["INPLACEHOLDER"];
    delete p.colors.GAME;
  }
  p.colors.NG = (p.colors.NG || []).filter((c) => ["BDOK", "橙白", "藍白"].includes(c));
  if (!p.colors.NG.length) p.colors.NG = ["BDOK"];
  if (!p.colors.PH) p.colors.PH = ["PHPINK"];
  if (!p.colors.SF) p.colors.SF = ["SFPURPLE"];

  // 3. Clean defaults
  delete p.defaults.WG;
  if (p.defaults.GAME) {
    p.defaults.IN = "INPLACEHOLDER";
    delete p.defaults.GAME;
  }
  if (!["BDOK", "橙白", "藍白"].includes(p.defaults.NG)) p.defaults.NG = "BDOK";
  if (!p.defaults.PH) p.defaults.PH = "PHPINK";
  if (!p.defaults.SF) p.defaults.SF = "SFPURPLE";

  return p;
}
```

---

## 7. File-by-File P3 Implementation Checklist

| Target File | Concrete Actions Required for P3 |
|---|---|
| `customize-core.js` | 1. Update `THEMES = ["NG", "PH", "IN", "SF"]`.<br>2. Update `THEME_NAV_COUNTS = { NG: 5, PH: 5, IN: 5, SF: 5 }`.<br>3. Update `THEME_NAV_DEFAULTS` for `PH`, `IN`, `SF` (all 5-slot).<br>4. Update `THEME_DEFAULTS` to define baseline states for `NG`, `PH`, `IN`, `SF`. Remove `WG` and `GAME`.<br>5. Update `CATALOG`: ensure all 28 entries have `themeOptions` populated for all 4 themes; remove `sourceThemeSelectable`.<br>6. Delete `runChecks`, `CHECK_NAMES_ZH`, `els.checks`, `open-checks` handler, and WG/GAME demo scenes.<br>7. Implement draft migration logic on load (`migrateDraft`). |
| `customize-studio.js` | 1. In `themePanel()`: replace hardcoded `["NG", "WG", "GAME"]` with `THEMES` (`NG`, `PH`, `IN`, `SF`).<br>2. Update `themeName()` with Chinese & English labels for PH (`菲律宾`), IN (`印度`), SF (`星空`).<br>3. In component detail rendering: delete the `s().theme !== "NG"` bailout! Render the style grid with options filtered by `state.theme`.<br>4. In `renderLegacyDetail`: render buttons from `item.themeOptions[state.theme]`. Remove cross-theme options.<br>5. Implement constraint hooks: disable/hide illegal choices as defined in §5.2.<br>6. Delete `testPlayer` (no longer needed after checks removal). |
| `ng-design-catalog.js` | 1. Add `PHPINK` (`#ff0055`) and `SFPURPLE` (`#7e00fd`) to `palettes`.<br>2. Add `INPLACEHOLDER` with blank hex values.<br>3. Prune `themeColors.NG` to `["BDOK", "橙白", "藍白"]`. Define `themeColors.PH`, `IN`, `SF`.<br>4. Update `defaultPolicy()` for `NG`, `PH`, `IN`, `SF`.<br>5. In `extendCatalog`: extend catalog items with `themeOptions` across all 4 themes.<br>6. Update `validateDraft` to validate policy against the new 4-theme registry. |
| `ng-page-designs.js` | 1. In `validateDraft`: allow `d.sourceTheme` to match any valid theme (`NG`, `PH`, `IN`, `SF`) corresponding to the current edit context, rather than strictly `"NG"`.<br>2. Define per-theme page family titles if needed or length 1 for PH/IN/SF. |
| `current-config.js` | 1. In `extendCatalog`: ensure `themeOptions.NG`, `PH`, `IN`, `SF` are properly attached for extended items (`gameLayout`, `gameGridStyle`, `footerStyle`, `popupStyle`).<br>2. Support 5-slot bottom navigation across all 4 themes. |
| `player-components.js` | 1. In `Player.current()`: delete the hardcoded `WG` and `GAME` nav replacements (lines 1696–1702). Use `config.nav` directly.<br>2. Update `brand(c)`: provide clean branding for `PH`, `IN`, `SF`.<br>3. Ensure player CSS dataset reads `data-theme="NG"|"PH"|"IN"|"SF"`. |
| `player-components.css` | 1. Remove obsolete `[data-theme="WG"]` and `[data-theme="GAME"]` selectors.<br>2. Add `[data-theme="PH"]` with primary `#ff0055`, `[data-theme="SF"]` with primary `#7e00fd`.<br>3. Add placeholder styles for `[data-theme="IN"]`. |
| `customize-studio.css` | 1. Update `.studio-themes` layout from 3 columns to 4 columns (`repeat(4, 1fr)`).<br>2. Replace `.theme-WG` and `.theme-GAME` art classes with `.theme-PH`, `.theme-IN`, `.theme-SF`.<br>3. Style constraint tooltips/disabled cards where illegal combinations are unselectable. |
| `player-preview.js` | 1. Update preview gate: accept `NG`, `PH`, `IN`, `SF` in `NGDesign.themeColors[theme]`. |
| `index.html` | 1. Remove `#checks-drawer` DOM element (lines 274–281).<br>2. Remove button `data-action="open-checks"`.<br>3. Remove script import `<script src="customize-checks.js..."></script>`.<br>4. Retain `#validation-pane` and `#diff-drawer`. |
| `customize-checks.js` | 1. Delete file or keep as empty deprecated stub. |
| Hub `index.html` | **DO NOT EDIT.** Hub contains no theme labels or theme keys. |

---

## 8. Non-Goals & Residual Risk

1. **No Application Code Edits in P2:** P2 is strictly specification and contract definition. Application JS/CSS changes are deferred entirely to P3.
2. **IN Tokens Deferred:** India Figma tokens remain blank due to the View-seat monthly quota limit on team `NG项目` (`1529095317361261300`). P3 must not invent India hex codes. IN components will function with unstyled placeholder tokens until a Full Figma seat re-harvests node `2078:305348`.
3. **PH Structure Unobserved:** Node `873:153335` design context hit the View-seat cap. Component structure defaults to length-1 NG defaults. This is valid contract behavior, not Figma-proven visual structure.
4. **SF Home Section Only:** Node `20:3700` is a 首页 section. Page-level components (`depositPage`, `vipPage`, `inbox`) are unobserved and safely use length-1 fallbacks.
5. **No Backend Persistence:** All draft persistence is browser session / local storage.

---

## 9. Acceptance Criteria for P3 Hand-off

- [x] Every single one of the 28 CATALOG ids has an explicit option mapping: NG multi-option set vs. PH/IN/SF length 1 bound option.
- [x] `GAME` is mapped to `IN` (deferred tokens) and `WG` is dropped completely.
- [x] PH primary hex `#ff0055` and SF primary hex `#7e00fd` are locked; `#8b5cf6` is excluded.
- [x] Check runner deletion and reachability constraint rules are explicitly mapped with zero ambiguity.
- [x] Draft migration rules for WG and GAME drafts are fully specified.
- [x] Hotspot files and required changes are itemized line-by-line.
