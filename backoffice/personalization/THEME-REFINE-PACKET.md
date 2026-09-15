# Customize theme refine — packet v1

Root: Hermes Kanban CUST-THEME-REFINE (2026-09-10)
Quota snapshot: mode=`auto`; gemini/grok/gpt lane-health files absent (no known block)
Workspace: `C:/Users/NGSS/Documents/ngss3BOPs/` (not NGSS3)
Git branch: **`dev/customize-theme-refine`** (created 2026-09-10 from `main` @ `4048f9e`). Do not checkout `main`. Do not merge or push to `main`/`origin/main` (GitHub Pages). Uncommitted refine files stay on this branch so published personalization is untouched.
Ownership: `backoffice/personalization/**` only unless hub `index.html` needs a label change
AGY: `~/.config/hermes-routing/allow-agy-autonomous-writes` exists. Gemini implementation may use `agy-gemini --mode work --effort high --unsafe-auto-approve`. Boot model of `gemini-worker` may be Grok; specialist work still goes through AGY. **AGY already has Figma MCP** — harvest and Figma→page via that connection. Do not require Hermes-profile `mcp install figma` on gemini-worker.

## Product decisions (orchestrator — do not re-decide)

Keep **NG**. Remove **WG**. Replace **GAME** with **India**. Add **Philippines (JLJL4)** and **Starfield (星空)**.

| Theme key | Label (zh / en) | Source | Option policy |
| --- | --- | --- | --- |
| `NG` | NG / NG | existing catalog | keep current NG option sets |
| `PH` | 菲律宾 / Philippines | Figma `DnNve2QZ22LEFCqDWuuAMl` node `873-153335` | **one** color + **one** option per component |
| `IN` | 印度 / India | Figma `XrzIsJfYarVffSI34zIwC4` node `2078-305348` | **one** option per component; **replaces GAME** |
| `SF` | 星空 / Starfield | Figma `wHQsrb1CATZNliip44FdNf` node `20-3700` | **one** option per component |

Future: PH/IN/SF may gain extra options. Catalog must stay theme-bound so extra options can be added later without cross-theme mixing.

## UX decisions (orchestrator)

1. Bind every component option to the selected theme. No cross-theme option lists.
2. **Remove the check / review function** (`customize-checks.js` and studio check UI).
3. Instead of review: **constrain** controls so a setting cannot hide a required entry (download FAB, auth-reachable chrome, etc.). Disable or hide illegal combinations; never leave a dead entry.
4. Tenant theme/color policy UI must list NG, PH, IN, SF only (no WG, no GAME).
5. Prototype-only. Do not claim production. Do not push unless a later card says so.

## Figma URLs

- PH: https://www.figma.com/design/DnNve2QZ22LEFCqDWuuAMl/JLJL4配色菲律賓板?node-id=873-153335
- IN: https://www.figma.com/design/XrzIsJfYarVffSI34zIwC4/NGSS-印度游戏版?node-id=2078-305348
- SF: https://www.figma.com/design/wHQsrb1CATZNliip44FdNf/NGSS3-星空版?node-id=20-3700

If Figma login is required, block `needs_input` — do not guess colors.

## Figma → page quality (user, 2026-09-10)

Use AGY Figma MCP (`get_variable_defs`, `get_design_context`) as the source of hex, type, spacing, and component looks. Browser screenshots are backup only.

P3 must map those tokens into the live studio + player preview **cleanly and beautifully**: one coherent look per PH/IN/SF theme, no leftover WG/GAME chrome, no check drawer, no mismatched NG assets on the new themes. Read-only Figma (no `use_figma` writes).

## Non-goals

- Production backend, Jira, Confluence, Customize frozen KB HTML under NGSS3 `docs/04_customize/`
- Adding extra options for PH/IN/SF now
- Changing player business rules, wallet, permissions
- Git commit/push unless explicitly authorized on a later card

## Graph

1. Inventory current NG/WG/GAME + checks (Grok)
2. Harvest three Figma themes (Gemini/AGY + browser)
3. Contract JSON/spec (Gemini, gated on 1+2)
4. Implement (Gemini, gated on 3)
5. Review (Grok reviewer, gated on 4)

Retry: once for transient. Do not escalate to GPT. File hotspot: `customize-core.js`, `customize-studio.js`, `ng-design-catalog.js`.
