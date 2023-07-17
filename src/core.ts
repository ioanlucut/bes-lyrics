import {
  filter,
  flattenDeep,
  includes,
  isEqual,
  last,
  parseInt,
  size,
  trim,
  uniq,
} from 'lodash-es';
import * as crypto from 'crypto';
import chalk from 'chalk';
import short from 'short-uuid';
import { SequenceChar } from './types.js';
import {
  COMMA,
  DOUBLE_LINE_TUPLE,
  EMPTY_STRING,
  HASH,
  NEW_LINE_TUPLE,
  TEST_ENV,
} from './constants.js';
import assert from 'node:assert';

const MISSING_SEQUENCE_NUMBER = 1;

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const logProcessingFile = (fileName: string, workType: string) =>
  console.log(chalk.cyan(`Processing (${workType}): "${fileName}".`));

export const getTitleBySections = (rawTitleContent: string) =>
  rawTitleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);

export const getVerseRegex = () =>
  new RegExp(`${SequenceChar.VERSE}([1-9]\\d*)(\\.?)([1-9]\\d*)?$`, 'gi');

export const getPrechorusRegex = () =>
  new RegExp(`${SequenceChar.PRECHORUS}([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`, 'gi');

export const getChorusRegex = () =>
  new RegExp(`${SequenceChar.CHORUS}([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`, 'gi');

export const getBridgeRegex = () =>
  new RegExp(`${SequenceChar.BRIDGE}([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`, 'gi');

export const getEndingRegex = () => new RegExp(`${SequenceChar.ENDING}w`, 'gi');

export const isKnownSongSequence = (sequenceChar: string | SequenceChar) => {
  if (isEqual(SequenceChar.ENDING, sequenceChar)) {
    return true;
  }
  if (isEqual(SequenceChar.VERSE, sequenceChar)) {
    return false;
  }
  if (isEqual(`${SequenceChar.PRECHORUS}1`, sequenceChar)) {
    return false;
  }
  if (isEqual(`${SequenceChar.CHORUS}1`, sequenceChar)) {
    return false;
  }
  if (isEqual(`${SequenceChar.BRIDGE}1`, sequenceChar)) {
    return false;
  }

  return [
    getVerseRegex(),
    getPrechorusRegex(),
    getChorusRegex(),
    getBridgeRegex(),
    getEndingRegex(),
  ].some((matcher) => matcher.test(sequenceChar));
};

export const isTestEnv = () => process.env.NODE_ENV === TEST_ENV;

export const getCharWithoutMarkup = (charWithMarkup: string) =>
  charWithMarkup.replaceAll('[', EMPTY_STRING).replaceAll(']', EMPTY_STRING);

export const getCharWithMarkup = (charWithoutMarkup: string) =>
  `[${charWithoutMarkup}]`;

export const getUniqueCharsAndRelevantChars = (content: string) =>
  flattenDeep(uniq(content.replaceAll(/\(\),-\.:;\?!/gimu, EMPTY_STRING)))
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

export const getHashContentFromSong = (titleContent: string) =>
  (last(titleContent.split(HASH)) as string).replaceAll('}', EMPTY_STRING);

export const getUniqueId = () => short.generate();

export const createSongMock = (desiredSequence: string[]) => `[title]
My custom title

[sequence]
${desiredSequence.join(COMMA)}

${desiredSequence
  .map((sequence) => `[${sequence}]${NEW_LINE_TUPLE}Content for ${sequence}`)
  .join(DOUBLE_LINE_TUPLE)}`;

export const createAdvancedSongMock = (tuples: string[][]) => `[title]
My custom title

[sequence]
${tuples.map(([sequence]) => sequence).join(COMMA)}

${tuples
  .map(([sequence, content]) => `[${sequence}]${NEW_LINE_TUPLE}${content}`)
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
