// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { processContent } from './src';

dotenv.config();

const reprocess = (sourceDir: string, dir: string) => {
  console.log(`"Reprocessing file contents from ${sourceDir} directory.."`);

  fs.readdirSync(sourceDir).forEach((fileName) => {
    const filePath = path.join(__dirname, sourceDir, fileName);
    const fileContent = fs.readFileSync(filePath).toString();

    fs.writeFileSync(
      path.join(__dirname, dir, fileName),
      processContent(fileContent,fileName),
    );
  });
};

(async () => {
  reprocess('./raw', process.env.CANDIDATES_DIR);
})();
