import fs from 'fs';
import fsExtra from 'fs-extra';
import { first, flatten, isEqual } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import { fileURLToPath } from 'url';
import '../bin/env.js';
import {
  COLON,
  NEW_LINE,
  getCandidatesDir,
  getVerifiedDir,
  logFileWithLinkInConsole,
  logProcessingFile,
  parse,
  print,
  readSongFiles,
  resolveInside,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  (await readSongFiles(dir)).map((songFile) => ({
    ...songFile,
    songAST: parse(songFile.content, { ignoreUniquenessErrors: true }),
  }));

const runFor = async (songsDirs: string[]) => {
  const allSongsInRepo = flatten(await Promise.all(songsDirs.map(readFiles)));
  const allExistingRcIds = allSongsInRepo.map(({ songAST: { rcId } }) => rcId);

  await pMap(RC_IDS_TO_PROCESS, async (rcSongIdToImport) => {
    const filePath = RC_INDEX[rcSongIdToImport] as string | undefined;

    if (!filePath) {
      throw new Error(`RC ID ${rcSongIdToImport} is not in the parser index.`);
    }

    const contentAsString = fsExtra
      .readFileSync(resolveInside(IN_LYRICS_PARSER, filePath))
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

    fs.writeFileSync(
      resolveInside(OUT_CANDIDATES_RC_DIR, fileName),
      print(rcSongAST),
    );
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

await runFor([getVerifiedDir(), getCandidatesDir()]);
