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

dotenv.config();

const THRESHOLD = 0.65;

const readAllVerifiedFilesOnce = async (againstDir: string) =>
  (await recursive(againstDir)).map((filePath) => {
    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName: path.basename(filePath),
      filePath,
    };
  });

const computeSimilarity =
  (existingFilePath: string) =>
  ({
    contentAsString,
    fileName: existingFileName,
  }: {
    contentAsString: string;
    fileName: string;
  }) => {
    const candidateContent = fs.readFileSync(existingFilePath).toString();
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
  const verifiedSongs = await readAllVerifiedFilesOnce(againstDir);

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

  if (!_.isEmpty(allSimilarities)) {
    const ERROR_CODE = 1;

    console.log('Unf., we have found song similarities.');

    allSimilarities.forEach(
      ({ candidateFilePath, candidateFileName, similarities }) => {
        console.group(`"Candidate: ${candidateFileName}"`);
        similarities.forEach(
          ({ existingFilePath, existingFileName, similarity }) => {
            console.log(
              `- similar to existing "${existingFileName}" with a similarity score of "${similarity}"`,
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
  // await runValidatorAndExitIfSimilar(
  //   process.env.CANDIDATES_DIR,
  //   process.env.CANDIDATES_DIR,
  // );

  // await runValidatorAndExitIfSimilar(
  //   process.env.VERIFIED_DIR,
  //   process.env.VERIFIED_DIR,
  // );

  await runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.VERIFIED_DIR,
  );
})();
