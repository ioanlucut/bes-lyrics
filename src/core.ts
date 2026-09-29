import chalk from 'chalk';
import * as crypto from 'crypto';
import fs from 'fs';
import {
  constant,
  filter,
  first,
  flattenDeep,
  includes,
  isEqual,
  parseInt,
  range,
  size,
  trim,
  uniq,
} from 'lodash-es';
import assert from 'node:assert';
import path from 'path';
import short from 'short-uuid';
import {
  COLON,
  COMMA,
  DOUBLE_LINE_TUPLE,
  EMPTY_STRING,
  NEW_LINE,
  SEMICOLON,
  SPACE_CHAR,
  TXT_EXTENSION,
} from './constants.js';
import { SequenceChar, SongFile, SongMeta, SongSection } from './types.js';

const MISSING_SEQUENCE_NUMBER = 1;

export const logFileWithLinkInConsole = (filePath: string) => {
  console.log(`at ${filePath}:1:1`);
};

export const logProcessingFile = (fileName: string, workType: string) => {
  console.log(chalk.cyan(`Processing (${workType}): "${fileName}".`));
};

export const getRawTitleBySong = (songAsString: string) =>
  first(
    songAsString
      .replaceAll(SongSection.TITLE, EMPTY_STRING)
      .split(/\n\n/gim)
      .filter(Boolean)
      .map(trim),
  ) as string;

export const getTitleByRawSection = (rawTitleContent: string) =>
  rawTitleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);

export const getVerseRegex = () =>
  new RegExp(`^${SequenceChar.VERSE}([1-9]\\d*)(\\.?)([1-9]\\d*)?$`, 'gi');

export const getPrechorusRegex = () =>
  new RegExp(
    `^${SequenceChar.PRECHORUS}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getChorusRegex = () =>
  new RegExp(
    `^${SequenceChar.CHORUS}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getBridgeRegex = () =>
  new RegExp(
    `^${SequenceChar.BRIDGE}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getRecitalRegex = () =>
  new RegExp(
    `^${SequenceChar.RECITAL}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const isKnownSongSequence = (sequenceChar: string | SequenceChar) => {
  if (isEqual(SequenceChar.ENDING, sequenceChar)) {
    return true;
  }
  if (isEqual(SequenceChar.VERSE, sequenceChar)) {
    return false;
  }
  return [
    getVerseRegex(),
    getPrechorusRegex(),
    getChorusRegex(),
    getBridgeRegex(),
    getRecitalRegex(),
  ].some((matcher) => matcher.test(sequenceChar));
};

export const getCharWithoutMarkup = (charWithMarkup: string) =>
  charWithMarkup.replaceAll('[', EMPTY_STRING).replaceAll(']', EMPTY_STRING);

export const getCharWithMarkup = (charWithoutMarkup: string) =>
  `[${charWithoutMarkup}]`;

export const getUniqueCharsAndRelevantChars = (content: string) =>
  flattenDeep(uniq(content.replaceAll(/[(),\-.:;?!]/gu, EMPTY_STRING)))
    .filter(Boolean)
    .sort();

export const computeUniqueContentHash = (content: string) =>
  crypto
    .createHash('shake256', {
      outputLength: 3,
    })
    .update(content, 'utf8')
    .digest('hex');

export const getSongInSectionTuples = (songText: string) =>
  songText
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(trim);

export const getUniqueId = () => short.generate();

export const createSongMock = (
  desiredSections: string[],
  desiredSequence: string[] = desiredSections,
) => `[title]
My custom title: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}

[sequence]
${desiredSequence.join(COMMA)}

${desiredSections
  .map((sequence) => `[${sequence}]${NEW_LINE}Content for ${sequence}`)
  .join(DOUBLE_LINE_TUPLE)}`;

export const createAdvancedSongMock = (
  tuples: string[][],
  desiredSequence?: string[],
) => `[title]
My custom title: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}

[sequence]
${
  desiredSequence
    ? desiredSequence.join(COMMA)
    : tuples.map(([sequence]) => sequence).join(COMMA)
}

${tuples
  .map(([sequence, content]) => `[${sequence}]${NEW_LINE}${content}`)
  .join(DOUBLE_LINE_TUPLE)}`;

export const convertSequenceToNumber = (sequenceOrderQualifier: string) =>
  parseInt(sequenceOrderQualifier) || MISSING_SEQUENCE_NUMBER;

export const assertUniqueness = (array: string[]) =>
  assert.equal(
    size(uniq(array)),
    size(array),
    `There are duplicates: ${filter(array, (value, index, iteratee) =>
      includes(iteratee, value, index + 1),
    ).join(COMMA)}`,
  );

export const withMetaMarkup = (content?: string) => `{${content}}`;

export const getWithoutMetaMarkup = (charWithMarkup?: string) =>
  charWithMarkup?.replaceAll('{', EMPTY_STRING).replaceAll('}', EMPTY_STRING);

export const getTitleWithoutMeta = (titleContent: string) =>
  trim(first(titleContent.split(/\{/i)) as string);

// Entries are separated by a comma only when the next entry starts with a
// key, so a value may itself contain commas or colons.
const META_ENTRY_SEPARATOR = /,\s*(?=\w+\s*:)/;

export const getMetaSectionsFromTitle = (titleContent: string) => {
  const [metaWithMarkup] = titleContent.match(/\{.*}$/) ?? [];

  return (getWithoutMetaMarkup(metaWithMarkup) || EMPTY_STRING)
    .split(META_ENTRY_SEPARATOR)
    .map(trim)
    .reduce((accumulator, entry) => {
      const separatorIndex = entry.indexOf(COLON);

      if (separatorIndex === -1) {
        return accumulator;
      }

      return {
        ...accumulator,
        [trim(entry.slice(0, separatorIndex))]: trim(
          entry.slice(separatorIndex + 1),
        ),
      };
    }, {}) as Record<SongMeta, string>;
};

export const multiToSingle = (text: string) =>
  text?.split(SEMICOLON)?.map(trim).join(`${SEMICOLON}${SPACE_CHAR}`);

/**
 * Lists every file under `dir`, sorted so scripts process songs in the same
 * order on every file system. Files named in `ignoredFileNames` are skipped.
 */
export const readFilesRecursively = async (
  dir: string,
  ignoredFileNames: string[] = [],
) =>
  (await fs.promises.readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile() && !ignoredFileNames.includes(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();

export const readTxtFilesRecursively = async (dir: string) =>
  (await readFilesRecursively(dir)).filter((filePath) =>
    isEqual(TXT_EXTENSION, path.extname(filePath)),
  );

export const readSongFiles = async (dir: string): Promise<SongFile[]> =>
  (await readTxtFilesRecursively(dir)).map((filePath) => ({
    content: fs.readFileSync(filePath, 'utf8'),
    fileName: path.basename(filePath),
    filePath,
  }));

export const padForTex = (chars: number) => (content?: string) =>
  `${range(0, chars).map(constant(SPACE_CHAR)).join(EMPTY_STRING)}${content}`;

/**
 * Resolves `segments` against `baseDir` and refuses a result outside it, for
 * paths built from data such as scraped song metadata.
 */
export const resolveInside = (baseDir: string, ...segments: string[]) => {
  const resolvedBaseDir = path.resolve(baseDir);
  const resolvedPath = path.resolve(resolvedBaseDir, ...segments);

  if (!resolvedPath.startsWith(`${resolvedBaseDir}${path.sep}`)) {
    throw new Error(
      `"${path.join(...segments)}" resolves outside "${baseDir}".`,
    );
  }

  return resolvedPath;
};
