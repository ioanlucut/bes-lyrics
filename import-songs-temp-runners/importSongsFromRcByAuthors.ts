import fs from 'fs';
import fsExtra from 'fs-extra';
import { flatten } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import { fileURLToPath } from 'url';
import '../bin/env.js';
import {
  COLON,
  getCandidatesDir,
  getVerifiedDir,
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
  parse,
  print,
  readSongFiles,
  resolveInside,
  UNSET_META,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const runFor = async (songsDirs: string[]) => {
  const allSongsInRepo = flatten(
    await Promise.all(songsDirs.map(readSongFiles)),
  ).map(({ content }) =>
    parse(content, {
      ignoreUniquenessErrors: true,
    }),
  );
  const allRcIds = allSongsInRepo.map(({ rcId }) => rcId).filter(Boolean);

  await pMap(rcAuthorPathsToProcess, async (pathConfig) => {
    const [counts, composer, authorPath] = pathConfig.split(COLON);
    const dirToImportFrom = resolveInside(RC_DIR, authorPath);
    (await readSongFiles(dirToImportFrom)).forEach(
      ({ content, filePath, fileName }) => {
        logProcessingFile(
          fileName,
          `Import from RC from ${composer}; Counts: ${counts}.`,
        );
        logFileWithLinkInConsole(filePath);
        const rcSongAST = parse(content, {
          ignoreUniquenessErrors: true,
        });

        if (allRcIds.includes(rcSongAST.rcId)) {
          console.log(
            `Skip processing the song with RC ID ${rcSongAST.rcId} as we have it in our system.`,
          );
          return;
        }

        // The composer comes from scraped data, so it may not leave candidates/.
        const targetFilePath = resolveInside(
          CANDIDATES_DIR,
          rcSongAST.composer ?? UNSET_META,
          fileName,
        );

        fsExtra.ensureDirSync(path.dirname(targetFilePath));
        fs.writeFileSync(targetFilePath, print(rcSongAST));
      },
    );
  });
};

await runFor([getVerifiedDir(), getCandidatesDir()]);
