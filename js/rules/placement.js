/**
 * Central Tibetan syllable placement (stub).
 * Roles: prefix, superscript, root, subscript, suffix, post-suffix.
 */

const ROLES = [
  "prefix",
  "superscript",
  "root",
  "subscript",
  "vowel",
  "suffix",
  "post-suffix",
];

/**
 * @param {string} syllable - Raw syllable string (not yet parsed).
 * @returns {Record<string, string | null>}
 */
export function analyzePlacement(syllable) {
  const trimmed = (syllable ?? "").trim();
  const empty = Object.fromEntries(ROLES.map((r) => [r, null]));

  if (!trimmed) {
    return empty;
  }

  // Stub: treat entire input as root until parser exists.
  return {
    ...empty,
    root: trimmed,
  };
}

/**
 * @param {Record<string, string | null>} placement
 * @returns {boolean}
 */
export function isValidPlacement(placement) {
  // Stub: accept any non-empty root.
  return Boolean(placement?.root);
}

export { ROLES };