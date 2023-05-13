import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { EMPTY_STRING, TXT_EXTENSION } from './constants';
import { normalizeFileName, SongSection } from './src';
import recursive from 'recursive-readdir';
import _ from 'lodash';

dotenv.config();

const reprocessFileNames = async (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  (await recursive(dir))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const existingContent = fs.readFileSync(filePath).toString();

      const strings = existingContent
        .replaceAll('^(\r)\n', '\r\n')
        // Replace to .split(/\n\n/gim) in test
        .split(/\r\n\r\n/gim)
        .filter(Boolean)
        .map(_.trim);
      console.log(strings);
      if (strings.length === 1) {
        const fileName = path.basename(filePath);
        // const newFileName = normalizeFileName(fileName);
        // console.log(
        //   `Processing "${fileName}": ${
        //     fileName !== newFileName ? newFileName : 'No change.'
        //   }.`,
        // );

        fs.unlinkSync(filePath);
        fs.writeFileSync(
          path.join(__dirname, 'candidates-to-lookup', fileName),
          existingContent,
        );
      }
    });
};

(async () => {
  await reprocessFileNames('./candidates-upcoming');
  // await reprocessFileNames(process.env.VERIFIED_DIR);
})();
