import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';

const EMPTY_STRING = '';
const ERROR_CODE = 1;
const TXT_EXTENSION = '.txt';

const ALLOWED_CHARS =
  ` !(),-./1234567890:;?ABCDEFGHIJLMNOPRSTUVZ[\\]abcdefghijlmnopqrstuvwxzÎâîăÂȘșĂȚț’”„\n\r`.split(
    EMPTY_STRING,
  );

dotenv.config();

const getUniqueChars = (content: string) =>
  _.flattenDeep(_.uniq(content)).filter(Boolean).sort();

const getUniqueCharsByFileName = (fileName: string) => {
  const filePath = path.join(__dirname, process.env.VERIFIED_DIR, fileName);
  const fileContent = fs.readFileSync(filePath).toString();
  const uniqueCharsFromContent = getUniqueChars(fileContent);
  const uniqueCharsFromFileName = getUniqueChars(fileName);

  return {
    fileName,
    uniqueCharsFromContent,
    differenceInContent: _.difference(uniqueCharsFromContent, ALLOWED_CHARS),
    uniqueCharsFromFileName,
    differenceInFileName: _.difference(uniqueCharsFromFileName, ALLOWED_CHARS),
  };
};

// ---
// RUN
// ---

(() => {
  const problematicHits = fs
    .readdirSync(process.env.VERIFIED_DIR)
    .filter((fileName) => fileName.endsWith(TXT_EXTENSION))
    .map(getUniqueCharsByFileName)
    .filter(
      ({ differenceInContent, differenceInFileName }) =>
        _.negate(_.isEmpty)(differenceInFileName) ||
        _.negate(_.isEmpty)(differenceInContent),
    );

  if (_.isEmpty(problematicHits)) {
    console.log('All the characters are valid.');

    return;
  }

  console.log('Unf., we have found wrong chars.');
  const allChars = problematicHits.map(
    ({ fileName, differenceInFileName, differenceInContent }) => {
      console.group(`"${fileName}"`);

      if (!_.isEmpty(differenceInFileName)) {
        console.log(
          `The difference between the allowed chars and found in content are: "${differenceInFileName}"`,
        );
      }

      if (!_.isEmpty(differenceInContent)) {
        console.log(
          `The difference between the allowed chars and found in content are: "${differenceInContent}"`,
        );
      }

      console.groupEnd();

      return _.uniq([...differenceInFileName, ...differenceInContent]);
    },
  );

  console.log(
    `A list of all rejected chars are: "${_.uniq(_.flattenDeep(allChars))}"`,
  );

  process.exit(ERROR_CODE);
})();
