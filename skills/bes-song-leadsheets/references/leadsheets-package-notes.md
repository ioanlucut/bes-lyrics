# Leadsheets v0.7 Capability Map

This is a concise inventory of the package's capability surface, not a copy of its manual.

Official manual: `https://mirrors.nxthost.com/ctan/macros/latex/contrib/leadsheets/leadsheets_en.pdf`

The repository currently uses Leadsheets v0.7 (2022-01-05). For exact signatures, defaults, examples, and caveats, search the official manual:

```bash
./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'
```

## Package Structure — Manual Pages 3–4

Loading modes:

- `\usepackage{leadsheets}`: loads the `songs` library and its dependencies.
- `\usepackage[full]{leadsheets}`: loads every library except `musejazz`.
- `\usepackage[minimal]{leadsheets}`: loads no libraries.
- `\useleadsheetslibrary{library}` and `\useleadsheetslibraries{a,b}`: explicit loading.

User libraries:

- `musicsymbols`: music glyphs, bar symbols, and meter.
- `chords`: chord parsing and rendering.
- `musejazz`: MuseJazz Text chord font; requires XeLaTeX/LuaLaTeX and the font.
- `songs`: songs, properties, verse types, templates, transposition, and translations.
- `external`: include standalone `leadsheet` documents.

Internal libraries: `properties`, `shorthands`, `transposing`, `chordnames`, `templates`, and `translations`.

## Music Symbols — Pages 5–6

Accidentals: `\sharp`, `\flat`, `\doublesharp`, `\doubleflat`, `\natural`.

Clefs/meters/rests: `\trebleclef`, `\bassclef`, `\altoclef`, `\allabreve`, `\meterC`, `\meter{n}{d}`, `\wholerest`, `\halfrest`, `\quarterrest`, `\eighthrest`, `\sixteenthrest`, `\Break`.

Bars: `\normalbar`, `\leftrepeat`, `\rightrepeat`, `\leftrightrepeat`, `\doublebar`, `\stopbar`; dimensions are controlled by `\normalbarwidth`, `\thickbarwidth`, and `\interbarwidth`.

## Chord Rendering — Pages 7–12

Commands:

- `\writechord{chord}`: transform and print a chord inline.
- `\chordname{chord}`: render chord notation without song transposition behavior.
- `\setchords{options}`: configure chord rendering.

Recognized notation includes sharps/flats, double accidentals, `ma`, `mi`, diminished `o`, augmented `+`, half-diminished `/o`, slash bass notes, `add`, `sus`, `dim`, `maj7`, `maj9`, tensions, and parenthesized alterations.

Chord options:

- Formatting/symbols: `format`, `sharp`, `flat`, `double-sharp`, `double-flat`, `aug`, `half-dim`, `full-dim`, `dim`, `add`, `sus`, `major`, `minor`, `major-seven`, `major-nine`.
- Notation systems: `input-notation`, `output-notation`, `german-B`, `german-H`.
- `musejazz` changes chord typography through the MuseJazz Text font.

## Song Environment and Properties — Pages 13–19

Shape:

```tex
\begin{song}[song options]{song properties}
  ...
\end{song}
```

Set document/scope defaults with `\setleadsheets{options}`.

Song options:

- Title/body hooks: `title-template`, `song-format`, `text-format`, `before-song`, `after-title`, `after-song`.
- Selection/state: `print-tags`, `add-to-reset`, `disable-measuring`.
- Input/rendering: `chord-cs`, `obey-lines`, `bar-shortcuts`.

Settable properties:

- Identity: `title`, `subtitle`, `short-title`, `sort-title`, `sort-short-title`.
- Credits: `composer`, `sort-composer`, `lyrics`, `sort-lyrics`, `arr`, `sort-arr`, `band`, `sort-band`, `interpret`, `sort-interpret`.
- Musical/catalog: `genre`, `key`, `capo`, `tempo`, `tags`.

Automatic properties: `counter`, `ID`, `height`.

Property/template API:

- Definition/copy: `\definesongproperty`, `\copysongproperty`.
- Access: `\songproperty`, `\printsongpropertylist`, `\usesongpropertylist`, `\forsongpropertylist`.
- Conditions: `\ifsongproperty`, `\ifanysongproperty`, `\ifallsongproperties`, `\ifsongpropertiesequal`, `\ifsongmeasuring`.
- Expansion helper: `\expandcode`.

Capo output is controlled by `capo-nr-format` and `capo-nr`.

## Verse-Like Environments — Pages 19–22 and 29–32

Built in through package/class integration:

- `verse`, `verse*`
- `chorus`, `chorus*`
- `intro`, `intro*`
- `interlude`
- `bridge`
- `info`
- `solo`, `solo*`
- `prechorus` from the `leadsheet` class

Create custom types with `\newversetype` and `\newversetype*`.

Per-type options:

- Appearance: `format`, `label-format`, `after-label`, `name`, `template`.
- Identity/counting: `numbered`, `named`, `class`.
- Chord recall: `recall-chords`.

Global verse defaults: `verses-format`, `verses-label-format`, `verses-after-label`. Type-specific defaults use paths such as `verse/numbered` and `chorus/format`.

## Chord Placement and Recall — Pages 22–27

- `\chord{G}` or in-song shortcut `^{G}` places a chord over following text.
- Starred placement controls trailing-space consumption for split words.
- Dash modifier smashes the next chord width.
- `_` is the in-song shortcut for `\writechord`.

Placement options: `smash-chords`, `smash-next-chord`, `empty-chord-dim`, `align-chords`, `print-chords`.

Recall options: `remember-chords` and verse-type `recall-chords`. Recall is ordered and scoped by verse type/class; recalling more chords than recorded is an error.

Caveat: chord placement requires a trailing space/anchor. End-of-line and `obey-lines` combinations require explicit care.

## Transposition — Pages 27–29

Song options:

- `transpose`: positive or negative semitones.
- `enharmonic`: force `sharp` or `flat` spelling.
- `transpose-capo`: transpose down one semitone per capo fret.

Transposition requires a recognized `key` and the standard chord parser. Do not combine custom `chord-cs` behavior with transposition without proving compatibility.

## Bars and Repeats — Pages 32–33

With `bar-shortcuts=true` inside `song`:

- `|` → normal bar
- `|:` → left repeat
- `:|` → right repeat
- `:|:` → combined repeat
- `||` → double bar
- `|||` → final/stop bar

The BES converter currently preserves its source repeat markers unless explicitly changed.

## Templates — Pages 33–44

Title templates:

- Built in: `minimal`, `tabular`; the class also supplies `leadsheet`.
- Select with `title-template`.
- Define with `\definesongtitletemplate{name}{code}`.
- Handle the measuring pass with `\ifsongmeasuring`; `height` is unavailable during measurement.

Verse-type templates:

- Built in: `itemize`.
- Define with `\defineversetypetemplate{name}{begin code}{end code}`.
- Template helpers: `\verselabel`, `\verselabelformat`, `\verseafterlabel`, `\versename`, `\versenumber`, `\ifversestarred`, `\ifversenumbered`, `\ifversenamed`, `\ifobeylines`.

Templates can implement arbitrary layout such as flush alignment or framed sections. BES defines `bes-title-template` and `framed` in `LaTeX/songbook/bes-songbook-config.tex`.

## Internationalization — Pages 44–46

Use `\DeclareTranslation{language}{leadsheets/key}{translation}`.

Predefined concepts include major/minor, verse types, composer, lyrics, key, capo, fret, and interpretation. BES overrides relevant English translation entries with Romanian labels.

## Standalone Class and External Inclusion — Pages 46–51

The `leadsheet` class:

- Builds on `scrartcl`.
- Supplies a title template, page header/footer behavior, `prechorus`, `\instruction`, `\choir`, and formatting hooks (`\mkinstruction`, `\mkchoir`, `\lsenparen`, `\mklsenparen`, `\mklsenparens`).

The `external` library:

- `\includeleadsheet{file}` includes a complete standalone leadsheet.
- Starred inclusion changes class-macro handling.
- `gobble-preamble` controls preamble removal; disabling it is risky because package loading is suppressed during inclusion.
- Plain files containing only `song` environments can also be included.

BES generates standalone `leadsheet` documents and includes them in the aggregate songbook through this library.

## Audit Boundaries

This capability map tells you what exists. It does not replace exact upstream syntax or runtime proof. Search the relevant manual pages before using advanced behavior, then compile in the BES XeLaTeX pipeline.
