# Workflow and Quality Gates

## Table of Contents

1. Task Routing
2. Single-Song Workflow
3. Repository-Scale Workflow
4. Songbook Workflow
5. Troubleshooting Matrix
6. Definition of Done

## Task Routing

Pick one route:

1. Create or edit one song file: use Single-Song Workflow.
2. Normalize many files: use Repository-Scale Workflow.
3. Produce TeX/songbook output: use Songbook Workflow.

## Single-Song Workflow

1. Open target file.
2. Ensure canonical top structure:
   - `[title]`
   - `[sequence]`
   - section bodies
3. Run focused audit:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt
```

4. If canonical rewrite is needed:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt --rewrite
```

5. If TeX preview file is needed:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts \
  ./path/to/song.txt --tex-output ./tmp/song.tex
```

## Repository-Scale Workflow

Use this when changing many songs:

1. Structure/char validation:

```bash
npm run verify
```

2. File-extension and id checks:

```bash
npm run verify:file-extensions
npm run verify:uniqueness-of-ids
```

3. Optional canonical reprocessing:

```bash
npm run reprocess:content
npm run reprocess:filename
```

4. Formatting:

```bash
npm run format
```

## Songbook Workflow

1. Generate per-song TeX files and aggregate includes:

```bash
npm run songbook:convert
```

2. Compile:

```bash
npm run songbook:compile
```

3. Full distribution path:

```bash
npm run songbook:dist
```

## Troubleshooting Matrix

1. Symptom: Unknown sequence token error.  
   Cause: illegal token (`c1`, `v`, `p1`, etc.).  
   Fix: convert to valid forms (`c`, `c2`, `v1`, `p`, `p2`, ...).
2. Symptom: Section present in content but not sequence.  
   Cause: sequence/content mismatch.  
   Fix: add missing token to `[sequence]` or remove orphan section.
3. Symptom: Section in sequence missing body.  
   Cause: missing section declaration.  
   Fix: add section block.
4. Symptom: Non-consecutive numbering error.  
   Cause: numbering gaps.  
   Fix: renumber to consecutive sequence.
5. Symptom: malformed chord notation.  
   Cause: spaces inside braces or missing caret.  
   Fix: use strict `^{...}` without internal spaces.
6. Symptom: TeX compiles but chord alignment is odd.  
   Cause: end-of-line or dense split-word chord placement.  
   Fix: adjust chord anchors and inspect normalized output from `song_audit.ts`.

## Definition of Done

1. File passes `song_audit.ts` (or stronger repo checks when needed).
2. Sequence/content/metadata are consistent.
3. Chord notation is parseable and normalized.
4. TeX output is generated without syntax failures for the changed songs.
