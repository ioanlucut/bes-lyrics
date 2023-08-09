import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import { isEqual } from 'lodash-es';
import chalk from 'chalk';
import {
  getRawTitleBySong,
  logFileWithLinkInConsole,
  logProcessingFile,
  lyricsFileNameReprocessor,
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

      const newFileName = lyricsFileNameReprocessor.deriveFromTitle(
        getRawTitleBySong(existingContent),
      );
      const hasNoChange = isEqual(fileName, newFileName);

      if (hasNoChange) {
        if (!process.env.CI) {
          console.log(chalk.yellow(`Skipped the ${fileName} file.`));
        }

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
