# Crimson & gold homepage

Standalone HTML interpretation of the user-supplied `index_short.svg` and `index_all.svg`.

## Review

Open `index.html` to switch between the compact viewport and full-page view. Use **Open page** to open either independently.

- `index_short.html`: scrollable mobile page with fixed bottom navigation.
- `index_all.html`: full-page layout with bottom navigation at the end.
- `theme.css` and `theme.js`: shared styling, native HTML components and demo interactions.
- `assets/`: local artwork extracted from the supplied SVGs. Provenance is recorded in `asset-source.json`.

The original phone status/address bars are omitted. The hero, cards, menus, search, game filters and navigation are HTML/CSS; the ornate winner podium remains a supplied illustration. Social icons and some decorative shapes are approximations. No external libraries, network requests, account actions or payments are required. Dialogs demonstrate interaction only.

Not integrated into the customization back office. No publishing or Git commit performed for this work.

## Verification

Both variants passed DOM checks for all referenced images, the 16 game cards, category/search filtering, filter visibility, menu, dialog and promotion switching. JavaScript syntax and CSS parsing passed. These checks do not verify browser rendering; visual browser QA is outstanding.
