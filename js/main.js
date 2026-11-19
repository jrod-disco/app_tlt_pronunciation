import { composeSyllable, renderCompositionStub } from "./composer.js";
import { UNIT1_CONSONANTS, UNIT1_ROWS } from "./data/unit1-consonants.js";
import { VOWEL_CHOICES } from "./data/vowels.js";
import {
  getAudioSeekNote,
  playConsonantByWylie,
} from "./audio.js";
import { createGlyphDisplay } from "./glyph/glyph-display.js";

const input = document.getElementById("syllable-input");
const composeBtn = document.getElementById("compose-btn");
const stage = document.getElementById("glyph-stage");
const composeStub = document.getElementById("compose-stub");

const showShad = new URLSearchParams(location.search).get("shad") === "1";
const renderGlyph = stage ? createGlyphDisplay(stage) : () => {};
const summary = document.getElementById("placement-summary");
const audioNote = document.getElementById("audio-note");

const slotMain = document.getElementById("slot-main");
const slotVowel = document.getElementById("slot-vowel");
const slotMainValue = document.getElementById("slot-main-value");
const slotVowelValue = document.getElementById("slot-vowel-value");
const tabConsonants = document.getElementById("tab-consonants");
const tabVowels = document.getElementById("tab-vowels");
const pickerMain = document.getElementById("picker-main");
const pickerVowel = document.getElementById("picker-vowel");
const consonantGrid = document.getElementById("consonant-grid");
const vowelChoices = document.getElementById("vowel-choices");

/** @type {{ wylie: string, vowelId: string }} */
let state = {
  wylie: UNIT1_CONSONANTS[0].wylie,
  vowelId: "a",
};

function getConsonant() {
  return (
    UNIT1_CONSONANTS.find((c) => c.wylie === state.wylie) ?? UNIT1_CONSONANTS[0]
  );
}

function getVowel() {
  return VOWEL_CHOICES.find((v) => v.id === state.vowelId) ?? VOWEL_CHOICES[0];
}

function updateSummary(placement) {
  if (!summary) return;
  for (const dd of summary.querySelectorAll("dd[data-role]")) {
    const role = dd.getAttribute("data-role");
    const value = placement[role];
    dd.textContent = value ?? "—";
  }
}

function syncUi() {
  const consonant = getConsonant();
  const vowel = getVowel();

  if (slotMainValue) {
    const tone = consonant.lowTone ? " (low)" : "";
    slotMainValue.textContent = `${consonant.tibetan} ${consonant.label}${tone}`;
  }
  if (slotVowelValue) {
    slotVowelValue.textContent = vowel.label;
  }
  if (stage) {
    renderGlyph({ wylie: consonant.wylie, vowelId: vowel.id, tsheg: true, shad: showShad });
  }
  if (audioNote) {
    audioNote.textContent = getAudioSeekNote();
  }

  for (const btn of consonantGrid?.querySelectorAll("[data-wylie]") ?? []) {
    btn.setAttribute(
      "aria-pressed",
      btn.getAttribute("data-wylie") === state.wylie ? "true" : "false"
    );
  }
  for (const btn of vowelChoices?.querySelectorAll("[data-vowel]") ?? []) {
    btn.setAttribute(
      "aria-pressed",
      btn.getAttribute("data-vowel") === state.vowelId ? "true" : "false"
    );
  }
}

function playCurrent() {
  playConsonantByWylie(state.wylie);
}

function selectConsonant(wylie) {
  state.wylie = wylie;
  syncUi();
  playCurrent();
}

function selectVowel(vowelId) {
  state.vowelId = vowelId;
  syncUi();
  playCurrent();
}

/** @param {"main" | "vowel"} which — active slot + matching picker/tab */
function setActiveSlot(which) {
  const mainOn = which === "main";
  pickerMain?.toggleAttribute("hidden", !mainOn);
  pickerVowel?.toggleAttribute("hidden", mainOn);
  tabConsonants?.setAttribute("aria-selected", String(mainOn));
  tabVowels?.setAttribute("aria-selected", String(!mainOn));
  slotMain?.classList.toggle("is-active", mainOn);
  slotVowel?.classList.toggle("is-active", !mainOn);
}

function buildConsonantGrid() {
  if (!consonantGrid) return;

  for (const row of UNIT1_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "consonant-row";
    for (const c of row) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "consonant-btn";
      btn.dataset.wylie = c.wylie;
      btn.setAttribute("aria-pressed", c.wylie === state.wylie ? "true" : "false");
      const tone = c.lowTone ? " low" : "";
      btn.textContent = `${c.tibetan} ${c.label}${tone}`;
      btn.addEventListener("click", () => {
        selectConsonant(c.wylie);
      });
      rowEl.appendChild(btn);
    }
    consonantGrid.appendChild(rowEl);
  }
}

function buildVowelChoices() {
  if (!vowelChoices) return;

  for (const v of VOWEL_CHOICES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vowel-btn";
    btn.dataset.vowel = v.id;
    btn.setAttribute("aria-pressed", v.id === state.vowelId ? "true" : "false");
    btn.textContent = v.mark ? `${v.mark} ${v.label}` : v.label;
    btn.addEventListener("click", () => {
      selectVowel(v.id);
    });
    vowelChoices.appendChild(btn);
  }
}

function runCompose() {
  const syllable = input?.value ?? "";
  const result = composeSyllable(syllable);
  updateSummary(result.placement);
  if (composeStub) {
    renderCompositionStub(composeStub, result);
  }
}

slotMain?.addEventListener("click", () => setActiveSlot("main"));
slotVowel?.addEventListener("click", () => setActiveSlot("vowel"));
tabConsonants?.addEventListener("click", () => setActiveSlot("main"));
tabVowels?.addEventListener("click", () => setActiveSlot("vowel"));

composeBtn?.addEventListener("click", runCompose);

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    runCompose();
  }
});

buildConsonantGrid();
buildVowelChoices();
setActiveSlot("main");
syncUi();