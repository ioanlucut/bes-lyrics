---
name: bes-song-leadsheets
description: Deep reference context for understanding the BES song format and its LaTeX `leadsheets` integration in this repository. Use when explaining grammar rules, parser/validator behavior, sequence and subsection constraints, metadata mapping, chord normalization, leadsheets package semantics, and songbook build flow. Use editing/rewriting features only when explicitly requested.
---

# BES Song Leadsheets

## Overview

Use this skill primarily as a read-only knowledge layer for deep understanding of how BES song files and `leadsheets` generation work.
Treat implementation actions (editing songs, rewriting, conversion output) as optional and only execute them when explicitly requested.

## Learning Workflow (Default)

1. Start with [`references/bes-format-spec.md`](references/bes-format-spec.md) for canonical grammar and validator constraints.
2. Continue with [`references/bes-to-leadsheets-mapping.md`](references/bes-to-leadsheets-mapping.md) to understand repository-specific conversion semantics.
3. Use [`references/leadsheets-package-notes.md`](references/leadsheets-package-notes.md) for package-level `leadsheets` behavior and concepts.
4. Use [`references/workflow-and-quality-gates.md`](references/workflow-and-quality-gates.md) for practical command flow and failure diagnosis.
5. Explain the model in layers:
   - BES source format and invariants
   - Parser/printer/validator behavior
   - Converter mapping to `leadsheets`
   - Songbook assembly pipeline
6. Prefer explanation with examples and edge cases over performing file edits.

## Implementation Workflow (Explicit Request Only)

1. Edit target songs in canonical BES format.
2. Run targeted validation:
   - `node --no-warnings=ExperimentalWarning --loader ts-node/esm ./skills/bes-song-leadsheets/scripts/song_audit.ts <path/to/song.txt>`
3. If requested, run broader checks (`npm run verify`, `npm run test:ci`, `npm run songbook:convert`).

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
2. Cite the exact reference file(s) used for each key rule.
3. Only output edited song content or TeX when explicitly requested.

## Resources

### scripts/

Use [`scripts/song_audit.ts`](scripts/song_audit.ts) for per-file validation, canonical reprint, and optional TeX generation.

### references/

Load only what is needed for the task:

1. [`references/bes-format-spec.md`](references/bes-format-spec.md): BES grammar and validator/parser constraints.
2. [`references/bes-to-leadsheets-mapping.md`](references/bes-to-leadsheets-mapping.md): project conversion behavior and normalization rules.
3. [`references/leadsheets-package-notes.md`](references/leadsheets-package-notes.md): package-level `leadsheets` semantics relevant to this repo.
4. [`references/workflow-and-quality-gates.md`](references/workflow-and-quality-gates.md): command workflow, checks, and fix patterns.
