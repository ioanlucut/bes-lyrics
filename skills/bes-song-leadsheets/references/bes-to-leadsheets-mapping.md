# BES to Leadsheets Mapping

## Table of Contents

1. Conversion Entry Points
2. Section-to-Environment Mapping
3. Song Metadata Mapping
4. Chord Normalization Pipeline
5. Line Layout and Escaping
6. Subsection Rejoin in Songbook Build
7. Known Limitations

## Conversion Entry Points

Primary converter:

1. `src/songToLeadsheetConverter.ts`

Songbook pipeline:

1. `LaTeX/songbook/convertToSongbookTex.ts`
2. Reads `.txt` songs.
3. Parses with `parse(content, { rejoinSubsections: true })`.
4. Converts each song to standalone leadsheet TeX.
5. Includes each generated file in `bes-songbook.tex` using `\includeleadsheet`.

## Section-to-Environment Mapping

Exact map from `SequenceChar`:

1. `v` -> `verse`
2. `p` -> `prechorus`
3. `c` -> `chorus`
4. `b` -> `bridge`
5. `e` -> `outro`
6. `s` -> `solo`

Default environment options:

1. `verse`: no template option.
2. `prechorus`, `chorus`, `bridge`, `outro`, `solo`: `[template = framed]`.

Practical outcome:

1. Non-verse sections are visually framed by default in this project.

## Song Metadata Mapping

Converter emits these `\begin{song}{...}` properties:

1. `title` <- BES `title`
2. `subtitle` <- BES `sequence` joined by commas
3. `composer` <- BES `composer`
4. `arr` <- BES `arranger`
5. `band` <- BES `band`
6. `tags` <- BES `tags`
7. `genre` <- BES `genre`
8. `tempo` <- BES `tempo`
9. `interpret` <- BES `interpreter`
10. `lyrics` <- BES `writer`
11. `key` <- BES `key`

Rules:

1. Metadata with value `*` is skipped.
2. Ampersands are escaped (`&` -> `\&`).
3. `alternative`, `version`, `id`, `rcId`, and `contentHash` are not written into song properties by current converter.

## Chord Normalization Pipeline

`getNormalizedContent()` applies line-by-line and word-by-word transforms.

Validation/repair sequence:

1. Reject chord groups that contain spaces (for example `^{A C}`).
2. Add missing caret before `{...}` when absent.
3. If multiple chord notations appear in one word, split them and convert all but the final chord marker to starred form (`^*{...}`).
4. Replace slash in chord-bass notation with dash (`^{D/F#}` -> `^{D-F#}`).

Examples:

1. `^{G4}th^{G}is` -> `^*{G4}th ^{G}is`
2. `{G4}th{G}is` -> `^*{G4}th ^{G}is`
3. `^{Db/Ab}invi^{Ab}at` -> `^*{Db-Ab}invi ^{Ab}at`

## Line Layout and Escaping

Line handling:

1. Each newline in section content is rewritten to TeX line break form (` \\`).
2. Converter pads lines with spaces for readability but padding is cosmetic.

TeX document shape:

1. Standalone file header (`\documentclass{leadsheet}`, `\begin{document}`).
2. `\newpage` before each song.
3. Single `song` environment per file.

## Subsection Rejoin in Songbook Build

Songbook generation parses with `rejoinSubsections: true`.

Result:

1. Subsections like `[v1.1]` + `[v1.2]` are merged into `[v1]` before conversion.
2. This keeps final TeX environments at main-section granularity.

If explicit subsection rendering is required in TeX:

1. Modify conversion flow to parse without `rejoinSubsections`.
2. Ensure sequence and section headers still pass validator constraints.

## Known Limitations

1. `/:` and `:/` repeat syntax is not transformed into left/right repeat commands by current converter.
2. `title` metadata parsing is simple brace splitting; malformed nested braces can break extraction.
3. Sequence parsing assumes comma-separated tokens without extra wrappers.
4. Converter ignores some available `leadsheets` properties even if present in BES metadata.
