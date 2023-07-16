// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import {
  TXT_EXTENSION,
  contentReprocessor,
  logProcessingFile,
  logFileWithLinkInConsole,
} from '../src/index.js';

dotenv.config();

const run = async (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const songContent = fs.readFileSync(filePath).toString();
      const fileName = path.basename(filePath);
      logProcessingFile(fileName, 'file contents');
      logFileWithLinkInConsole(filePath);

      fs.writeFileSync(
        path.join(path.dirname(filePath), fileName),
        contentReprocessor.reprocess(songContent),
      );
    });
};

await run(process.env.CANDIDATES_DIR);
await run(process.env.VERIFIED_DIR);
