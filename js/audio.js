/**
 * Syllable audio priority:
 *   1. assets/audio/consonants/<wylie>.(mp3|wav)
 *   2. Row clip: consonant-row-audio.json → row MP3 + {start,end} (vowel-aware)
 *   3. Master tibetanconsonants.mp3 + consonant-audio-offsets.json
 *   4. Master equal split
 */

import { CONSONANTS, CONSONANT_ROWS } from "./data/consonants.js";

const offsetData = await fetch(new URL("./data/consonant-audio-offsets.json", import.meta.url)).then(
  (r) => r.json()
);
const rowData = await fetch(new URL("./data/consonant-row-audio.json", import.meta.url)).then((r) =>
  r.json()
);

export const CONSONANTS_AUDIO_SRC = "assets/audio/tibetanconsonants.mp3";
export const CONSONANT_FILE_DIR = "assets/audio/consonants";
const FILE_EXTS = ["mp3", "wav"];

export const CONSONANTS_AUDIO_DURATION_SEC = offsetData.duration ?? 23.14449;

const LETTER_COUNT = CONSONANTS.length;
const SEGMENT_SEC = CONSONANTS_AUDIO_DURATION_SEC / LETTER_COUNT;
const OFFSETS = offsetData.consonants ?? {};
const ROW_FILES = rowData.files ?? {};
const ROW_SEGMENTS = rowData.segments ?? {};

/** @type {string | null} */
let lastMode = null;
let sharedAudio = null;
let activeAudio = null;
let stopListener = null;
/** wylie -> url | null */
const fileCache = new Map();

function getMaster() {
  if (!sharedAudio) sharedAudio = new Audio(CONSONANTS_AUDIO_SRC);
  return sharedAudio;
}

function validSegment(seg) {
  return (
    seg &&
    Number.isFinite(seg.start) &&
    Number.isFinite(seg.end) &&
    seg.end > seg.start
  );
}

/** @returns {{ row: number, col: number } | null} */
function rowColForWylie(wylie) {
  for (let r = 0; r < CONSONANT_ROWS.length; r++) {
    const col = CONSONANT_ROWS[r].findIndex((c) => c.wylie === wylie);
    if (col >= 0) return { row: r + 1, col };
  }
  return null;
}

const FULL_VOWEL_IDS = ["a", "i", "u", "e", "o"];

/** True when row-audio JSON has clips for every vowel on this consonant's row (e.g. ka–nga). */
export function hasFullVowelRowAudio(wylie) {
  const pos = rowColForWylie(wylie);
  if (!pos) return false;
  return FULL_VOWEL_IDS.every((vowelId) => {
    const file = ROW_FILES[`row${pos.row}_${vowelId}`];
    if (!file) return false;
    const seg = ROW_SEGMENTS[file]?.[pos.col];
    return validSegment(seg);
  });
}

/** @returns {{ file: string, start: number, end: number } | null} */
function getRowClip(wylie, vowelId) {
  const pos = rowColForWylie(wylie);
  if (!pos) return null;
  const file = ROW_FILES[`row${pos.row}_${vowelId}`];
  if (!file) return null;
  const seg = ROW_SEGMENTS[file]?.[pos.col];
  if (!validSegment(seg)) return null;
  return { file, start: seg.start, end: seg.end };
}

/** Segment in seconds for a letter on the master clip. */
export function getSegment(index) {
  const wylie = CONSONANTS[index].wylie;
  const seg = OFFSETS[wylie];
  if (validSegment(seg)) return { start: seg.start, end: seg.end, mode: "offsets" };
  const start = index * SEGMENT_SEC;
  return {
    start,
    end: Math.min(CONSONANTS_AUDIO_DURATION_SEC, start + SEGMENT_SEC),
    mode: "equal",
  };
}

async function findConsonantFile(wylie) {
  if (fileCache.has(wylie)) return fileCache.get(wylie);
  let found = null;
  for (const ext of FILE_EXTS) {
    const url = `${CONSONANT_FILE_DIR}/${wylie}.${ext}`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && (type.startsWith("audio/") || type.includes("octet-stream"))) {
        found = url;
        break;
      }
    } catch {
      /* offline */
    }
  }
  fileCache.set(wylie, found);
  return found;
}

function stopActive() {
  if (activeAudio) {
    activeAudio.pause();
    if (stopListener) activeAudio.removeEventListener("timeupdate", stopListener);
  }
  stopListener = null;
  activeAudio = null;
}

function safePlay(audio) {
  const p = audio.play();
  if (p?.catch) p.catch(() => {});
}

function noteMode(mode, wylie, detail) {
  if (mode === lastMode) return;
  lastMode = mode;
  if (mode === "equal" || mode === "offsets") {
    console.debug(
      `[audio] ${wylie}: approximate (${mode}) — ${detail ?? "tune js/data/consonant-row-audio.json or add per-letter mp3"}`
    );
  }
}

function playRange(audio, start, end) {
  activeAudio = audio;
  audio.pause();
  audio.currentTime = start;
  stopListener = () => {
    if (audio.currentTime >= end - 0.02) stopActive();
  };
  audio.addEventListener("timeupdate", stopListener);
  safePlay(audio);
}

/**
 * @param {string} vowelId — a | i | u | e | o
 * @param {string} wylie
 */
export async function playVowelSyllable(vowelId, wylie) {
  stopActive();

  const fileUrl = await findConsonantFile(wylie);
  if (fileUrl) {
    noteMode("file", wylie);
    const audio = new Audio(fileUrl);
    activeAudio = audio;
    safePlay(audio);
    return;
  }

  const row = getRowClip(wylie, vowelId);
  if (row) {
    noteMode("row", wylie);
    const url = `${CONSONANT_FILE_DIR}/${row.file}`;
    const audio = new Audio(url);
    playRange(audio, row.start, row.end);
    return;
  }

  const index = CONSONANTS.findIndex((c) => c.wylie === wylie);
  if (index < 0) return;

  if (vowelId !== "a") {
    noteMode("equal", wylie, `no row recording for vowel ${vowelId} — using master ka-style clip`);
  }

  const { start, end, mode } = getSegment(index);
  noteMode(mode, wylie);
  const audio = getMaster();
  playRange(audio, start, end);
}

/** @param {number} index - 0..29 in CONSONANTS order */
export function playConsonantByIndex(index) {
  if (index < 0 || index >= LETTER_COUNT) return;
  playVowelSyllable("a", CONSONANTS[index].wylie);
}

/** @param {string} wylie */
export function playConsonantByWylie(wylie) {
  playVowelSyllable("a", wylie);
}

export function getAudioSeekNote() {
  const rowCount = Object.keys(ROW_FILES).length;
  if (rowCount) {
    return `Audio: row clips for ka–nga (all vowels) and ca–na, ta–na (inherent a). Tune segment times in js/data/consonant-row-audio.json.`;
  }
  return "Audio: approximate timing from master clip until row/per-letter files are wired.";
}