import {
  first,
  flatten,
  groupBy,
  isEqual,
  range,
  size,
  trim,
  uniq,
} from 'lodash-es';
import chalk from 'chalk';
import {
  CARRIAGE_RETURN,
  EMPTY_STRING,
  NEW_LINE,
  SEQUENCE_SEPARATOR,
} from '../constants.js';
import { SequenceChar, SongSection } from './types.js';
import { isTestEnv } from './utils.js';

const getUniqueCharsFromSection = (section: string) =>
  section.replaceAll(/[\r\n.,! -]/gim, EMPTY_STRING).toLowerCase();

const normalizeContentByAddingBasicStructure = (
  flatSections: string[],
  fileName?: string,
) => {
  const MULTIPLE_MATCHES_OF_THE_SAME_SECTION = 1;

  const groupedSections = groupBy(flatSections, getUniqueCharsFromSection);
  const uniqueSections = Object.values(groupedSections).filter(
    (equalSections) =>
      size(equalSections) > MULTIPLE_MATCHES_OF_THE_SAME_SECTION,
  );

  const uniqueSectionsSize = size(uniqueSections);

  const MAX_EQUAL_SECTIONS_ALLOWED = 1;

  if (uniqueSectionsSize > MAX_EQUAL_SECTIONS_ALLOWED) {
    throw new Error(`
Cannot identify the chorus for "${chalk.green(
      fileName,
    )}". Multiple tuples are equal.
The group sections we have are: 

${uniqueSections
  .map((section) => `>>${chalk.cyan(section)}<<`)
  .join(`${NEW_LINE}${NEW_LINE}`)}`);
  }
  const sectionsMap = {} as Record<string, string>;
  const verses = [] as string[];

  const hasChorus = uniqueSectionsSize === MAX_EQUAL_SECTIONS_ALLOWED;
  const multipleChorusSections = uniq(first(uniqueSections) as string[]);
  if (hasChorus && size(multipleChorusSections) > 1) {
    throw new Error(
      chalk.red(`Multiple chorus versions exists!: 
      ${multipleChorusSections.join(`<<${NEW_LINE}>>`)}

      The group sections we have are:
      ${Object.keys(groupedSections)
        .sort()
        .map((section) => `>>${chalk.cyan(section)}<<`)
        .join(`<<${NEW_LINE}>>`)}`),
    );
  }
  const maybeChorus = hasChorus ? first(multipleChorusSections) : null;

  let verseIndex = 1;
  flatSections.forEach((section, index) => {
    if (index === 0) {
      // Take title
      sectionsMap[SongSection.TITLE] = section;

      return;
    }

    if (index === 1) {
      // Ignore sequence
      return;
    }

    if (
      Boolean(sectionsMap[SongSection.CHORUS()]) &&
      multipleChorusSections.includes(section)
    ) {
      if (!isTestEnv()) {
        console.warn(`Dropping a duplicate version found: >>${section}<<`);
      }

      return;
    }

    if (isEqual(section, maybeChorus)) {
      // Add a chorus
      sectionsMap[SongSection.CHORUS()] = maybeChorus!;

      return;
    }

    verses.push([SongSection.VERSE(verseIndex++), section].join(NEW_LINE));
  });

  sectionsMap[SongSection.SEQUENCE] = sectionsMap[SongSection.CHORUS()]
    ? range(1, size(verses) + 1)
        .map((verse) => [
          [SequenceChar.VERSE, verse].join(EMPTY_STRING),
          SequenceChar.CHORUS,
        ])
        .flat()
        .join(SEQUENCE_SEPARATOR)
    : range(1, size(verses) + 1)
        .map((verse) => [SequenceChar.VERSE, verse].join(EMPTY_STRING))
        .join(SEQUENCE_SEPARATOR);

  const [firstVerse, ...restVerses] = verses;

  // ---
  // Rework
  return trim(
    flatten(
      [
        [SongSection.TITLE, sectionsMap[SongSection.TITLE]].join(
          `${CARRIAGE_RETURN}${NEW_LINE}`,
        ),
        [SongSection.SEQUENCE, sectionsMap[SongSection.SEQUENCE]].join(
          `${CARRIAGE_RETURN}${NEW_LINE}`,
        ),
        firstVerse,
        sectionsMap[SongSection.CHORUS()]
          ? [SongSection.CHORUS(), sectionsMap[SongSection.CHORUS()]].join(
              `${CARRIAGE_RETURN}${NEW_LINE}`,
            )
          : null,
        ...restVerses,
      ].filter(Boolean),
    ).join(`${CARRIAGE_RETURN}${NEW_LINE}${CARRIAGE_RETURN}${NEW_LINE}`),
  );
};

export const reprocess = (content: string, fileName?: string) => {
  const flatSections = content
    .replaceAll('^(\r)\n', '\r\n')
    .replaceAll(SongSection.TITLE, EMPTY_STRING)
    .replaceAll(SongSection.SEQUENCE, EMPTY_STRING)
    .replaceAll(new RegExp(`\\[${SequenceChar.VERSE}.*\\]`, 'gi'), EMPTY_STRING)
    .replaceAll(
      new RegExp(`\\[${SequenceChar.CHORUS}.*\\]`, 'gi'),
      EMPTY_STRING,
    )
    .replaceAll(
      new RegExp(`\\[${SequenceChar.PRECHORUS}.*\\]`, 'gi'),
      EMPTY_STRING,
    )
    .replaceAll(
      new RegExp(`\\[${SequenceChar.BRIDGE}.*\\]`, 'gi'),
      EMPTY_STRING,
    )
    .replaceAll(new RegExp(`\\[${SequenceChar.ENDING}\\]`, 'gi'), EMPTY_STRING)
    // Not sure how to fix this better
    .split(isTestEnv() ? /\n\n/gim : /\r\n\r\n/gim)
    .filter(Boolean)
    .map(trim);

  return normalizeContentByAddingBasicStructure(flatSections, fileName);
};
