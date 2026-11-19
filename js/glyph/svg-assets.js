import { REFERENCE_SVG } from "../composer.js";
import { UCHEN_GROUP_ID } from "../data/uchen-glyph-ids.js";

const BASE = "assets/svg";

/** Logical key → candidate files (first that loads wins). */
export const MARK_FILES = {
  tsheg: [`${BASE}/marks/mark-tsheg.svg`, `${BASE}/marks/tsek.svg`, `${BASE}/mark-tsek.svg`],
  shad: [`${BASE}/marks/mark-shad.svg`, `${BASE}/mark-shad.svg`],
};
export const consonantFiles = (w) => [`${BASE}/consonants/${w === "'a" ? "a-chung" : w}.svg`];
export const vowelFiles = (v) => [`${BASE}/vowels/mark-${v}.svg`, `${BASE}/vowels/${v}.svg`];

/** @type {Map<string, Promise<{ url: string, w: number, h: number } | null>>} */
const metaCache = new Map();

function loadMeta(url) {
  if (!metaCache.has(url)) {
    metaCache.set(
      url,
      fetch(encodeURI(url))
        .then((r) => {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        })
        .then((t) => {
          const el = new DOMParser().parseFromString(t, "image/svg+xml").documentElement;
          const vb = (el.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
          if (vb.length !== 4 || vb.some(Number.isNaN) || !el.querySelector("path")) return null;
          return { url: encodeURI(url), w: vb[2], h: vb[3] };
        })
        .catch(() => null)
    );
  }
  return metaCache.get(url);
}

/** @returns {Promise<{ url: string, w: number, h: number } | null>} first candidate that loads; w/h = viewBox */
export async function loadFirst(urls) {
  for (const u of urls) {
    const m = await loadMeta(u);
    if (m) return m;
  }
  return null;
}

/** @type {Promise<Document> | null} */
let refDocPromise = null;
/** @type {Map<string, { d: string, x: number, y: number, w: number, h: number } | null>} */
const rootPathCache = new Map();

function loadReferenceDoc() {
  refDocPromise ??= fetch(encodeURI(REFERENCE_SVG))
    .then((r) => {
      if (!r.ok) throw new Error(`SVG ${r.status}`);
      return r.text();
    })
    .then((t) => new DOMParser().parseFromString(t, "image/svg+xml"));
  return refDocPromise;
}

/** Reference-chart fallback root: path `d` + its bbox (measured in a hidden SVG). */
export async function getReferenceRoot(wylie) {
  if (rootPathCache.has(wylie)) return rootPathCache.get(wylie);
  const gid = UCHEN_GROUP_ID[wylie];
  let out = null;
  if (gid) {
    const doc = await loadReferenceDoc();
    const d = doc.getElementById(gid)?.querySelector("path")?.getAttribute("d");
    if (d) {
      const NS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      document.body.appendChild(svg);
      const bb = p.getBBox();
      svg.remove();
      out = { d, x: bb.x, y: bb.y, w: bb.width, h: bb.height };
    }
  }
  rootPathCache.set(wylie, out);
  return out;
}
