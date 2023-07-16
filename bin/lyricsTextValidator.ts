import fs from 'fs';
import path from 'path';
import * as process from 'process';
import { flattenDeep, isEmpty, negate, uniq } from 'lodash-es';
import dotenv from 'dotenv';
import recursive from 'recursive-readdir';
import chalk from 'chalk';
import {
  assemblyCharsStats,
  ERROR_CODE,
  logFileWithLinkInConsole,
  logProcessingFile,
  TXT_EXTENSION,
  verifyStructure,
} from '../src/index.js';

dotenv.config();

const runValidationForDir = async (dir: string) => {
  const arrayOfFileNameAndContent = (await recursive(dir))
    .filter((filePath) => filePath.endsWith(TXT_EXTENSION))
    .map((filePath) => {
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath).toString();
      logProcessingFile(fileName, 'content validation');
      logFileWithLinkInConsole(filePath);

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
        negate(isEmpty)(differenceInFileName) ||
        negate(isEmpty)(differenceInContent),
    );

  if (!isEmpty(problematicHits)) {
    console.log('Unf., we have found wrong chars.');

    const allChars = problematicHits.map(
      ({ filePath, fileName, differenceInFileName, differenceInContent }) => {
        console.group(`"${fileName}"`);
        logFileWithLinkInConsole(filePath);

        if (!isEmpty(differenceInFileName)) {
          console.log(
            `The difference between the allowed chars and found in file name are: "${chalk.yellow(
              differenceInFileName,
            )}"`,
          );
        }

        if (!isEmpty(differenceInContent)) {
          console.log(
            `The difference between the allowed chars and found in content are: "${chalk.yellow(
              differenceInContent,
            )}"`,
          );
        }

        console.log();
        console.groupEnd();

        return uniq([...differenceInFileName, ...differenceInContent]);
      },
    );

    console.log(
      `A list of all rejected chars are: "${uniq(flattenDeep(allChars))}"`,
    );

    process.exit(ERROR_CODE);
  }

  // ---
  // Structure problems
  // ---

  let isStructureErroneous;

  arrayOfFileNameAndContent.forEach(({ fileName, fileContent, filePath }) => {
    try {
      verifyStructure(fileContent);
    } catch (error: unknown) {
      console.group(chalk.yellow(fileName));
      logFileWithLinkInConsole(filePath);
      console.log((error as Error)?.message);
      console.log();

      console.groupEnd();

      isStructureErroneous = true;
    }
  });

  if (isStructureErroneous) {
    process.exit(ERROR_CODE);
  }

  console.log(`Everything is ok within ${dir} dir.`);
};

// ---
// RUN
// ---
await runValidationForDir(process.env.VERIFIED_DIR);
