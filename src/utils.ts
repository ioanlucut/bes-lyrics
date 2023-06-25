import { trim } from 'lodash';
import { SequenceChar } from './types';

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const getTitleContent = (titleContent: string) =>
  titleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);

export const isKnownSongSequence = (seqChar: string | SequenceChar) =>
  [
    new RegExp(`${SequenceChar.VERSE}.*`, 'gi'),
    new RegExp(`${SequenceChar.PRECHORUS}.*`, 'gi'),
    new RegExp(`${SequenceChar.CHORUS}.*`, 'gi'),
    new RegExp(`${SequenceChar.BRIDGE}.*`, 'gi'),
    new RegExp(`${SequenceChar.ENDING}.*`, 'gi'),
  ].some((matcher) => matcher.test(seqChar));

export const isTestEnv = () => process.env.NODE_ENV === 'test';
