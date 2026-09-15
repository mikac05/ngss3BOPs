# Source home themes — 2026-09-10

**Prototype-only.** Latest user instructions supersede the PH/IN/SF placeholder and deferred sections of `THEME-REFINE-CONTRACT.md`.

- Active branch: `dev/customize-theme-refine`. Existing uncommitted refinement work retained. No commit, push, or publication performed for this request.
- PH uses `client/crimson-home/`, recreated from `index_short.svg` / `index_all.svg`.
- IN and SF use `client/source-themes/`, recreated from the five supplied SVGs. Local asset manifests record their source files and SHA-256 hashes.
- Homepage previews are routed by `player-preview.js`; other pages retain the existing theme-colored prototype components. The supplied files specify homepages only.
- SF banner changes, activity-dock expansion, logged-in header, and sticky categories are interaction/scroll states of the same style, not additional component choices.

## Operator behavior

- PH, IN, SF each have one palette and one theme-local visual variant per component. NG retains its existing variants.
- Changing the site theme loads its defaults. Matching labels do not authorize carrying visual overrides between themes.
- The former configuration-check dock is removed. Invalid choices are disabled with a reason; a transaction guard rejects invalid drafts before rendering. The internal resolver still protects saving.
- Protected entries are evaluated in both authentication states. Navigation, sidebar/shortcut hosts, download availability and alternate entries are evaluated together.
- Changing the player's preview theme uses that theme's default components and palette, independently from the site's explicit style overrides.

## Extension points

- Palette arrays: `NGDesign.themeColors`.
- Component visual variants: `NGDesign.boundStyleIndices`; arrays intentionally support future additions.
- Functional value options: each catalog item's `themeOptions`.
- For a new variant, add its renderer, thumbnail and theme-local option registration together. Do not append another theme's variants to the available list.
- `INPLACEHOLDER` is retained only as a compatible persisted palette identifier; its label and color values are now sourced India gold/purple rather than a deferred blank palette.
- Complex artwork is extracted as local WebP assets. Layout, controls, game grids and text remain HTML/CSS. Decorative borders and some icons are approximations.

## Validation

DOM checks cover 112 component editor/theme combinations, single-option counts, publishable defaults, disabled conflicting selections, rejected invalid drafts, navigation picker behavior, IN/SF logged-in/out states, asset paths, filtering, activity expansion and source-preview routing. JavaScript syntax, stylesheet parsing and whitespace checks passed. Browser visual verification is outstanding; DOM checks do not establish pixel-level fidelity.

## UX follow-up — 2026-09-10

- Navigation now lists only editable items. For the current PH/IN/SF registries these are theme/player choices, game-area settings, authentication artwork, and bottom navigation. Empty groups disappear. NG retains its adjustable catalog.
- Preview theme/color labels expose compact pointer/keyboard hints explaining player choice versus site defaults. Single-value color dropdowns are disabled.
- Fixed-size controls use single-line labels and responsive text sizes. PH task labels no longer contain forced line breaks; IN activity labels reserve icon space. Deliberate multiline promotional headings remain structured display typography.
- Alternate-entry placement names now match the renderer and resolver. Legacy floating placement names migrate to the supported floating entry. Selecting a navigation host picks a safe initial slot atomically, then allows slot edits.
- Review diagnostics no longer require a separate acknowledgement to save a valid configuration; capability violations still block, and unresolved automatic fallback still cannot publish. Old acknowledgement controls and the alternate editor's check section are removed.
- Rejected selections show the specific reason inline. Publish reflects resolver/loading status. Expired previews offer refresh; unavailable publishing offers reload of the published configuration, with confirmation before discarding unsaved edits.
- Regression verification passed for alternate enable/placement/save, absent acknowledgement gates, stale-version reload, stale-preview refresh, visible rollback feedback, 24 NG editors and 4 editors per bound theme, source-page states and asset references. Browser visual QA remains outstanding. No commit/push/publication performed.
