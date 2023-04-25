import _ from 'lodash';
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
    throw new Error(`Cannot identify the chorus for "${fileName}". Multiple tuples are equal.
    
    The group sections we have are: 
      ${Object.keys(uniqueSections).sort().join(`<<${NEW_LINE}>>`)}\`,
    `);
  }
  const sectionsMap = {} as Record<SongSection, string>;
  const verses = [] as string[];

  const hasChorus = uniqueSectionsSize === MAX_EQUAL_SECTIONS_ALLOWED;
  const multipleChorusSections = _.uniq(_.first(uniqueSections) as string[]);
  if (hasChorus && _.size(multipleChorusSections) > 1) {
    throw new Error(
      `Multiple chorus versions exists!: 
      ${multipleChorusSections.join(`<<${NEW_LINE}>>`)}
      
      The group sections we have are: 
      ${Object.keys(groupedSections).sort().join(`<<${NEW_LINE}>>`)}`,
    );
  }
  const maybeChorus = hasChorus ? _.first(multipleChorusSections) : null;

  let verseIndex = 1;
  flatSections.forEach((section, index) => {
    if (index === 0) {
      sectionsMap[SongSection.TITLE] = section;

      return;
    }

    if (index === 1) {
      sectionsMap[SongSection.SEQUENCE] = section;

      return;
    }

    if (
      Boolean(sectionsMap[SongSection.CHORUS]) &&
      multipleChorusSections.includes(section)
    ) {
      // console.warn(`Dropping a duplicate version found: >>${section}<<`);

      return;
    }

    if (_.isEqual(section, maybeChorus)) {
      sectionsMap[SongSection.CHORUS] = maybeChorus!;

      return;
    }

    verses.push([`[${verseIndex++}]`, section].join(NEW_LINE));
  });

  sectionsMap[SongSection.SEQUENCE] = sectionsMap[SongSection.CHORUS]
    ? _.range(1, _.size(verses))
        .map((verse) => [verse, SequenceChar[SongSection.CHORUS]])
        .flat()
        .join(SEQUENCE_SEPARATOR)
    : _.range(1, _.size(verses)).join(SEQUENCE_SEPARATOR);

  const [firstVerse, ...restVerses] = verses;

  return _.trim(
    _.flatten(
      [
        [SongSection.TITLE, sectionsMap[SongSection.TITLE]].join(NEW_LINE),
        [SongSection.SEQUENCE, sectionsMap[SongSection.SEQUENCE]].join(
          NEW_LINE,
        ),
        firstVerse,
        sectionsMap[SongSection.CHORUS]
          ? [SongSection.CHORUS, sectionsMap[SongSection.CHORUS]].join(NEW_LINE)
          : null,
        ...restVerses,
      ].filter(Boolean),
    ).join(`${NEW_LINE}${CARRIAGE_RETURN}`),
  );
};

export const processContent = (content: string, fileName?: string) => {
  const flatSections = content
    .replaceAll('^(\r)\n', '\r\n')
    .replaceAll(SongSection.VERSE_1, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_2, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_3, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_4, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_5, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_6, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_7, EMPTY_STRING)
    .replaceAll(SongSection.VERSE_8, EMPTY_STRING)
    .replaceAll(SongSection.TITLE, EMPTY_STRING)
    .replaceAll(SongSection.SEQUENCE, EMPTY_STRING)
    .split(/\r\n\r\n/gim)
    .filter(Boolean)
    .map(_.trim);

  return normalizeContentByAddingBasicStructure(flatSections, fileName);
};
