import { difference, isEmpty, size, uniq, without } from 'lodash-es';
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

type SectionNumber = {
  qualifier: string;
  section: number;
  part?: number;
};

// "2" → section 2; "1.2" → part 2 of section 1. Deeper nesting is rejected.
const toSectionNumber = (qualifier: string): SectionNumber => {
  if (!qualifier.includes(DOT)) {
    return { qualifier, section: convertSequenceToNumber(qualifier) };
  }

  const numbers = qualifier.split(DOT).map(convertSequenceToNumber);

  assert.equal(
    numbers.length,
    EXPECTED_SUB_SECTIONS_LENGTH,
    `The ${qualifier} sub-qualifier should have length of ${EXPECTED_SUB_SECTIONS_LENGTH}.`,
  );

  const [section, part] = numbers;

  return { qualifier, section, part };
};

/**
 * Each marker must follow the previous one of its kind: the next section
 * (`v1` → `v2`, `v1.2` → `v2.1`), or the next part of the same section
 * (`v1.1` → `v1.2`).
 */
const assertFollows = (
  previous: SectionNumber,
  current: SectionNumber,
  sequenceChar: SequenceChar,
) => {
  const hasParts = previous.part !== undefined || current.part !== undefined;
  const previousContext = hasParts ? previous.qualifier : sequenceChar;
  const currentContext = hasParts ? current.qualifier : sequenceChar;

  if (
    previous.part !== undefined &&
    current.part !== undefined &&
    previous.section === current.section
  ) {
    return assertIsCorrectSequence(
      current.part,
      previous.part,
      currentContext,
      previousContext,
    );
  }

  if (previous.part !== undefined && current.part !== undefined) {
    assert.notEqual(
      current.part,
      previous.part,
      `The "${current.section}${DOT}${current.part}" and "${previous.section}${DOT}${previous.part}" cannot both end in the same sub sequence.`,
    );
  }

  return assertIsCorrectSequence(
    current.section,
    previous.section,
    currentContext,
    previousContext,
  );
};

const isSequenceCharInRightOrder = (
  allSequencesWithMarkup: string[],
  sequenceCharToVerify: SequenceChar,
) => {
  const qualifiers = uniq(
    allSequencesWithMarkup
      .map(getCharWithoutMarkup)
      .filter((char) => REGEX_SUPPLIERS[sequenceCharToVerify]().test(char)),
  ).map((sequence) => sequence.replace(sequenceCharToVerify, EMPTY_STRING));

  return qualifiers.every(
    (qualifier, index) =>
      !index ||
      assertFollows(
        toSectionNumber(qualifiers[index - 1]),
        toSectionNumber(qualifier),
        sequenceCharToVerify,
      ),
  );
};

export const verifyStructure = (content: string) => {
  const sectionTuples = getSongInSectionTuples(content);

  if (!content.includes(SongSection.TITLE)) {
    throw new Error(`${SongSection.TITLE} is missing.`);
  }

  if (!content.includes(SongSection.SEQUENCE)) {
    throw new Error(`${SongSection.SEQUENCE} is missing.`);
  }

  const sequenceIdentifiersFromSequenceSection = sectionTuples[
    sectionTuples.indexOf(SongSection.SEQUENCE) + 1
  ]
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
        `The size of the existing ${sectionIdentifier} content, "${sizeOfSectionContent}", is higher than the maximum allowed one, (${MAX_ALLOWED_SECTION_SIZE})}."`,
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
        `The ${section} is defined in the sequence but missing as a ${section} section.`,
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
