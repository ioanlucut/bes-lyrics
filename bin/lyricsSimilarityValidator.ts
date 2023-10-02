// ---
// This validator tries to avoid duplicates (`candidates` against the `verified` directory)
// ---

import fs from 'fs';
import path from 'path';
import * as process from 'process';
import { parseArgs } from 'node:util';
import { isEmpty, isEqual, negate } from 'lodash-es';
import fsExtra from 'fs-extra';
import dotenv from 'dotenv';
import stringSimilarity from 'string-similarity';
import chalk from 'chalk';
import {
  ALT_SONGS_FILE_SUFFIX,
  logFileWithLinkInConsole,
  NEW_LINE,
  parse,
  readTxtFilesRecursively,
} from '../src/index.js';

dotenv.config();

const THRESHOLD = 0.65;

const readAllFilesAgainstTheChecksAreDoneOnce = async (againstDir: string) =>
  (await readTxtFilesRecursively(againstDir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

const getRelevantContentOnly = (contentAsString: string) => {
  const { sectionOrder, sectionsMap } = parse(contentAsString, {
    ignoreUniquenessErrors: true,
  });

  return sectionOrder
    .map(
      (verseSongSectionIdentifier) =>
        sectionsMap[verseSongSectionIdentifier].content,
    )
    .join(NEW_LINE)
    .toLowerCase();
};

const computeSimilarity =
  (candidateFilePath: string) =>
  ({
    contentAsString,
    fileName: existingFileName,
    filePath: existingFilePath,
  }: {
    contentAsString: string;
    fileName: string;
    filePath: string;
  }) => {
    const similarity = stringSimilarity.compareTwoStrings(
      getRelevantContentOnly(contentAsString),
      getRelevantContentOnly(fs.readFileSync(candidateFilePath).toString()),
    );

    return {
      similarity,
      existingFileName,
      existingFilePath,
    };
  };

const findSimilarities = async (
  potentialDuplicatesDir: string,
  againstDir: string,
) => {
  const againstSongs =
    await readAllFilesAgainstTheChecksAreDoneOnce(againstDir);

  return (await readTxtFilesRecursively(potentialDuplicatesDir))
    .map((candidateFilePath) => {
      const candidateFileName = path.basename(candidateFilePath);

      return {
        candidateFileName,
        candidateFilePath,
        similarities: againstSongs
          .filter(({ filePath }) => !isEqual(filePath, candidateFilePath))
          .map(computeSimilarity(candidateFilePath))
          .filter(({ similarity }) => Boolean(similarity))
          .filter(({ similarity }) => similarity > THRESHOLD),
      };
    })
    .filter(({ similarities }) => negate(isEmpty)(similarities));
};

// ---
// RUN
// ---

const {
  values: { overwrite, removeDuplicates },
} = parseArgs({
  options: {
    overwrite: {
      type: 'boolean',
    },
    removeDuplicates: {
      type: 'boolean',
    },
  },
});

const runValidatorAndExitIfSimilar = async (
  potentialDuplicatesDir: string,
  againstDir: string,
) => {
  const allSimilarities = await findSimilarities(
    potentialDuplicatesDir,
    againstDir,
  );

  const withoutAllowedDuplicates = allSimilarities.filter(
    ({ candidateFileName, similarities }) =>
      !ALT_SONGS_FILE_SUFFIX.test(candidateFileName) &&
      !similarities.every(({ existingFileName }) =>
        ALT_SONGS_FILE_SUFFIX.test(existingFileName),
      ),
  );

  if (!isEmpty(withoutAllowedDuplicates)) {
    const ERROR_CODE = 1;

    console.log('Unf., we have found song similarities.');

    withoutAllowedDuplicates.forEach(
      ({ candidateFilePath, candidateFileName, similarities }, index) => {
        console.group(`Candidate ${index}, ${chalk.red(candidateFileName)}:`);
        logFileWithLinkInConsole(candidateFilePath);
        console.log();

        similarities.forEach(
          ({ existingFilePath, existingFileName, similarity }) => {
            console.log(
              `- Similar to existing "${chalk.green(
                existingFileName,
              )}" with a similarity score of "${chalk.yellow(similarity)}."`,
            );
            logFileWithLinkInConsole(existingFilePath);

            if (!fsExtra.pathExistsSync(candidateFilePath)) {
              return;
            }

            if (removeDuplicates) {
              fsExtra.unlinkSync(candidateFilePath);
            }

            if (overwrite) {
              fsExtra.moveSync(candidateFilePath, existingFilePath, {
                overwrite: true,
              });
            }
          },
        );

        console.log(NEW_LINE);
        console.groupEnd();
      },
    );

    process.exit(ERROR_CODE);
  }
};

await Promise.all([
  // // ---
  // // Verify if the songs that are in candidates are unique across them
  // // ---
  runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.CANDIDATES_DIR,
  ),
  //
  // // ---
  // // Verify if the songs that are in candidates are unique across the verified songs
  // // ---
  runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.VERIFIED_DIR,
  ),

  // ---
  // Verify if the songs that are verified are unique across them
  // ---
  runValidatorAndExitIfSimilar(
    process.env.VERIFIED_DIR,
    process.env.VERIFIED_DIR,
  ),
]);
