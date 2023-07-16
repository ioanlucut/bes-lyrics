import path from 'path';
import * as process from 'process';
import { filter, includes, isEmpty, last } from 'lodash-es';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import chalk from 'chalk';
import {
  ERROR_CODE,
  getHashContentFromSong,
  getSongInSections,
  HASH,
  logFileWithLinkInConsole,
  logProcessingFile,
  SongMeta,
  SongSection,
  TXT_EXTENSION,
} from '../src/index.js';
import assert from 'node:assert';
import fs from 'fs';

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

        const maybeTitle = getSongInSections(fileContent)[1];

        assert.ok(
          maybeTitle.includes(SongMeta.CONTENT_HASH),
          `The ${SongMeta.CONTENT_HASH} should be defined.`,
        );

        return getHashContentFromSong(maybeTitle);
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
