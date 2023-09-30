import {
  filter,
  first,
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
import { SequenceChar, SongMeta, SongSection } from './types.js';
import {
  COLON,
  COMMA,
  DOUBLE_LINE_TUPLE,
  EMPTY_SPACE,
  EMPTY_STRING,
  NEW_LINE_TUPLE,
  SEMICOLON,
  TEST_ENV,
} from './constants.js';
import assert from 'node:assert';

const MISSING_SEQUENCE_NUMBER = 1;

export const logFileWithLinkInConsole = (filePath: string) => {
  if (process.env.CI) {
    return;
  }

  console.log(`at ${filePath}:1:1`);
};

export const logProcessingFile = (fileName: string, workType: string) => {
  if (process.env.CI) {
    return;
  }

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
  new RegExp(`${SequenceChar.VERSE}([1-9]\\d*)(\\.?)([1-9]\\d*)?$`, 'gi');

export const getPrechorusRegex = () =>
  new RegExp(
    `${SequenceChar.PRECHORUS}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getChorusRegex = () =>
  new RegExp(
    `${SequenceChar.CHORUS}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getBridgeRegex = () =>
  new RegExp(
    `${SequenceChar.BRIDGE}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getRecitalRegex = () =>
  new RegExp(
    `${SequenceChar.RECITAL}(?!1$)([1-9]\\d*)?(\\.?)([1-9]\\d*)?$`,
    'gi',
  );

export const getEndingRegex = () =>
  new RegExp(`${SequenceChar.ENDING}(?!1$)w$`, 'gi');

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
    getEndingRegex(),
    getRecitalRegex(),
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

export const getUniqueId = () => short.generate();

export const createSongMock = (
  desiredSections: string[],
  desiredSequence: string[] = desiredSections,
) => `[title]
My custom title: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}

[sequence]
${desiredSequence.join(COMMA)}

${desiredSections
  .map((sequence) => `[${sequence}]${NEW_LINE_TUPLE}Content for ${sequence}`)
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

export const withMetaMarkup = (content?: string) => `{${content}}`;

export const getWithoutMetaMarkup = (charWithMarkup?: string) =>
  charWithMarkup?.replaceAll('{', EMPTY_STRING).replaceAll('}', EMPTY_STRING);

export const getTitleWithoutMeta = (titleContent: string) =>
  trim(first(titleContent.split(/\{/i)) as string);

export const getMetaSectionsFromTitle = (titleContent: string) => {
  const charWithMarkup = last(titleContent.split(/(\{.*})$/gi).filter(Boolean));

  return (getWithoutMetaMarkup(charWithMarkup) || EMPTY_STRING)
    .split(COMMA)
    .map(trim)
    .reduce((accumulator, entry) => {
      const [sequence, content] = entry.split(COLON);

      return { ...accumulator, [sequence]: trim(content) };
    }, {}) as Record<SongMeta, string>;
};

export const multiToSingle = (text: string) =>
  text?.split(SEMICOLON)?.map(trim).join(`${SEMICOLON}${EMPTY_SPACE}`);
