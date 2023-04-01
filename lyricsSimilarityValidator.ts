import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dotenv from 'dotenv';
import stringSimilarity from 'string-similarity';

dotenv.config();

const THRESHOLD = 0.7;

const readAllVerifiedFilesOnce = () =>
  fs.readdirSync(process.env.VERIFIED_DIR).map((fileName) => {
    const filePath = path.join(__dirname, process.env.VERIFIED_DIR, fileName);

    return {
      contentAsString: fs.readFileSync(filePath).toString(),
      fileName,
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
      contentAsString,
      candidateContent,
    );

    return {
      similarity,
      existingFileName,
    };
  };

const findSimilarities = () => {
  const candidateFileNames = fs.readdirSync(process.env.CANDIDATES_DIR);
  const verifiedSongs = readAllVerifiedFilesOnce();

  return candidateFileNames
    .map((candidateFileName) => {
      const candidateContent = fs
        .readFileSync(
          path.join(__dirname, process.env.CANDIDATES_DIR, candidateFileName),
        )
        .toString();

      return {
        candidateFileName,
        similarities: verifiedSongs
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

const allSimilarities = findSimilarities();

if (!_.isEmpty(allSimilarities)) {
  const ERROR_CODE = 1;

  console.log('Unf., we have found song similarities.');

  allSimilarities.forEach(({ candidateFileName, similarities }) => {
    console.group(`"${candidateFileName}"`);
    similarities.forEach(({ existingFileName, similarity }) =>
      console.log(
        `Similar to the "${existingFileName}" with a similarity of "${similarity}"`,
      ),
    );
    console.groupEnd();
  });

  process.exit(ERROR_CODE);
}
