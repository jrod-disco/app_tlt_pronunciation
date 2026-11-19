/**
 * Unit 1 vowel set: inherent a + four vowel signs.
 * TODO: map each combo to PRIMARY_SVG vowel mark fragments when composer wires SVG.
 */

/** @typedef {{ id: string, label: string, mark: string, wylieSuffix: string }} VowelChoice */

/** @type {VowelChoice[]} */
export const VOWEL_CHOICES = [
  { id: "a", label: "a (inherent)", mark: "", wylieSuffix: "a" },
  { id: "i", label: "i", mark: "ི", wylieSuffix: "i" },
  { id: "u", label: "u", mark: "ུ", wylieSuffix: "u" },
  { id: "e", label: "e", mark: "ེ", wylieSuffix: "e" },
  { id: "o", label: "o", mark: "ོ", wylieSuffix: "o" },
];