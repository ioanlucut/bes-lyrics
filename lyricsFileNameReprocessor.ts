import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { TXT_EXTENSION } from './constants';
import { normalizeFileName } from './src';
import recursive from 'recursive-readdir';

dotenv.config();

/**
 * Beware: There is a nasty bug about song names with diacritics, thus that part is not really working.
 *
 * See https://apple.stackexchange.com/questions/10476/how-to-enter-special-characters-so-that-bash-terminal-understands-them/10484#10484
 */
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
