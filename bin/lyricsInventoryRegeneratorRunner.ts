import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import {
  assertUniqueness,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getTodayAsDateString,
  logFileWithLinkInConsole,
  logProcessingFile,
  SongInventoryChange,
  SongMeta,
  SongsInventory,
  SongsInventoryEntry,
  TXT_EXTENSION,
} from '../src/index.js';
import assert from 'node:assert';
import { isEqual, last, reject } from 'lodash-es';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inventoryChangelogFilename = path.join(
  __dirname,
  '..',
  'inventoryChangelog.json',
);

const run = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  const { songs } = JSON.parse(
    fs.readFileSync(inventoryChangelogFilename).toString(),
  ) as SongsInventory;

  const songsAsHashMap = songs.reduce(
    (accumulator, entry) => ({
      ...accumulator,
      [entry.id]: entry,
    }),
    {} as {
      [id: string]: SongsInventoryEntry;
    },
  );

  const songsMeta = (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .map((filePath) => {
      const filename = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath).toString();

      logProcessingFile(filename, 'inventory generation');
      logFileWithLinkInConsole(filePath);

      const rawTitle = getSongInSectionTuples(fileContent)[1];

      assert.ok(
        rawTitle.includes(SongMeta.CONTENT_HASH),
        `The ${SongMeta.CONTENT_HASH} should be defined.`,
      );

      return {
        filename,
        metaSections: getMetaSectionsFromTitle(rawTitle),
        titleWithoutMetaSections: getTitleWithoutMeta(rawTitle),
      };
    });

  assertUniqueness(
    songsMeta.map(({ metaSections }) => metaSections[SongMeta.ID]),
  );

  const dateAsString = getTodayAsDateString();
  const updatedSongsInventory = songsMeta.map(({ filename, metaSections }) => {
    const id = metaSections[SongMeta.ID];
    const contentHash = metaSections[SongMeta.CONTENT_HASH];
    const currentInventory = songsAsHashMap[id];

    if (!currentInventory) {
      return {
        id,
        filename,
        changes: [
          {
            date: dateAsString,
            contentHash,
          },
        ],
      } as SongsInventoryEntry;
    }

    const { changes } = currentInventory;
    const {
      filename: lastChangeFilename,
      contentHash: lastChangedContentHash,
      date: lastChangedDate,
    } = last(changes) as SongInventoryChange;

    if (isEqual(lastChangedContentHash, contentHash)) {
      return currentInventory;
    }

    const isFilenameChanged = !isEqual(lastChangeFilename, filename);
    return {
      id,
      filename,
      changes: [
        ...(isEqual(lastChangedDate, dateAsString)
          ? reject(changes, { date: lastChangedDate })
          : changes),
        {
          date: dateAsString,
          contentHash,
          ...(isFilenameChanged ? { filename, isFilenameChanged } : {}),
        },
      ],
    } as SongsInventoryEntry;
  });

  assertUniqueness(Object.keys(updatedSongsInventory).map((id) => id));

  fs.writeFileSync(
    inventoryChangelogFilename,
    JSON.stringify({
      updatedOn: dateAsString,
      songs: updatedSongsInventory.sort((a, b) =>
        a.filename.localeCompare(b.filename),
      ),
    }),
  );
};

await run(process.env.VERIFIED_DIR as string);
