# Customize theme/option/check inventory (CUST-P0)

Packet: `backoffice/personalization/THEME-REFINE-PACKET.md` (v1). Prototype-only. No code edits in this card except this file.

Frozen product target (do not re-decide): keep `NG`; remove `WG`; replace `GAME` with `IN`; add `PH` and `SF`; bind options to the selected theme; delete check/review UX; constrain illegal combinations so required entries cannot disappear.

## 1. Theme keys today

Canonical keys: **`NG`**, **`WG`**, **`GAME`**. There is no `PH` / `IN` / `SF` symbol in the runtime.

| Surface | Symbol | File | What it lists |
| --- | --- | --- | --- |
| Resolver theme enum | `THEMES` | `customize-core.js` L11 | `["NG", "WG", "GAME"]` |
| Catalog object `theme` | `CATALOG[0].options` | `customize-core.js` L153–171 | same three keys; `support` all `true`; `defaults` identity map |
| Theme defaults blob | `THEME_DEFAULTS` | `customize-core.js` L114–151 | per-theme functional defaults |
| Bottom-nav slot counts | `THEME_NAV_COUNTS` | `customize-core.js` L30 | `{ NG: 5, WG: 4, GAME: 3 }` |
| Bottom-nav presets | `THEME_NAV_DEFAULTS` | `customize-core.js` L31–41 | NG = `LIVE_NAV` (5); WG 4-slot; GAME 3-slot |
| Studio theme picker | `themePanel()` | `customize-studio.js` L338–371 | hardcoded `["NG", "WG", "GAME"]` |
| Studio player policy | `themePanel()` allow-theme | `customize-studio.js` L404–450 | same three keys |
| Studio labels | `themeName(n)` | `customize-studio.js` L15–18 | `NG` →「完整 Figma 设计」; **WG and GAME share**「既有原型 · 设计待补」 |
| Hidden `<select>` | `#theme-select` | `index.html` L78; filled by `THEMES` in `customize-core.js` L4484–4487 | still the source of `switchTheme` via change handler L4552 |
| Color allowlists | `NGDesign.themeColors` | `ng-design-catalog.js` L246–250 | see §1.1 |
| Player policy seed | `NGDesign.defaultPolicy()` | `ng-design-catalog.js` L281–287 | `themes: ["NG"]` plus WG/GAME color defaults |
| Player preview gate | `NGDesign.themeColors[e.data.config.theme]` | `player-preview.js` L71 | unknown theme rejected |
| Player DOM | `this.root.dataset.theme = c.theme` | `player-components.js` `Player.current`/`render` L1683–1716 | WG/GAME swap nav + reset styles |
| Player CSS | `.ng-player[data-theme="WG"\|"GAME"]` | `player-components.css` L1665–1670 | header chrome only |
| Studio art CSS | `.theme-WG`, `.theme-GAME` | `customize-studio.css` L563–582 | **no `.theme-NG`** — NG uses default `.studio-theme-art` |
| Hub `index.html` | — | repo root `index.html` L285, L399 | links only; **no theme keys** |

`switchTheme(theme)` (`customize-core.js` L1953) writes `state.theme`, rebuilds via `inheritDraft(theme)`, then **keeps previous SET/OFF rows** across theme change (except `theme` / `downloadFAB` / `brandMark`). `inheritDraft` (`customize-core.js` L1863) indexes `THEME_DEFAULTS[theme]`.

### 1.1 Colors (`NGDesign.palettes` + `themeColors`)

`ng-design-catalog.js` L174–250.

| Palette id | `source` | Meaning |
| --- | --- | --- |
| `BDOK` | true | NG 绿黑 `#75eb92` |
| `橙白` | true | NG Figma orange `#f48d16` |
| `藍白` | true | NG Figma blue `#4781ff` (`palette()` also accepts `蓝白`) |
| `BDAK` | false | WG-ish purple; labeled legacy in studio |
| `BDLKK` | false | GAME-ish gold; labeled legacy in studio |

```
themeColors.NG   = ["BDOK", "橙白", "藍白", "BDAK", "BDLKK"]
themeColors.WG   = ["BDAK", "BDOK", "BDLKK"]
themeColors.GAME = ["BDLKK", "BDOK", "BDAK"]
```

`defaultPolicy()`:

```
themes: ["NG"]
colors:   { NG: ["BDOK","橙白","藍白"], WG: ["BDAK"], GAME: ["BDLKK"] }
defaults: { NG: "BDOK", WG: "BDAK", GAME: "BDLKK" }
```

Studio `themePanel()` splits `D.themeColors[s().theme]` into `palette(n).source` (main) vs legacy details. Player settings UI is `player-components.js` `playerChoice` (L1878) + `[data-player-theme]` (L1473). Checks 40–41 (`customize-checks.js`) assert WG lock / WG default `BDAK`.

### 1.2 NG-only player chrome

`player-components.js`:

- `brand(c)` L253 — `c.theme === "NG"` uses asset logo; else text `{theme} LOGO`
- `bottom(c)` L1122 — NG delegates to `NGPageComponents.bottom`
- page body L1191 — NG delegates to `NGPageComponents.render`
- `Player.current()` L1696 — if player-selected theme ≠ site theme, WG nav = `["首页","活动","钱包","账户"]`, GAME nav = `["首页","钱包","账户"]`, else keep `config.nav`; all home `styles` reset to `1`

`ng-page-designs.js` `validateDraft` wrap L119–132: page-family `extra.design` is valid only if `sourceTheme === "NG"`.

---

## 2. Two option models (not already theme-bound)

Runtime has **two parallel catalogs**. Binding “every component option to the selected theme” must touch both.

### 2.1 Functional catalog — `CATALOG` in `customize-core.js`

Built at L153–703, then `NGDesign.extendCatalog(CATALOG, THEME_DEFAULTS)` at L705 (after `current-config.js` has wrapped `extendCatalog`). Check 31 asserts **`CATALOG.length === 28`**. Semantic ids: `SEMANTIC_IDS` L711–740.

`theme` is **hidden from the left tree** (`customize-studio.js` `tree()` L246–250 and check 31). It is edited only in `themePanel()` / `#theme-select`.

Per-item `support` is `{NG, WG, GAME}` with values `true | "open" | false`. `supportOf(item, theme)` (`customize-core.js` L2057) prefers `item.prototypeSupport[theme]` (today only `alternateButton.prototypeSupport = { NG: true }` from `current-config.js` L169).

`sourceThemeSelectable: true` means the **legacy detail editor** still offers a “来源主题（混合主题演示）” row over `THEMES` (`customize-core.js` L3356). Cross-theme SET → Warn (R0/R1) or Review (R2) via `isCrossTheme` L2061.

**Already theme-scoped (have `themeOptions`):** resolver Auto-resolves / Blocks if SET value ∉ `themeOptions[state.theme]` (`resolveAll` L2437). **Studio option buttons do not read `themeOptions`** — `renderLegacyDetail` uses `item.options.slice()` (L3301). So the UI still shows the **union** list; scoping is post-hoc in the resolver.

| id | `themeOptions` today | `options` (union / after extend) | Theme-scoped in UI? |
| --- | --- | --- | --- |
| `themeColor` | set in `extendCatalog` = `themeColors` | union `["BDOK","BDAK","BDLKK","橙白","藍白"]`; studio uses `themeColors[theme]` | **yes** (studio color grid) |
| `carouselStyle` | NG 3, WG 2, GAME 2 Axure labels | `["通用Banner","小Banner","轮播Banner"]` | **no** (legacy buttons = union). Visual family is separate (§2.2) |
| `footerStyle` | NG overwritten to 4 `样式N` by `current-config.js` L167; WG/GAME still 2–3 Axure labels | `D.names.slice(0,4)` | **no** |
| `profileLayout` | NG 5 / WG 3 / GAME 3 Axure labels | 5 labels | **no**; visual family is Figma titles |
| `authVisual` | NG both, WG `简洁框` only, GAME `插画框` only | `["简洁框","插画框"]` | **no** |
| `buttonStyle` | NG 4 / WG 2 / GAME 2 | 4 labels | **no** |
| `gameIconStyle` | NG both, WG `标准`, GAME `极简` | `["标准","极简"]` | **no** |

**Not theme-scoped (shared `options`, only `defaults[theme]`):**

`theme`, `categoryButtons`, `topStatusBar` (per-auth), `sidebar`, `shortcuts`, `gameLayout`, `gameGridStyle` (injected), `searchPagination`, `topDownloadBar`, `downloadFAB` (derived), `depositPage`, `recordsDisplay`, `amountAutoInput`, `vipCard`, `vipPage`, `inbox`, `userVerification`, `bottomNav` (slot count is theme-scoped; **choices** are `NGCurrent.nav` 19 entries), `popupStyle`, `alternateButton`, `brandMark` (FIXED).

`gameLayout` / `gameGridStyle` `options` are rewritten to `D.names.slice(0, families[id].titles.length)` (`current-config.js` L157) — so they track **visual family length**, still not per-theme.

### 2.2 Visual families — `NGDesign.families` + `NGDesign.pageFamilies`

Home (`ng-design-catalog.js` `families`, L5–173). Page (`ng-page-designs.js` `pageFamilies`, L17–116) plus `footerStyle` / `popupStyle` injected by `current-config.js` L90–114. `D.allFamilies()` = merge (`ng-page-designs.js` L117).

Studio style grid (`customize-studio.js` `detail` ~L550–659) maps **`f.titles` in full** for the selected component. Count badge = `f.titles.length`. **No theme filter.** Non-NG themes get a note:「此 Figma 文件仅定义 NG。{theme} 暂使用既有原型设置。」(L540).

`NGDesign.styleNumber(id, draft, theme)` (`ng-design-catalog.js` L273): `gameLayout`/`gameGridStyle` from `names.indexOf(draft.value)+1`; others from `draft.extra.design` only if `mode === "SET"` **and** `sourceTheme === theme`, else `1`. `current-config.js` L149 wraps this for footer/popup without `extra.design`.

After `current-config.js` `add()` (appends “现行” styles; sets `currentStart`):

| family id | `key` | origin titles | + current | `currentStart` |
| --- | --- | --- | --- | --- |
| `gameLayout` | `category` | 5 Figma | +5 | 5 |
| `topStatusBar` | `header` | 5 | 0 | — |
| `sidebar` | `sidebar` | 5 | 0 | — |
| `shortcuts` | `shortcuts` | 4 | 0 | — |
| `gameGridStyle` | `grid` | 3 | +1 | 3 |
| `searchPagination` | `search` | 6 | 0 | — |
| `carouselStyle` | `carousel` | 5 | +3 | 5 |
| `topDownloadBar` | `download` | 4 | 0 | — |
| `authVisual` | `auth` | 4 | 0 | — |
| `depositPage` | `deposit` | 3 | 0 | — |
| `profileLayout` | `profile` | 3 | +4 | 3 |
| `vipPage` | `vip` | 3 | 0 | — |
| `inbox` | `inbox` | 3 | 0 | — |
| `bottomNav` | `bottom` | 5 | +4 | 5 |
| `footerStyle` | `footer` | 4 current-only | 0 | 0 |
| `popupStyle` | `popup` | 3 current-only | 0 | 0 |

`NGCurrent.homeCompositions` (`current-config.js` L222): 5 named home compositions; check 62.

**Implication for P2:** NG visual lists are the “existing set”. PH/IN/SF “one option per component” is **not modeled**. WG/GAME have functional `defaults` + partial `themeOptions`, but they still see the **full NG Figma style grid**.

### 2.3 Studio tree groups (`customize-studio.js` `tree` L253–296)

1. FOUNDATION — `themeColor` (theme picker lives in that panel)
2. HOME — `topStatusBar`, `topDownloadBar`, `carouselStyle`, `gameLayout`, `gameGridStyle`, `searchPagination`, `footerStyle`
3. PAGE — `authVisual`, `depositPage`, `profileLayout`, `vipPage`, `inbox`, `popupStyle`
4. NAVIGATION & ENTRIES — `bottomNav`, `sidebar`, `shortcuts`, `alternateButton`
5. MORE — `recordsDisplay`, `amountAutoInput`, `vipCard`, `userVerification`, `buttonStyle`, `gameIconStyle`

Hidden from tree: `theme`, `brandMark`, `downloadFAB`.

---

## 3. Check / review pipeline and “entry missing”

Three different “review/check” surfaces exist. Packet item 2 (“remove the check / review function”) maps to **A + the checks half of C**. Packet item 3 (“constrain instead of review”) maps to **B’s reachability Blocks**. Diff/save confirm (D) is a separate studio UX; packet does not name it.

### A. Regression checks (delete target)

| Piece | Symbol / selector | File |
| --- | --- | --- |
| Script | `window.NGChecks` | `customize-checks.js` (entire file; checks **37–65**) |
| Runner | `runChecks()` | `customize-core.js` L3923 |
| Inner `check(name, fn)` | L3927 | snapshots state, restores after each |
| Core checks | `"1. live NG default"` … `"36. new preview surfaces are represented"` | `customize-core.js` L3940–4323 |
| Extension hook | `window.NGChecks(check, {state, loadScene, switchTheme, …})` | L4324 |
| Drawer UI | `#checks-drawer`, `els.checks` | `index.html` L274–281; `customize-core.js` L2001, L4345 |
| Open button | `data-action="open-checks"` | `index.html` L153; handler L4760 |
| ZH names | `CHECK_NAMES_ZH` | `customize-core.js` L3870 |
| Player harness | `NGStudio.testPlayer(fn)` | `customize-studio.js` L1910 |

WG/GAME-specific checks: 40–41 (WG policy), 7–10 / scenes `warn-cross-r0`, `review-cross-r2`, `auto-safe`, `block-unsafe`, `block-theme-count` (WG 4-slot, GAME unsupported).

### B. Resolver validation (keep engine; packet wants **constraints instead of after-the-fact Block**)

`resolveAll()` (`customize-core.js` L2371) → items with outcomes `Allow | Warn | Auto-resolve | Review | Block`.

`canApply` (L2906) = `blockCount === 0` && no pending Auto-resolve ack && no pending Review ack && `!state.ui.invalidApplied`.

UI: `#validation-pane` (`index.html` L107, `data-name="配置检查"`), `renderValidation` L3459. Save disabled when `!canApply`. Acks: `state.acks.auto` / `state.acks.review`.

`NGDesign.validateDraft` chain: catalog (`ng-design-catalog.js` L333) → page families (`ng-page-designs.js` L119) → nav/download (`current-config.js` L175). Errors become Blocks in `resolveAll` L2846.

### C. Demo scenes (dev toolbox)

`loadScene(name)` (`customize-core.js` L3720) + `#scene-select` (`index.html` L164). Scene table L4489–4511. WG/GAME scenes: `auto-safe` / `block-unsafe` call `switchTheme("GAME")`; `block-theme-count` calls `switchTheme("WG")`; `warn-cross-r0` / `review-cross-r2` SET `sourceTheme: "WG"`.

### D. Diff / publish confirm (not the check runner)

`#diff-drawer`, `data-action="open-diff"`, `NGStudio.diff` / `confirmSave` (`customize-studio.js` ~L1376, “配置差异对比审阅” / “发布前确认”). Uses review-thumb helpers. Packet does not say to delete this.

### What “entry missing” means today

There is **no** string `entry missing`. The product meaning is **a required capability has zero visible operable surface**, or a SET that omits the required target.

1. **Protected-capability reachability (primary).** `CAPABILITIES` (`customize-core.js` L43–59) × `capabilityMap(values, preview)` (L2206). After flatten, `resolveAll` L2792–2809: if `!caps[name].ok` for loggedOut or loggedIn → Block on `bottomNav`:

   `受保护能力「{name}」在{登入前|登入後}无可见可操作表面（深链/toast 不计）。`

   Surfaces include bottom nav, shortcuts, sidebar, header, alternate button, VIP card, download bar/FAB. `OBJECT_CAPABILITY` (L71) maps catalog ids → capability names for upstream-off simulation.

2. **Install entry unreachable.** If `topDownloadBar !== "开启"` and `capabilityAvailable("App download")` → Block on `topDownloadBar` (L2748): 「安装入口不可达」. `downloadFAB` is `derivedFrom: "topDownloadBar"` (catalog L322); OFF hides both bar and FAB (check 50).

3. **VIP card hide without VIP host.** `vipCard === "隐藏VIP资讯"` and no VIP nav/alt (L2728) → Block. Account/Me is **not** an accepted VIP replacement.

4. **Alternate SET missing target.** Scene `block-alt-missing` (L3804) / UI label「Block · 替代按钮缺少能力」. Check 17: SET with `target: ""` Blocks (`/明确选择/`). Editor placeholder `（请选择已声明能力）` (`customize-core.js` L3239). This is **incomplete spec**, not a missing chrome entry.

5. **Host conflicts that drop an entry.** Sidebar-host (`shortcuts === "侧边栏内"` + sidebar OFF); compact header + `状态列按钮` (withdrawal shortcut hidden). Checks 2–4.

**Today the studio still offers the illegal combination; the resolver Blocks save.** Packet UX 3: disable/hide the combination instead. Constraint candidates (for P2): `topDownloadBar` OFF while App download on; `vipCard` hide without VIP slot; `shortcuts` host vs sidebar/header; compact header vs header-hosted alternate; bottom-nav edits that zero a `CAPABILITIES` surface; `alternateButton` SET without target/slot.

`#capability-select` / `#install-select` (`index.html` L189–205) are **preview simulations**, not tenant config.

---

## 4. Files that must change (P3 checklist)

Ownership remains `backoffice/personalization/**`. Hub `index.html` has no theme labels — **no hub edit**.

### 4.1 Remove WG; GAME → IN; add PH, SF

Must list NG/PH/IN/SF only (packet UX 4).

| File | Symbols |
| --- | --- |
| `customize-core.js` | `THEMES`, `THEME_NAV_COUNTS`, `THEME_NAV_DEFAULTS`, `THEME_DEFAULTS`, `CATALOG` (`options`/`support`/`defaults`/`themeOptions`/`safeFallback` GAME→NG), `ZH_TO_EN` WG/GAME copy, `switchTheme`, `inheritDraft`, `themeDefaultFor`, source-theme buttons over `THEMES`, `loadScene` GAME/WG scenes, checks 7–10/24/34, `#theme-select` fill |
| `customize-studio.js` | `themePanel` arrays L356 and L404; `themeName()` (need PH/IN/SF labels: 菲律宾 / 印度 / 星空) |
| `customize-studio.css` | `.theme-WG` / `.theme-GAME`; add `.theme-PH` `.theme-IN` `.theme-SF`; 3-col `.studio-themes` → 4 |
| `ng-design-catalog.js` | `themeColors`, `palettes` (new PH/IN/SF colors — **blocked on P1 Figma harvest**), `defaultPolicy`, `extendCatalog` `support` maps, `validateDraft` `themeColors[v.sourceTheme]` |
| `ng-page-designs.js` | `validateDraft` `sourceTheme !== "NG"` — must accept PH/IN/SF designs |
| `current-config.js` | `themeOptions.NG` rewrite L167; `prototypeSupport` |
| `player-components.js` | `brand`, `bottom`, `Player.current` WG/GAME nav, `playerChoice` policy |
| `player-components.css` | `[data-theme="WG"|"GAME"]` |
| `player-preview.js` | `themeColors` gate; default `theme: "NG"` stays |
| `customize-checks.js` | WG policy tests 40–41; GAME scenes if file kept |
| `player-pages.js` | default `theme: "NG"` only (L416) — likely no key rename |

### 4.2 Bind options to theme (no cross-theme lists)

| File | Gap |
| --- | --- |
| `customize-studio.js` | style grid uses full `f.titles`; must filter by selected theme; drop “混合主题” if P2 kills `sourceThemeSelectable` |
| `customize-core.js` | `renderLegacyDetail` uses `item.options` not `themeOptions`; `sourceThemeSelectable` UI L3356; `isCrossTheme` Warn/Review |
| `ng-design-catalog.js` | families have **no** per-theme title lists |
| `ng-page-designs.js` | pageFamilies NG-only validation |
| Catalog `themeOptions` | only 7 ids; most components are union lists + `defaults` |

PH/IN/SF start with **one option per component** (packet). Catalog must stay theme-keyed so later extras do not leak across themes.

### 4.3 Delete checks / review runner

| File | Action |
| --- | --- |
| `customize-checks.js` | delete (or stop loading) |
| `index.html` | remove `data-action="open-checks"`, `#checks-drawer`, script tag; decide whether `#scene-select` / `#validation-pane` stay |
| `customize-core.js` | delete `runChecks`, `CHECK_NAMES_ZH`, `els.checks`, `state.ui.checks`, `NGChecks` call, open-checks handler; optionally `loadScene` if scenes die with checks |
| `customize-studio.js` | `testPlayer` only used by checks — removable with A |

**Do not confuse with** `#validation-pane` / `renderValidation` (resolver) or `#diff-drawer` (diff). Replacing reachability **Blocks** with control constraints is P2/P3 product work on `resolveAll` + studio editors, not just deleting `NGChecks`.

### 4.4 Constrain required entries (replaces B reachability Blocks)

| File | Functions |
| --- | --- |
| `customize-core.js` | `capabilityMap`, `csHosts`, `withdrawalShortcutVisible`, `shortcutHosts`, `effectiveNav`, `resolveAll` issue `add()` L2680–2809 |
| `customize-studio.js` | visibility switch, bottom-nav editor, `themePanel`, style/off controls |
| `player-components.js` | `addons` download FAB L241; `alternate`; header compact |

### 4.5 Migration of existing GAME/WG drafts

No persistence beyond session / exported JSON. In-memory: `state.theme`, `draft.*.sourceTheme`, `draft.theme.extra.playerChoices.themes|colors|defaults`. `switchTheme` keeps SET/OFF across keys — GAME SET rows would otherwise survive as `IN` if only the enum is renamed. P2 must specify: drop WG drafts; map GAME → IN or drop.

---

## 5. Hotspots and `index.html` load order

Packet hotspots (confirmed): `customize-core.js`, `customize-studio.js`, `ng-design-catalog.js`. Additional collision files: `current-config.js` (wraps catalog/validate), `ng-page-designs.js` (pageFamilies + NG-only sourceTheme), `player-components.js` / `.css` (WG/GAME chrome), `index.html` (script order + check DOM).

CSS (head, `?v=controls-20260909-13`):

1. `customize-base.css`
2. `player-components.css`
3. `player-pages.css`
4. `customize-studio.css`
5. `current-config.css`

JS (body end, same cache-bust):

1. `ng-assets.js` — NG asset URLs
2. `ng-design-catalog.js` — `window.NGDesign` (`families`, `themeColors`, `defaultPolicy`, `extendCatalog`, `validateDraft`)
3. `ng-page-designs.js` — `NGDesign.pageFamilies`, wraps `validateDraft` (NG-only)
4. `current-config.js` — `window.NGCurrent`; appends 现行 styles; wraps `extendCatalog` / `validateDraft` / `styleNumber`
5. `player-components.js` — `window.NGPlayer`
6. `player-pages.js` — `window.NGPageComponents`
7. `current-player.js` — current-admin preview bits
8. `customize-studio.js` — `window.NGStudio` (attach on core boot)
9. `customize-checks.js` — `window.NGChecks` (must precede core)
10. `customize-core.js` — IIFE: `CATALOG`, `extendCatalog`, `resolveAll`, `runChecks`, `NGStudio.attach`

`customize-core.js` **must stay last**: it calls `NGDesign.extendCatalog` after the current-config wrap and invokes `NGChecks` at check-run time.

---

## 6. Exact CATALOG ids (28)

`theme`, `themeColor`, `categoryButtons`, `topStatusBar`, `sidebar`, `shortcuts`, `gameLayout`, `gameGridStyle` (spliced by `extendCatalog`), `searchPagination`, `topDownloadBar`, `downloadFAB`, `depositPage`, `recordsDisplay`, `amountAutoInput`, `vipCard`, `vipPage`, `inbox`, `userVerification`, `bottomNav`, `popupStyle`, `alternateButton`, `carouselStyle`, `footerStyle`, `profileLayout`, `authVisual`, `brandMark`, `buttonStyle`, `gameIconStyle`.

---

## 7. Evidence notes for P2

- Theme keys are **hardcoded in at least five JS literals** plus CSS, not a single registry. Adding PH/IN/SF by only editing `THEMES` will miss `themePanel`, `themeColors`, `defaultPolicy`, player nav, and CSS art.
- “Theme-scoped options” exist only as resolver `themeOptions` + color allowlists. Visual style grids and most functional radios are **cross-theme unions**.
- Page visual variants are **NG-only** (`sourceTheme === "NG"`). WG/GAME never persist a page-family design of their own.
- Checks 37–65 live in `customize-checks.js`; 1–36 in `customize-core.js` `runChecks`. Both write the same `#checks-drawer`.
- Hub `index.html` does not name NG/WG/GAME.
