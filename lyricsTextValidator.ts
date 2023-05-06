import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import { ERROR_CODE, TXT_EXTENSION } from './constants';
import { assemblyCharsStats, verifyStructure } from './src';

dotenv.config();

// ---
// RUN
// ---

(() => {
  const arrayOfFileNameAndContent = fs
    .readdirSync(process.env.CANDIDATES_DIR)
    .filter((fileName) => fileName.endsWith(TXT_EXTENSION))
    .map((fileName) => {
      const filePath = path.join(
        __dirname,
        process.env.CANDIDATES_DIR,
        fileName,
      );
      const fileContent = fs.readFileSync(filePath).toString();

      return { fileName, fileContent };
    });

  // ---
  // Chars problems
  // ---

  const problematicHits = arrayOfFileNameAndContent
    .map(({ fileName, fileContent }) =>
      assemblyCharsStats(fileName, fileContent),
    )
    .filter(
      ({ differenceInContent, differenceInFileName }) =>
        _.negate(_.isEmpty)(differenceInFileName) ||
        _.negate(_.isEmpty)(differenceInContent),
    );

  if (!_.isEmpty(problematicHits)) {
    console.log('Unf., we have found wrong chars.');

    const allChars = problematicHits.map(
      ({ fileName, differenceInFileName, differenceInContent }) => {
        console.group(`"${fileName}"`);

        if (!_.isEmpty(differenceInFileName)) {
          console.log(
            `The difference between the allowed chars and found in file name are: "${differenceInFileName}"`,
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
  }

  // ---
  // Structure problems
  // ---

  let isStructureErroneous = false;

  arrayOfFileNameAndContent.forEach(({ fileName, fileContent }) => {
    try {
      verifyStructure(fileContent);
    } catch (error: any) {
      console.log(`"${fileName}": `, error.message);

      isStructureErroneous = true;
    }
  });

  if (isStructureErroneous) {
    process.exit(ERROR_CODE);
  }
})();
