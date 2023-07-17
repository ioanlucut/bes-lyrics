import { cloneDeep, flatten, range, size, uniq } from 'lodash-es';
import assert from 'node:assert';
import { COMMA, DOT, DOUBLE_LINE_TUPLE, NEW_LINE_TUPLE } from './constants.js';
import { SongSection } from './types.js';
import {
  convertSequenceToNumber,
  getCharWithMarkup,
  getCharWithoutMarkup,
  getSongInSectionTuples,
} from './core.js';
import { verifyStructure } from './contentStructureValidator.js';

/**
 * Reprocess the content of a song to add the basic structure.
 * This is useful when the content of the song is correct, but we want to apply further changes.
 *
 * It's important to note that the song should be valid.
 *
 * @param content The content of the song
 * @param fileName The name of the file
 */
export const reprocess = (content: string) => {
  assert.ok(verifyStructure(content), 'The structure of the song is invalid');

  const sectionTuples = getSongInSectionTuples(content);
  const sectionsMap = {} as Record<string, string>;

  for (
    let sectionIndex = 0;
    sectionIndex < sectionTuples.length;
    sectionIndex = sectionIndex + 2
  ) {
    sectionsMap[sectionTuples[sectionIndex]] = sectionTuples[sectionIndex + 1];
  }

  const sequence = cloneDeep(sectionsMap[SongSection.SEQUENCE].split(COMMA));

  const mapperWithSequenceSideEffectCollector = (
    verseSongSectionIdentifier: string,
  ) => {
    const verseSongSection = sectionsMap[verseSongSectionIdentifier];
    const hasSubSections = verseSongSection.includes(DOUBLE_LINE_TUPLE);

    if (!hasSubSections) {
      return [verseSongSectionIdentifier, verseSongSection].join(
        NEW_LINE_TUPLE,
      );
    }

    const subSections = verseSongSection
      .split(DOUBLE_LINE_TUPLE)
      .filter(Boolean);
    const subSectionSequence = [] as string[];

    const [char, identifierAsString] = getCharWithoutMarkup(
      verseSongSectionIdentifier,
    )
      .split(new RegExp(`(\\D+)(.*)`))
      .filter(Boolean);

    const updatedContent = flatten(
      range(0, size(subSections)).map((index) => {
        const subSectionIdentifier = `${char}${convertSequenceToNumber(
          identifierAsString,
        )}${DOT}${index + 1}`;
        subSectionSequence.push(subSectionIdentifier);

        return [
          getCharWithMarkup(subSectionIdentifier),
          subSections[index],
        ].join(NEW_LINE_TUPLE);
      }),
    ).join(DOUBLE_LINE_TUPLE);

    // ---
    // As side effect, update the sequence
    sequence[
      sequence.indexOf(
        getCharWithoutMarkup(verseSongSectionIdentifier),
      ) as number
    ] = subSectionSequence.join(COMMA);

    return updatedContent;
  };

  const verses = uniq(sequence)
    .map(getCharWithMarkup)
    .map(mapperWithSequenceSideEffectCollector);

  // ---
  // Reassemble the song
  return flatten([
    [SongSection.TITLE, sectionsMap[SongSection.TITLE]].join(NEW_LINE_TUPLE),
    [SongSection.SEQUENCE, sequence.join(COMMA)].join(NEW_LINE_TUPLE),

    // Assemble the verses based on the sequence
    verses,
  ]).join(DOUBLE_LINE_TUPLE);
};
