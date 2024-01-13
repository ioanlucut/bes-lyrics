import chalk from 'chalk';
import dotenv from 'dotenv';
import isCI from 'is-ci';
import { isEmpty, isEqual } from 'lodash-es';
import path from 'path';
import * as process from 'process';
import recursive from 'recursive-readdir';
import {
  DS_STORE_FILE,
  ERROR_CODE,
  GIT_KEEP_FILE,
  TXT_EXTENSION,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Verifying the file extensions from ${dir} directory.."`);

  const filesWithUnexpectedExtension = (
    await recursive(dir, [DS_STORE_FILE, GIT_KEEP_FILE])
  ).filter((filePath) => !isEqual(path.extname(filePath), TXT_EXTENSION));

  if (!isEmpty(filesWithUnexpectedExtension)) {
    console.log(chalk.red(`Files with unexpected extension found:`));
    console.log(filesWithUnexpectedExtension);

    process.exit(ERROR_CODE);
  }
};

await run(process.env.VERIFIED_DIR!);

if (!isCI) {
  await run(process.env.CANDIDATES_DIR!);
}
