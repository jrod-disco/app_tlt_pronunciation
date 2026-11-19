/**
 * Consonant audio. Priority per letter:
 *   1. assets/audio/consonants/<wylie>.(mp3|wav)  — exact
 *   2. master mp3 seeked via js/data/consonant-audio-offsets.json {start,end}
 *   3. master mp3, equal split (entry missing)
 * Vowel audio: stub (replays consonant clip).
 */

import { UNIT1_CONSONANTS } from "./data/unit1-consonants.js";
const offsetData = await fetch(new URL("./data/consonant-audio-offsets.json", import.meta.url)).then((r) => r.json());

export const CONSONANTS_AUDIO_SRC = "assets/audio/tibetanconsonants.mp3";
export const CONSONANT_FILE_DIR = "assets/audio/consonants";
const FILE_EXTS = ["mp3", "wav"];

export const CONSONANTS_AUDIO_DURATION_SEC = offsetData.duration ?? 23.14449;

const LETTER_COUNT = UNIT1_CONSONANTS.length;
const SEGMENT_SEC = CONSONANTS_AUDIO_DURATION_SEC / LETTER_COUNT;
const OFFSETS = offsetData.consonants ?? {};

/** @type {"file"|"offsets"|"equal"|null} */
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

/** Segment in seconds for a letter. */
export function getSegment(index) {
  const wylie = UNIT1_CONSONANTS[index].wylie;
  const seg = OFFSETS[wylie];
  if (validSegment(seg)) return { start: seg.start, end: seg.end, mode: "offsets" };
  const start = index * SEGMENT_SEC;
  return {
    start,
    end: Math.min(CONSONANTS_AUDIO_DURATION_SEC, start + SEGMENT_SEC),
    mode: "equal",
  };
}

/** Finds an individual file, if any. Vite dev serves index.html for misses, so check content-type. */
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
      /* offline / blocked: fall through */
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

function noteMode(mode, wylie) {
  if (mode === lastMode) return;
  lastMode = mode;
  if (mode !== "file") {
    console.debug(`[audio] ${wylie}: approximate (${mode}) — add ${CONSONANT_FILE_DIR}/${wylie}.mp3 for exact audio`);
  }
}

/**
 * @param {number} index - 0..29 in UNIT1_CONSONANTS order
 */
export async function playConsonantByIndex(index) {
  if (index < 0 || index >= LETTER_COUNT) return;
  const { wylie } = UNIT1_CONSONANTS[index];

  stopActive();
  const fileUrl = await findConsonantFile(wylie);

  stopActive();
  if (fileUrl) {
    noteMode("file", wylie);
    const audio = new Audio(fileUrl);
    activeAudio = audio;
    safePlay(audio);
    return;
  }

  const { start, end, mode } = getSegment(index);
  noteMode(mode, wylie);
  const audio = getMaster();
  activeAudio = audio;
  audio.pause();
  audio.currentTime = start;

  stopListener = () => {
    if (audio.currentTime >= end - 0.02) stopActive();
  };
  audio.addEventListener("timeupdate", stopListener);
  safePlay(audio);
}

/** @param {string} wylie */
export function playConsonantByWylie(wylie) {
  const index = UNIT1_CONSONANTS.findIndex((c) => c.wylie === wylie);
  if (index >= 0) playConsonantByIndex(index);
}

/** @param {string} _vowelId  Stub: no vowel audio yet. */
export function playVowelSyllable(_vowelId, _wylie) {}

export function getAudioSeekNote() {
  const exact = [...fileCache.values()].filter(Boolean).length;
  const base = exact
    ? `Audio: ${exact} exact clip(s) loaded; others approximate.`
    : "Audio: approximate timing from one master clip.";
  return `${base} Vowel picks replay the consonant clip.`;
}
