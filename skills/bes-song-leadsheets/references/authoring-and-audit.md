# Authoring and Audit Patterns

## Canonical and Lead-Sheet BES Songs

Canonical songs under `verified/` contain no chords and are published to ProPresenter:

```txt
[title]
Cântarea mea {composer: {Nume}, writer: {Nume}, interpreter: {Nume}, key: {D}, tempo: {72}, tags: {închinare}, id: {song-id}}

[sequence]
v1,c

[v1]
Prima linie a cântării
A doua linie se termină în har

[c]
Acesta este refrenul
Cântat din nou în închinare
```

The paired song under `leadsheets/` has the same `id`, descriptive metadata, structure, and exact lyrics, with chord markup added. Its `contentHash` is calculated independently:

```txt
[title]
Cântarea mea {composer: {Nume}, writer: {Nume}, interpreter: {Nume}, key: {D}, tempo: {72}, tags: {închinare}, id: {song-id}}

[sequence]
v1,c

[v1]
^{D}Prima linie a cântării
^{G}A doua linie se termină în ^{A}har

[c]
^{D}Acesta este refrenul
^{G}Cântat din nou în ^{A}închinare
```

Rules:

1. Use actual metadata; omit unknown optional metadata or preserve the repository's existing `*` convention.
2. Declare a section once. Repeat its token only in `[sequence]`.
3. Verse tokens are numbered (`v1`); first chorus/bridge/prechorus/solo tokens are unnumbered (`c`, `b`, `p`, `s`).
4. Keep canonical songs chord-free.
5. Pair lead sheets by stable song `id`; removing chords must reproduce the canonical section exactly.
6. Keep descriptive metadata synchronized; `contentHash` differs because each source hashes its own body.
7. BES slash chords use source form such as `^{D/F#}`; the converter owns output normalization.
8. Use double blank lines inside a section only when intentional subsection splitting is wanted.

## Standalone Leadsheets TeX

Use this when direct TeX is explicitly requested:

```tex
\documentclass{leadsheet}

\begin{document}

\begin{song}{
  title={Cântarea mea},
  composer={Nume},
  lyrics={Nume},
  interpret={Nume},
  key={D},
  tempo={72},
  tags={închinare}
}
  \begin{verse}
    ^{D}Prima linie a cântării \\
    ^{G}A doua linie se termină în ^{A}har
  \end{verse}

  \begin{chorus}
    ^{D}Acesta este refrenul \\
    ^{G}Cântat din nou în ^{A}închinare
  \end{chorus}

  \begin{bridge}
    Bridge-ul cântării
  \end{bridge}
\end{song}

\end{document}
```

Direct-TeX rules:

1. `song` takes optional song options in `[...]` and mandatory properties in `{...}`.
2. `^{G}` is the in-song shortcut for `\chord{G}`.
3. The chord command consumes following text plus a mandatory trailing space; line endings need care.
4. Use direct slash-chord notation such as `^{D/F#}`. The BES converter's dash normalization is repository-specific and should not be copied into handwritten TeX.
5. Use `\writechord{G}` when printing a chord outside lyric placement, such as in a title template.
6. The `leadsheet` class supplies `prechorus`, `\instruction`, and `\choir` in addition to package song functionality.

## Useful Direct-TeX Variants

Per-song transposition:

```tex
\begin{song}[transpose=2,enharmonic=flat]{title={...},key={D}}
```

Hide chords:

```tex
\setleadsheets{print-chords=false}
```

Number verses and enable bar shortcuts:

```tex
\setleadsheets{verse/numbered,bar-shortcuts}
```

Instruction and choir text with the `leadsheet` class:

```tex
\instruction{doar pian} \\
\choir{răspunsul corului}
```

Custom section type:

```tex
\newversetype{response}[name=Response]
```

Include standalone songs in a collection:

```tex
\usepackage[full]{leadsheets}
\useleadsheetslibraries{external}
\includeleadsheet{song.tex}
```

## Audit Checklist

### Ownership

- Does the header say the file is generated?
- Is the real owner a BES `.txt` file, converter, songbook template, or shared config?
- Would regeneration overwrite the proposed fix?

### Structure

- Correct `\documentclass` and required libraries?
- Balanced `document`, `song`, and verse-like environments?
- Song options in `[...]`; properties in `{...}`?
- Every property and environment supported by the chosen class/package setup?

### Content

- Braces and special TeX characters escaped?
- Romanian UTF-8 text preserved?
- Explicit line breaks intentional and not duplicated?
- Repeated musical sections represented intentionally rather than accidentally copied?

### Chords

- Chord shortcut used only inside `song`?
- Required trailing space/anchor present, especially at line and environment ends?
- Starred chord form used intentionally for split words?
- `key` valid before using `transpose`?
- `chord-cs` not customized together with transposition?
- `remember-chords` recalls no more chords than initially recorded?

### Layout and templates

- Song title template handles `\ifsongmeasuring` where required?
- `height` property avoided during measuring?
- Verse template provides balanced begin/end code?
- Labels respect starred, named, and numbered states?
- `obey-lines` behavior checked with chords and paragraph spacing?

### Compilation

- Compile with the repository's XeLaTeX path.
- Inspect `.log` for errors, undefined controls, overfull boxes, and package warnings.
- Inspect the PDF for chord alignment, section framing, page breaks, title metadata, and table-of-contents entries.
