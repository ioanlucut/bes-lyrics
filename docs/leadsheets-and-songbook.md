# Lead sheets and songbook

The printed songbook is generated from lead sheets: chorded copies of songs,
kept in `leadsheets/` next to the chord-free originals in `verified/`.
ProPresenter only ever sees `verified/`, so chords never reach the screen.

## The twin rule

A lead sheet is the same song with chords added. It must have:

- the same `id` as a song in `verified/`, and no other lead sheet with that
  `id`;
- the same metadata, apart from `contentHash`, which differs because the content
  differs;
- the same sequence, the same section order and, once the chords are removed,
  exactly the same lyrics;
- at least one chord.

`npm run verify:leadsheets` enforces all of this on every pull request, and it
also rejects chord markup in `verified/`. To change the lyrics of a song that
has a lead sheet, change both files in the same pull request. Not every song
needs a lead sheet.

## Chord markup

Put `^{chord}` directly before the syllable the chord falls on:

```text
[v1]
A^{D}ceasta mi-e do^{Bm}rința, să ^{G}Te-o^{D}no^{A}rez,
^{Bm}Cu ființa-nt^{D}reagă să Te ^{C}slă^{A}vesc.
```

A chord is a root `A`–`G`, an optional `#` or `b`, then optionally `m`, `M`,
`maj`, `sus`, `dim`, `aug` or `add` with a number, or a bare number such as `7`.
Use `/` for a bass note (`^{D/F#}`) and `-` to chain chords inside one marker.
Spaces inside the braces are rejected.

The converter adapts the markup for the LaTeX
[`leadsheets`](https://ctan.org/pkg/leadsheets) package:

- when one word carries several chords, all but the last become `^*{…}` and the
  word is split, so the chords do not collide: `^{G4}th^{G}is` →
  `^*{G4}th ^{G}is`;
- the standalone repeat marks `/:` and `:/` become the repeat bars `|:` and
  `:|`.

AI agents that author or audit lead sheets follow
[`skills/bes-song-leadsheets`](../skills/bes-song-leadsheets/SKILL.md), which
also maps the complete `leadsheets` package.

## The songbook

`npm run songbook:convert` reads `leadsheets/trupe_lauda_si_inchinare/`, the
worship-band lead sheets, and writes one `.tex` file per song into
`LaTeX/songbook/target-tex/`. It then fills `bes-songbook.template.txt` to
produce `bes-songbook.tex`. Songs are sorted by title in Romanian alphabetical
order and numbered, and each starts on a new page. Verses, choruses,
pre-choruses, bridges, endings and recitals become `leadsheets` environments,
and every section other than a verse is framed. Each song's header shows its
interpreter, composer, lyricist, genre, tempo and key when they are set. The
book opens with a title page and a table of contents, and it is typeset in
Romanian: hyphenation, dates and labels (`Refren`, `Gama`, `Versuri`,
`Cuprins`). Lyrics and chords are set in MonoLisa where that licensed font is
installed; elsewhere, including CI, lyrics use Latin Modern and chords a bold
sans serif.

`npm run songbook:compile` builds the PDF with `latexmk` and XeLaTeX, and it
fails on LaTeX errors. `npm run songbook:dist` runs both steps. Locally this
needs [TeX Live](https://tug.org/texlive/) or MacTeX; CI uses
[`xu-cheng/latex-action`](https://github.com/xu-cheng/latex-action).

Every push to `main` that changes the worship lead sheets, `LaTeX/songbook/` or
the converter publishes a new `BES_Songbook_<date>`
[release](https://github.com/ioanlucut/bes-lyrics/releases) and uploads the PDF
to Google Drive.
