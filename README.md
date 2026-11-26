# Tibetan Language Tool for Pronunciation

As a new student of the Tibetan language, I wanted to have something to tinker with in code that would be helpful to myself and other new Tibetan language learners. This browser-based tool let's students select a root syllable/consonant and adjust it by adding vowels, prefix, suffix(es), super and sub scripts. Ultimately I hope to have accurate pronunciation in male and female presenting voices for all of the possible combinations.

Stretch goals included color coding and candle wheel graphics based on how we've learned from our teacher.

https://github.com/user-attachments/assets/d79e5f2d-4506-4bbb-be4f-00bd78924844
(sound on)


---

## Resource credits

This app is **not affiliated** with the sites below; they are study references only.

### Sowa Rigpa

This is the course I'm taking to learn Tibetan. Very much enjoying it.

- [Tibetan Language 1](https://www.sowarigpainstitute.org/course/tibetan-language-1-1-fall-2026)

### Pronunciation & spelling (Standard Central Tibetan)

- [Unit 1 — The Tibetan Alphabet](https://tibetanlanguage.school/learn/standard-tibetan/unit-1/)
- [Unit 2 — How to Spell Tibetan Words](https://tibetanlanguage.school/learn/standard-tibetan/unit-2/)

### SVG glyph charts (CC BY-SA 4.0)

Sliced glyphs in `assets/svg/` are derived from these Wikimedia Commons files. Attribution also appears in the in-app footer.

| Role | Author | Source |
|------|--------|--------|
| Primary chart (consonants + vowel marks) | Christopher J. Fynn | [Tibetan consonants and vowel marks…](https://commons.wikimedia.org/wiki/File:Tibetan_consonants%E0%BC%8B_and_vowel_marks_with_additional_consonants_and_vowels_for_writing_Sanskrit.svg) |
| Reference chart (Uchen / Umê, no vowels) | Goran tek-en | [Uchen and Umê scripts](https://commons.wikimedia.org/wiki/File:Uchen_and_Um%C3%AA_scripts.svg) |

License: [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Extracted slices are a derivative work under the same license.

---

## Requirements

- **Node.js** (for dev/build)
- **Python 3** (optional static preview without Vite)

Serve from the **repo root** (not `file://`).

## Quick start

From the repository root:

```bash
npm install
npm run dev
```

Open the URL Vite prints (default [http://127.0.0.1:3030](http://127.0.0.1:3030)).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server + HMR |
| `npm run build` | Production bundle → `dist/` |
| `npm run preview:vite` | Serve `dist/` |
| `npm run preview` | Static server from repo root (port `3030`, or set `PORT`) |

After clone, if glyphs/audio 404 in dev, ensure `public/assets` → `../assets` exists:

```bash
ln -sfn ../assets public/assets
```

## What's in the repo

| Area | Notes |
|------|--------|
| `index.html`, `css/`, `js/` | App shell, glyph grid, pickers, audio |
| `assets/svg/` | Sliced consonants/vowels/marks (see **Resource credits**) |
| `assets/audio/` | Row clips + optional master; segment times in `js/data/consonant-row-audio.json` |
| `js/data/glyph-layout.json` | Layout numbers (edit → full reload in dev) |

**Query param:** `?shad=1` shows shad for crossbar alignment checks.

**Stubs (not wired):** text compose (`js/composer.js`), placement rules (`js/rules/placement.js`).

## Deploy

Static upload: ship `index.html`, `css/`, `js/`, and `assets/` with the same relative paths (or use `dist/` after `npm run build`).

## Planning / agent context

Not stored in this repository. Use the **ContextDev** work package `app-tlt-pronunciation` (start with **ANCHOR.md** in that tree).
