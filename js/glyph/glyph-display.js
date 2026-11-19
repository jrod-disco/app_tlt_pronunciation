import { MARK_FILES, consonantFiles, getReferenceRoot, loadFirst, vowelFiles } from "./svg-assets.js";

const LAYOUT = await fetch(new URL("../data/glyph-layout.json", import.meta.url)).then((r) => r.json());
const { grid, cells, perGlyph, fallbackRoot } = LAYOUT;
const NS = "http://www.w3.org/2000/svg";
const u = (n) => `calc(${n} * var(--u))`;
const above = (id) => id !== "u";

function maskPart(cls, m, w, h, extra = {}) {
  const el = document.createElement("div");
  el.className = `glyph-part ${cls}`;
  el.style.width = u(w);
  el.style.height = u(h);
  el.style.setProperty("--mask", `url("${new URL(m.url, document.baseURI).href}")`);
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
      const s = Math.min(cells.root.w / root.w, cells.root.h / root.h);
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
      const extra = {
        gridArea: top ? "vowel-above" : "vowel-below",
        marginLeft: u((cells.root.w - vowel.w) / 2 + cells.vowel.dx),
      };
      if (top) {
        extra.alignSelf = "end";
        extra.marginBottom = u(cells.vowel.gap - cells.vowel.dy);
      } else {
        extra.alignSelf = "start";
        extra.marginTop = u(box.h - crossbarTop + cells.vowel.belowGap + cells.vowel.dy - grid.mainH);
      }
      const el = maskPart("glyph-part--vowel", vowel, vowel.w, vowel.h, extra);
      if (LAYOUT.debugTint) el.classList.add("is-tinted");
      g.appendChild(el);
    }
    if (tshegM) {
      g.appendChild(
        maskPart("glyph-part--tsheg", tshegM, tshegM.w, tshegM.h, {
          marginLeft: u((cells.tsheg.w - tshegM.w) / 2 + cells.tsheg.dx),
          marginTop: u(grid.mainH * cells.tsheg.yFraction + cells.tsheg.dy),
        })
      );
    }
    if (shadM) {
      const el = maskPart("glyph-part--shad", shadM, shadM.w, shadM.h, {
        marginLeft: u((cells.shad.w - shadM.w) / 2 + cells.shad.dx),
        marginTop: u(cells.shad.dy),
      });
      if (LAYOUT.debugTint) el.classList.add("is-tinted");
      g.appendChild(el);
    }
    stage.appendChild(g);
  }

  return update;
}
