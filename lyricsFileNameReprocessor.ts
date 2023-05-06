import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { TXT_EXTENSION } from './constants';
import { normalizeFileName } from './src';

dotenv.config();

const reprocessFileNames = (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  fs.readdirSync(dir)
    .filter((file) => file.endsWith(TXT_EXTENSION))
    .forEach((fileName) => {
      const filePath = path.join(dir, fileName);
      const existingContent = fs.readFileSync(filePath).toString();

      console.log(`Processing "${fileName}"..`);
      const newFileName = normalizeFileName(fileName);

      fs.unlinkSync(filePath);
      fs.writeFileSync(path.join(__dirname, dir, newFileName), existingContent);
    });
};

(async () => {
  reprocessFileNames(process.env.CANDIDATES_DIR);
  reprocessFileNames(process.env.VERIFIED_DIR);
})();
