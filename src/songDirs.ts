import fs from 'fs';
import { TXT_EXTENSION } from './constants.js';

type SongDirVariable = 'VERIFIED_DIR' | 'CANDIDATES_DIR';

/**
 * Reads a song directory from the environment and fails with a message that
 * names the variable, instead of a `TypeError` deep inside a script.
 */
export const getSongDir = (
  variable: SongDirVariable,
  env: NodeJS.ProcessEnv,
) => {
  const dir = env[variable];

  if (!dir) {
    throw new Error(`${variable} is not set; add it to .env.`);
  }

  if (!fs.statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`${variable} is "${dir}", which is not a directory.`);
  }

  return dir;
};

/**
 * The verified library must contain songs: a validator that finds none has
 * checked nothing and must not pass.
 */
export const getVerifiedDir = (env = process.env) => {
  const dir = getSongDir('VERIFIED_DIR', env);
  const hasSongs = fs
    .readdirSync(dir, { recursive: true })
    .some((fileName) => String(fileName).endsWith(TXT_EXTENSION));

  if (!hasSongs) {
    throw new Error(`VERIFIED_DIR is "${dir}", which contains no songs.`);
  }

  return dir;
};

export const getCandidatesDir = (env = process.env) =>
  getSongDir('CANDIDATES_DIR', env);
