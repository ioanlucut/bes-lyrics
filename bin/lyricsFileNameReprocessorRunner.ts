import fs from 'fs-extra';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import { isEqual } from 'lodash-es';
import chalk from 'chalk';
import isCI from 'is-ci';
import {
  getRawTitleBySong,
  logFileWithLinkInConsole,
  logProcessingFile,
  lyricsFileNameReprocessor,
  readTxtFilesRecursively,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  (await readTxtFilesRecursively(dir)).forEach((filePath) => {
    const existingContent = fs.readFileSync(filePath).toString();
    const fileName = path.basename(filePath);
    logProcessingFile(fileName, 'file name');
    logFileWithLinkInConsole(filePath);

    const newFileName = lyricsFileNameReprocessor.deriveFromTitle(
      getRawTitleBySong(existingContent),
    );
    const hasNoChange = isEqual(fileName, newFileName);

    if (hasNoChange) {
      console.log(chalk.yellow(`Skipped the ${fileName} file.`));
      console.log();
      console.groupEnd();

      return;
    }

    fs.unlinkSync(filePath);
    fs.writeFileSync(
      path.join(path.dirname(filePath), newFileName),
      existingContent,
    );

    console.log(chalk.green(`Renamed to "${newFileName}"`));
    console.log();
    console.groupEnd();
  });
};

await run(process.env.VERIFIED_DIR);
if (!isCI) {
  await run(process.env.CANDIDATES_DIR);
}
