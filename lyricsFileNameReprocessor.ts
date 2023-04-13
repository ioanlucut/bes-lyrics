import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';

const EMPTY_STRING = '';

dotenv.config();

const reprocessFileNames = (fileNames: string[]) => {
  fileNames.forEach((fileName) => {
    const filePath = path.join(process.env.VERIFIED_DIR, fileName);
    const fileContent = fs.readFileSync(filePath).toString();

    const maybeNewFileName = _.trim(
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
        .replaceAll('4X', EMPTY_STRING)
        .replaceAll('ƒ', 'â')
        .replaceAll('╠ª', 'ț')
        .replaceAll("'", '’')
        .replaceAll('フ', 'ât')
        .replaceAll('ハ', 'ân')
        .replaceAll('Œ', 'î')
        .replaceAll('á', 'ânt'),
    );

    const maybeNewFilePath = path.join(
      __dirname,
      process.env.VERIFIED_DIR,
      `${maybeNewFileName}`,
    );

    fs.unlinkSync(filePath);
    fs.writeFileSync(maybeNewFilePath, fileContent);
  });
};

(async () => {
  reprocessFileNames(fs.readdirSync(process.env.VERIFIED_DIR));
})();
