### Implementation Summary: CUST-P3 Theme Bind + Remove Checks (`t_5c4cee91`)

All requested changes have been implemented strictly inside workspace [`ngss3BOPs`](file:///C:/Users/NGSS/Documents/ngss3BOPs) on branch `dev/customize-theme-refine` in full compliance with [`THEME-REFINE-CONTRACT.md`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/THEME-REFINE-CONTRACT.md) and [`THEME-REFINE-CONTRACT.json`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/THEME-REFINE-CONTRACT.json). No edits were made outside `backoffice/personalization/**`, hub `index.html` was untouched, and no git commits or pushes were performed.

---

### Key Accomplishments

1. **Canonical Theme Registry Frozen to 4 Keys (`["NG", "PH", "IN", "SF"]`):**
   - Completely pruned legacy `WG`.
   - Replaced legacy `GAME` with `IN` across all defaults, catalogs, and runtime logic.
   - Built migration logic in [`migrateDraft`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-core.js#L2042-L2085) and [`migratePlayerChoices`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/ng-design-catalog.js#L327-L360) so that existing `WG` drafts rewrite to `NG` and `GAME` drafts rewrite to `IN` with 5-slot navigation.
   - Updated `THEMES = ["NG", "PH", "IN", "SF"]`, `THEME_NAV_COUNTS = { NG: 5, PH: 5, IN: 5, SF: 5 }`, and unified 5-slot `THEME_NAV_DEFAULTS`.
   - Pruned NG palettes strictly to source Figma sets `["BDOK", "橙白", "藍白"]` (dropped `BDAK` and `BDLKK`).
   - Configured canonical tokens:
     - **PH (`PHPINK`):** Primary `#ff0055`, secondary gold `#f79908`, raised `#ffccdd`, text `#201330`, muted `#00000066`, onAccent `#ffffff`, BG/Panel `#ffffff`.
     - **SF (`SFPURPLE`):** Primary `#7e00fd` (excluding `#8b5cf6`), accent2 `#e100ff`, BG `#0f0c20`, panel `#1c1635`, raised `#2c2350`, text `#ffffff`, muted `#c8c5d8`, onAccent `#ffffff`. Flat colors only, no unverified gradients.
     - **IN (`INPLACEHOLDER`):** Deferred tokens stay unstyled empty strings `""` (no guessed India hex; no copying of GAME `BDLKK`).

2. **Per-Component Option Binding & Zero Cross-Theme Mixing:**
   - Every one of the 28 catalog components now has explicit `themeOptions` bound for `NG`, `PH`, `IN`, and `SF`.
   - For `PH`, `IN`, and `SF`: exactly 1 option per component (length === 1); e.g., SF `gameLayout` bound to `样式五` (紧凑分类), while all other 27 components bind their canonical single option or length-1 fallback.
   - Studio detail style grid ([`.studio-style-grid`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-studio.js#L664-L718)) renders only the style cards belonging to `state.theme` (1 card with count badge `1 款样式` for PH/IN/SF; nav tree meta displays `1`).
   - Detail options buttons in `renderLegacyDetail` are generated strictly from `item.themeOptions[state.theme]`. The cross-theme union array `item.options` is never rendered to the user.
   - Removed `sourceThemeSelectable` controls, "来源主题（混合主题演示）" buttons, and legacy cross-theme callouts.

3. **Check/Review Runner Removal:**
   - Replaced [`customize-checks.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-checks.js) with a deprecated no-op stub.
   - Removed `#checks-drawer` modal, `data-action="open-checks"` button, and `<script src="customize-checks.js">` from [`backoffice/personalization/index.html`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/index.html).
   - Removed `runChecks()` (checks 1–36) and `CHECK_NAMES_ZH` dictionary from [`customize-core.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-core.js).
   - Deleted [`NGStudio.testPlayer`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-studio.js).
   - Pruned obsolete WG/GAME demo scenes (`warn-cross-r0`, `review-cross-r2`, `auto-safe`, `block-unsafe`, `block-theme-count`) from `#scene-select`.
   - Preserved `#validation-pane` (`renderValidation`) and `#diff-drawer` (`confirmSave` / diff preview).

4. **Proactive Entry-Reachability Constraints (§5.2):**
   - **Constraint 1:** `topDownloadBar` switch is disabled and locked to "开启" with tooltip (`App 下载能力开启时不可关闭安装入口`) when App install capability is active.
   - **Constraint 2:** `vipCard` "隐藏VIP资讯" button is disabled with tooltip when no VIP surface exists in `bottomNav` or `alternateButton`. (For PH/IN/SF, only "完整卡片" is available).
   - **Constraint 3:** `shortcuts` "侧边栏内" is disabled when `sidebar === "关闭"`. `sidebar` closing is disabled when shortcuts are hosted in the sidebar. In non-NG themes, sidebar switch is locked to disabled.
   - **Constraint 4:** `topStatusBar` "简洁" is disabled when shortcuts is "状态列按钮"; `shortcuts` "状态列按钮" is disabled when `topStatusBar` is "简洁".
   - **Constraint 5:** `bottomNav` slot editor prevents removing or replacing a slot if it is the sole remaining surface for a core capability across the site.
   - **Constraint 6:** `alternateButton` auto-defaults target to "客服" and placement to "浮动收折" upon enabling.

---

### Changed Files

- [`backoffice/personalization/current-config.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/current-config.js)
- [`backoffice/personalization/customize-checks.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-checks.js)
- [`backoffice/personalization/customize-core.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-core.js)
- [`backoffice/personalization/customize-studio.css`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-studio.css)
- [`backoffice/personalization/customize-studio.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/customize-studio.js)
- [`backoffice/personalization/index.html`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/index.html)
- [`backoffice/personalization/ng-design-catalog.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/ng-design-catalog.js)
- [`backoffice/personalization/ng-page-designs.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/ng-page-designs.js)
- [`backoffice/personalization/player-components.css`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/player-components.css)
- [`backoffice/personalization/player-components.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/player-components.js)
- [`backoffice/personalization/player-preview.js`](file:///C:/Users/NGSS/Documents/ngss3BOPs/backoffice/personalization/player-preview.js)
- [`GEMINI_RESULT.md`](file:///C:/Users/NGSS/Documents/ngss3BOPs/GEMINI_RESULT.md)

*(Hub `index.html` was untouched).*

---

### Exact Command Results

1. **Syntax Verification across all modified JS files:**
   ```powers
   node -e "files.forEach(f => { new Function(fs.readFileSync(f, 'utf8')); console.log('Syntax OK:', f); });"
   ```
   **Output:**
   ```
   Syntax OK: backoffice/personalization/ng-design-catalog.js
   Syntax OK: backoffice/personalization/ng-page-designs.js
   Syntax OK: backoffice/personalization/current-config.js
   Syntax OK: backoffice/personalization/customize-core.js
   Syntax OK: backoffice/personalization/customize-studio.js
   Syntax OK: backoffice/personalization/player-components.js
   Syntax OK: backoffice/personalization/player-preview.js
   Syntax OK: backoffice/personalization/customize-checks.js
   ```

2. **Catalog & Theme Switching Verification:**
   ```
   CATALOG length: 28
   All 28 catalog items valid with PH/IN/SF length === 1: true
   Initial theme: NG
   Switched to: PH draft.theme.value: PH
   Switched to: IN draft.theme.value: IN
   Switched to: SF draft.theme.value: SF
   Switched to: NG draft.theme.value: NG
   ```

3. **Draft & Policy Migration Verification:**
   ```
   Migrated WG themes: [ 'NG' ]
   Migrated WG colors: { NG: [ 'BDOK' ], PH: [ 'PHPINK' ], SF: [ 'SFPURPLE' ] }
   Migrated GAME themes: [ 'IN', 'NG' ]
   Migrated GAME colors: { NG: [ 'BDOK' ], IN: [ 'INPLACEHOLDER' ], PH: [ 'PHPINK' ], SF: [ 'SFPURPLE' ] }
   [migrateDraft] Rewriting WG -> NG
   Restored WG theme: NG (themeColor: BDOK)
   [migrateDraft] Rewriting GAME -> IN
   Restored GAME theme: IN (themeColor: INPLACEHOLDER, bottomNav slots: 5)
   ```

4. **Python HTTP Server Acceptance (`python -m http.server 8765`):**
   ```
   GET /backoffice/personalization/index.html -> HTTP 200 (Length: 11043)
   GET /backoffice/personalization/player-home-preview.html -> HTTP 200
   Has checks-drawer: False
   Has open-checks: False
   Has validation-pane: True
   Has diff-drawer: True
   Has customize-checks.js: False
   ```

---

### Assumptions and Residual Risk

1. **IN Tokens Deferred:** Per contract §2.4, India tokens remain empty strings (`INPLACEHOLDER`) awaiting Figma quota reset. Guessed colors and legacy GAME palette `BDLKK` were not used.
2. **PH Visual Structure Unobserved:** PH tokens (`#ff0055`, `#f79908`) are canonical; component visual structure safely uses length-1 fallbacks to NG defaults.
3. **SF Page Frames Sparse:** SF home layout (`#7e00fd`, style 5) is Figma-proven; subpage frames safely default to single canonical fallback options.
