import fs from 'fs';
import path from 'path';
import * as process from 'process';
import fsExtra from 'fs-extra';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import pMap from 'p-map';
import { parse } from '../src/songParser.js';
import { print } from '../src/songPrinter.js';
import {
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
} from '../src/index.js';
import { flatten } from 'lodash-es';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const RC_BASE = '/Users/ilucut/WORK/BES/bes-lyrics-parser';
const RC_DIR = `${RC_BASE}/out/resurse_crestine`;
const CANDIDATES_DIR = `/Users/ilucut/WORK/BES/bes-lyrics/candidates`;

const rcAuthorPathsToProcess = fsExtra
  .readFileSync(`${__dirname}/authors_to_process.txt`)
  .toString()
  .split(NEW_LINE)
  .filter(Boolean);

const readFiles = async (dir: string) =>
  (await recursive(dir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

const runFor = async (songsDirs: string[]) => {
  const allSongsInRepo = flatten(
    await Promise.all(songsDirs.map(readFiles)),
  ).map(({ contentAsString }) => parse(contentAsString));
  const allRcIds = allSongsInRepo.map(({ rcId }) => rcId).filter(Boolean);

  await pMap(rcAuthorPathsToProcess, async (pathConfig) => {
    const [counts, author, authorPath] = pathConfig.split(':');
    const dirToImportFrom = `${RC_DIR}/${authorPath}`;
    (await readFiles(dirToImportFrom)).forEach(
      ({ contentAsString, filePath, fileName }) => {
        const rcSongAST = parse(contentAsString);
        logProcessingFile(
          fileName,
          `Import from RC from ${author}; Counts: ${counts}.`,
        );
        logFileWithLinkInConsole(filePath);

        if (allRcIds.includes(rcSongAST.rcId)) {
          console.log(
            `Skip processing the song with RC ID ${rcSongAST.rcId} as we have it in our system.`,
          );
          console.log(NEW_LINE);

          return;
        }

        const authorDirTarget = `${CANDIDATES_DIR}/${rcSongAST.author}`;

        fsExtra.ensureDirSync(authorDirTarget);
        fs.writeFileSync(`${authorDirTarget}/${fileName}`, print(rcSongAST));
      },
    );
  });
};

await runFor([process.env.VERIFIED_DIR, process.env.CANDIDATES_DIR]);
