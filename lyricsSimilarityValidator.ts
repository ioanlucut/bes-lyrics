// ---
// This validator tries to avoid duplicates (`candidates` against the `verified` directory)
// ---

import _, { isEqual } from 'lodash';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import stringSimilarity from 'string-similarity';
import recursive from 'recursive-readdir';
import { parseArgs } from 'node:util';
import { ALT_SONGS_FILE_SUFFIX } from './constants';

dotenv.config();

const THRESHOLD = 0.7;

const readAllFilesAgainstTheChecksAreDoneOnce = async (againstDir: string) =>
  (await recursive(againstDir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

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
    const candidateContent = fs.readFileSync(candidateFilePath).toString();
    const similarity = stringSimilarity.compareTwoStrings(
      contentAsString.toLowerCase(),
      candidateContent.toLowerCase(),
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
  const verifiedSongs = await readAllFilesAgainstTheChecksAreDoneOnce(
    againstDir,
  );

  return (await recursive(potentialDuplicatesDir))
    .map((candidateFilePath) => {
      const candidateFileName = path.basename(candidateFilePath);

      return {
        candidateFileName,
        candidateFilePath,
        similarities: verifiedSongs
          .filter(({ filePath }) => !isEqual(filePath, candidateFilePath))
          .map(computeSimilarity(candidateFilePath))
          .filter(({ similarity }) => Boolean(similarity))
          .filter(({ similarity }) => similarity > THRESHOLD),
      };
    })
    .filter(({ similarities }) => _.negate(_.isEmpty)(similarities));
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

  if (!_.isEmpty(withoutAllowedDuplicates)) {
    const ERROR_CODE = 1;

    console.log('Unf., we have found song similarities.');

    withoutAllowedDuplicates.forEach(
      ({ candidateFilePath, candidateFileName, similarities }) => {
        console.group(
          `"Candidate: ${candidateFileName} from ${path.dirname(
            candidateFilePath,
          )}:"`,
        );

        similarities.forEach(
          ({ existingFilePath, existingFileName, similarity }) => {
            console.log(
              `- Similar to existing "${existingFileName}" from ${path.dirname(
                existingFilePath,
              )} with a similarity score of "${similarity}."`,
            );

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

        console.groupEnd();
      },
    );

    process.exit(ERROR_CODE);
  }
};

(async () => {
  // ---
  // Verify if the songs that are verified are unique across them
  // ---
  //
  // await runValidatorAndExitIfSimilar(
  //   process.env.VERIFIED_DIR,
  //   process.env.VERIFIED_DIR,
  // );

  // // ---
  // // Verify if the songs that are in candidates are unique across them
  // // ---
  // await runValidatorAndExitIfSimilar(
  //   process.env.CANDIDATES_DIR,
  //   process.env.CANDIDATES_DIR,
  // );
  //
  // // ---
  // // Verify if the songs that are in candidates are unique across the verified songs
  // // ---
  await runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.VERIFIED_DIR,
  );
})();
