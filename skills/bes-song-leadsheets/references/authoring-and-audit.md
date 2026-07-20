# Authoring and Audit Patterns

## Canonical BES Song

Use this for songs that belong in `verified/`:

```txt
[title]
Cântarea mea {composer: {Nume}, writer: {Nume}, interpreter: {Nume}, key: {D}, tempo: {72}, tags: {închinare}}

[sequence]
v1,c,v2,c,b,c,e

[v1]
^{D}Prima linie a cântării
^{G}A doua linie se termină în ^{A}har

[c]
^{D}Acesta este refrenul
^{G}Cântat din nou în ^{A}închinare

[v2]
Al doilea vers

[b]
Bridge-ul cântării

[e]
Finalul cântării
```

Rules:

1. Use actual metadata; omit unknown optional metadata or preserve the repository's existing `*` convention.
2. Declare a section once. Repeat its token only in `[sequence]`.
3. Verse tokens are numbered (`v1`); first chorus/bridge/prechorus/solo tokens are unnumbered (`c`, `b`, `p`, `s`).
4. BES slash chords use source form such as `^{D/F#}`; the converter owns output normalization.
5. Use double blank lines inside a section only when intentional subsection splitting is wanted.

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
