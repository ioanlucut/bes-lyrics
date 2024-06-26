import dotenv from 'dotenv';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { first, flatten, isEqual } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
import {
  COLON,
  NEW_LINE,
  logFileWithLinkInConsole,
  logProcessingFile,
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
  .filter(Boolean)
  .map((rcSongIdLine) => first(rcSongIdLine.split(COLON)) as string);

const RC_IDS_TO_IGNORE = fsExtra
  .readFileSync(`${__dirname}/rc_ids_to_ignore.txt`)
  .toString()
  .split(NEW_LINE)
  .filter(Boolean)
  .map((rcSongIdLine) => first(rcSongIdLine.split(COLON)) as string);

const RC_INDEX = JSON.parse(
  fsExtra
    .readFileSync(`${IN_LYRICS_PARSER_GENERATED_RC_SONGS}/index.json`)
    .toString(),
);

const readFiles = async (dir: string) =>
  (await readTxtFilesRecursively(dir)).map((filePath) => {
    const contentAsString = fs.readFileSync(filePath).toString();

    return {
      contentAsString,
      fileName: path.basename(filePath),
      filePath,
      songAST: parse(contentAsString, { ignoreUniquenessErrors: true }),
    };
  });

const runFor = async (songsDirs: string[]) => {
  const allSongsInRepo = flatten(await Promise.all(songsDirs.map(readFiles)));
  const allExistingRcIds = allSongsInRepo.map(({ songAST: { rcId } }) => rcId);

  await pMap(RC_IDS_TO_PROCESS, async (rcSongIdToImport) => {
    const filePath = RC_INDEX[rcSongIdToImport] as string;
    const contentAsString = fsExtra
      .readFileSync(filePath.replace('./', `${IN_LYRICS_PARSER}/`))
      .toString();
    const fileName = path.basename(filePath);

    const rcSongAST = parse(contentAsString, { ignoreUniquenessErrors: true });
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

  await pMap(RC_IDS_TO_IGNORE, async (rcSongIdToIgnore) => {
    const found = allSongsInRepo.find(({ songAST: { rcId } }) =>
      isEqual(rcId, rcSongIdToIgnore),
    );

    if (!found) {
      return;
    }

    fs.unlinkSync(found.filePath);
  });
};

await runFor([process.env.VERIFIED_DIR, process.env.CANDIDATES_DIR]);
