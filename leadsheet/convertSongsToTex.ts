import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import { flatten } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
import {
  NEW_LINE,
  TEX_EXTENSION,
  TEX_MUSICAL_NOTATIONS,
  TXT_EXTENSION,
  logFileWithLinkInConsole,
  logProcessingFile,
  padForTex,
  parse,
  readTxtFilesRecursively,
} from '../src/index.js';
import { convertSongToLeadsheet } from '../src/songToLeadsheetConverter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const TEMPLATE_FILE = 'bes-songbook.template.txt';
const BES_SONGBOOK_FILE = 'bes-songbook.tex';

const readFiles = async (dir: string) =>
  (await readTxtFilesRecursively(dir)).map((filePath) => {
    const contentAsString = fs.readFileSync(filePath).toString();

    return {
      fileName: path.basename(filePath),
      filePath,
      songAST: parse(contentAsString),
      contentAsString,
    };
  });

const runForDirs = async (songsDirs: string[]) => {
  const generatedFiles = await pMap(
    flatten(await Promise.all(songsDirs.map(readFiles))),
    async ({ contentAsString, fileName, filePath, songAST }) => {
      logProcessingFile(
        fileName,
        `Converting to TEX the song with title: ${songAST.title}.`,
      );
      logFileWithLinkInConsole(filePath);

      if (!contentAsString.includes(TEX_MUSICAL_NOTATIONS)) {
        console.warn(
          `The song does not have musical notations present: "${chalk.yellow(
            filePath,
          )}"`,
        );

        return;
      }

      const newFileName = fileName.replace(TXT_EXTENSION, TEX_EXTENSION);
      const newPath = path.join(path.dirname(filePath), newFileName);
      const contentAsTex = convertSongToLeadsheet(songAST);

      fs.writeFileSync(newPath, contentAsTex);

      return newPath;
    },
  );

  const dynamicLeadsheetSongs = generatedFiles
    .filter(Boolean)
    .map((filePath) => padForTex(2)(`\\includeleadsheet{../${filePath}}`))
    .join(NEW_LINE);

  const compiledTemplate = fs
    .readFileSync(path.join(__dirname, TEMPLATE_FILE))
    .toString()
    .replace('{{REPLACE_ME}}', dynamicLeadsheetSongs);

  fs.writeFileSync(path.join(__dirname, BES_SONGBOOK_FILE), compiledTemplate);
};

await runForDirs([process.env.VERIFIED_DIR]);
