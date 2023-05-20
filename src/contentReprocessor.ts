import _ from 'lodash';
import chalk from 'chalk';
import { CARRIAGE_RETURN, EMPTY_STRING, NEW_LINE } from '../constants';
import { SequenceChar, SongSection } from './types';

const SEQUENCE_SEPARATOR = ',';

const getUniqueHashFromSection = (section: string) =>
  section.replaceAll(/[\r\n.,! -]/gim, EMPTY_STRING).toLowerCase();

const normalizeContentByAddingBasicStructure = (
  flatSections: string[],
  fileName?: string,
) => {
  const MULTIPLE_MATCHES_OF_THE_SAME_SECTION = 1;

  const groupedSections = _.groupBy(flatSections, getUniqueHashFromSection);
  const uniqueSections = Object.values(groupedSections).filter(
    (equalSections) =>
      _.size(equalSections) > MULTIPLE_MATCHES_OF_THE_SAME_SECTION,
  );

  const uniqueSectionsSize = _.size(uniqueSections);

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
  const sectionsMap = {} as Record<SongSection, string>;
  const verses = [] as string[];

  const hasChorus = uniqueSectionsSize === MAX_EQUAL_SECTIONS_ALLOWED;
  const multipleChorusSections = _.uniq(_.first(uniqueSections) as string[]);
  if (hasChorus && _.size(multipleChorusSections) > 1) {
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
  const maybeChorus = hasChorus ? _.first(multipleChorusSections) : null;

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
      Boolean(sectionsMap[SongSection.CHORUS]) &&
      multipleChorusSections.includes(section)
    ) {
      console.warn(`Dropping a duplicate version found: >>${section}<<`);

      return;
    }

    if (_.isEqual(section, maybeChorus)) {
      // Add a chorus
      sectionsMap[SongSection.CHORUS] = maybeChorus!;

      return;
    }

    verses.push([`[${verseIndex++}]`, section].join(NEW_LINE));
  });

  sectionsMap[SongSection.SEQUENCE] = sectionsMap[SongSection.CHORUS]
    ? _.range(1, _.size(verses) + 1)
        .map((verse) => [verse, SequenceChar[SongSection.CHORUS]])
        .flat()
        .join(SEQUENCE_SEPARATOR)
    : _.range(1, _.size(verses) + 1).join(SEQUENCE_SEPARATOR);

  const [firstVerse, ...restVerses] = verses;

  // ---
  // Rework
  return _.trim(
    _.flatten(
      [
        [SongSection.TITLE, sectionsMap[SongSection.TITLE]].join(
          `${CARRIAGE_RETURN}${NEW_LINE}`,
        ),
        [SongSection.SEQUENCE, sectionsMap[SongSection.SEQUENCE]].join(
          `${CARRIAGE_RETURN}${NEW_LINE}`,
        ),
        firstVerse,
        sectionsMap[SongSection.CHORUS]
          ? [SongSection.CHORUS, sectionsMap[SongSection.CHORUS]].join(
              `${CARRIAGE_RETURN}${NEW_LINE}`,
            )
          : null,
        ...restVerses,
      ].filter(Boolean),
    ).join(`${CARRIAGE_RETURN}${NEW_LINE}${CARRIAGE_RETURN}${NEW_LINE}`),
  );
};

export const processContent = (content: string, fileName?: string) => {
  const flatSections = content
    .replaceAll('^(\r)\n', '\r\n')
    .replaceAll(SongSection.TITLE, EMPTY_STRING)
    .replaceAll(SongSection.SEQUENCE, EMPTY_STRING)
    .replaceAll(SongSection.CHORUS, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_1, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_2, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_3, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_4, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_5, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_6, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_7, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_8, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_9, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_10, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_11, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_12, EMPTY_STRING)
    // Not sure how to fix this better
    .split(process.env.NODE_ENV === 'test' ? /\n\n/gim : /\r\n\r\n/gim)
    .filter(Boolean)
    .map(_.trim);

  return normalizeContentByAddingBasicStructure(flatSections, fileName);
};
