import fs from 'fs';
import path from 'path';
import * as process from 'process';
import fsExtra from 'fs-extra';
import dotenv from 'dotenv';
import pMap from 'p-map';
import { first, flatten } from 'lodash-es';
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

const IN_LYRICS_PARSER = path.join(__dirname, '../../', 'bes-lyrics-parser');
const IN_LYRICS_PARSER_GENERATED_RC_SONGS = `${IN_LYRICS_PARSER}/out/resurse_crestine`;

const OUT_CANDIDATES_RC_DIR = './candidates/resurse_crestine_raw';

const RC_IDS_TO_PROCESS = fsExtra
  .readFileSync(`${__dirname}/rc_ids_to_process.txt`)
  .toString()
  .split(NEW_LINE)
  .filter(Boolean);

const RC_INDEX = JSON.parse(
  fsExtra
    .readFileSync(`${IN_LYRICS_PARSER_GENERATED_RC_SONGS}/index.json`)
    .toString(),
);

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
  const allExistingRcIds = allSongsInRepo
    .map(({ rcId }) => rcId)
    .filter(Boolean);

  await pMap(RC_IDS_TO_PROCESS, async (rcSongIdLine) => {
    const rcSongIdToImport = first(rcSongIdLine.split(COLON)) as string;
    const filePath = RC_INDEX[rcSongIdToImport] as string;
    const contentAsString = fsExtra
      .readFileSync(filePath.replace('./', `${IN_LYRICS_PARSER}/`))
      .toString();
    const fileName = path.basename(filePath);

    const rcSongAST = parse(contentAsString);
    logProcessingFile(fileName, `Import from RC with ID ${rcSongIdToImport}.`);
    logFileWithLinkInConsole(filePath);

    if (allExistingRcIds.includes(rcSongAST.rcId)) {
      console.log(
        `Skip processing the song with RC ID ${rcSongAST.rcId} as we have it in our system.`,
      );
      return;
    }

    fs.writeFileSync(`${OUT_CANDIDATES_RC_DIR}/${fileName}`, print(rcSongAST));
  });
};

await runFor([process.env.VERIFIED_DIR, process.env.CANDIDATES_DIR]);
