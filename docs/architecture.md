# Architecture

`bes-lyrics` is a Git repository of song files plus the TypeScript tooling that
keeps them consistent. GitHub Actions does the rest: it checks every pull
request, writes metadata back to it, and after a merge ships the songs to
ProPresenter and to the PDF songbook.

```mermaid
flowchart LR
    E["Edit a song<br/>verified/ or leadsheets/"] --> PR["Pull request"]
    PR --> B["Build<br/>npm run build:ci"]
    B -- pass --> M["AutoUpdateMeta bot<br/>npm run meta:ci"]
    M -- "commit to the PR" --> PR
    PR -- merge --> MAIN["main"]
    MAIN -- "verified/** changed" --> D["deploy_to_gdrive.yml<br/>bes-propres7-migrator"]
    D --> PP["Google Drive → presentation Mac<br/>ProPresenter 7"]
    MAIN -- "worship lead sheets changed" --> S["latex_songbook_release.yml<br/>XeLaTeX"]
    S --> PDF["GitHub Release + Google Drive<br/>PDF songbook"]
```

## Songs as data

`src/songParser.ts` parses a song file into a `SongAST`: title, metadata,
sequence and a map of sections. `src/songPrinter.ts` prints a `SongAST` back to
text in canonical form. Everything else is built on this round trip:

- the [Prettier plugin](../src/prettier-bes-txt-plugin/index.ts) formats `.txt`
  files by parsing and reprinting them;
- the reprocessors parse, transform and reprint;
- the validators parse and assert;
- the lead-sheet converter turns a parsed song into LaTeX.

Parsing also fills in what is derivable. A missing `id` is generated with
`short-uuid`, and `contentHash` is recomputed from the file content without its
title metadata, so a chorded lead sheet and its chord-free song have different
hashes.

## The checks

`npm run build:ci` runs on every pull request, and a failure blocks the merge.

| Step                     | Script                     | Rejects                                                                                                                                                                                                                                                                                                         |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lint                     | `lint`                     | ESLint warnings or errors in the TypeScript tooling                                                                                                                                                                                                                                                             |
| Docs formatting          | `lint:docs`                | `README.md` or `docs/` not formatted by Prettier                                                                                                                                                                                                                                                                |
| Tests                    | `test:ci`                  | Parser, printer, validator and converter regressions; a song in the library that formats differently on a second pass, or a lead sheet whose TeX leaves an environment open; coverage of `src/` below its floor; docs whose links, example song, allowed characters or section markers no longer match the code |
| File types               | `verify:file-extensions`   | Anything other than `.txt` in `verified/`                                                                                                                                                                                                                                                                       |
| Unique IDs               | `verify:uniqueness-of-ids` | A song without an `id`, or two songs with the same one                                                                                                                                                                                                                                                          |
| Lead sheets              | `verify:leadsheets`        | Chords in `verified/`; invalid chords; a lead sheet without chords, with an unknown or duplicate `id`, or whose metadata, sequence, section order or chord-free lyrics differ from its song                                                                                                                     |
| Characters and structure | `verify`                   | Characters outside the [allowed set](song-format.md#allowed-characters) in a file name or song, and every [format](song-format.md) rule: missing title or sequence, unknown markers, sections missing from the sequence or vice versa, non-consecutive numbering                                                |

These checks cover `verified/` and `leadsheets/`. `candidates/` is not checked
on CI.

Some checks run only on demand, because they need judgement:

| Script               | Reports                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify:similarity`  | Pairs of songs whose lyrics are more than 65% similar, comparing candidates with each other, candidates with verified songs, and verified songs with each other. `verify:similarity:mv` replaces the verified song with the candidate and `verify:similarity:rm` deletes the candidate; both compare only candidates with verified songs and never change a verified song on their own, and `:mv` leaves in place candidates that duplicate the same verified song. |
| `dictionary:analyze` | Words the Romanian dictionary (plus `custom-dictionary_ro.txt`) does not know. It is not reliable enough to block; `dictionary:update` adds the reported words to the custom dictionary.                                                                                                                                                                                                                                                                            |

## The metadata bot

When `Build` passes, the `AutoUpdateMeta` job runs `npm run meta:ci` on the pull
request branch and commits any changes as
`[Bot] I have added all of the meta information…`:

1. `reprocess:filename` renames each file after its metadata (see
   [Song format](song-format.md#title-and-metadata)).
2. `reprocess:content` normalizes text and reprints each song, which assigns
   missing IDs: `ş`/`ţ` → `ș`/`ț`, `"` → `”`, `'` → `’`, `…` → `...`, double
   spaces, `nici o` → `nicio`, `Cristos` → `Hristos`, capitalized divine names
   (`Domnul`, `Isus`, `Mesia`, …), and Windows line endings.
3. `verify` checks characters and structure again.
4. `format` reprints every song and lead sheet through the Prettier plugin,
   refreshing content hashes.
5. `verify:leadsheets` confirms the lead sheets still match their songs.

Pull the bot's commit before pushing more changes to the same branch.

## Workflows

| Workflow                                                                        | Trigger                                                                               | What it does                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](../.github/workflows/ci.yml)                                         | Pull request                                                                          | `Build`, then `AutoUpdateMeta`. When the Resurse Creștine lists in `import-songs-temp-runners/` change, `ImportFromRCBasedOnAuthorsOrIds` imports those songs into `candidates/` and commits them.                                                  |
| [`deploy_to_gdrive.yml`](../.github/workflows/deploy_to_gdrive.yml)             | Push to `main` touching `verified/**`, or manual run                                  | Checks out [`bes-propres7-migrator`](https://github.com/ioanlucut/bes-propres7-migrator) and runs `convert:remote`, which builds `.pro` files and uploads new, changed or renamed songs to Google Drive. The manual run can force a full re-deploy. |
| [`latex_songbook_release.yml`](../.github/workflows/latex_songbook_release.yml) | Push to `main` touching the worship lead sheets, `LaTeX/songbook/**` or the converter | Converts the lead sheets to LaTeX, compiles the PDF with XeLaTeX, publishes a `BES_Songbook_<date>` release and uploads the PDF to Google Drive.                                                                                                    |
| [`latex_conduct_release.yml`](../.github/workflows/latex_conduct_release.yml)   | Push to `main` touching `LaTeX/conduct/**`                                            | Compiles the projection team's code of conduct and publishes it the same way.                                                                                                                                                                       |
| [`claude.yml`](../.github/workflows/claude.yml)                                 | A comment mentioning `@claude`                                                        | Runs a Claude review or task on the issue or pull request.                                                                                                                                                                                          |

## Related repositories

- [`bes-propres7-migrator`](https://github.com/ioanlucut/bes-propres7-migrator)
  owns everything after `verified/`: the ProPresenter format, incremental
  deploys and the presentation Mac sync.
- [`bes-lyrics-parser`](https://github.com/ioanlucut/bes-lyrics-parser)
  (private) scrapes Resurse Creștine into `out/resurse_crestine/`, which the
  import scripts read from a sibling checkout (`../bes-lyrics-parser`).
