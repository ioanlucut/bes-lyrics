# Upstream Leadsheets Reference

## Pinned Release

This skill is pinned to the Leadsheets release used by this repository's current TeX installation:

- Version: `0.7`
- Release date: `2022/01/05`
- Author: Clemens Niederberger
- License: LPPL 1.3 or later
- CTAN archive: `https://mirrors.nxthost.com/ctan/macros/latex/contrib/leadsheets.zip`
- Manual: `https://mirrors.nxthost.com/ctan/macros/latex/contrib/leadsheets/leadsheets_en.pdf`

Verified checksums:

```text
leadsheets.zip     135a6194c2dc88dd9e0e018852a1a4d6385818937b66f535566ec425f33f6d15
leadsheets_en.pdf  1d0d581504a79d5af1eebc129d93ab294db27011fe3f030b3672b2c6ffc23ae1
leadsheets_en.tex  889a2b657ae9f90794a602038d2014d61614be594f662ef75cb3e7449c0f6aa4
leadsheets.sty     66ed234dc3127cea64ba886ac8afd9ef38ed3f9027af605c285c2cf4720e9544
```

The downloaded mirror PDF and the locally installed TeX Live 2023 PDF were byte-identical when this snapshot was created.

## Vendored Material

`upstream/leadsheets-v0.7/` contains the complete CTAN v0.7 source archive except the binary PDF:

- `leadsheets_en.tex`: authoritative manual source.
- `leadsheets_en.txt`: page-marked text extracted from the official PDF with `pdftotext -layout`.
- `leadsheets.sty`, `leadsheet.cls`, and every `leadsheets.library.*.code.tex`: package implementation.
- `README`: upstream copyright, license, maintainer, and bundle inventory.

The PDF is omitted because it adds 2.5 MB while remaining inaccessible to text search. The page-marked extraction provides the rendered manual text; the TeX source preserves exact command spelling and examples.

Do not edit upstream files. Replace the complete snapshot only when deliberately upgrading Leadsheets.

## Authority Order

Use sources in this order:

1. Repository source code for actual BES conversion and layout behavior.
2. `leadsheets_en.tex` or the page-marked PDF extraction for documented v0.7 semantics.
3. Vendored package implementation for undocumented behavior and compatibility diagnosis.
4. BES summary references only as navigation aids.

Never infer current behavior from a newer online manual without first upgrading and validating the installed package.

## Searching

Search the rendered manual and implementation:

```bash
./skills/bes-song-leadsheets/scripts/search_leadsheets.sh '<term or regex>'
```

The manual results include PDF page numbers. Cite those page numbers when explaining upstream behavior.

Useful direct searches:

```bash
rg -n '\\includeleadsheet|external' \
  skills/bes-song-leadsheets/references/upstream/leadsheets-v0.7/

rg -n 'title-template|definesongtitletemplate' \
  skills/bes-song-leadsheets/references/upstream/leadsheets-v0.7/
```

## Version Verification

Before relying on package details or changing songbook TeX, run:

```bash
./skills/bes-song-leadsheets/scripts/verify_leadsheets_version.sh
```

A mismatch is a compatibility decision, not an invitation to silently regenerate this snapshot. Establish which version the repository should support, then update the snapshot, BES notes, and compiled output together.
