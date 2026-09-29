import chalk from 'chalk';
import isCI from 'is-ci';
import { isEmpty, isEqual } from 'lodash-es';
import path from 'path';
import * as process from 'process';
import {
  DS_STORE_FILE,
  ERROR_CODE,
  getCandidatesDir,
  getVerifiedDir,
  GIT_KEEP_FILE,
  readFilesRecursively,
  TXT_EXTENSION,
} from '../src/index.js';
import './env.js';

const run = async (dir: string) => {
  console.log(`"Verifying the file extensions from ${dir} directory.."`);

  const filesWithUnexpectedExtension = (
    await readFilesRecursively(dir, [DS_STORE_FILE, GIT_KEEP_FILE])
  ).filter((filePath) => !isEqual(path.extname(filePath), TXT_EXTENSION));

  if (!isEmpty(filesWithUnexpectedExtension)) {
    console.log(chalk.red(`Files with unexpected extension found:`));
    console.log(filesWithUnexpectedExtension);

    process.exit(ERROR_CODE);
  }
};

await run(getVerifiedDir());

if (!isCI) {
  await run(getCandidatesDir());
}
