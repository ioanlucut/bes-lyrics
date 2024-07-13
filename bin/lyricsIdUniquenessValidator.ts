import dotenv from 'dotenv';
import fs from 'fs';
import {
  filter,
  includes,
  isEmpty,
  isEqual,
  isNil,
  size,
  uniq,
} from 'lodash-es';
import assert from 'node:assert';
import path from 'path';
import * as process from 'process';
import {
  COMMA,
  EMPTY_STRING,
  NEW_LINE_TUPLE,
  parse,
  readTxtFilesRecursively,
} from '../src/index.js';

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
  const allSongsWithIds = await getAllWithId(dir);
  const ids = allSongsWithIds.map(({ id }) => id);

  const maybeSongsWithoutId = allSongsWithIds.filter(
    ({ id }) => isNil(id) || isEqual(EMPTY_STRING, id),
  );
  assert.ok(
    isEmpty(maybeSongsWithoutId),
    `There are missing IDS: ${maybeSongsWithoutId
      .map(({ id, fileName }) => `${fileName} with wrong/missing id: "${id}"`)
      .join(NEW_LINE_TUPLE)}`,
  );

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
