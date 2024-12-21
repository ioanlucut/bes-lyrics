import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { flatten } from 'lodash-es';
import pMap from 'p-map';
import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
import {
  EMPTY_STRING,
  logFileWithLinkInConsole,
  logProcessingFile,
  NEW_LINE,
  padForTex,
  parse,
  readTxtFilesRecursively,
  TEX_EXTENSION,
  TEX_MUSICAL_NOTATIONS,
  TXT_EXTENSION,
} from '../../src/index.js';
import { convertSongToLeadsheet } from '../../src/songToLeadsheetConverter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const TEMPLATE_FILE = 'bes-songbook.template.txt';
const BES_SONGBOOK_FILE = 'bes-songbook.tex';
const TEX_OUTPUT = 'target-tex';

const escapeRequiredChars = (songMetaContent: string) =>
  songMetaContent.replaceAll(/&/g, '\\&');

const readFiles = async (dir: string) =>
  (await readTxtFilesRecursively(dir)).map((filePath) => {
    const contentAsString = fs.readFileSync(filePath).toString();

    return {
      fileName: path.basename(filePath),
      filePath,
      songAST: parse(contentAsString, { rejoinSubsections: true }),
      contentAsString,
    };
  });

const runForDirs = async (songsDirs: string[]) => {
  const generatedFiles = await pMap(
    flatten(await Promise.all(songsDirs.map(readFiles))).sort(
      ({ songAST: songASTa }, { songAST: songASTb }) =>
        [
          songASTa.title,
          songASTa.alternative,
          songASTa.composer,
          songASTa.arranger,
          songASTa.band,
          songASTa.genre,
          songASTa.version,
        ]
          .join(EMPTY_STRING)
          .localeCompare(
            [
              songASTb.title,
              songASTb.alternative,
              songASTb.composer,
              songASTb.arranger,
              songASTb.band,
              songASTb.genre,
              songASTb.version,
            ].join(EMPTY_STRING),
          ),
    ),
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
      }

      const contentAsTex = convertSongToLeadsheet(songAST);

      // Use absolute path here
      const absoluteFilePath = path.join(
        __dirname,
        TEX_OUTPUT,
        fileName.replace(TXT_EXTENSION, TEX_EXTENSION),
      );
      fs.writeFileSync(absoluteFilePath, contentAsTex);

      return absoluteFilePath;
    },
  );

  const dynamicLeadsheetSongs = generatedFiles
    .filter(Boolean)
    .map((relativeFilePath) =>
      padForTex(2)(`\\includeleadsheet{${relativeFilePath}}`),
    )
    .join(NEW_LINE);

  const compiledTemplate = fs
    .readFileSync(path.join(__dirname, TEMPLATE_FILE))
    .toString()
    .replace('{{REPLACE_ME}}', dynamicLeadsheetSongs);

  fs.writeFileSync(path.join(__dirname, BES_SONGBOOK_FILE), compiledTemplate);
};

fsExtra.ensureDirSync(path.join(__dirname, TEX_OUTPUT));
await runForDirs([`${process.env.VERIFIED_DIR}/trupe_lauda_si_inchinare`]);
