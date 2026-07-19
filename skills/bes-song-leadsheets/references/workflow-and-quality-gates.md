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

1. Verify that the installed package and manual match the pinned reference:

```bash
./skills/bes-song-leadsheets/scripts/verify_leadsheets_version.sh
```

2. Search the full upstream reference for any command, option, environment, template, or internal being changed:

```bash
./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'
```

3. Generate per-song TeX files and aggregate includes:

```bash
npm run songbook:convert
```

4. Compile:

```bash
npm run songbook:compile
```

5. Inspect `LaTeX/songbook/bes-songbook.log` for errors and relevant warnings. The compile command uses `latexmk -f`, so process success alone is not sufficient proof.

6. Full distribution path:

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
7. Symptom: version verification fails.  
   Cause: local TeX installation differs from the pinned Leadsheets v0.7 reference.  
   Fix: stop and decide whether to restore v0.7 or perform an explicit package upgrade; do not mix documentation and implementation versions.

## Definition of Done

1. File passes `song_audit.ts` (or stronger repo checks when needed).
2. Sequence/content/metadata are consistent.
3. Chord notation is parseable and normalized.
4. Installed Leadsheets version matches the reference used for package decisions.
5. TeX output is generated without syntax failures for the changed songs.
6. Rendering changes compile and the resulting log has been inspected for errors and relevant warnings.
