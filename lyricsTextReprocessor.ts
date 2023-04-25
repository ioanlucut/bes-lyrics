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

const reprocess = (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(__dirname, dir, fileName);
    const fileContent = fs.readFileSync(filePath).toString();

    fs.writeFileSync(
      path.join(__dirname, dir, fileName),
      processContent(fileContent, fileName),
    );
  });
};

(async () => {
  reprocess(process.env.CANDIDATES_DIR);
})();
