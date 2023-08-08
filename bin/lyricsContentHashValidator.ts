import path from 'path';
import * as process from 'process';
import { filter, includes, isEmpty } from 'lodash-es';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import chalk from 'chalk';
import assert from 'node:assert';
import fs from 'fs';
import {
  ERROR_CODE,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  logFileWithLinkInConsole,
  logProcessingFile,
  SongMeta,
  TXT_EXTENSION,
} from '../src/index.js';

dotenv.config();

const runValidationForDir = async (dir: string) => {
  const duplicateHashes = filter(
    (await recursive(dir))
      .filter((filePath) => filePath.endsWith(TXT_EXTENSION))
      .map((filePath) => {
        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath).toString();
        logProcessingFile(fileName, 'content hash validation');
        logFileWithLinkInConsole(filePath);

        const maybeTitle = getSongInSectionTuples(fileContent)[1];

        assert.ok(
          maybeTitle.includes(SongMeta.CONTENT_HASH),
          `The ${SongMeta.CONTENT_HASH} should be defined.`,
        );

        return getMetaSectionsFromTitle(maybeTitle)[SongMeta.CONTENT_HASH];
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
