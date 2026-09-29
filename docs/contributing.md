# Contributing

Every change to the library is a pull request. CI checks it, a bot adds the
metadata, and after the merge the song reaches ProPresenter and, for worship
songs with chords, the songbook.

## Fix or edit a song

1. Find the song in `verified/`. Files are named after their author and title
   without diacritics, for example
   `verified/trupe_lauda_si_inchinare/Aceasta mi-e dorinta sa Te-onorez.txt`.
2. Edit the lyrics. Keep the [format](song-format.md) and use only the
   [allowed characters](song-format.md#allowed-characters): `ș` and `ț` with a
   comma below, and `„` `”` quotes.
3. If the song has a twin in `leadsheets/` with the same `id`, make the same
   lyric change there, keeping the chords.
4. Open a pull request. If a check fails, its log names the file and the rule.
5. When the checks pass, the bot may push a commit with IDs, hashes, file names
   and typography fixes. Pull it before you push again.

GitHub's web editor is enough for small fixes: open the file, edit it, and
choose "Create a new branch and start a pull request".

## Add a new song

Create a file in the right `verified/` folder with a title, a sequence and the
sections:

```text
[title]
Song title

[sequence]
v1,c,v2,c

[v1]
…

[c]
…

[v2]
…
```

Leave out the metadata and the file name details. The bot generates the `id` and
`contentHash`, fills every metadata key with `*`, and renames the file after the
metadata. Add `composer`, `writer` or other
[metadata](song-format.md#title-and-metadata) on the title line if you know it.

To add chords, wait until the bot has given the song its `id`, then copy the
song into `leadsheets/` with the same file name, keeping the title line and its
`id`, and add the [chord markup](leadsheets-and-songbook.md#chord-markup).

## Import from Resurse Creștine

The importer reads songs scraped by
[`bes-lyrics-parser`](https://github.com/ioanlucut/bes-lyrics-parser), a private
repository; its lists below open for collaborators only:

- To import single songs, add each
  [Resurse Creștine](https://www.resursecrestine.ro) song ID on a new line in
  `import-songs-temp-runners/rc_ids_to_process.txt`. The ID is the number in the
  song's URL: `https://www.resursecrestine.ro/cantece/212152/cuvantul-intrupat`
  is `212152`. The parser's
  [`authors_ids.txt`](https://github.com/ioanlucut/bes-lyrics-parser/blob/main/out/resurse_crestine/authors_ids.txt)
  lists the available songs.
- To import an author's songs, add their line from the parser's
  [`authors.txt`](https://github.com/ioanlucut/bes-lyrics-parser/blob/main/out/resurse_crestine/authors.txt)
  to `import-songs-temp-runners/rc_authors_to_process.txt`.

Then, with `bes-lyrics-parser` checked out next to this repository, run
`npm run import:rc`. It imports the songs into `candidates/`, skipping songs
that are already in the library, and removes songs whose IDs are listed in
`rc_ids_to_ignore.txt` from the library. It refuses any scraped author name or
path that would write outside `candidates/`. Commit the result in a pull
request.

Imported songs stay in `candidates/` until someone reviews them and moves them
into `verified/`. `npm run verify:similarity` lists candidates that look like
songs already in the library.

## Run the checks locally

With Node.js 24:

```bash
npm ci
npm run build:ci          # everything CI blocks on
npm run reprocess:content # fix typography the way the bot does
npm run format            # reprint songs in canonical form
```

To build the songbook PDF, see
[Lead sheets and songbook](leadsheets-and-songbook.md#the-songbook).
