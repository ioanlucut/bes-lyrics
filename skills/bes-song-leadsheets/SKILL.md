---
name: bes-song-leadsheets
description: Authoritative BES song format and Leadsheets v0.7 knowledge for this repository. Must be used for any task involving song grammar, parser/validator behavior, generated song TeX, chords, Leadsheets commands or options, songbook layout, LaTeX compilation, or PDF output. Use editing/rewriting features only when explicitly requested.
---

# BES Song Leadsheets

## Overview

Use this skill primarily as a read-only knowledge layer for deep understanding of how BES song files and `leadsheets` generation work.
Treat implementation actions (editing songs, rewriting, conversion output) as optional and only execute them when explicitly requested.

## Authority and Version

1. This repository is pinned to the vendored Leadsheets `0.7` reference dated `2022/01/05`.
2. Before package-level analysis or TeX changes, run `scripts/verify_leadsheets_version.sh`.
3. Treat repository source as authoritative for BES behavior.
4. Treat the vendored manual source and page-marked PDF extraction as authoritative for documented Leadsheets v0.7 behavior.
5. Inspect the vendored package implementation when the manual is ambiguous or a compatibility workaround touches internals.
6. Treat summary notes as navigation only. Never invent syntax or rely on memory when the upstream reference can answer the question.
7. Do not edit files under `references/upstream/` except during an explicit Leadsheets upgrade.

See [`references/upstream-reference.md`](references/upstream-reference.md) for provenance, checksums, source priority, and update policy.

## Learning Workflow (Default)

1. Start with [`references/bes-format-spec.md`](references/bes-format-spec.md) for canonical grammar and validator constraints.
2. Continue with [`references/bes-to-leadsheets-mapping.md`](references/bes-to-leadsheets-mapping.md) to understand repository-specific conversion semantics.
3. For package semantics, search the full v0.7 reference with `scripts/search_leadsheets.sh '<term or regex>'` and inspect the cited manual pages/source.
4. Use [`references/leadsheets-package-notes.md`](references/leadsheets-package-notes.md) as a package map, not as a substitute for upstream documentation.
5. Use [`references/workflow-and-quality-gates.md`](references/workflow-and-quality-gates.md) for practical command flow and failure diagnosis.
6. Explain the model in layers:
   - BES source format and invariants
   - Parser/printer/validator behavior
   - Converter mapping to `leadsheets`
   - Songbook assembly pipeline
7. Prefer explanation with examples and edge cases over performing file edits.

## Implementation Workflow (Explicit Request Only)

1. For Leadsheets, songbook, or PDF work, verify the pinned package with `scripts/verify_leadsheets_version.sh`.
2. Search the upstream reference for every command, option, environment, or internal being changed.
3. Edit target songs in canonical BES format.
4. Run targeted validation:
   - `node --no-warnings=ExperimentalWarning --loader ts-node/esm ./skills/bes-song-leadsheets/scripts/song_audit.ts <path/to/song.txt>`
5. If requested, run broader checks (`npm run verify`, `npm run test:ci`, `npm run songbook:convert`).
6. For rendering changes, compile the songbook and inspect `LaTeX/songbook/bes-songbook.log`; successful process exit alone is insufficient because the build uses force mode.

## Editing Rules

1. Keep `[title]` first and `[sequence]` second.
2. Keep section declarations unique in content (`[v1]`, `[c]`, etc. cannot be duplicated as section headers).
3. Keep `[sequence]` tokens aligned 1:1 with declared sections; duplicates are allowed only in the sequence to indicate repeats.
4. Keep numbering consecutive for verse/prechorus/chorus/bridge families, including subsection order.
5. Keep chord markup parseable (`^{...}` with no spaces inside braces).
6. Preserve or intentionally update metadata keys; do not silently drop existing values.
7. Use project reprocessing behavior intentionally:
   - Double blank lines inside a section trigger automatic subsection splitting on print.
   - Single subsection instances may be rejoined to the parent section identifier.

## Deliverables

1. By default, provide a high-fidelity explanation of format, constraints, and internals.
2. Cite the exact reference file(s) used for each key rule; cite PDF page numbers for upstream manual claims.
3. State any installed-version mismatch before drawing package conclusions.
4. Only output edited song content or TeX when explicitly requested.

## Resources

### scripts/

1. Use [`scripts/song_audit.ts`](scripts/song_audit.ts) for per-file validation, canonical reprint, and optional TeX generation.
2. Use [`scripts/search_leadsheets.sh`](scripts/search_leadsheets.sh) to search the rendered manual by PDF page and inspect matching implementation code.
3. Use [`scripts/verify_leadsheets_version.sh`](scripts/verify_leadsheets_version.sh) to verify the installed package and manual against the pinned reference.

### references/

Load only what is needed for the task:

1. [`references/bes-format-spec.md`](references/bes-format-spec.md): BES grammar and validator/parser constraints.
2. [`references/bes-to-leadsheets-mapping.md`](references/bes-to-leadsheets-mapping.md): project conversion behavior and normalization rules.
3. [`references/leadsheets-package-notes.md`](references/leadsheets-package-notes.md): package-level `leadsheets` semantics relevant to this repo.
4. [`references/workflow-and-quality-gates.md`](references/workflow-and-quality-gates.md): command workflow, checks, and fix patterns.
5. [`references/upstream-reference.md`](references/upstream-reference.md): v0.7 provenance, authority order, checksums, and search policy.
6. `references/upstream/leadsheets-v0.7/`: complete official source archive except the binary PDF, plus a page-marked PDF text extraction.
