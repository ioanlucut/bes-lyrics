import { isEqual, trim } from 'lodash-es';
import { SequenceChar } from './types.js';
import { EMPTY_STRING, TEST_ENV } from './constants.js';

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const getTitleContent = (titleContent: string) =>
  titleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);

export const getVerseRegex = () =>
  new RegExp(`${SequenceChar.VERSE}([1-9]\\d*)?$`, 'gi');

export const getPrechorusRegex = () =>
  new RegExp(`${SequenceChar.PRECHORUS}([1-9]\\d*)?$`, 'gi');

export const getChorusRegex = () =>
  new RegExp(`${SequenceChar.CHORUS}([1-9]\\d*)?$`, 'gi');

export const getBridgeRegex = () =>
  new RegExp(`${SequenceChar.BRIDGE}([1-9]\\d*)?$`, 'gi');

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
