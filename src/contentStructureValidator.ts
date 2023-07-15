import { difference, isEmpty, isEqual, trim, uniq, without } from 'lodash-es';
import chalk from 'chalk';
import { COMMA, EMPTY_STRING } from './constants.js';
import { SequenceChar, SongSection } from './types.js';
import {
  getBridgeRegex,
  getCharWithoutMarkup,
  getChorusRegex,
  getPrechorusRegex,
  getVerseRegex,
  isKnownSongSequence,
} from './utils.js';

const REGEX_SUPPLIERS = {
  [SequenceChar.VERSE]: () => getVerseRegex(),
  [SequenceChar.CHORUS]: () => getChorusRegex(),
  [SequenceChar.PRECHORUS]: () => getPrechorusRegex(),
  [SequenceChar.BRIDGE]: () => getBridgeRegex(),
} as Record<SequenceChar, () => RegExp>;

const isSequenceCharInRightOrder = (
  allSequencesWithMarkup: string[],
  sequenceCharToVerify: SequenceChar,
) => {
  return uniq(
    allSequencesWithMarkup
      .map(getCharWithoutMarkup)
      .filter((char) => REGEX_SUPPLIERS[sequenceCharToVerify]().test(char)),
  ).every((v, index, array) => {
    const MISSING_SEQUENCE_NUMBER = 1;

    if (!index) {
      return true;
    }

    const previousSequence = array[index - 1];
    const previousSequenceNumber =
      parseInt(previousSequence.replace(sequenceCharToVerify, EMPTY_STRING)) ||
      MISSING_SEQUENCE_NUMBER;
    const currentSequence = array[index];
    const currentSequenceNumber =
      parseInt(currentSequence.replace(sequenceCharToVerify, EMPTY_STRING)) ||
      MISSING_SEQUENCE_NUMBER;

    if (!isEqual(currentSequenceNumber - 1, previousSequenceNumber)) {
      throw new Error(
        `The two sequences ${chalk.red(previousSequence)} and ${chalk.red(
          currentSequence,
        )} are not consecutive.`,
      );
    }

    return true;
  });
};

export const verifyStructure = (content: string) => {
  const sectionTuples = content
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(trim);

  if (!content.includes(SongSection.TITLE)) {
    throw new Error(`${SongSection.TITLE} is missing.`);
  }

  if (!content.includes(SongSection.SEQUENCE)) {
    throw new Error(`${SongSection.SEQUENCE} is missing.`);
  }

  const sequenceIdentifiersFromSequenceSection = sectionTuples[3]
    .split(COMMA)
    .map((sequenceChar) => {
      if (!isKnownSongSequence(sequenceChar)) {
        throw new Error(`Unknown "${sequenceChar}" section.`);
      }

      return `[${sequenceChar}]`;
    });

  const sectionsHashMap = {} as Record<string, string>;

  for (
    let sectionIndex = 0;
    sectionIndex < sectionTuples.length;
    sectionIndex = sectionIndex + 2
  ) {
    sectionsHashMap[sectionTuples[sectionIndex] as string] =
      sectionTuples[sectionIndex + 1];
  }

  const sequencesFromSongContent = without(
    Object.keys(sectionsHashMap),
    SongSection.TITLE,
    SongSection.SEQUENCE,
  );
  const maybeMismatchingSequence = difference(
    sequencesFromSongContent,
    sequenceIdentifiersFromSequenceSection,
  );

  if (!isEmpty(maybeMismatchingSequence)) {
    throw new Error(
      `The ${chalk.red(
        maybeMismatchingSequence,
      )} tags are present in the content but not in the sequence.`,
    );
  }

  sequenceIdentifiersFromSequenceSection.forEach((section) => {
    if (!sectionsHashMap[section]) {
      throw new Error(
        `The ${chalk.red(
          section,
        )} is defined in the sequence but missing as a ${chalk.red(
          section,
        )} section.`,
      );
    }
  });

  return [
    SequenceChar.VERSE,
    SequenceChar.PRECHORUS,
    SequenceChar.CHORUS,
    SequenceChar.BRIDGE,
  ].every((sequenceChar) =>
    isSequenceCharInRightOrder(
      sequenceIdentifiersFromSequenceSection,
      sequenceChar,
    ),
  );
};
