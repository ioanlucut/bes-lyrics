import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';

const OUTPUT_DIR = './out';
const EMPTY_STRING = '';

const ALLOWED_CHARS = `!(),-./1234567890:;?ABCDEFGHIJLMNOPRSTUVZ[\\]abcdefghijlmnopqrstuvwxzÎâîăȘșȚț–’”„`;

const verifyChars = (fileNames: string[]) =>
  fileNames.map((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));

    return _.uniq(fs.readFileSync(filePath).toString());
  });

(async () => {
  const chars = _.flattenDeep(verifyChars(fs.readdirSync(OUTPUT_DIR)));
  const uniqueChars = _.uniq(chars).filter(Boolean).sort().join(EMPTY_STRING);
  console.log(`The found unique chars are: ${uniqueChars}`);

  const difference = _.difference(uniqueChars, ALLOWED_CHARS);

  if (!_.isEmpty(difference)) {
    console.log(
      `The difference between the allowed and found is: ${difference}`,
    );

    process.exit(1);
  }
})();
