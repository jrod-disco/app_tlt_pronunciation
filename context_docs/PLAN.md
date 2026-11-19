# TLT Pronunciation — Plan & Scope

## Current milestone: v0 — 30 consonants + 4 vowels

### Assets ✅ done
- 30 consonant SVGs → `assets/svg/consonants/<wylie>.svg`
- 4 vowel mark SVGs → `assets/svg/vowels/mark-<v>.svg`
- Marks: tsheg, shad → `assets/svg/marks/`

### In progress
- `perGlyph.crossbarTop` tuning for all 30 consonants (visual pass in browser with `?shad=1`)
- Audio: individual `assets/audio/consonants/<wylie>.mp3` recordings
- Audio: tune `consonant-audio-offsets.json` for master MP3 fallback

### Up next (agent)
- Wire `playVowelSyllable` once vowel+consonant audio exists
- Wire `composer.js` + `placement.js` stubs once assets are solid

### Deferred
- UI polish

---

## Future milestone: stacked consonant forms

The PRIMARY_SVG contains a full row of **stacked/compound consonant glyphs** — these are the subscript and superscript letter forms used in complex syllables (Unit 3+ material).

**Subscript forms** (attached below main letter):
- ར་ subscript → "tr" cluster (e.g. གྲ་ → *tra*)
- ཡ་ subscript → "-y" or "ch" (e.g. ཁྱ་ → *khy*, བྱ་ → *ch*)
- ལ་ subscript → high-tone "l" (e.g. བླ་ → *la*)
- ཝ་ subscript → silent (e.g. རྩྭ་ → *tsa*)

**Superscript forms** (attached above main letter):
- ར་ superscript (མགོ་ཅན་ *gochän*)
- ལ་ superscript
- ས་ superscript

**Scope note:** Do not slice or wire stacked forms until basic consonant/vowel/audio pass is complete and composer stub is wired. This is a separate milestone requiring syllable composition logic.

---

## Even further out

- Suffix + post-suffix letter rendering
- Spelling system (སྦྱོར་ཀློག་ *jorlok*) interactive tool
- Umê script (layer4 of reference SVG) — explicitly out of scope until later milestone
