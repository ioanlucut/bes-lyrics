import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import {
  ERROR_CODE,
  getSongProblems,
  getVerifiedDir,
  logFileWithLinkInConsole,
  readTxtFilesRecursively,
} from '../src/index.js';
import './env.js';

// Checks every song before reporting, and prints only the songs that need
// fixing, so one run lists everything to fix.
const runValidationForDir = async (dir: string) => {
  const filePaths = await readTxtFilesRecursively(dir);
  const songsWithProblems = filePaths
    .map((filePath) => ({
      filePath,
      problems: getSongProblems(
        path.basename(filePath),
        fs.readFileSync(filePath).toString(),
      ),
    }))
    .filter(({ problems }) => problems.length);

  songsWithProblems.forEach(({ filePath, problems }) => {
    console.group(chalk.yellow(path.basename(filePath)));
    logFileWithLinkInConsole(filePath);
    problems.forEach((problem) => console.log(`- ${problem}`));
    console.groupEnd();
    console.log();
  });

  if (songsWithProblems.length) {
    console.log(
      chalk.red(
        `${songsWithProblems.length} of ${filePaths.length} songs in ${dir} need fixing.`,
      ),
    );

    process.exit(ERROR_CODE);
  }

  console.log(`All ${filePaths.length} songs in ${dir} are valid.`);
};

await runValidationForDir(getVerifiedDir());
