import chalk from 'chalk';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import '../../bin/env.js';
import {
  EMPTY_STRING,
  LEADSHEETS_DIR,
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
  padForTex,
  parse,
  readSongFiles,
  SongAST,
  TEX_EXTENSION,
  TEX_MUSICAL_NOTATIONS,
  TXT_EXTENSION,
} from '../../src/index.js';
import { convertSongToLeadsheet } from '../../src/songToLeadsheetConverter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_FILE = 'bes-songbook.template.txt';
const BES_SONGBOOK_FILE = 'bes-songbook.tex';
const TEX_OUTPUT = 'target-tex';

const readFiles = async (dir: string) =>
  (await readSongFiles(dir)).map((songFile) => ({
    ...songFile,
    songAST: parse(songFile.content, { rejoinSubsections: true }),
  }));

const getSortKey = ({
  title,
  alternative,
  composer,
  arranger,
  band,
  genre,
  version,
}: SongAST) =>
  [title, alternative, composer, arranger, band, genre, version].join(
    EMPTY_STRING,
  );

const runForDirs = async (songsDirs: string[]) => {
  const songs = (await Promise.all(songsDirs.map(readFiles)))
    .flat()
    .sort(({ songAST: songA }, { songAST: songB }) =>
      getSortKey(songA).localeCompare(getSortKey(songB)),
    );

  // Absolute paths, because `songbook:compile` runs from the repository root
  // and the release workflow from `LaTeX/songbook/`.
  const generatedFilePaths = songs.map(
    ({ content, fileName, filePath, songAST }) => {
      logProcessingFile(
        fileName,
        `Converting to TEX the song with title: ${songAST.title}.`,
      );
      logFileWithLinkInConsole(filePath);

      if (!content.includes(TEX_MUSICAL_NOTATIONS)) {
        console.warn(
          `The song does not have musical notations present: "${chalk.yellow(
            filePath,
          )}"`,
        );
      }

      const absoluteFilePath = path.join(
        __dirname,
        TEX_OUTPUT,
        fileName.replace(TXT_EXTENSION, TEX_EXTENSION),
      );
      fs.writeFileSync(absoluteFilePath, convertSongToLeadsheet(songAST));

      return absoluteFilePath;
    },
  );

  const dynamicLeadsheetSongs = generatedFilePaths
    .map((absoluteFilePath) =>
      padForTex(2)(`\\includeleadsheet{${absoluteFilePath}}`),
    )
    .join(NEW_LINE);

  const compiledTemplate = fs
    .readFileSync(path.join(__dirname, TEMPLATE_FILE))
    .toString()
    .replace('{{REPLACE_ME}}', dynamicLeadsheetSongs);

  fs.writeFileSync(path.join(__dirname, BES_SONGBOOK_FILE), compiledTemplate);
};

fsExtra.ensureDirSync(path.join(__dirname, TEX_OUTPUT));
await runForDirs([`${LEADSHEETS_DIR}/trupe_lauda_si_inchinare`]);
