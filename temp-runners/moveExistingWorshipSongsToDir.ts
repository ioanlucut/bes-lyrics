import fs from 'fs';
import path from 'path';
import * as process from 'process';
import fsExtra from 'fs-extra';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import pMap from 'p-map';
import stringSimilarity from 'string-similarity';
import { parse } from '../src/songParser.js';
import { print } from '../src/songPrinter.js';
import {
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
  SLASH,
} from '../src/index.js';
import { flatten, without } from 'lodash-es';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const RC_BASE = '/Users/ilucut/WORK/BES/bes-lyrics-parser';
const RC_DIR = `${RC_BASE}/out/resurse_crestine`;
const L_I_DIR = 'trupe_lauda_si_inchinare';
const L_AND_I = '/Users/ilucut/WORK/BES/bes-lyrics/verified/' + L_I_DIR;

const pickedPartialTitleSongs = fsExtra
  .readFileSync(`${__dirname}/manual_picks.txt`)
  .toString()
  .split(NEW_LINE)
  .filter(Boolean);

const getOneOrTwoMatches = (text: string) => text.split(' / ').filter(Boolean);

const readFiles = async (dir: string) =>
  (await recursive(dir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

const runFor = async (songsDirs: string[]) => {
  const lines = [] as string[];
  const rawSongs = flatten(await Promise.all(songsDirs.map(readFiles)));

  await pMap(pickedPartialTitleSongs, async (rawLine) => {
    const [matchingTitle, maybeMatchingExtraText] = rawLine
      .split(SLASH)
      .filter(Boolean);

    rawSongs.forEach(({ contentAsString, fileName, filePath }) => {
      const { title, sectionsMap } = parse(contentAsString);

      const isAGreatHit =
        stringSimilarity.compareTwoStrings(
          title.toLowerCase(),
          matchingTitle.toLowerCase(),
        ) >= 0.9 ||
        (!!maybeMatchingExtraText &&
          stringSimilarity.compareTwoStrings(
            title.toLowerCase(),
            maybeMatchingExtraText.toLowerCase(),
          ) >= 0.9) ||
        (!!maybeMatchingExtraText &&
          sectionsMap[0]?.content &&
          stringSimilarity.compareTwoStrings(
            sectionsMap[0]?.content?.toLowerCase(),
            maybeMatchingExtraText.toLowerCase(),
          ) >= 0.9);
      const isAHit = title.includes(matchingTitle);

      if (isAGreatHit || isAHit) {
        lines.push(rawLine);

        if (filePath.includes(L_I_DIR)) {
          console.log(
            `Skipping ${fileName} as it is already in the target dir.`,
          );

          return;
        }

        console.log({
          title,
          matchingTitle,
          isExactMatch: isAGreatHit,
          contains: isAHit,
        });
        fsExtra.moveSync(filePath, `${L_AND_I}/${fileName}`);
      }
    });

    fs.writeFileSync(
      `${__dirname}/manual_picks_rest.txt`,
      without(pickedPartialTitleSongs, ...lines).join(NEW_LINE),
    );
  });
};

await runFor([process.env.VERIFIED_DIR]);
