import { isEqual, trim } from 'lodash';
import { SequenceChar } from './types';

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const getTitleContent = (titleContent: string) =>
  titleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);

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
    new RegExp(`${SequenceChar.VERSE}(\\d+)?`, 'gi'),
    new RegExp(`${SequenceChar.PRECHORUS}(\\d+)?`, 'gi'),
    new RegExp(`${SequenceChar.CHORUS}(\\d+)?`, 'gi'),
    new RegExp(`${SequenceChar.BRIDGE}(\\d+)?`, 'gi'),
    new RegExp(`${SequenceChar.ENDING}w`, 'gi'),
  ].some((matcher) => matcher.test(sequenceChar));
};

export const isTestEnv = () => process.env.NODE_ENV === 'test';
