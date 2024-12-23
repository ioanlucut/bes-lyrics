import dotenv from 'dotenv';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { flatten } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
import {
  COLON,
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
  parse,
  print,
  readTxtFilesRecursively,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const RC_DIR = `${path.join(
  __dirname,
  '../../',
  'bes-lyrics-parser',
)}/out/resurse_crestine`;

const CANDIDATES_DIR = './candidates';

const rcAuthorPathsToProcess = fsExtra
  .readFileSync(`${__dirname}/rc_authors_to_process.txt`)
  .toString()
  .split(NEW_LINE)
  .filter(Boolean);

const readFiles = async (dir: string) =>
  (await readTxtFilesRecursively(dir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

const runFor = async (songsDirs: string[]) => {
  const allSongsInRepo = flatten(
    await Promise.all(songsDirs.map(readFiles)),
  ).map(({ contentAsString }) =>
    parse(contentAsString, {
      ignoreUniquenessErrors: true,
    }),
  );
  const allRcIds = allSongsInRepo.map(({ rcId }) => rcId).filter(Boolean);

  await pMap(rcAuthorPathsToProcess, async (pathConfig) => {
    const [counts, composer, authorPath] = pathConfig.split(COLON);
    const dirToImportFrom = `${RC_DIR}/${authorPath}`;
    (await readFiles(dirToImportFrom)).forEach(
      ({ contentAsString, filePath, fileName }) => {
        logProcessingFile(
          fileName,
          `Import from RC from ${composer}; Counts: ${counts}.`,
        );
        logFileWithLinkInConsole(filePath);
        const rcSongAST = parse(contentAsString, {
          ignoreUniquenessErrors: true,
        });

        if (allRcIds.includes(rcSongAST.rcId)) {
          console.log(
            `Skip processing the song with RC ID ${rcSongAST.rcId} as we have it in our system.`,
          );
          return;
        }

        const authorDirTarget = `${CANDIDATES_DIR}/${rcSongAST.composer}`;

        fsExtra.ensureDirSync(authorDirTarget);
        fs.writeFileSync(`${authorDirTarget}/${fileName}`, print(rcSongAST));
      },
    );
  });
};

await runFor([process.env.VERIFIED_DIR, process.env.CANDIDATES_DIR]);
