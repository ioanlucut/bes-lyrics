---
name: bes-song-leadsheets
description: Author and audit BES song sources and Leadsheets LaTeX in this repository. Must be used when creating or editing songs, writing direct `leadsheet` documents, reviewing generated song TeX, working with chords or song environments, changing songbook layout, or diagnosing PDF compilation. Covers the complete Leadsheets v0.7 capability surface without vendoring upstream documentation.
---

# BES Song Leadsheets

## Purpose

Use this skill for both authoring routes and for TeX audits:

1. **Canonical BES source**: write `verified/**/*.txt`, then let the repository generate Leadsheets TeX. This is the normal route.
2. **Direct Leadsheets TeX**: write a standalone `leadsheet` document when explicitly requested or when prototyping package functionality.
3. **Audit**: inspect handwritten or generated TeX, trace defects to the owning source, and validate compilation.

Do not confuse source ownership: generated `LaTeX/songbook/target-tex/*.tex` and `LaTeX/songbook/bes-songbook.tex` are outputs, not editing targets.

## Route Selection

1. If the requested song belongs in the repository corpus, use canonical BES source.
2. If the user explicitly asks for TeX, a standalone leadsheet, or a package feature unavailable through the converter, use direct TeX.
3. If auditing TeX, first determine whether it is generated:
   - Generated song body defect → fix the BES source or `src/songToLeadsheetConverter.ts`.
   - Generated aggregate defect → fix `LaTeX/songbook/bes-songbook.template.txt` or `LaTeX/songbook/convertToSongbookTex.ts`.
   - Shared layout defect → fix `LaTeX/songbook/bes-songbook-config.tex`.
   - Handwritten TeX defect → fix that TeX file directly.

## Required References

Load only the references needed:

1. [`references/bes-format-spec.md`](references/bes-format-spec.md): canonical BES grammar and validator constraints.
2. [`references/bes-to-leadsheets-mapping.md`](references/bes-to-leadsheets-mapping.md): exact converter behavior and ownership boundaries.
3. [`references/authoring-and-audit.md`](references/authoring-and-audit.md): ready-to-use BES and direct-TeX patterns plus audit checklist.
4. [`references/leadsheets-package-notes.md`](references/leadsheets-package-notes.md): complete capability map, commands, properties, options, environments, and upstream page index.
5. [`references/workflow-and-quality-gates.md`](references/workflow-and-quality-gates.md): validation and compilation routes.

For exact package semantics, search the installed official manual instead of relying on memory:

```bash
./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'
```

## Canonical BES Authoring Workflow

1. Inspect nearby verified songs for metadata and naming conventions.
2. Write `[title]`, `[sequence]`, then each uniquely declared section.
3. Keep sequence tokens and section declarations consistent; sequence duplicates represent repeats.
4. Place chords with BES notation such as `^{D}Cânt` and `^{D/F#}`.
5. Preserve Romanian diacritics and existing metadata.
6. Run the focused audit:

```bash
node --no-warnings=ExperimentalWarning --loader ts-node/esm \
  ./skills/bes-song-leadsheets/scripts/song_audit.ts <song.txt>
```

7. Generate TeX only when needed; never hand-edit the generated result.

## Direct Leadsheets TeX Workflow

1. Start from the standalone template in `references/authoring-and-audit.md`.
2. Use the `leadsheet` class and one or more `song` environments.
3. Choose only documented properties, environments, commands, and options from the capability map.
4. Search the official manual before using an unfamiliar or advanced feature.
5. Compile with XeLaTeX because this repository's songbook uses `fontspec` and XeLaTeX.
6. Inspect both terminal output and the `.log` file.

## TeX Audit Workflow

1. Classify the file as generated or handwritten and identify its owner.
2. Check document/class and environment balance.
3. Check song properties, braces, TeX escaping, and property names.
4. Check verse-like environment availability and local options.
5. Check chord syntax, required trailing spaces, line-end caveats, slash chords, and transposition assumptions.
6. Check package/library loading for advanced features such as `external` or `musejazz`.
7. Compare custom title/verse templates against their measuring and label contracts.
8. Compile through the narrowest real repository path and inspect the log.
9. Report findings against the owning source, not merely the generated symptom.

## Non-Negotiable Rules

1. Never invent Leadsheets commands or options; confirm them in the capability map/manual.
2. Never edit generated songbook outputs as the fix.
3. Never silently discard BES metadata.
4. Never claim rendered correctness from static inspection alone.
5. Keep changes scoped to the requested song, converter, template, or configuration owner.

## Scripts

- `scripts/song_audit.ts`: validate one BES song, show canonical output, optionally rewrite or generate TeX.
- `scripts/search_leadsheets.sh`: search the official installed/manual PDF by page and the installed package implementation, without storing either in this repository.
