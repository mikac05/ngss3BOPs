# CUST-P3 remaining Figma→page visual (t_5c4cee91 follow-up)

Workspace: `C:/Users/NGSS/Documents/ngss3BOPs`
Branch: `dev/customize-theme-refine` only. Do not checkout or push `main`. No git commit/push. Do not edit NGSS3 KB repo. File ownership: `backoffice/personalization/**` only. Do NOT edit hub `index.html`. Do NOT edit `README.md`.

You already implemented JS theme bind + checks removal in a prior AGY run (gemini-3.8-flash-high). That JS is ON DISK. Do not rewrite working catalog/themeOptions/migrateDraft/constraint logic unless a specific bug blocks the visual.

## Goal
Make the **player preview** for PH and SF a clean, beautiful Figma→webpage. Studio theme picker already shows NG/PH/IN/SF.

Quality bar: Figma→webpage must be clean and beautiful. Exact MCP tokens. One look per PH/IN/SF component. No leftover WG/GAME/check UI.

## Canonical tokens (do not guess)
- PH `PHPINK` primary `#ff0055`. Gold `#f79908` / `#fcc136` / `#fdd880`. Raised `#ffccdd`. Text `#201330`. Muted `#00000066`. onAccent `#ffffff`. BG/Panel `#ffffff`. Pink 10 `#330011`. Radius 8/12/120. Shadow `#27000059` 0 8px 8px. Optional Roboto.
- SF `SFPURPLE` primary `#7e00fd` NOT `#8b5cf6`. Accent2 `#e100ff`. Text `#ffffff`. Muted `#c8c5d8`.
- SF canvas/panel `#0f0c20/#1c1635/#2c2350` are NOT MCP-canonical. Prefer `#7e00fd/#e100ff/#c8c5d8/#ffffff`. Keep dark fills ONLY if needed for a readable starfield page. Flat colors, no unverified gradient (`紫色渐变` was empty).
- IN tokens stay BLANK strings. Do NOT invent India hex. Do NOT copy GAME `BDLKK` / `#efb44e`. Do NOT let IN inherit NG green (`#75eb92`) as if it were India chrome.
- NG palettes stay `BDOK`, `橙白`, `藍白` only.

## Figma MCP — quota
PH file `DnNve2QZ22LEFCqDWuuAMl` and IN file `XrzIsJfYarVffSI34zIwC4` already exhausted **NG项目 View-seat** monthly MCP cap. **Do not** call `get_variable_defs` / `get_design_context` / `get_screenshot` on those files.

Use harvest already in:
- `backoffice/personalization/THEME-REFINE-FIGMA.md`
- `backoffice/personalization/THEME-REFINE-CONTRACT.md`

SF file `wHQsrb1CATZNliip44FdNf` node `20:3700` is on a different team; optional MCP only if you need layout you cannot get from THEME-REFINE-FIGMA.md. Do not burn PH/IN quota.

## Remaining visual work (do this)

1. **PH player** (`player-components.css` + small HTML/CSS in `player-components.js` if needed)
   - White/pink/gold look using only PH tokens.
   - Corner radius 8/12, gold accents on chips/CTAs where NG currently uses accent, drop-shadow on raised cards.
   - Header/nav/category chips/banner/footer should look like a finished light PH lobby, not NG green recolored badly on white.
   - Keep PH structure as length-1 NG defaults (structure unobserved). Beauty comes from tokens + spacing/type/radius, not invented layout.

2. **SF player**
   - Readable dark starfield using `#7e00fd` / `#e100ff` / `#c8c5d8` / `#ffffff` plus dark fills only for contrast.
   - Compact category look (gameLayout `样式五` already bound). Bottom nav `首页/活动/VIP/钱包/我的`.
   - Floating chat / download bar already in defaults; style them so SF does not look like NG-on-purple.

3. **IN player (deferred)**
   - Unstyled placeholder, still readable.
   - `cssVars()` currently emits empty `--p-accent:` etc. for `INPLACEHOLDER`, which can wipe paint. Fix so IN does not apply empty CSS variables (skip empty values) AND does not silently fall back to NG green as “India”.
   - A small “印度(待补) / India (deferred)” badge in the player is OK. No invented brand palette.

4. **Logos**
   - Current PH/SF/IN logos are crude text “PH”/“SF”/“IN”. Keep them simple but typographically clean (letter-spacing, weight, accent color). Do not invent Figma logo SVGs.

5. **Do not regress**
   - Themes enum `["NG","PH","IN","SF"]`
   - PH/IN/SF one option per component
   - No check panel (`customize-checks.js` stub, no `#checks-drawer`)
   - Keep `#validation-pane` and `#diff-drawer`
   - Constraints §5.2 stay
   - `python -m http.server 8765` from repo root still serves `backoffice/personalization/`

## After edits
List changed files. Do not commit or push.
Write `GEMINI_RESULT_P3_VISUAL.md` covering what you changed, residual risk (IN blank, PH structure unobserved, SF page frames sparse).
