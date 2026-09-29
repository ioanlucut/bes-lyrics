import {
  cloneDeep,
  filter,
  first,
  flatten,
  isEmpty,
  isEqual,
  range,
  size,
  trim,
} from 'lodash-es';
import assert from 'node:assert';
import {
  COLON,
  COMMA,
  DOT,
  DOUBLE_LINE_TUPLE,
  NEW_LINE,
  NULL,
  SPACE_CHAR,
} from './constants.js';
import {
  assertUniqueness,
  computeUniqueContentHash,
  convertSequenceToNumber,
  getCharWithMarkup,
  getCharWithoutMarkup,
  withMetaMarkup,
} from './core.js';
import { SongAST, SongMeta, SongSection } from './types.js';

const getContentAndSequenceSplitInSubSections = (
  songSectionContent: string,
  verseSongSectionIdentifierWithoutMarkup: string,
  existingSequence: string[],
) => {
  const subSections = songSectionContent
    .split(DOUBLE_LINE_TUPLE)
    .filter(Boolean);
  const subSectionSequence = [] as string[];

  const [songSectionWithoutQualifier, identifierAsString] =
    verseSongSectionIdentifierWithoutMarkup
      .split(new RegExp(`(\\D+)(.*)`))
      .filter(Boolean);

  const updatedSongSectionContent = flatten(
    range(0, size(subSections)).map((index) => {
      const subSectionIdentifier = `${songSectionWithoutQualifier}${convertSequenceToNumber(
        identifierAsString,
      )}${DOT}${index + 1}`;

      subSectionSequence.push(subSectionIdentifier);

      return [getCharWithMarkup(subSectionIdentifier), subSections[index]].join(
        NEW_LINE,
      );
    }),
  ).join(DOUBLE_LINE_TUPLE);

  const updatedSequence = existingSequence.map((sequenceIteratee) => {
    if (isEqual(sequenceIteratee, verseSongSectionIdentifierWithoutMarkup)) {
      return subSectionSequence.join(COMMA);
    }

    return sequenceIteratee;
  });

  return { updatedSequence, updatedSongSectionContent };
};

const getContentAndSequenceUnSplit = (
  songSectionContent: string,
  verseSongSectionIdentifierWithoutMarkup: string,
  existingSequence: string[],
) => {
  const identifierWithoutMarkup = first(
    verseSongSectionIdentifierWithoutMarkup.split(DOT),
  ) as string;
  const identifierWitMarkup = getCharWithMarkup(identifierWithoutMarkup);

  const updatedSongSectionContent = [
    identifierWitMarkup,
    songSectionContent,
  ].join(NEW_LINE);

  const updatedSequence = existingSequence.map((sequenceIteratee) => {
    if (isEqual(sequenceIteratee, verseSongSectionIdentifierWithoutMarkup)) {
      return identifierWithoutMarkup;
    }

    return sequenceIteratee;
  });

  return { updatedSequence, updatedSongSectionContent };
};

/**
 * Prints one section and returns the sequence updated for it: a section
 * whose content has blank lines is split into parts (`v1` → `v1.1,v1.2`), and
 * the single remaining part of a split section is merged back (`v1.1` → `v1`).
 */
const printSection = (
  sectionIdentifier: string,
  content: string,
  sequence: string[],
) => {
  const sectionIdentifierWithoutMarkup =
    getCharWithoutMarkup(sectionIdentifier);

  assert.ok(
    !isEmpty(content),
    `The song section content is not empty: "${content}"."`,
  );

  const hasContentThatCouldBeSubSections = content.includes(DOUBLE_LINE_TUPLE);

  if (
    !hasContentThatCouldBeSubSections &&
    isEqual(
      size(
        sequence.filter((sequenceIteratee) =>
          sequenceIteratee.includes(
            `${first(sectionIdentifierWithoutMarkup.split(DOT))}${DOT}`,
          ),
        ),
      ),
      1,
    )
  ) {
    const { updatedSongSectionContent, updatedSequence } =
      getContentAndSequenceUnSplit(
        content,
        sectionIdentifierWithoutMarkup,
        sequence,
      );

    return { sectionText: updatedSongSectionContent, updatedSequence };
  }

  if (!hasContentThatCouldBeSubSections) {
    return {
      sectionText: [sectionIdentifier, content].join(NEW_LINE),
      updatedSequence: sequence,
    };
  }

  const { updatedSongSectionContent, updatedSequence } =
    getContentAndSequenceSplitInSubSections(
      content,
      sectionIdentifierWithoutMarkup,
      sequence,
    );

  return { sectionText: updatedSongSectionContent, updatedSequence };
};

/**
 * Reprocess the content of a song by printing the basic structure.
 * This is useful when the content of the song is correct, but we want to apply further changes.
 *
 * It's important to note that the song should be valid.
 *
 * @param songAST The AST of the song
 */
export const print = ({
  sectionOrder,
  sectionsMap,
  sequence,
  alternative,
  arranger,
  band,
  composer,
  genre,
  id,
  interpreter,
  key,
  rcId,
  tags,
  tempo,
  title,
  version,
  writer,
}: SongAST) => {
  const printableSequence = filter(cloneDeep(sequence), (sequenceItem) =>
    sectionOrder.map(getCharWithoutMarkup).includes(sequenceItem),
  ) as string[];

  assertUniqueness(sectionOrder);

  const { songBodySections, newSequence } = sectionOrder.reduce(
    (printed, sectionIdentifier) => {
      const { sectionText, updatedSequence } = printSection(
        sectionIdentifier,
        sectionsMap[sectionIdentifier].content,
        printed.newSequence,
      );

      return {
        songBodySections: [...printed.songBodySections, sectionText],
        newSequence: updatedSequence,
      };
    },
    { songBodySections: [] as string[], newSequence: printableSequence },
  );

  const sequenceSection = [SongSection.SEQUENCE, newSequence.join(COMMA)].join(
    NEW_LINE,
  );
  const printSong = (titleLine: string) =>
    `${trim(
      flatten([
        [SongSection.TITLE, titleLine].join(NEW_LINE),
        sequenceSection,
        songBodySections,
      ]).join(DOUBLE_LINE_TUPLE),
    )}${NEW_LINE}`;
  // The hash covers the printed song with the bare title, so it is the same
  // whether or not the input was already formatted.
  const contentHash = computeUniqueContentHash(printSong(title));

  const printSongMetaContentIfTruthy = (
    songMetaKey: SongMeta,
    songMetaContent?: string,
  ) =>
    songMetaContent
      ? [songMetaKey, withMetaMarkup(songMetaContent)].join(
          `${COLON}${SPACE_CHAR}`,
        )
      : NULL;

  const metaSection = withMetaMarkup(
    [
      printSongMetaContentIfTruthy(SongMeta.ALTERNATIVE, alternative),
      printSongMetaContentIfTruthy(SongMeta.COMPOSER, composer),
      printSongMetaContentIfTruthy(SongMeta.WRITER, writer),
      printSongMetaContentIfTruthy(SongMeta.ARRANGER, arranger),
      printSongMetaContentIfTruthy(SongMeta.INTERPRETER, interpreter),
      printSongMetaContentIfTruthy(SongMeta.BAND, band),
      printSongMetaContentIfTruthy(SongMeta.KEY, key),
      printSongMetaContentIfTruthy(SongMeta.TEMPO, tempo),
      printSongMetaContentIfTruthy(SongMeta.TAGS, tags),
      printSongMetaContentIfTruthy(SongMeta.VERSION, version),
      printSongMetaContentIfTruthy(SongMeta.GENRE, genre),
      printSongMetaContentIfTruthy(SongMeta.RC_ID, rcId),
      printSongMetaContentIfTruthy(SongMeta.ID, id),
      printSongMetaContentIfTruthy(SongMeta.CONTENT_HASH, contentHash),
    ]
      .filter(Boolean)
      .join(`${COMMA}${SPACE_CHAR}`),
  );
  return printSong([title, metaSection].join(SPACE_CHAR));
};
