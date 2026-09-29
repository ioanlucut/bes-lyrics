import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import isCI from 'is-ci';
import path from 'path';
import * as process from 'process';
import {
  ERROR_CODE,
  getRawTitleBySong,
  logFileWithLinkInConsole,
  lyricsFileNameReprocessor,
  readTxtFilesRecursively,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  const { renames, conflicts } = lyricsFileNameReprocessor.planFileRenames(
    (await readTxtFilesRecursively(dir)).map((filePath) => ({
      from: filePath,
      to: path.join(
        path.dirname(filePath),
        lyricsFileNameReprocessor.deriveFromTitle(
          getRawTitleBySong(fs.readFileSync(filePath).toString()),
        ),
      ),
    })),
  );

  if (conflicts.length) {
    console.log(
      chalk.red(
        'Nothing was renamed: these songs would replace another song. Change their title metadata so each file name is unique.',
      ),
    );
    conflicts.forEach(({ from, to }) => {
      console.log(`"${from}" -> "${to}"`);
      logFileWithLinkInConsole(from);
    });

    process.exit(ERROR_CODE);
  }

  renames.forEach(({ from, to }) => {
    fs.renameSync(from, to);
    console.log(chalk.green(`Renamed "${from}" to "${to}".`));
  });
};

await run(process.env.VERIFIED_DIR);
if (!isCI) {
  await run(process.env.CANDIDATES_DIR);
}
