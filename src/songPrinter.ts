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
  EMPTY_SPACE,
  NEW_LINE_TUPLE,
  NULL,
} from './constants.js';
import {
  assertUniqueness,
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
        NEW_LINE_TUPLE,
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
  ].join(NEW_LINE_TUPLE);

  const updatedSequence = existingSequence.map((sequenceIteratee) => {
    if (isEqual(sequenceIteratee, verseSongSectionIdentifierWithoutMarkup)) {
      return identifierWithoutMarkup;
    }

    return sequenceIteratee;
  });

  return { updatedSequence, updatedSongSectionContent };
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
  contentHash,
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
  let newSequence = filter(cloneDeep(sequence), (sequenceItem) =>
    sectionOrder.map(getCharWithoutMarkup).includes(sequenceItem),
  ) as string[];

  const mapperWithSequenceSideEffectCollector = (
    verseSongSectionIdentifier: string,
  ) => {
    const songSectionContent = sectionsMap[verseSongSectionIdentifier].content;
    const verseSongSectionIdentifierWithoutMarkup = getCharWithoutMarkup(
      verseSongSectionIdentifier,
    );

    assert.ok(
      !isEmpty(songSectionContent),
      `The song section content is not empty: "${songSectionContent}"."`,
    );

    const hasContentThatCouldBeSubSections =
      songSectionContent.includes(DOUBLE_LINE_TUPLE);

    // ---
    // If it should be un-split
    if (
      !hasContentThatCouldBeSubSections &&
      isEqual(
        size(
          newSequence.filter((sequenceIteratee) =>
            sequenceIteratee.includes(
              `${first(
                verseSongSectionIdentifierWithoutMarkup.split(DOT),
              )}${DOT}`,
            ),
          ),
        ),
        1,
      )
    ) {
      const { updatedSongSectionContent, updatedSequence } =
        getContentAndSequenceUnSplit(
          songSectionContent,
          verseSongSectionIdentifierWithoutMarkup,
          newSequence,
        );

      // As a side effect, Update the sequence
      newSequence = updatedSequence;

      return updatedSongSectionContent;
    }

    // ---
    // If no split is required
    if (!hasContentThatCouldBeSubSections) {
      return [verseSongSectionIdentifier, songSectionContent].join(
        NEW_LINE_TUPLE,
      );
    }

    // ---
    // If content should be split
    const { updatedSongSectionContent, updatedSequence } =
      getContentAndSequenceSplitInSubSections(
        songSectionContent,
        verseSongSectionIdentifierWithoutMarkup,
        newSequence,
      );

    // As a side effect, Update the sequence
    newSequence = updatedSequence;

    return updatedSongSectionContent;
  };

  assertUniqueness(sectionOrder);

  const songBodySections = sectionOrder.map(
    mapperWithSequenceSideEffectCollector,
  );

  const printSongMetaContentIfTruthy = (
    songMetaKey: SongMeta,
    songMetaContent?: string,
  ) =>
    songMetaContent
      ? [songMetaKey, withMetaMarkup(songMetaContent)].join(
          `${COLON}${EMPTY_SPACE}`,
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
      .join(`${COMMA}${EMPTY_SPACE}`),
  );
  // ---
  // Reassemble the song
  const flattenContent = flatten([
    [SongSection.TITLE, [title, metaSection].join(EMPTY_SPACE)].join(
      NEW_LINE_TUPLE,
    ),
    [SongSection.SEQUENCE, newSequence.join(COMMA)].join(NEW_LINE_TUPLE),
    songBodySections,
  ]).join(DOUBLE_LINE_TUPLE);

  return `${trim(flattenContent)}${NEW_LINE_TUPLE}`;
};
