import chalk from 'chalk';
import {
  difference,
  first,
  isEmpty,
  isEqual,
  last,
  size,
  uniq,
  without,
} from 'lodash-es';
import assert from 'node:assert';
import { COMMA, DOT, EMPTY_STRING } from './constants.js';
import {
  assertUniqueness,
  convertSequenceToNumber,
  getBridgeRegex,
  getCharWithMarkup,
  getCharWithoutMarkup,
  getChorusRegex,
  getPrechorusRegex,
  getRecitalRegex,
  getSongInSectionTuples,
  getUniqueCharsAndRelevantChars,
  getVerseRegex,
  isKnownSongSequence,
} from './core.js';
import { SequenceChar, SongSection } from './types.js';

const EXPECTED_SUB_SECTIONS_LENGTH = 2;
const MAX_ALLOWED_SECTION_SIZE = 50;

const REGEX_SUPPLIERS = {
  [SequenceChar.VERSE]: () => getVerseRegex(),
  [SequenceChar.CHORUS]: () => getChorusRegex(),
  [SequenceChar.PRECHORUS]: () => getPrechorusRegex(),
  [SequenceChar.BRIDGE]: () => getBridgeRegex(),
  [SequenceChar.RECITAL]: () => getRecitalRegex(),
} as Record<SequenceChar, () => RegExp>;

const assertIsCorrectSequence = (
  currentSequenceNumber: number,
  previousSequenceNumber: number,
  currentContext: string,
  previousContext: string,
) => {
  assert.equal(
    currentSequenceNumber - 1,
    previousSequenceNumber,
    `The two sequences/sub-sequences "${previousSequenceNumber}" from "${previousContext}" context and "${currentSequenceNumber}" from "${currentContext}" context are not consecutive.`,
  );

  return true;
};

const isSequenceCharInRightOrder = (
  allSequencesWithMarkup: string[],
  sequenceCharToVerify: SequenceChar,
) => {
  return uniq(
    allSequencesWithMarkup
      .map(getCharWithoutMarkup)
      .filter((char) => REGEX_SUPPLIERS[sequenceCharToVerify]().test(char)),
  ).every((_, index, array) => {
    if (!index) {
      return true;
    }

    // ---
    // Previous sequence, e.g. [v1] or [v1.1]
    const previousSequence = array[index - 1];

    // ---
    // Previous sequence w/o qualifier, e.g. [1] or [1.1]
    const previousSequenceOrderQualifier = previousSequence.replace(
      sequenceCharToVerify,
      EMPTY_STRING,
    );

    // ---
    // Current sequence, e.g. [v2] or [v1.2]
    const currentSequence = array[index];

    // ---
    // Current sequence w/o qualifier, e.g. [2] or [1.2]
    const currentSequenceOrderQualifier = currentSequence.replace(
      sequenceCharToVerify,
      EMPTY_STRING,
    );

    // ---
    // Both sequences are not having sub sections, e.g. [1] and [2]
    if (
      [previousSequenceOrderQualifier, currentSequenceOrderQualifier].every(
        (sequenceWithQualifier) => !sequenceWithQualifier.includes(DOT),
      )
    ) {
      return assertIsCorrectSequence(
        convertSequenceToNumber(currentSequenceOrderQualifier),
        convertSequenceToNumber(previousSequenceOrderQualifier),
        sequenceCharToVerify,
        sequenceCharToVerify,
      );
    }

    // ---
    // Both sequences have sub sections, e.g. [1.1] and [1.2]
    if (
      [previousSequenceOrderQualifier, currentSequenceOrderQualifier].every(
        (sequenceWithQualifier) => sequenceWithQualifier.includes(DOT),
      )
    ) {
      const previousSequenceOrderQualifierSubSections =
        previousSequenceOrderQualifier.split(DOT).map(convertSequenceToNumber);
      const currentSequenceOrderQualifierSubSections =
        currentSequenceOrderQualifier.split(DOT).map(convertSequenceToNumber);

      assert.equal(
        previousSequenceOrderQualifierSubSections.length,
        EXPECTED_SUB_SECTIONS_LENGTH,
        `The ${previousSequenceOrderQualifier} sub-qualifier should have length of ${EXPECTED_SUB_SECTIONS_LENGTH}.`,
      );

      assert.equal(
        currentSequenceOrderQualifierSubSections.length,
        EXPECTED_SUB_SECTIONS_LENGTH,
        `The ${currentSequenceOrderQualifier} sub-qualifier should have length of ${EXPECTED_SUB_SECTIONS_LENGTH}.`,
      );

      // ---
      // Both sequences have subsections from the same main section, e.g. [1.1] and [1.2]
      if (
        isEqual(
          first(previousSequenceOrderQualifierSubSections),
          first(currentSequenceOrderQualifierSubSections),
        )
      ) {
        return assertIsCorrectSequence(
          last(currentSequenceOrderQualifierSubSections) as number,
          last(previousSequenceOrderQualifierSubSections) as number,
          currentSequenceOrderQualifier,
          previousSequenceOrderQualifier,
        );
      }

      assert.notEqual(
        last(currentSequenceOrderQualifierSubSections) as number,
        last(previousSequenceOrderQualifierSubSections) as number,
        `The "${currentSequenceOrderQualifierSubSections.join(
          DOT,
        )}" and "${previousSequenceOrderQualifierSubSections.join(
          DOT,
        )}" cannot both end in the same sub sequence.`,
      );

      // ---
      // Both sequences have subsections from different main section, e.g. [1.2] and [2.1]
      return assertIsCorrectSequence(
        first(currentSequenceOrderQualifierSubSections) as number,
        first(previousSequenceOrderQualifierSubSections) as number,
        currentSequenceOrderQualifier,
        previousSequenceOrderQualifier,
      );
    }

    // ---
    // First sequence has sub section, second not, e.g. [2.1] and [3]
    if (!previousSequenceOrderQualifier.includes(DOT)) {
      const currentSequenceOrderQualifierSubSections =
        currentSequenceOrderQualifier.split(DOT).map(convertSequenceToNumber);

      assert.equal(
        currentSequenceOrderQualifierSubSections.length,
        EXPECTED_SUB_SECTIONS_LENGTH,
        `The ${currentSequenceOrderQualifier} sub-qualifier should have length of ${EXPECTED_SUB_SECTIONS_LENGTH}.`,
      );

      return assertIsCorrectSequence(
        first(currentSequenceOrderQualifierSubSections) as number,
        convertSequenceToNumber(previousSequenceOrderQualifier),
        currentSequenceOrderQualifier,
        previousSequenceOrderQualifier,
      );
    }

    // ---
    // First sequence has no section, second has, e.g. [2] and [3.1]
    const previousSequenceOrderQualifierSubSections =
      previousSequenceOrderQualifier.split(DOT).map(convertSequenceToNumber);

    assert.equal(
      previousSequenceOrderQualifierSubSections.length,
      EXPECTED_SUB_SECTIONS_LENGTH,
      `The ${previousSequenceOrderQualifier} sub-qualifier should have length of ${EXPECTED_SUB_SECTIONS_LENGTH}.`,
    );

    return assertIsCorrectSequence(
      convertSequenceToNumber(currentSequenceOrderQualifier),
      first(previousSequenceOrderQualifierSubSections) as number,
      currentSequenceOrderQualifier,
      previousSequenceOrderQualifier,
    );
  });
};

export const verifyStructure = (content: string) => {
  const sectionTuples = getSongInSectionTuples(content);

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

      return getCharWithMarkup(sequenceChar);
    });

  const sectionsMap = {} as Record<string, string>;
  const sectionOrder = [] as string[];

  for (
    let sectionIndex = 0;
    sectionIndex < sectionTuples.length;
    sectionIndex = sectionIndex + 2
  ) {
    const sectionContent = sectionTuples[sectionIndex + 1];
    const sectionIdentifier = sectionTuples[sectionIndex];

    if (
      ![SongSection.TITLE, SongSection.SEQUENCE].includes(sectionIdentifier)
    ) {
      sectionOrder.push(sectionIdentifier);

      const sizeOfSectionContent = size(
        getUniqueCharsAndRelevantChars(sectionContent),
      );

      assert.ok(
        sizeOfSectionContent <= MAX_ALLOWED_SECTION_SIZE,
        `The size of the existing ${sectionIdentifier} content, "${chalk.green(
          sizeOfSectionContent,
        )}", is higher than the maximum allowed one, (${MAX_ALLOWED_SECTION_SIZE})}."`,
      );
    }

    sectionsMap[sectionIdentifier] = sectionContent;
  }

  const sequencesFromSongContent = without(
    sectionOrder,
    SongSection.TITLE,
    SongSection.SEQUENCE,
  );
  const maybeMismatchingSequence = difference(
    sequencesFromSongContent,
    sequenceIdentifiersFromSequenceSection,
  );

  if (!isEmpty(maybeMismatchingSequence)) {
    throw new Error(
      `The ${maybeMismatchingSequence} tags are present in the content but not in the sequence.`,
    );
  }

  sequenceIdentifiersFromSequenceSection.forEach((section) => {
    if (!sectionsMap[section]) {
      throw new Error(
        `The ${chalk.red(
          section,
        )} is defined in the sequence but missing as a ${chalk.red(
          section,
        )} section.`,
      );
    }
  });

  assertUniqueness(sequencesFromSongContent);

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
