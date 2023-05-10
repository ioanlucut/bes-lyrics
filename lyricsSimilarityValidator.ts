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
import { parseArgs } from 'node:util';

dotenv.config();

const THRESHOLD = 0.65;

const readAllVerifiedFilesOnce = (againstDir: string) =>
  fs.readdirSync(againstDir).map((fileName) => {
    const filePath = path.join(__dirname, againstDir, fileName);

    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName,
      filePath,
    };
  });

const computeSimilarity =
  (candidateContent: string) =>
  ({
    contentAsString,
    fileName: existingFileName,
  }: {
    contentAsString: string;
    fileName: string;
  }) => {
    const similarity = stringSimilarity.compareTwoStrings(
      contentAsString.toLowerCase(),
      candidateContent.toLowerCase(),
    );

    return {
      similarity,
      existingFileName,
    };
  };

const findSimilarities = (
  potentialDuplicatesDir: string,
  againstDir: string,
) => {
  const candidateFileNames = fs.readdirSync(potentialDuplicatesDir);
  const verifiedSongs = readAllVerifiedFilesOnce(againstDir);

  return candidateFileNames
    .map((candidateFileName) => {
      const candidateFilePath = path.join(
        __dirname,
        potentialDuplicatesDir,
        candidateFileName,
      );
      const candidateContent = fs.readFileSync(candidateFilePath).toString();

      return {
        candidateFileName,
        similarities: verifiedSongs
          .filter(({ filePath }) => !isEqual(filePath, candidateFilePath))
          .map(computeSimilarity(candidateContent))
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

const runValidatorAndExitIfSimilar = (
  potentialDuplicatesDir: string,
  againstDir: string,
) => {
  const allSimilarities = findSimilarities(potentialDuplicatesDir, againstDir);

  if (!_.isEmpty(allSimilarities)) {
    const ERROR_CODE = 1;

    console.log('Unf., we have found song similarities.');

    allSimilarities.forEach(({ candidateFileName, similarities }) => {
      console.group(`"Candidate: ${candidateFileName}"`);
      similarities.forEach(({ existingFileName, similarity }) => {
        console.log(
          `- similar to existing "${existingFileName}" with a similarity score of "${similarity}"`,
        );

        const candidateFilePath = path.join(
          __dirname,
          potentialDuplicatesDir,
          candidateFileName,
        );

        if (!fsExtra.pathExistsSync(candidateFilePath)) {
          return;
        }

        if (removeDuplicates) {
          fsExtra.unlinkSync(candidateFilePath);
        }

        if (overwrite) {
          fsExtra.moveSync(
            candidateFilePath,
            path.join(__dirname, againstDir, existingFileName),
            {
              overwrite: true,
            },
          );
        }
      });

      console.groupEnd();
    });

    process.exit(ERROR_CODE);
  }
};

(async () => {
  runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.CANDIDATES_DIR,
  );

  runValidatorAndExitIfSimilar(
    process.env.CANDIDATES_DIR,
    process.env.VERIFIED_DIR,
  );
})();
