import {
  cloneDeep,
  first,
  flatten,
  isEqual,
  range,
  size,
  trim,
} from 'lodash-es';
import {
  COLON,
  COMMA,
  DOT,
  DOUBLE_LINE_TUPLE,
  EMPTY_SPACE,
  NEW_LINE_TUPLE,
  NULL,
} from './constants.js';
import { SongAST, SongMeta, SongSection } from './types.js';
import {
  assertUniqueness,
  convertSequenceToNumber,
  getCharWithMarkup,
  getCharWithoutMarkup,
  withMetaMarkup,
} from './core.js';

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
  alternative,
  author,
  contentHash,
  id,
  sectionOrder,
  sectionsMap,
  sequence,
  title,
  version,
}: SongAST) => {
  let newSequence = cloneDeep(sequence);

  const mapperWithSequenceSideEffectCollector = (
    verseSongSectionIdentifier: string,
  ) => {
    const songSectionContent = sectionsMap[verseSongSectionIdentifier].content;
    const verseSongSectionIdentifierWithoutMarkup = getCharWithoutMarkup(
      verseSongSectionIdentifier,
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

  const metaSection = withMetaMarkup(
    [
      author
        ? [SongMeta.AUTHOR, withMetaMarkup(author)].join(
            `${COLON}${EMPTY_SPACE}`,
          )
        : NULL,
      alternative
        ? [SongMeta.ALTERNATIVE, withMetaMarkup(alternative)].join(
            `${COLON}${EMPTY_SPACE}`,
          )
        : NULL,
      version
        ? [SongMeta.VERSION, withMetaMarkup(version)].join(
            `${COLON}${EMPTY_SPACE}`,
          )
        : NULL,

      contentHash
        ? [SongMeta.CONTENT_HASH, withMetaMarkup(contentHash)].join(
            `${COLON}${EMPTY_SPACE}`,
          )
        : NULL,
      id
        ? [SongMeta.ID, withMetaMarkup(id)].join(`${COLON}${EMPTY_SPACE}`)
        : NULL,
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
