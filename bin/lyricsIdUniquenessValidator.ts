import dotenv from 'dotenv';
import fs from 'fs';
import { filter, includes, size, uniq } from 'lodash-es';
import assert from 'node:assert';
import path from 'path';
import * as process from 'process';
import { COMMA, parse, readTxtFilesRecursively } from '../src/index.js';

dotenv.config();

const getAllWithId = async (potentialDuplicatesDir: string) =>
  (await readTxtFilesRecursively(potentialDuplicatesDir)).map(
    (candidateFilePath) => {
      const { id } = parse(fs.readFileSync(candidateFilePath).toString(), {
        ignoreUniquenessErrors: true,
      });

      return {
        id,
        fileName: path.basename(candidateFilePath),
      };
    },
  );

const runValidator = async (dir: string) => {
  const ids = (await getAllWithId(dir)).map(({ id }) => id);

  assert.equal(
    size(uniq(ids)),
    size(ids),
    `There are duplicates: ${filter(ids, (value, index, iteratee) =>
      includes(iteratee, value, index + 1),
    ).join(COMMA)}`,
  );
};

// ---
// RUN
// ---
await runValidator(process.env.VERIFIED_DIR);
