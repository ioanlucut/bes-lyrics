# BES Song Format Specification

## Table of Contents

1. Canonical File Layout
2. Section Identifier Grammar
3. Sequence and Ordering Invariants
4. Subsections (Split/Rejoin Behavior)
5. Title Metadata Contract
6. Character and Content Constraints
7. Chord Markup in BES Source
8. Validation Failure Patterns
9. Authoring Checklist

## Canonical File Layout

Use this structure:

```txt
[title]
Song title {metaKey: {value}, ...}

[sequence]
v1,c,v2,c,b,c,e

[v1]
Verse line 1
Verse line 2

[c]
Chorus line 1
Chorus line 2
```

Hard rules:

1. Put `[title]` first.
2. Put `[sequence]` second.
3. Keep all body sections after `[sequence]`.
4. Separate top-level sections with exactly one blank line.

Why this is strict:

1. `verifyStructure()` reads sequence tokens from `sectionTuples[3]`, which assumes `[sequence]` is the second declared section.
2. Parser and printer tolerate some flexibility, but repository tooling is optimized around the canonical order.

## Section Identifier Grammar

Supported families:

1. Verse: `v`
2. Pre-chorus: `p`
3. Chorus: `c`
4. Bridge: `b`
5. Ending: `e`
6. Recital/Solo: `s`

Valid sequence tokens:

1. Verse requires numeric index: `v1`, `v2`, `v3`, ...
2. Pre-chorus allows `p`, `p2`, `p3`, ... but not `p1`.
3. Chorus allows `c`, `c2`, `c3`, ... but not `c1`.
4. Bridge allows `b`, `b2`, `b3`, ... but not `b1`.
5. Recital allows `s`, `s2`, `s3`, ... but not `s1`.
6. Ending is only `e` (no numeric suffix).

Valid subsection tokens:

1. `v1.1`, `v1.2`, `v2.1`
2. `c1.1`, `c1.2`, `c2.1`
3. `p1.1`, `p1.2`, `p2.1`
4. `b1.1`, `b1.2`, `b2.1`
5. `s1.1`, `s1.2`, `s2.1`

Known invalid examples:

1. `v`
2. `c1`, `p1`, `b1`, `s1`
3. `e1`

## Sequence and Ordering Invariants

The validator enforces these:

1. `[title]` exists.
2. `[sequence]` exists.
3. Every token in `[sequence]` is recognized.
4. Every declared section tag appears in `[sequence]`.
5. Every `[sequence]` tag exists as a declared section.
6. Declared section headers are unique.

Ordering constraints:

1. `v*`, `p*`, `c*`, and `b*` families must be consecutive with no gaps.
2. Subsection chains must be consecutive.
   - Valid: `v1.1,v1.2,v2.1`
   - Invalid: `v1.1,v1.3`
3. Mixed main/subsection transitions must still preserve consecutive main index order.

Repeats:

1. Duplicates in `[sequence]` are valid and expected for repeated choruses.
2. Duplicates in declared section headers are invalid.

## Subsections (Split/Rejoin Behavior)

`print()` may rewrite section identifiers based on content shape.

Split behavior:

1. If a section body contains double newlines, printer splits it into subsections.
2. Section `v2` with two paragraph blocks becomes `v2.1` and `v2.2`.
3. `[sequence]` occurrences for `v2` are expanded to `v2.1,v2.2`.

Rejoin behavior:

1. If a section appears as a single subsection (for example `v1.1`) and no additional sibling subsection exists in sequence, printer may collapse it back to `v1`.

Practical implication:

1. Use double blank lines intentionally.
2. Avoid accidental blank paragraphs in section content if you do not want subsection splitting.

## Title Metadata Contract

Metadata is parsed from the title line using nested braces:

```txt
[title]
Name {alternative: {Alt A; Alt B}, composer: {Name}, id: {abc123}, contentHash: {c0ffee}}
```

Keys used by this repository:

1. `alternative`
2. `version`
3. `contentHash`
4. `id`
5. `rcId`
6. `writer`
7. `composer`
8. `arranger`
9. `interpreter`
10. `band`
11. `genre`
12. `key`
13. `tempo`
14. `tags`

Conventions:

1. Use `*` for unknown/unset values.
2. Use `;` to separate multiple values for list-like fields.
3. Preserve existing metadata unless explicitly updating it.

Parser-side behavior:

1. Missing `id` or `id: {*} ` gets auto-generated.
2. `contentHash` is computed from canonical content (title text plus body).
3. Multi-value metadata is normalized with semicolon plus single-space separators.

## Character and Content Constraints

Allowed characters are constrained by `ALLOWED_CHARS` in `src/constants.ts`.

Important points:

1. Keep Romanian diacritics in canonical forms (`ș`, `ț`, etc.).
2. Keep typographic apostrophes/quotes consistent (`‘’”„`) where used.
3. Do not introduce unsupported Unicode variants.

Validator constraint per section:

1. Unique relevant character count must be at most `50` (computed after filtering punctuation-like separators).

## Chord Markup in BES Source

Use inline chord markup before syllables:

1. `^{D}Cântă`
2. `^*{G}cân` for split-word normalization cases
3. `^{D/F#}` slash-bass form is accepted in source and normalized later for TeX output

Avoid:

1. `^{A C}` (space inside chord braces)
2. Bare `{G}` without caret (converter can repair but treat as malformed input)

## Validation Failure Patterns

Common failures and likely fixes:

1. Error: `[title] is missing.`  
   Fix: add `[title]` as first section.
2. Error: `[sequence] is missing.`  
   Fix: add `[sequence]` as second section.
3. Error: `Unknown "x..." section.`  
   Fix: use only supported tokens.
4. Error: content tags not in sequence.  
   Fix: add missing tags to `[sequence]`.
5. Error: sequence tag missing as section.  
   Fix: add missing section body.
6. Error: duplicate section declarations.  
   Fix: keep one declaration per section tag.
7. Error: not consecutive.  
   Fix: repair numbering gaps (`v1,v2,v3`, not `v1,v3`).

## Authoring Checklist

1. Place `[title]`, then `[sequence]`, then section blocks.
2. Keep section identifiers legal and consecutive.
3. Keep sequence/content parity exact.
4. Keep metadata braces and keys well-formed.
5. Keep chord markup parseable (`^{...}`).
6. Run `song_audit.ts` and fix any structural or normalization errors before finalizing.
