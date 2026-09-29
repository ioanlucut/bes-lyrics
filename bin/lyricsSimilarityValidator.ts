// ---
// Reports songs whose lyrics look alike: candidates against each other,
// candidates against verified songs, and verified songs against each other.
// `--removeDuplicates` and `--overwrite` resolve only candidates that
// duplicate a verified song; they never touch a verified song on their own.
// ---

import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { parseArgs } from 'node:util';
import path from 'path';
import * as process from 'process';
import {
  DuplicateResolution,
  ERROR_CODE,
  NEW_LINE,
  SimilarityMatch,
  SongFile,
  findSimilarSongs,
  logFileWithLinkInConsole,
  planDuplicateResolution,
  readTxtFilesRecursively,
} from '../src/index.js';

dotenv.config();

const readSongFiles = async (dir: string): Promise<SongFile[]> =>
  (await readTxtFilesRecursively(dir)).map((filePath) => ({
    content: fs.readFileSync(filePath).toString(),
    fileName: path.basename(filePath),
    filePath,
  }));

const report = (comparison: string, matches: SimilarityMatch[]) => {
  console.log(
    `${comparison}: ${matches.length ? chalk.red(matches.length) : 0} song(s) with similar lyrics.`,
  );

  matches.forEach(({ song, similarSongs }, index) => {
    console.group(`Candidate ${index}, ${chalk.red(song.fileName)}:`);
    logFileWithLinkInConsole(song.filePath);
    console.log();

    similarSongs.forEach(({ fileName, filePath, similarity }) => {
      console.log(
        `- Similar to existing "${chalk.green(
          fileName,
        )}" with a similarity score of "${chalk.yellow(similarity)}."`,
      );
      logFileWithLinkInConsole(filePath);
    });

    console.log(NEW_LINE);
    console.groupEnd();
  });

  return matches.length;
};

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

const candidates = await readSongFiles(process.env.CANDIDATES_DIR);
const verifiedSongs = await readSongFiles(process.env.VERIFIED_DIR);

if (overwrite || removeDuplicates) {
  const candidateMatches = findSimilarSongs(candidates, verifiedSongs);
  report('Candidates against verified songs', candidateMatches);

  const actions = planDuplicateResolution(
    candidateMatches,
    overwrite
      ? DuplicateResolution.REPLACE_EXISTING
      : DuplicateResolution.REMOVE_CANDIDATE,
  );
  const plannedCandidatePaths = actions.map(
    ({ candidatePath }) => candidatePath,
  );

  candidateMatches
    .filter(({ song }) => !plannedCandidatePaths.includes(song.filePath))
    .forEach(({ song }) =>
      console.log(
        `Left "${song.filePath}" in place: another candidate duplicates the same verified song.`,
      ),
    );

  actions.forEach((action) => {
    if (action.type === DuplicateResolution.REMOVE_CANDIDATE) {
      fsExtra.removeSync(action.candidatePath);
      console.log(`Removed "${action.candidatePath}".`);
    } else {
      fsExtra.moveSync(action.candidatePath, action.existingPath, {
        overwrite: true,
      });
      console.log(
        `Replaced "${action.existingPath}" with "${action.candidatePath}".`,
      );
    }
  });

  process.exit(candidateMatches.length ? ERROR_CODE : 0);
}

const similarSongCount = [
  report(
    'Candidates against each other',
    findSimilarSongs(candidates, candidates),
  ),
  report(
    'Candidates against verified songs',
    findSimilarSongs(candidates, verifiedSongs),
  ),
  report(
    'Verified songs against each other',
    findSimilarSongs(verifiedSongs, verifiedSongs),
  ),
].reduce((total, count) => total + count, 0);

process.exit(similarSongCount ? ERROR_CODE : 0);
