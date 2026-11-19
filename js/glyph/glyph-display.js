import { MARK_FILES, consonantFiles, getReferenceRoot, loadFirst, vowelFiles } from "./svg-assets.js";
import LAYOUT from "../data/glyph-layout.json";

const { grid, cells, perGlyph, perVowel = {}, fallbackRoot } = LAYOUT;
const NS = "http://www.w3.org/2000/svg";
const u = (n) => `calc(${n} * var(--u))`;
const above = (id) => id !== "u";

/** Darken a hex color by `amount` (0–1). */
function darkenHex(hex, amount) {
  const f = 1 - amount;
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function maskPart(cls, m, w, h, extra = {}) {
  const el = document.createElement("div");
  el.className = `glyph-part ${cls}`;
  el.style.width = u(w);
  el.style.height = u(h);
  // Set mask directly (not via --mask custom property) so relative URLs resolve
  // against the document rather than the stylesheet.
  const maskVal = `url("${m.url}") no-repeat center / 100% 100%`;
  el.style.webkitMask = maskVal;
  el.style.mask = maskVal;
  Object.assign(el.style, extra);
  return el;
}

/**
 * Mount a nested-grid glyph preview into `stage`. Returns `update({ wylie, vowelId, tsheg, shad })`.
 * Each part (root, vowel, tsheg, shad) is its own SVG; layout numbers live in js/data/glyph-layout.json.
 */
export function createGlyphDisplay(stage) {
  let token = 0;

  async function update({ wylie, vowelId, tsheg = true, shad = false }) {
    const my = ++token;
    const [root, vowel, tshegM, shadM] = await Promise.all([
      loadFirst(consonantFiles(wylie)),
      vowelId === "a" ? null : loadFirst(vowelFiles(vowelId)),
      tsheg ? loadFirst(MARK_FILES.tsheg) : null,
      shad ? loadFirst(MARK_FILES.shad) : null,
    ]);
    const ref = root ? null : await getReferenceRoot(wylie).catch(() => null);
    if (my !== token) return;

    stage.replaceChildren();
    if (!root && !ref) {
      const p = document.createElement("p");
      p.className = "placeholder";
      p.textContent = "Glyph unavailable";
      stage.appendChild(p);
      return;
    }

    const pg = perGlyph[wylie] ?? {};
    let box;
    if (root) {
      const s = (cells.root.w / root.w) * (pg.scale ?? 1); // scale to width; perGlyph.scale normalizes inconsistent slice sizes
      box = { s, w: root.w * s, h: root.h * s };
    } else {
      const s = (grid.mainH * fallbackRoot.heightFraction) / ref.h;
      box = { s, w: ref.w * s, h: ref.h * s };
    }
    const crossbarTop = (pg.crossbarTop ?? 0) * box.s;

    const row = ["root"];
    const cols = [cells.root.w];
    if (tshegM) { cols.push(cells.tsheg.w); row.push("tsheg"); }
    if (shadM) { cols.push(cells.shad.w); row.push("shad"); }
    const rest = (name) => row.map((_, i) => (i === 0 ? name : ".")).join(" ");

    const g = document.createElement("div");
    g.className = "glyph-grid";
    g.setAttribute("role", "img");
    g.setAttribute("aria-label", `${wylie} + ${vowelId}`);
    g.style.setProperty("--tint", LAYOUT.tintColor ?? "#c9b896");
    g.style.setProperty("--tint-mark", darkenHex(LAYOUT.tintColor ?? "#c9b896", 0.3));
    g.style.setProperty("--col-gap", grid.colGap);
    g.style.setProperty("--pad", grid.padding);
    g.style.gridTemplateColumns = cols.map((c) => u(c)).join(" ");
    g.style.gridTemplateRows = [grid.aboveH, grid.mainH, grid.belowH].map(u).join(" ");
    g.style.gridTemplateAreas = `"${rest("vowel-above")}" "${row.join(" ")}" "${rest("vowel-below")}"`;

    const rx = (cells.root.w - box.w) / 2 + cells.root.dx + (pg.dx ?? 0);
    const ry = -crossbarTop + (cells.root.dy ?? 0) + (pg.dy ?? 0);
    let rootEl;
    if (root) {
      rootEl = maskPart("glyph-part--root", root, box.w, box.h);
    } else {
      rootEl = document.createElementNS(NS, "svg");
      rootEl.setAttribute("class", "glyph-part glyph-part--root");
      rootEl.setAttribute("viewBox", `${ref.x} ${ref.y} ${ref.w} ${ref.h}`);
      rootEl.setAttribute("fill", "currentColor");
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", ref.d);
      rootEl.appendChild(path);
      rootEl.style.width = u(box.w);
      rootEl.style.height = u(box.h);
    }
    rootEl.style.marginLeft = u(rx);
    rootEl.style.marginTop = u(ry);
    g.appendChild(rootEl);

    if (vowel) {
      const top = above(vowelId);
      const pv = perVowel[vowelId] ?? {};
      const extra = {
        gridArea: top ? "vowel-above" : "vowel-below",
        marginLeft: u((cells.root.w - vowel.w) / 2 + (pv.dx ?? cells.vowel.dx)),
      };
      if (top) {
        extra.alignSelf = "end";
        extra.marginBottom = u((pg.vowelGap ?? pv.gap ?? cells.vowel.gap) - (pv.dy ?? cells.vowel.dy));
      } else {
        extra.alignSelf = "start";
        extra.marginTop = u(box.h - crossbarTop + (pv.belowGap ?? cells.vowel.belowGap) + (pv.dy ?? cells.vowel.dy) - grid.mainH);
      }
      const el = maskPart("glyph-part--vowel", vowel, vowel.w, vowel.h, extra);
      if (LAYOUT.debugTint) el.classList.add("is-tinted");
      g.appendChild(el);
    }
    if (tshegM) {
      const el = maskPart("glyph-part--tsheg", tshegM, tshegM.w, tshegM.h, {
        marginLeft: u((cells.tsheg.w - tshegM.w) / 2 + cells.tsheg.dx),
        marginTop: u(grid.mainH * cells.tsheg.yFraction + cells.tsheg.dy),
      });
      el.classList.add("is-tinted-mark");
      g.appendChild(el);
    }
    if (shadM) {
      const el = maskPart("glyph-part--shad", shadM, shadM.w, shadM.h, {
        marginLeft: u((cells.shad.w - shadM.w) / 2 + cells.shad.dx),
        marginTop: u(cells.shad.dy ?? 0),
      });
      el.classList.add("is-tinted-mark");
      g.appendChild(el);
    }
    stage.appendChild(g);
  }

  return update;
}
