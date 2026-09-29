# bes-lyrics

[![CI](https://github.com/ioanlucut/bes-lyrics/actions/workflows/ci.yml/badge.svg)](https://github.com/ioanlucut/bes-lyrics/actions/workflows/ci.yml)
[![Songbook](https://img.shields.io/github/v/release/ioanlucut/bes-lyrics?label=songbook&color=8250df)](https://github.com/ioanlucut/bes-lyrics/releases/latest)
[![License: GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)
![Songs](https://img.shields.io/badge/songs-1%2C935-1a7f37)
![Lead sheets](https://img.shields.io/badge/lead%20sheets-347-0969da)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

**Songs as code.** The song library of Biserica Emanuel Sibiu (BES), kept as
plain text in Git and treated the way infrastructure as code treats servers:
every change is reviewed, statically checked, versioned and deployed by CI.

Every song is one `.txt` file. A pull request runs checks that reject broken
structure, wrong Romanian diacritics and chord sheets that drift from the
lyrics. Once merged, GitHub Actions compiles the same files into ProPresenter 7
presentations for the church screens and into a PDF songbook with chords for the
bands.

![Animated overview: a song file with a cedilla ţ fails the Characters check and blocks the pull request; after the fix every check passes, the pull request merges, and the lyrics appear on a ProPresenter slide and on a PDF songbook page with chords](docs/assets/dataflow.gif)

## Songs as code

A church that projects lyrics every Sunday and prints chord sheets for its bands
ends up with many copies of each song. Kept by hand, those copies drift apart. A
typo fixed on screen survives in print, `ş` and `ș` look alike but are different
characters, the same song gets imported twice under two names, and nobody knows
which copy is current.

This is the same problem infrastructure as code solved for servers, so
`bes-lyrics` borrows its answer: one text file per song is the source of truth,
and everything else is built from it.

| Practice           | Songs kept by hand                 | Songs as code                                                                                                                    |
| ------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Source of truth    | Whichever copy someone edited last | One `.txt` file per song in Git                                                                                                  |
| Declarative        | Slides built one by one in an app  | Sections declared once, the order written as `v1,c,v2,c`                                                                         |
| Review             | None                               | Every change is a pull request with a diff and a reviewer                                                                        |
| History            | None                               | `git log`, `git blame` and `git revert` for every line of every song                                                             |
| Static analysis    | By eye                             | Allowed characters, structure, unique IDs and lead-sheet sync are checked on every pull request; the merge is blocked on failure |
| Formatting         | Whatever the last editor left      | A custom Prettier plugin reprints every song in canonical form                                                                   |
| Duplicates         | Found by accident, on a Sunday     | A similarity report flags songs whose lyrics overlap by more than 65%                                                            |
| Build and delivery | Export, copy, import               | Merge to `main`; CI ships ProPresenter files and a new PDF songbook                                                              |

## In production

Since March 2023 this repository has held the whole song library of BES, a
church in Sibiu, Romania: 1,935 songs for the worship bands, the mixed, men's
and children's choirs, Sunday school groups and the brass band. 347 of them also
have a chorded lead sheet, and the 291 worship-band lead sheets make up the
printed songbook.

By numbers: 2,300+ commits, 300+ merged pull requests, 44 songbook releases
since December 2024, and 171 tests guarding the tooling.

| Output                          | Built from                             | Delivered to                                                                                                                                                   |
| ------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ProPresenter 7 presentations    | `verified/`                            | Google Drive, then the presentation Mac, through [`bes-propres7-migrator`](https://github.com/ioanlucut/bes-propres7-migrator); only new or changed songs ship |
| PDF songbook with chords        | `leadsheets/trupe_lauda_si_inchinare/` | [GitHub Releases](https://github.com/ioanlucut/bes-lyrics/releases) and Google Drive, rebuilt on every change                                                  |
| Projection team code of conduct | `LaTeX/conduct/`                       | GitHub Releases and Google Drive                                                                                                                               |

## What makes it interesting

- **A parser and printer that round-trip.** A song parses into an AST and prints
  back in canonical form. Formatting, validation, typography fixes and the LaTeX
  converter are all built on that round trip. See
  [Architecture](docs/architecture.md#songs-as-data).

- **Checks that block, not just warn.** Every pull request runs lint and tests,
  then verifies file types, song structure, allowed characters, unique song IDs
  and lead-sheet consistency across the whole library. See
  [the checks](docs/architecture.md#the-checks).

- **Expert corrections become rules.** When a linguist fixes `nici o` to `nicio`
  or `ş` to `ș` in one song, the fix becomes a reprocessor rule, and a bot
  applies it to every song, including the ones added next year.

- **A bot does the bookkeeping.** After the checks pass, a GitHub Actions bot
  assigns stable IDs, computes content hashes, renames files after their
  metadata, normalizes typography and commits the result back to the pull
  request.

- **Lyrics and chords cannot drift.** A chorded lead sheet in `leadsheets/`
  shares its song's `id`. CI strips the chords and requires the lyrics, sequence
  and metadata to match the chord-free song exactly.

- **The docs are tested.** The example song in the format guide is parsed and
  reprinted in CI, the allowed-characters list and section markers are checked
  against the code, and every relative link and anchor must resolve.

- **Importing is a one-line change.** Add a
  [Resurse Creștine](https://www.resursecrestine.ro) song ID or author to a
  list, open a pull request, and a bot imports the songs into `candidates/` for
  review.

- **Ready for AI agents.**
  [`skills/bes-song-leadsheets/`](skills/bes-song-leadsheets/SKILL.md) teaches
  coding agents the song format and the Leadsheets LaTeX package, and every pull
  request gets a Claude code review before merge.

## Why I built this

When I started, the BES songs lived in presentation apps and slide decks, one
copy per tool and per team. I work as a software engineer, and I recognized the
problem: configuration drift. Many hand-edited copies, no history, no review,
and no way to know which one was right. Infrastructure as code solved that for
servers years ago, so I wanted the same for songs.

Once a song is a text file in Git, the rest of the software toolbox works on it.
Pull requests give review and history. A parser gives static analysis, so a
wrong diacritic or a missing chorus fails the build instead of showing up on the
screen on Sunday. CI gives delivery, so nobody retypes a song into ProPresenter
or a songbook again.

The language itself was not my job. Emma is a linguist and checked every song by
hand. My part was to make that work last: turn each correction into a rule, each
rule into a check, and each check into something no pull request can skip.

— [Ioan Lucuț](https://github.com/ioanlucut)

### How it grew

| When         | Milestone                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------- |
| Mar 2023     | Library imported from EasySlides into plain text; first CI checks                            |
| Apr 2023     | Test suite, integrity checks, similarity report for duplicates, Romanian dictionary analysis |
| Jun–Jul 2023 | Section-based format, stable song IDs, content hashes, custom Prettier plugin                |
| Aug 2023     | Every merge deploys to ProPresenter 7 through `bes-propres7-migrator`                        |
| Sep 2023     | Metadata bot and typography rules applied to every pull request                              |
| Oct 2023     | Resurse Creștine importer driven by ID and author lists                                      |
| Nov 2023     | LaTeX pipeline and releases for the projection team code of conduct                          |
| Dec 2024     | First PDF songbook with chords, rebuilt and released on every change                         |
| Mar–Jul 2026 | Chord corpus recovered and normalized; lead sheets split from lyrics and kept in sync by CI  |
| Sep 2026     | Node 24 toolchain, docs tested against the code, Claude review on every pull request         |

## People

- **[Ioan Lucuț](https://github.com/ioanlucut)** designed and built the format,
  the tooling, the checks and the delivery pipelines, and maintains them.

- **Emma ([@EmanuelVecerdea](https://github.com/EmanuelVecerdea))** is the
  linguist behind the content: checked every song by hand and has added and
  corrected the Sunday songs since 2023.

- **[@ioanastanila](https://github.com/ioanastanila)** and
  **[@ghitaoana](https://github.com/ghitaoana)** did the first proofreading pass
  over the library in spring 2023.

## Quick start

Requires Node.js 24 (see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/ioanlucut/bes-lyrics.git
cd bes-lyrics
npm ci
npm run build:ci   # lint, tests and every blocking song check
```

To add or fix a song, edit its file under `verified/` and open a pull request.
[Contributing](docs/contributing.md) walks through it, including lead sheets and
imports.

To build the songbook locally you also need TeX Live with XeLaTeX:

```bash
npm run songbook:dist   # writes LaTeX/songbook/bes-songbook.pdf
```

## Repository layout

| Path                          | Contents                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `verified/`                   | Canonical, chord-free songs, grouped by ensemble; this is what ProPresenter shows |
| `leadsheets/`                 | Chorded twins of verified songs, used for the PDF songbook                        |
| `candidates/`                 | Imported or proposed songs waiting for review; not checked by CI                  |
| `src/`                        | Parser, printer, validators, reprocessors and the lead-sheet converter            |
| `bin/`                        | Command-line validators and reprocessors behind the `npm run` scripts             |
| `LaTeX/`                      | Songbook template and converter, and the code of conduct document                 |
| `import-songs-temp-runners/`  | Resurse Creștine import lists and scripts                                         |
| `skills/bes-song-leadsheets/` | Instructions for AI agents that author songs and lead sheets                      |

## Documentation

- [Song format](docs/song-format.md): the file format, metadata, section markers
  and allowed characters.
- [Lead sheets and songbook](docs/leadsheets-and-songbook.md): chord markup and
  how the PDF is built.
- [Architecture](docs/architecture.md): the pipeline, every check, the metadata
  bot and the workflows.
- [Contributing](docs/contributing.md): adding, editing and importing songs.

## Related repositories

- [`bes-propres7-migrator`](https://github.com/ioanlucut/bes-propres7-migrator)
  compiles `verified/` into native ProPresenter 7 `.pro` files through the
  reverse-engineered protobuf format and deploys only what changed.
- [`bes-lyrics-parser`](https://github.com/ioanlucut/bes-lyrics-parser)
  (private) scrapes Resurse Creștine and provides the songs the importer reads.

## License

[GNU GPL v3](LICENSE).
