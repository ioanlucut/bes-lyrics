import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { EMPTY_STRING } from './constants';

dotenv.config();

const reprocessFileNames = (dir: string) => {
  console.log(`"Reprocessing file names from ${dir} directory.."`);

  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(dir, fileName);
    const existingContent = fs.readFileSync(filePath).toString();

    const newFileName = _.trim(
      fileName
        .replaceAll(':/', EMPTY_STRING)
        .replaceAll('/:', EMPTY_STRING)
        .replaceAll('!', EMPTY_STRING)
        .replaceAll('?', EMPTY_STRING)
        .replaceAll(':', EMPTY_STRING)
        .replaceAll('  ', ' ')
        .replaceAll(' .', '.')
        .replaceAll('1X', EMPTY_STRING)
        .replaceAll('1x', EMPTY_STRING)
        .replaceAll('2X', EMPTY_STRING)
        .replaceAll('2x', EMPTY_STRING)
        .replaceAll('3X', EMPTY_STRING)
        .replaceAll('3x', EMPTY_STRING)
        .replaceAll('4X', EMPTY_STRING),
    );

    fs.unlinkSync(filePath);
    fs.writeFileSync(path.join(__dirname, dir, newFileName), existingContent);
  });
};

(async () => {
  reprocessFileNames(process.env.CANDIDATES_DIR);
  reprocessFileNames(process.env.VERIFIED_DIR);
})();
