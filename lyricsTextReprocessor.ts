// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { processContent } from './src';
import recursive from 'recursive-readdir';
import { TXT_EXTENSION } from './constants';

dotenv.config();

const reprocess = async (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .filter((filePath) => !filePath.includes('Nu te teme'))
    .forEach((filePath) => {
      const fileContent = fs.readFileSync(filePath).toString();
      const fileName = path.basename(filePath);

      fs.writeFileSync(
        path.join(path.dirname(filePath), fileName),
        processContent(fileContent, fileName),
      );
    });
};

(async () => {
  await reprocess(process.env.CANDIDATES_DIR);
})();
