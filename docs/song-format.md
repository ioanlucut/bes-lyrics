# Song format

Each song is one UTF-8 `.txt` file. The file is a series of blocks separated by
blank lines, and each block starts with a `[marker]` line. `[title]` comes first
and `[sequence]` second; the sections follow.

```text
[title]
Aceasta mi-e dorința, să Te-onorez {alternative: {*}, composer: {*}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {*}, genre: {*}, rcId: {59763}, id: {8ipLZddXG3Zy7Hbbo93Vm7}, contentHash: {418384}}

[sequence]
v1,c,v2,c

[v1]
Aceasta mi-e dorința, să Te-onorez,
Cu ființa-ntreagă să Te slăvesc.
Te ador, Stăpâne, și mă închin,
Lauda și onoarea Ți se cuvin!

[c]
Ție-Ți dau inima și sufletul meu,
Pentru Tine vreau să trăiesc!
Domnul meu, Te iubesc!
Zi de zi vreau să-mplinesc
Doar sfântă voia Ta!

[v2]
Vrednic ești de cinste, fii lăudat!
Împărat al slavei, fii înălțat!
Alfa și Omega, de-a pururi viu,
Domn al veșniciei, în veci! Amin!
```

You only have to write the title, the sequence and the sections. The
[metadata bot](architecture.md#the-metadata-bot) fills in the rest when you open
a pull request.

## Title and metadata

The line after `[title]` holds the song title, optionally followed by metadata
on the same line as `key: {value}` pairs inside one pair of braces. Metadata
spread over several lines is not read.

| Key                             | Meaning                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                            | Stable identity of the song across edits and renames. Generated when missing or set to `*`; must be unique across `verified/`. |
| `contentHash`                   | Six hex characters derived from the song content. Recomputed on every format; the migrator uses it to ship only changed songs. |
| `rcId`                          | The song's ID on [Resurse Creștine](https://www.resursecrestine.ro), when it was imported from there.                          |
| `alternative`                   | A distinguishing label when two songs share a title.                                                                           |
| `version`                       | A distinguishing label for a different arrangement of the same song.                                                           |
| `writer`                        | Wrote both the lyrics and the melody.                                                                                          |
| `composer`                      | Wrote the melody.                                                                                                              |
| `arranger`                      | Arranged an existing song.                                                                                                     |
| `interpreter`                   | Performer the version is based on.                                                                                             |
| `band`                          | Band the version is based on.                                                                                                  |
| `genre`, `key`, `tempo`, `tags` | Descriptive fields; `key` and `tempo` appear in the songbook.                                                                  |

`*` means "not set". Separate multiple values with `;`, for example
`composer: {Chris Tomlin; Matt Redman}`. The printer always writes every key in
the order shown in the example above, so after formatting every title line has
the same shape.

The file name is derived from the metadata: the first of `band`, `interpreter`,
`composer`, `writer` or `arranger` that is set, then the title, `alternative`
and `version`, joined with `-`. Punctuation is removed and diacritics are folded
(`ă` → `a`, `ș` → `s`), so the title above lives in
`Aceasta mi-e dorinta sa Te-onorez.txt`.

## Sequence

`[sequence]` lists the order in which the sections are sung, separated by
commas: `v1,c,v2,c`. Every item must have a matching section, and every section
must appear in the sequence at least once.

## Section markers

| Marker            | Section                            | Numbering                                 |
| ----------------- | ---------------------------------- | ----------------------------------------- |
| `[v1]`, `[v2]`, … | Verse                              | Always numbered, starting at `1`          |
| `[c]`, `[c2]`, …  | Chorus                             | The first is unnumbered; `c1` is rejected |
| `[p]`, `[p2]`, …  | Pre-chorus, sung before the chorus | Like the chorus                           |
| `[b]`, `[b2]`, …  | Bridge                             | Like the chorus                           |
| `[s]`, `[s2]`, …  | Recital (a spoken section)         | Like the chorus                           |
| `[e]`             | Ending                             | Only one                                  |

Numbers must be consecutive, except for recitals: `v3` requires `v2`, and `c3`
requires `c2`. A section that contains a blank line is split into sub-sections
such as `v1.1` and `v1.2`, and the sequence is rewritten to match.

## Allowed characters

Besides spaces and line breaks, only these characters may appear in a song, in
its file name and in its content:

```text
*{}&!()][,-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZYQabcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț‘’”„
```

Romanian has look-alike characters: `ş` and `ţ` with a cedilla are different
Unicode code points from `ș` and `ț` with a comma below, and only the comma
forms are correct Romanian. Straight quotes and `…` are likewise rejected. The
metadata bot converts the common mistakes, but the check runs first, so fix them
yourself or run `npm run reprocess:content` before pushing. See
[issue #105](https://github.com/ioanlucut/bes-lyrics/issues/105) for the quote
conventions.

## Lead sheets

A song can have a chorded twin in `leadsheets/` with the same `id`, the same
metadata and the same lyrics, plus chord markup such as `A^{D}ceasta`. See
[Lead sheets and songbook](leadsheets-and-songbook.md).
