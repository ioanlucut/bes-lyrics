# Leadsheets Package Notes (for BES)

## Table of Contents

1. Scope
2. Core Song Environment
3. Song Properties Commonly Relevant to BES
4. Chord Commands and Placement Semantics
5. Verse-Like Environments and Templates
6. Important Global Options
7. Bars, Repeats, and Shortcuts
8. Transposition
9. Internationalization
10. Leadsheet Class and External Library
11. BES Project Defaults

## Scope

This file maps the parts of `leadsheets_en.pdf` most relevant to this repository. It is navigation, not a replacement for the complete pinned upstream reference.

Before making a package-level claim:

1. Run `./skills/bes-song-leadsheets/scripts/verify_leadsheets_version.sh` from the repository root.
2. Search with `./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'`.
3. Confirm the result in the page-marked PDF extraction or manual source.
4. Inspect package implementation when documentation is ambiguous.

Authoritative source provenance and checksums are recorded in `upstream-reference.md`. The complete v0.7 source and searchable manual live under `upstream/leadsheets-v0.7/`.

## Core Song Environment

General form:

```tex
\begin{song}[<options>]{<properties>}
  ...
\end{song}
```

Important ideas:

1. Song content is built from verse-like environments.
2. Song-level options and properties are configurable per song.
3. Title rendering is controlled by title templates.

## Song Properties Commonly Relevant to BES

Typical properties supported by the package include:

1. `title`
2. `subtitle`
3. `composer`
4. `lyrics`
5. `arr`
6. `interpret`
7. `album`
8. `year`
9. `key`
10. `capo`
11. `tempo`
12. `tags`
13. `genre`

Project mapping uses only a subset; see `bes-to-leadsheets-mapping.md`.

## Chord Commands and Placement Semantics

Key commands:

1. `\ch{<chord>}` place chord before following lyrics.
2. `\ch*{<chord>}` variant for split-word handling.
3. `\ch(<chord>)` and star variants for parenthesized chord output.
4. `\writechord{<chord>}` write chord according to package note/input settings.

Placement caveat:

1. Chords align with following syllables.
2. A chord at end-of-line without following text may need a dummy anchor (for example `\ch{}`) to avoid floating behavior.

## Verse-Like Environments and Templates

Built-in verse-like environment names include:

1. `verse`
2. `chorus`
3. `prechorus`
4. `bridge`
5. `intro`
6. `interlude`
7. `outro`
8. `info`
9. Custom environments via `\newversetype{...}`

Template controls:

1. Use predefined templates or define custom ones.
2. BES uses a custom framed template in `LaTeX/songbook/bes-songbook-config.tex`.
3. Section labels and formatting can be translated and restyled.

## Important Global Options

Options frequently used in this project:

1. `title-template`
2. `bar-shortcuts`
3. `verse/numbered`
4. `verse/named`
5. `verses-format`
6. `verses-label-format`
7. `info/format`
8. `obey-lines`
9. `smash-chords`

Additional options from package docs to know:

1. Chord alignment options (`align-chords` family).
2. Remember/recall chord mechanisms.
3. Overlay options.
4. Inter-song hooks like `before-song`, `after-song`.

## Bars, Repeats, and Shortcuts

When bar shortcuts are enabled, common textual shortcuts can become bar/repeat symbols:

1. `|`
2. `|:`
3. `:|`
4. `||`

BES converter currently keeps textual repeat markers (`/:`, `:/`) as-is unless additional rewrite logic is introduced.

## Transposition

Use `\transpose{<half steps>}{<text with chords>}` for local transposition.

Package behavior notes:

1. Positive/negative half-step shifts are supported.
2. Named key transposition and note style settings are available.
3. Avoid mixing incompatible accidental conventions in one chord set.

## Internationalization

Leadsheets integrates with translation keys.

Key commands:

1. `\DeclareTranslation{<lang>}{leadsheets/<key>}{<text>}`

BES uses this to localize labels such as:

1. `chorus` -> `Refren`
2. `prechorus` -> `Prerefren`
3. `verse` -> `Vers`
4. `outro` -> `End`
5. `lyrics` -> `Versuri`
6. `composer` -> `Compozitor`
7. `key` -> `Gama`

## Leadsheet Class and External Library

Two integration modes matter:

1. Standalone `leadsheet` class documents per song.
2. Embedding song documents via external library.

For embedding standalone leadsheets into a main songbook:

1. Load external library: `\useleadsheetslibraries{external}`.
2. Include generated files with `\includeleadsheet{...}`.
3. Use optional `\includeleadsheet[...]` arguments when preamble handling is needed.

## BES Project Defaults

Project defaults currently come from:

1. `LaTeX/songbook/bes-songbook.template.txt`
2. `LaTeX/songbook/bes-songbook-config.tex`
3. `src/songToLeadsheetConverter.ts`

Key behaviors:

1. Most non-verse environments use framed template.
2. Song title block is custom (`bes-title-template`).
3. Songbook build includes standalone generated leadsheet files via external library.
