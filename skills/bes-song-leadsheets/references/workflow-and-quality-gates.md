# Workflow and Quality Gates

## Task Routing

Choose one route before editing:

1. Lyrics or ProPresenter content → chord-free `verified/**/*.txt` authoring.
2. Chords or PDF songbook content → paired `leadsheets/**/*.txt` authoring.
3. Explicit standalone/package request → direct Leadsheets `.tex` authoring.
4. Existing TeX review → ownership-aware TeX audit.
5. Songbook appearance/build issue → converter, template, or config diagnosis.

## Canonical BES Song

1. Read the target and nearby verified songs.
2. Edit the chord-free canonical `.txt` file.
3. If a paired lead sheet exists, apply the same lyric change there without changing its chord placement.
4. Run focused validation:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt
```

5. If explicitly requested, canonicalize in place:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt --rewrite
```

6. For a lead-sheet song, generate a focused TeX artifact when useful:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt --tex-output ./tmp/song.tex
```

7. Validate all canonical/lead-sheet pairs:

```bash
npm run verify:leadsheets
```

## Direct Leadsheets TeX

1. Confirm direct TeX is the intended owner; do not place handwritten work in generated `target-tex/`.
2. Start from `authoring-and-audit.md`.
3. Search exact upstream semantics for advanced features:

```bash
./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'
```

4. Compile the standalone file with XeLaTeX/latexmk in its real path so relative inputs resolve.
5. Inspect the `.log` and rendered PDF.

## Existing TeX Audit

1. Read the generated-file header and identify ownership.
2. Compare generated TeX with:
   - canonical BES source,
   - `src/songToLeadsheetConverter.ts`,
   - `LaTeX/songbook/bes-songbook.template.txt`,
   - `LaTeX/songbook/bes-songbook-config.tex`,
   - `LaTeX/songbook/convertToSongbookTex.ts`.
3. Apply the checklist in `authoring-and-audit.md`.
4. Search the capability map/manual for every questioned command or option.
5. Compile through the narrowest real path that reproduces the behavior.
6. Report findings at the owning source file; generated output is evidence only.

## Repository-Scale Validation

For broad song changes:

```bash
npm run verify
npm run verify:file-extensions
npm run verify:uniqueness-of-ids
npm run verify:leadsheets
npm run test:ci
```

Run reprocessing or formatting only when requested or required by the change:

```bash
npm run reprocess:content
npm run reprocess:filename
npm run format
```

## Songbook Validation

```bash
npm run songbook:convert
npm run songbook:compile
```

Or run the complete path:

```bash
npm run songbook:dist
```

The compile command uses force mode. Inspect `LaTeX/songbook/bes-songbook.log`; process success alone does not prove clean TeX.

## Common Failures

1. Unknown sequence token → use legal BES tokens (`v1`, `c`, `p`, `b`, `s`, `e`).
2. Sequence/body mismatch → add the missing section or remove the orphan token.
3. Numbering gap → restore consecutive family/subsection numbering.
4. Malformed chord → remove spaces inside braces and use canonical `^{...}` markup.
5. Chord drifts at line end → check the required trailing space/anchor and `obey-lines` caveat.
6. Unknown environment/control sequence → confirm class/library loading and spelling in the capability map/manual.
7. Direct fix disappears → the edited file was generated; fix its owner.
8. Compile succeeds but layout is wrong → inspect PDF, log warnings, title measuring, and custom verse templates.

## Definition of Done

### BES source

- Focused audit passes.
- Canonical songs contain no chords.
- Paired songs have matching IDs, descriptive metadata, sequence, sections, and exact chord-stripped lyrics; each source has its own `contentHash`.
- Sequence, sections, metadata, diacritics, and lead-sheet chords are correct.
- Generated TeX reflects the intended lead sheet.

### Direct or audited TeX

- Ownership is correct.
- Every package feature used is documented.
- Structure and environments are balanced.
- XeLaTeX compilation and log inspection pass.
- Rendered PDF is visually checked for the behavior under review.

### All routes

- No generated output was edited as the durable fix.
- No unrelated songs, templates, or configuration changed.
