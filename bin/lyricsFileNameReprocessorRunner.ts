import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import { isEqual, trim } from 'lodash-es';
import chalk from 'chalk';
import {
  EMPTY_STRING,
  logFileWithLinkInConsole,
  logProcessingFile,
  lyricsFileNameReprocessor,
  SongSection,
  TXT_EXTENSION,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const existingContent = fs.readFileSync(filePath).toString();
      const fileName = path.basename(filePath);
      logProcessingFile(fileName, 'file name');
      logFileWithLinkInConsole(filePath);

      const title = existingContent
        .replaceAll('^(\r)\n', '\r\n')
        .replaceAll(SongSection.TITLE, EMPTY_STRING)
        .split(/\r\n\r\n/gim)
        .filter(Boolean)
        .map(trim)[0];

      const newFileName = lyricsFileNameReprocessor.deriveFromTitle(title);
      const hasNoChange = isEqual(fileName, newFileName);

      if (hasNoChange) {
        console.log(chalk.yellow('Skipped the file.'));
        console.log();
        console.groupEnd();

        return;
      }

      fs.writeFileSync(
        path.join(path.dirname(filePath), newFileName),
        existingContent,
      );
      fs.unlinkSync(filePath);

      console.log(chalk.green(`Renamed to "${newFileName}"`));
      console.log();
      console.groupEnd();
    });
};

await run(process.env.CANDIDATES_DIR);
await run(process.env.VERIFIED_DIR);
