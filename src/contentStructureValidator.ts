import _, { without } from 'lodash';
import chalk from 'chalk';
import { SongSection } from './types';
import { COMMA } from '../constants';
import { isKnownSongSequence } from './utils';

export const verifyStructure = (content: string) => {
  const sectionTuples = content
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(_.trim);

  if (!content.includes(SongSection.TITLE)) {
    throw new Error(`${SongSection.TITLE} is missing.`);
  }

  if (!content.includes(SongSection.SEQUENCE)) {
    throw new Error(`${SongSection.SEQUENCE} is missing.`);
  }

  const sequenceIdentifiersFromSections = sectionTuples[3]
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

  const mismatchingSequence = _.difference(
    without(
      Object.keys(sectionsHashMap),
      SongSection.TITLE,
      SongSection.SEQUENCE,
    ),
    sequenceIdentifiersFromSections,
  );
  if (!_.isEmpty(mismatchingSequence)) {
    throw new Error(
      `The ${chalk.red(
        mismatchingSequence,
      )} tags are present in the content but not in the sequence.`,
    );
  }

  sequenceIdentifiersFromSections.forEach((section) => {
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
};
