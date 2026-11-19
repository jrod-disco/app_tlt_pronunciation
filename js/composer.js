import { analyzePlacement, isValidPlacement } from "./rules/placement.js";

const ASSET_BASE = "assets/svg";
/** Consonant stacks + vowel marks (+ Sanskrit); v1 composer target — see internal/vowel-svg-notes.md */
export const PRIMARY_SVG = `${ASSET_BASE}/Tibetan_consonants་_and_vowel_marks_with_additional_consonants_and_vowels_for_writing_Sanskrit.svg`;
/** Labeled Uchen/Umê consonant charts (no vowel signs) — id/Wylie map in internal/uchen-svg-notes.md */
export const REFERENCE_SVG = `${ASSET_BASE}/Uchen_and_Umê_scripts.svg`;

/**
 * Resolve SVG path for a glyph id (stub — legacy per-file layout; prefer PRIMARY_SVG + fragment ids).
 * @param {"consonant" | "vowel"} kind
 * @param {string} id
 * @returns {string}
 */
export function glyphAssetPath(kind, id) {
  const folder = kind === "vowel" ? "vowels" : "consonants";
  return `${ASSET_BASE}/${folder}/${id}.svg`;
}

/**
 * Build composition model from syllable text (stub).
 * @param {string} syllable
 * @returns {{ placement: Record<string, string | null>, valid: boolean, glyphs: { role: string, src: string | null }[] }}
 */
export function composeSyllable(syllable) {
  const placement = analyzePlacement(syllable);
  const valid = isValidPlacement(placement);

  const glyphs = Object.entries(placement).map(([role, value]) => ({
    role,
    src: value ? null : null, // TODO: map value → SVG id when assets exist
  }));

  return { placement, valid, glyphs };
}

/**
 * Placeholder DOM update for glyph stage (no SVG load yet).
 * @param {HTMLElement} container
 * @param {{ placement: Record<string, string | null> }} result
 */
export function renderCompositionStub(container, result) {
  const root = result.placement.root;
  container.replaceChildren();
  const p = document.createElement("p");
  p.className = "placeholder";
  const msg = "Enter a syllable and click Compose (stub).";
  p.textContent = root
    ? `Stub: root "${root}" — wire glyphs from ${PRIMARY_SVG} (reference consonant map: ${REFERENCE_SVG}).`
    : msg;
  container.appendChild(p);
}