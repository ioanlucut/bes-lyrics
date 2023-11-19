// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import dotenv from 'dotenv';
import fs from 'fs';
import isCI from 'is-ci';
import { flow } from 'lodash-es';
import path from 'path';
import * as process from 'process';
import {
  contentReplacerReprocessor,
  contentStructureReprocessor,
  logFileWithLinkInConsole,
  logProcessingFile,
  readTxtFilesRecursively,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  (await readTxtFilesRecursively(dir)).forEach((filePath) => {
    const songContent = fs.readFileSync(filePath).toString();
    const fileName = path.basename(filePath);
    logProcessingFile(fileName, 'file contents');
    logFileWithLinkInConsole(filePath);

    fs.writeFileSync(
      path.join(path.dirname(filePath), fileName),
      flow([
        contentReplacerReprocessor.reprocess,
        contentStructureReprocessor.reprocess,
      ])(songContent),
    );
  });
};

await run(process.env.VERIFIED_DIR);
if (!isCI) {
  await run(process.env.CANDIDATES_DIR);
}
