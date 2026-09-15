# Figma Theme Harvest — PH / IN / SF (CUST-P1C grok Figma MCP)

Task: CUST-P1C grok Figma MCP harvest PH / IN / SF (`t_5f6623c7`)
Workspace: `C:/Users/NGSS/Documents/ngss3BOPs`
Git branch: `dev/customize-theme-refine` (no checkout of `main`, no commit, no push)
Date: 2026-09-10
Profile: grok-worker | Grok 4.6
Mode: read-from-Figma only. No `use_figma`. No canvas writes. No JS/CSS.

References:
- `backoffice/personalization/THEME-REFINE-PACKET.md`
- `backoffice/personalization/THEME-REFINE-INVENTORY.md` §6 (28 CATALOG ids)

Skill prerequisite: MCP resource `skill://figma/figma-design-to-code/SKILL.md` loaded before `get_design_context`. `skillNames=resource:figma-design-to-code`.

---

## 1. MCP identity and tool matrix

### 1.1 Auth (`mcp__figma__whoami`) — exempt from rate limits

```text
handle: Dazhen PM
email:  pm@dz21.co
plans:
  - 大真有限公司Dazhen's team  seat=Full  tier=pro  team::1497438469099845343
  - NG项目                     seat=View  tier=pro  team::1529095317361261300
  - NGSS                       seat=View  tier=pro  team::1567121240659444342
```

Figma MCP docs (`file://figma/docs/rate-limits-access.md`): Professional **View** seat = **up to 6 tool calls / month**. Full seat = 200/day.

### 1.2 Tool execution

| Theme | File key | Node | Tool | Result | Status |
| --- | --- | --- | --- | --- | --- |
| PH | `DnNve2QZ22LEFCqDWuuAMl` | `873:153335` | `get_variable_defs` | 56 variables; `mcpRequestId=4b82c6ce-b81a-4167-a9d1-43540174b7e0` | OK |
| PH | same | same | `get_design_context` (twice; 2nd with `excludeScreenshot=true`) | View-seat monthly cap (quoted in §2.1) | FAILED |
| IN | `XrzIsJfYarVffSI34zIwC4` | `2078:305348` | `get_variable_defs` (twice) | View-seat monthly cap (quoted in §2.2) | FAILED |
| IN | same | same | `get_design_context` | not called (same team cap already exhausted) | SKIPPED |
| SF | `wHQsrb1CATZNliip44FdNf` | `20:3700` | `get_variable_defs` | 5 variables; `mcpRequestId=56ef7afc-1ff0-4287-8220-e78e142cc975` | OK |
| SF | same | same | `get_design_context` `skillNames=resource:figma-design-to-code` | sparse XML metadata for section `首页`; no hex in XML | OK (sparse) |
| — | — | — | `get_screenshot` | not used (not the color source; SF mapping from layer names; PH would hit the same View cap) | SKIPPED |
| — | — | — | `use_figma` | forbidden by packet | SKIPPED |

Exact View-seat error (PH `get_design_context`, IN `get_variable_defs`):

```text
You've reached the Figma MCP tool call limit for your View seat on the Professional plan. Upgrade your seat or plan for more tool calls: https://www.figma.com/files/1529095317361261300/recents-and-sharing?upgrade_request_type=expert&entry_point=mcp_rate_limit_deeplink
```

Team `1529095317361261300` = **NG项目** (View). PH file reads after the first `get_variable_defs` and the IN file both billed that View bucket. SF file did not.

---

## 2. MCP-returned tokens

Rule: only MCP hex/tokens. If MCP cannot read a file, that theme’s hex section is **blank** and the raw error is quoted. No Tailwind guesses. `#8b5cf6` is **not** in any MCP payload.

### 2.1 PH — 菲律宾 / Philippines (JLJL4) — tokens OK

- URL: https://www.figma.com/design/DnNve2QZ22LEFCqDWuuAMl/JLJL4配色菲律賓板?node-id=873-153335
- File key: `DnNve2QZ22LEFCqDWuuAMl`
- Node: `873:153335`
- Harvest: **OK** (`get_variable_defs`). Structure: **BLANK** (`get_design_context` View-cap).

Default color for P2 (MCP primary): **`Basic/Primary_Pink/50` = `#ff0055`**.
Canvas/page background: **`Backgrounds/Primary` = `#ffffff`**.
Gold accent: **`Basic/Secendary_gold/50` = `#f79908`**, **`Basic/Secendary_gold/60` = `#fcc136`**.
Dark: **`Basic/Primary_Pink/10` = `#330011`**, **`Main Color/main7` = `#201330`**.

Empty MCP values (kept empty, not invented): `Primary_yellow` = `""`; `Primary_Pink_overlay` = `""`.

#### Color variables

| Token | Hex |
| --- | --- |
| `Basic/Primary_Pink/10` | `#330011` |
| `Basic/Primary_Pink/10 0%` | `#33001100` |
| `Basic/Primary_Pink/10 45%` | `#33001173` |
| `Basic/Primary_Pink/10 90%` | `#330011e5` |
| `Basic/Primary_Pink/20` | `#660021` |
| `Basic/Primary_Pink/30` | `#9b002e` |
| `Basic/Primary_Pink/40` | `#cc0044` |
| `Basic/Primary_Pink/50` | `#ff0055` |
| `Basic/Primary_Pink/50 0%` | `#ff005500` |
| `Basic/Primary_Pink/60` | `#ff3377` |
| `Basic/Primary_Pink/60 35%` | `#ff337759` |
| `Basic/Primary_Pink/70` | `#ff6699` |
| `Basic/Primary_Pink/80` | `#ff99bb` |
| `Basic/Primary_Pink/90` | `#ffccdd` |
| `Basic/Primary_Red/10` | `#330009` |
| `Basic/Secendary_gold/15` | `#4a2e02` |
| `Basic/Secendary_gold/30` | `#945c05` |
| `Basic/Secendary_gold/50` | `#f79908` |
| `Basic/Secendary_gold/60` | `#fcc136` |
| `Basic/Secendary_gold/70` | `#fdd880` |
| `Basic/neutral-black/neutral-black-10` | `#0000001a` |
| `Basic/neutral-black/neutral-black-20` | `#00000033` |
| `Basic/neutral-black/neutral-black-40` | `#00000066` |
| `Basic/neutral-black/neutral-black-60` | `#00000099` |
| `Basic/neutral-white/neutral-white-10` | `#ffffff1a` |
| `Basic/neutral-white/neutral-white-20` | `#ffffff33` |
| `Basic/neutral-white/neutral-white-40` | `#ffffff66` |
| `Basic/neutral-white/neutral-white-60` | `#ffffff99` |
| `Basic/neutral-white/neutral-white-80` | `#ffffffcc` |
| `Basic/neutral-white/neutral-white-100` | `#ffffff` |
| `Basic/neutral/neutral-100` | `#ffffff` |
| `Backgrounds/Primary` | `#ffffff` |
| `Sub Color/White` | `#FFFFFF` |
| `index/phone-header-content` | `#ffffff` |
| `index/txt` | `#ffffff` |
| `Main Color/main7` | `#201330` |
| `promotion tag/corner` | `#1d3b7c` |
| `promotion tag/0%` | `#4c81b2` |
| `promotion tag/4%` | `#285b9f` |
| `promotion tag/80%` | `#2e68c0` |
| `promotion tag/100%` | `#6184b9` |

#### Type / size / effect (MCP)

| Token | Value |
| --- | --- |
| `Paragraph/Medium M` | Font family Roboto, Medium, size 16, weight 500, lineHeight 100 |
| `Paragraph/Small` | Font family Roboto, Regular, size `size/12`, weight 400, lineHeight 100 |
| `Paragraph/Small M 14` | Font family Roboto, Medium, size `size/14`, weight 500, lineHeight 100 |
| `size/4` | 4 |
| `size/8` | 8 |
| `size/12` | 12 |
| `size/14` | 14 |
| `size/16` | 16 |
| `size/120` | 120 |
| `corner/s` | 8 |
| `corner/m` | 12 |
| `corner/full` | 120 |
| `share-icon_shadow` | DROP_SHADOW color `#27000059` offset (0, 8) radius 8 spread 0 |
| `Blur Bar Top` | BACKGROUND_BLUR radius 16 |

Suggested P2 palette id (not a Figma variable name): mint a new `themeColors.PH` entry bound to `#ff0055`. Do not reuse `BDOK` / `BDAK` / `BDLKK`.

### 2.2 IN — 印度 / India (replaces GAME) — BLANK

- URL: https://www.figma.com/design/XrzIsJfYarVffSI34zIwC4/NGSS-印度游戏版?node-id=2078-305348
- File key: `XrzIsJfYarVffSI34zIwC4`
- Node: `2078:305348`
- Harvest: **BLANK** (MCP could not read the file)

Raw MCP error:

```text
You've reached the Figma MCP tool call limit for your View seat on the Professional plan. Upgrade your seat or plan for more tool calls: https://www.figma.com/files/1529095317361261300/recents-and-sharing?upgrade_request_type=expert&entry_point=mcp_rate_limit_deeplink
```

Tokens: *(blank)*

Hex: *(blank)*

Do not fill India colors until a later card retries MCP against a Full/Dev seat or after the View monthly quota resets.

### 2.3 SF — 星空 / Starfield — tokens OK

- URL: https://www.figma.com/design/wHQsrb1CATZNliip44FdNf/NGSS3-星空版?node-id=20-3700
- File key: `wHQsrb1CATZNliip44FdNf`
- Node: `20:3700` name=`首页` (section, 3534×1849)
- Harvest: **OK** (`get_variable_defs` + sparse `get_design_context`)

Default color for P2 (MCP primary): **`Primary Purple/Purple 50` = `#7e00fd`**.
Accent: **`Primary Pink/Pink 50` = `#e100ff`**.
Gray: **`Gray/gray` = `#c8c5d8`**.
White: **`Neutral white/white 100%` = `#ffffff`**.
`紫色渐变` = `""` (empty MCP value; do not invent a gradient).

`#8b5cf6` was **not** returned.

| Token | Hex |
| --- | --- |
| `Primary Purple/Purple 50` | `#7e00fd` |
| `Primary Pink/Pink 50` | `#e100ff` |
| `Gray/gray` | `#c8c5d8` |
| `Neutral white/white 100%` | `#ffffff` |
| `紫色渐变` | *(empty)* |

Sparse `get_design_context` XML contained **zero** `#hex` fills (metadata-only). Color source remains `get_variable_defs`.

Phone frames inside node `20:3700`:

| Node | Name | Size |
| --- | --- | --- |
| `20:3701` | 星空版-首页 | 375×1040 |
| `33:653` | 星空版-首页 | 375×812 |
| `30:1256` | 星空版-首页(登录后) | 375×812 |
| `35:11771` | 首页-底部 | 375×1582 |
| `171:11621` | 首页-底部-活动 | 375×812 |
| `417:30266` | 星空版-首页-宝箱 | 375×812 |

---

## 3. One option per CATALOG id (28)

Policy (packet, frozen): NG keeps current sets. PH / IN / SF each get **exactly one** option per id. Options are theme-bound.

Classification:
- **MCP-named** — layer name or variable on the harvested node.
- **Unobserved** — node did not include that surface; single option = NG catalog default so P2 can bind a list of length 1. Not a market guess.
- **Blank** — MCP could not read the file (IN).

PH structure was not retrieved (`get_design_context` View-cap). PH column is MCP-named only for `theme` / `themeColor`; every other PH cell is Unobserved.

IN column is Blank.

| # | id | Label | NG baseline (inventory) | PH (one) | IN (one) | SF (one) | Class | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `theme` | 主题 | `NG` | `PH` | `IN` | `SF` | MCP-named (SF node `星空版-*`; PH/IN keys from packet + PH file read) | Packet enum. SF frames named 星空版-首页. IN file unread. |
| 2 | `themeColor` | 主题颜色 | `BDOK` | `#ff0055` (`Basic/Primary_Pink/50`) | *(blank)* | `#7e00fd` (`Primary Purple/Purple 50`) | MCP-named PH+SF; Blank IN | `get_variable_defs`. P2 should mint `themeColors.PH` / `themeColors.SF` — do not reuse BDAK/BDLKK. |
| 3 | `categoryButtons` | 分类按钮 | `图示+名称` | `图示+名称` Unobserved | *(blank)* | `图示+名称` | SF MCP-named | SF: `中文名` ×56 plus vendor marks CQ9/FG/EP/BG/PP/PG/… |
| 4 | `topStatusBar` | 顶部状态列 | Out `基本功能` / In `全部功能` | same Unobserved | *(blank)* | Out `基本功能` / In `全部功能` | SF MCP-named | Logged-out `20:3701`: `登录` `注册` + logo + `global`. Logged-in frame `30:1256` 星空版-首页(登录后); `dollar-circle` / `add` / `970.8`. |
| 5 | `sidebar` | 侧边栏 | `关闭` | `关闭` Unobserved | *(blank)* | `关闭` | SF MCP-named (absence) | No sidebar/rail frame in section `20:3700`. |
| 6 | `shortcuts` | 快捷按钮 | `浮动并列` | `浮动并列` Unobserved | *(blank)* | `浮动并列` | SF MCP-named | Layer `icon_chat` on home. |
| 7 | `gameLayout` | 游戏排版 | `样式一` | `样式一` Unobserved | *(blank)* | `样式五` (visual family 紧凑分类) | SF MCP-named | `热门` chip + horizontal vendor frames + `更多`. Maps to NG family title 紧凑分类 = catalog `样式五`. |
| 8 | `gameGridStyle` | 游戏区排版 | `样式一` | `样式一` Unobserved | *(blank)* | `样式一` Unobserved-detail | Unobserved which of 双行横滑/主打游戏/可调卡片大小 | Game image masks present; sparse XML does not distinguish grid family. |
| 9 | `searchPagination` | 搜索/分页 | `Open` / `搜索列` | `搜索列` Unobserved | *(blank)* | `搜索列` Unobserved | Unobserved | No search layer name in `20:3700`. |
| 10 | `topDownloadBar` | 顶部下载栏 | `开启` | `开启` Unobserved | *(blank)* | `开启` | SF MCP-named | `Download App1` ×8; `iOS版`; `Android版`. |
| 11 | `downloadFAB` | 下载FAB | 跟随顶部下载栏 | 跟随顶部下载栏 | *(blank)* | 跟随顶部下载栏 | derived | Catalog `derivedFrom: topDownloadBar`. |
| 12 | `depositPage` | 充值页 | `方式优先` | `方式优先` Unobserved | *(blank)* | `方式优先` Unobserved | Unobserved | Harvested node is 首页 only. |
| 13 | `recordsDisplay` | 纪录顯示 | `下拉` | `下拉` Unobserved | *(blank)* | `下拉` Unobserved | Unobserved | Not in node. |
| 14 | `amountAutoInput` | 额度自动输入 | `按钮` | `按钮` Unobserved | *(blank)* | `按钮` Unobserved | Unobserved | Not in node. |
| 15 | `vipCard` | 显示VIP卡片 | `完整卡片` | `完整卡片` Unobserved | *(blank)* | `完整卡片` Unobserved | Unobserved | `VIP` appears as nav/list label, not a profile card variant. |
| 16 | `vipPage` | VIP页 | `表格` | `表格` Unobserved | *(blank)* | `表格` Unobserved | Unobserved | No VIP page frame. |
| 17 | `inbox` | 站内信 | `列表` | `列表` Unobserved | *(blank)* | `列表` Unobserved | Unobserved | Not in node. |
| 18 | `userVerification` | 用户验证 | `列表` | `列表` Unobserved | *(blank)* | `列表` Unobserved | Unobserved | Not in node. |
| 19 | `bottomNav` | 底部导航 | NG 5-slot `LIVE_NAV` | 5-slot Unobserved | *(blank)* | 5-slot `首页` `活动` `VIP` `钱包` `我的` | SF MCP-named | Frames `首页` `活动` `VIP` `钱包` `个人中心`/`我的`. **Not** NG’s 推广/账户 set. |
| 20 | `popupStyle` | 弹窗样式 | `样式一` | `样式一` Unobserved | *(blank)* | `样式一` Unobserved | Unobserved | Not in node. |
| 21 | `alternateButton` | 替代按钮 | `关闭` | `关闭` Unobserved | *(blank)* | `关闭` | SF MCP-named (absence) | No alternate-host layer. |
| 22 | `carouselStyle` | 轮播样式 | `通用Banner` | `通用Banner` Unobserved | *(blank)* | `通用Banner` | SF MCP-named | Home hero `最高奖励` / `$88888` over full-width image `20:3703`. |
| 23 | `footerStyle` | 页尾内容 | `样式一` | `样式一` Unobserved | *(blank)* | `样式一` | SF MCP-named | Frame `35:11771` 首页-底部: `footer_TikTok` `footer_telegram` `footer_WhatsApp` `footer_instagram` `footer_facebook` `footer_YouTube` `游戏合作商` `footer_18`. |
| 24 | `profileLayout` | 个人中心版面 | `样式一` | `样式一` Unobserved | *(blank)* | `样式一` Unobserved | Unobserved | `171:11621` 首页-底部-活动 is an activity list (VIP/任务中心/活动中心/推广信息), not a profile family. |
| 25 | `authVisual` | 登入注册视觉 | `简洁框` | `简洁框` Unobserved | *(blank)* | `简洁框` Unobserved | Unobserved | Only header `登录`/`注册` chips; no login modal in this section. |
| 26 | `brandMark` | 品牌标志 | 固定唯读 | 固定唯读 | *(blank)* | 固定唯读 | MCP-named | Header logo image; catalog is fixed-readonly. |
| 27 | `buttonStyle` | 按钮样式 | `样式一` | `样式一` Unobserved | *(blank)* | `样式一` Unobserved-detail | Unobserved which of 样式一–四 | `登录`/`注册` 50×24 chips; sparse XML has no fill. |
| 28 | `gameIconStyle` | 游戏图标 | `标准` | `标准` Unobserved | *(blank)* | `标准` | SF MCP-named | Full-color vendor marks (PG, CQ9, JILI, …), not 极简. |

### 3.1 Visual families (16) — SF only where MCP-named

1. `gameLayout` → SF `样式五` / 紧凑分类 (MCP). PH Unobserved `样式一`. IN blank.
2. `topStatusBar` → SF Out 基本功能 / In 全部功能 (MCP). PH Unobserved same. IN blank.
3. `sidebar` → SF `关闭` (MCP absence). PH Unobserved `关闭`. IN blank.
4. `shortcuts` → SF `浮动并列` (MCP `icon_chat`). PH Unobserved same. IN blank.
5. `gameGridStyle` → `样式一` Unobserved-detail all themes except IN blank.
6. `searchPagination` → `搜索列` Unobserved. IN blank.
7. `carouselStyle` → SF `通用Banner` (MCP). PH Unobserved same. IN blank.
8. `topDownloadBar` → SF `开启` (MCP). PH Unobserved `开启`. IN blank.
9. `authVisual` → `简洁框` Unobserved. IN blank.
10. `depositPage` → `方式优先` Unobserved. IN blank.
11. `profileLayout` → `样式一` Unobserved. IN blank.
12. `vipPage` → `表格` Unobserved. IN blank.
13. `inbox` → `列表` Unobserved. IN blank.
14. `bottomNav` → SF 5-slot 首页/活动/VIP/钱包/我的 (MCP). PH Unobserved 5-slot. IN blank.
15. `footerStyle` → SF `样式一` (MCP). PH Unobserved same. IN blank.
16. `popupStyle` → `样式一` Unobserved. IN blank.

---

## 4. Downstream (CUST-P2 / CUST-P3)

1. **Colors that may enter `NGDesign.palettes` now:** PH `#ff0055` (+ gold `#f79908` / `#fcc136`, dark `#330011` / `#201330`, bg `#ffffff`); SF `#7e00fd` (+ pink `#e100ff`, gray `#c8c5d8`, white `#ffffff`).
2. **IN colors must stay blank** until MCP is retried on a Full/Dev seat or the NG项目 View monthly quota resets. Do not copy GAME `BDLKK` / `#ffc83b` as a stand-in.
3. **Do not keep `#8b5cf6`.** It was never returned.
4. SF `get_design_context` was sparse section metadata. Implementing pixel-perfect home chrome needs a later `get_design_context` on child ids `20:3701`, `30:1256`, `35:11771` (Full-seat quota).
5. Unobserved cells are NG defaults of length 1 so the catalog can stay theme-keyed. They are not Figma-proven looks.
6. No application JS/CSS was edited in this card.

Working copies of MCP payloads (not the deliverable): `scratch_harvest/ph_variable_defs.json`, `scratch_harvest/sf_variable_defs.json`, `scratch_harvest/sf_design_context.xml`.
