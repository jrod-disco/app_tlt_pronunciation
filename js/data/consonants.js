/**
 * Standard Central Tibetan — 30 consonants in traditional row order (8 rows × 4, last row has 2).
 * Picker data only. Placement rules live in js/rules/placement.js.
 */

/** @typedef {{ wylie: string, tibetan: string, label: string, lowTone?: boolean }} Consonant */

/** @type {Consonant[]} */
export const CONSONANTS = [
  // row 1
  { wylie: "ka", tibetan: "ཀ", label: "ka" },
  { wylie: "kha", tibetan: "ཁ", label: "kha", lowTone: true },
  { wylie: "ga", tibetan: "ག", label: "ga" },
  { wylie: "nga", tibetan: "ང", label: "nga" },
  // row 2
  { wylie: "ca", tibetan: "ཅ", label: "ca" },
  { wylie: "cha", tibetan: "ཆ", label: "cha", lowTone: true },
  { wylie: "ja", tibetan: "ཇ", label: "ja" },
  { wylie: "nya", tibetan: "ཉ", label: "nya" },
  // row 3
  { wylie: "ta", tibetan: "ཏ", label: "ta" },
  { wylie: "tha", tibetan: "ཐ", label: "tha", lowTone: true },
  { wylie: "da", tibetan: "ད", label: "da" },
  { wylie: "na", tibetan: "ན", label: "na" },
  // row 4
  { wylie: "pa", tibetan: "པ", label: "pa" },
  { wylie: "pha", tibetan: "ཕ", label: "pha", lowTone: true },
  { wylie: "ba", tibetan: "བ", label: "ba" },
  { wylie: "ma", tibetan: "མ", label: "ma" },
  // row 5
  { wylie: "tsa", tibetan: "ཙ", label: "tsa" },
  { wylie: "tsha", tibetan: "ཚ", label: "tsha", lowTone: true },
  { wylie: "dza", tibetan: "ཛ", label: "dza" },
  { wylie: "wa", tibetan: "ཝ", label: "wa" },
  // row 6
  { wylie: "zha", tibetan: "ཞ", label: "zha", lowTone: true },
  { wylie: "za", tibetan: "ཟ", label: "za" },
  { wylie: "'a", tibetan: "འ", label: "ʔa" },
  { wylie: "ya", tibetan: "ཡ", label: "ya" },
  // row 7
  { wylie: "ra", tibetan: "ར", label: "ra" },
  { wylie: "la", tibetan: "ལ", label: "la" },
  { wylie: "sha", tibetan: "ཤ", label: "sha" },
  { wylie: "sa", tibetan: "ས", label: "sa" },
  // row 8
  { wylie: "ha", tibetan: "ཧ", label: "ha" },
  { wylie: "a", tibetan: "ཨ", label: "a" },
];

/** @type {ReadonlyArray<readonly Consonant[]>} */
export const CONSONANT_ROWS = [
  CONSONANTS.slice(0, 4),
  CONSONANTS.slice(4, 8),
  CONSONANTS.slice(8, 12),
  CONSONANTS.slice(12, 16),
  CONSONANTS.slice(16, 20),
  CONSONANTS.slice(20, 24),
  CONSONANTS.slice(24, 28),
  CONSONANTS.slice(28, 30),
];