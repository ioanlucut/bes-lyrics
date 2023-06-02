import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import { ERROR_CODE, TXT_EXTENSION } from './constants';
import {
  assemblyCharsStats,
  logFileWithLinkInConsole,
  verifyStructure,
} from './src';
import recursive from 'recursive-readdir';
import chalk from 'chalk';

dotenv.config();

// ---
// RUN
// ---

(async () => {
  const fileDir = process.env.VERIFIED_DIR;

  const arrayOfFileNameAndContent = (await recursive(fileDir))
    .filter((filePath) => filePath.endsWith(TXT_EXTENSION))
    .map((filePath) => {
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath).toString();

      return { filePath, fileName, fileContent };
    });

  // ---
  // Chars problems
  // ---

  const problematicHits = arrayOfFileNameAndContent
    .map(({ filePath, fileName, fileContent }) => ({
      ...assemblyCharsStats(fileName, fileContent),
      filePath,
    }))
    .filter(
      ({ differenceInContent, differenceInFileName }) =>
        _.negate(_.isEmpty)(differenceInFileName) ||
        _.negate(_.isEmpty)(differenceInContent),
    );

  if (!_.isEmpty(problematicHits)) {
    console.log('Unf., we have found wrong chars.');

    const allChars = problematicHits.map(
      ({ filePath, fileName, differenceInFileName, differenceInContent }) => {
        console.group(`"${fileName}"`);
        logFileWithLinkInConsole(filePath);

        if (!_.isEmpty(differenceInFileName)) {
          console.log(
            `The difference between the allowed chars and found in file name are: "${chalk.yellow(
              differenceInFileName,
            )}"`,
          );
        }

        if (!_.isEmpty(differenceInContent)) {
          console.log(
            `The difference between the allowed chars and found in content are: "${chalk.yellow(
              differenceInContent,
            )}"`,
          );
        }

        console.log();
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

  arrayOfFileNameAndContent.forEach(({ fileName, fileContent, filePath }) => {
    try {
      verifyStructure(fileContent);
    } catch (error: any) {
      console.group(chalk.yellow(fileName));
      logFileWithLinkInConsole(filePath);
      console.log(error.message);
      console.log();

      console.groupEnd();

      isStructureErroneous = true;
    }
  });

  if (isStructureErroneous) {
    process.exit(ERROR_CODE);
  }
})();
