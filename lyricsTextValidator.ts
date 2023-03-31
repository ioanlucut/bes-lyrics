import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';

const OUTPUT_DIR = './candidates';
const EMPTY_STRING = '';

const ALLOWED_CHARS =
  ` !(),-./1234567890:;?ABCDEFGHIJLMNOPRSTUVZ[\\]abcdefghijlmnopqrstuvwxzÎâîăÂȘșĂȚț’”„\n\r`.split(
    EMPTY_STRING,
  );

const getUniqueChars = (fileNames: string[]) =>
  fileNames.map((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));

    return _.uniq(fs.readFileSync(filePath).toString());
  });

// ---
// RUN
// ---

const chars = _.flattenDeep(getUniqueChars(fs.readdirSync(OUTPUT_DIR)));
const uniqueChars = _.uniq(chars).filter(Boolean).sort();
const difference = _.difference(uniqueChars, ALLOWED_CHARS);

if (!_.isEmpty(difference)) {
  const ERROR_CODE = 1;

  console.log(
    `The difference between the allowed and found is: "${difference}"`,
  );

  process.exit(ERROR_CODE);
} else {
  console.log('All the characters are valid.');
}
