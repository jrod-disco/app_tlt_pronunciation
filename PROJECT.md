# TLT Pronunciation — agent handoff

## Run
- `npm run dev` (port 3030, may use 3031)
- Layout JSON edits need save → full page reload (static import in glyph-display.js)

## Active bug (priority)
**Shad vertical offset:** `js/data/glyph-layout.json` → `cells.shad.dy`
User sets dy (e.g. -20); devtools on `.glyph-part--shad` may still show `margin-top: calc(0 * var(--u))` meaning JS passed 0 into u(), NOT that JSON is wrong. Literal `-10px` in devtools works on same element.

**Expected fix pattern** (verify on disk): in `js/glyph/glyph-display.js` shad render, use px: `marginTop: ${Number(cells?.shad?.dy ?? 0) * (11/1020) * 16}px` — NOT `u(cells.shad.dy)`.

**User still sees multiplier 0 after claimed fix** — verify git log, actual inline style, and that dy is read before render. Log once if needed.

## Key files
- js/glyph/glyph-display.js — grid compose, shad/tsheg/root
- js/data/glyph-layout.json — tuning (cells.shad.dy, debugTint, perGlyph crossbar)
- css/styles.css — .glyph-stage sets --glyph-h, --glyph-units, --u
- css/parts.css — .glyph-part--shad grid-column (should be col 3 only, not 2/4)

## Git
Remote may be unset. Recent commits mentioned: efb9f42 (import layout JSON), px shad margin fix on glyph-display.js.

## Do NOT
- Cloud-only agents (no repo access)
- Long SVG archaeology
- Duplicate ~/JR-repos paths
