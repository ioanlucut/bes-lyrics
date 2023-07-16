import { flattenDeep, isEqual, trim, uniq } from 'lodash-es';
import * as crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { SequenceChar } from './types.js';
import { EMPTY_STRING, TEST_ENV } from './constants.js';
import chalk from 'chalk';

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const logProcessingFile = (fileName: string, workType: string) =>
  console.log(chalk.cyan(`Processing (${workType}): "${fileName}".`));

export const getTitleContent = (titleContent: string) =>
  titleContent
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

export const getUniqueCharsAndRelevantChars = (content: string) =>
  flattenDeep(uniq(content.replaceAll(/\(\),-\.:;\?!/gimu, EMPTY_STRING)))
    .filter(Boolean)
    .sort();

export const computeUniqueContentHash = (content: string) =>
  crypto
    .createHash('shake256', {
      outputLength: 3,
    })
    .update(getUniqueCharsAndRelevantChars(content).join(EMPTY_STRING), 'utf8')
    .digest('hex');

export const getDirName = () => path.dirname(fileURLToPath(import.meta.url));
