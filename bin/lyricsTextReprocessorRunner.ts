// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import fs from 'fs';
import isCI from 'is-ci';
import { flow } from 'lodash-es';
import path from 'path';
import {
  contentReplacerReprocessor,
  contentStructureReprocessor,
  getCandidatesDir,
  getVerifiedDir,
  logFileWithLinkInConsole,
  logProcessingFile,
  readTxtFilesRecursively,
} from '../src/index.js';
import './env.js';

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

await run(getVerifiedDir());
if (!isCI) {
  await run(getCandidatesDir());
}
