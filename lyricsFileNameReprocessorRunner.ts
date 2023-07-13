import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { EMPTY_STRING, TXT_EXTENSION } from './constants';
import { deriveFromTitle, logFileWithLinkInConsole, SongSection } from './src';
import recursive from 'recursive-readdir';
import _, { isEqual } from 'lodash';
import chalk from 'chalk';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const existingContent = fs.readFileSync(filePath).toString();
      const fileName = path.basename(filePath);

      const title = existingContent
        .replaceAll('^(\r)\n', '\r\n')
        .replaceAll(SongSection.TITLE, EMPTY_STRING)
        .split(/\r\n\r\n/gim)
        .filter(Boolean)
        .map(_.trim)[0];

      const newFileName = deriveFromTitle(title);
      const hasNoChange = isEqual(fileName, newFileName);

      console.group(chalk.cyan(`Processing "${fileName}".`));
      logFileWithLinkInConsole(filePath);

      if (hasNoChange) {
        console.log(chalk.yellow('Skipped the file.'));
        console.log();
        console.groupEnd();

        return;
      }

      const nextPathName = path.join(
        __dirname,
        path.dirname(filePath),
        newFileName,
      );

      fs.writeFileSync(nextPathName, existingContent);
      fs.unlinkSync(filePath);

      console.log(chalk.green(`Renamed to "${newFileName}"`));
      console.log();
      console.groupEnd();
    });
};

(async () => {
  await run(process.env.CANDIDATES_DIR);
  await run(process.env.VERIFIED_DIR);
})();
