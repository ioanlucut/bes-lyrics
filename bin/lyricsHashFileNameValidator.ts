import path from 'path';
import * as process from 'process';
import { filter, includes, isEmpty, last } from 'lodash-es';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import chalk from 'chalk';
import {
  ERROR_CODE,
  HASH,
  logFileWithLinkInConsole,
  logProcessingFile,
} from '../src/index.js';
import { TXT_EXTENSION } from '../src/constants.js';

dotenv.config();

const runValidationForDir = async (dir: string) => {
  const duplicateHashes = filter(
    (await recursive(dir))
      .filter((filePath) => filePath.endsWith(TXT_EXTENSION))
      .map((filePath) => {
        const fileName = path.basename(filePath);

        logProcessingFile(fileName, 'version hash validation');
        logFileWithLinkInConsole(filePath);

        return last(fileName.split(HASH));
      }),
    (current, index, iteratee) => includes(iteratee, current, index + 1),
  );

  if (!isEmpty(duplicateHashes)) {
    console.log(
      `The hashes are the same between the files: "${chalk.yellow(
        duplicateHashes,
      )}"`,
    );

    process.exit(ERROR_CODE);
  }
};

// ---
// RUN
// ---
await runValidationForDir(process.env.VERIFIED_DIR);
