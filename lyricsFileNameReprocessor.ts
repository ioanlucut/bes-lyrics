import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { TXT_EXTENSION } from './constants';
import { normalizeFileName } from './src';
import recursive from 'recursive-readdir';

dotenv.config();

const reprocessFileNames = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const existingContent = fs.readFileSync(filePath).toString();

      const fileName = path.basename(filePath);
      const newFileName = normalizeFileName(fileName);
      console.log(
        `Processing "${fileName}": ${
          fileName !== newFileName ? newFileName : 'No change.'
        }.`,
      );

      fs.unlinkSync(filePath);
      fs.writeFileSync(
        path.join(__dirname, path.dirname(filePath), newFileName),
        existingContent,
      );
    });
};

(async () => {
  await reprocessFileNames(process.env.CANDIDATES_DIR);
  await reprocessFileNames(process.env.VERIFIED_DIR);
})();
