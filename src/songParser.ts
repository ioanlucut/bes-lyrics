import { SongAST, SongSection } from './types.js';
import {
  assertUniqueness,
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getUniqueId,
} from './core.js';
import { COMMA, EMPTY_STRING, MISSING_RC_ID } from './constants.js';

/**
 * Parses the content of a song to its basic AST structure.
 *
 * It's important to note that the song should be valid.
 *
 * @param songAsString The content of the song
 */
export const parse = (songAsString: string) => {
  const sectionTuples = getSongInSectionTuples(songAsString);

  const songAST = {
    author: EMPTY_STRING,
    contentHash: EMPTY_STRING,
    id: EMPTY_STRING,
    rcId: EMPTY_STRING,
    sectionOrder: [],
    sectionsMap: {},
    sequence: [],
    title: EMPTY_STRING,
    version: EMPTY_STRING,
    alternative: EMPTY_STRING,
  } as SongAST;

  for (
    let sectionIndex = 0;
    sectionIndex < sectionTuples.length;
    sectionIndex = sectionIndex + 2
  ) {
    const sectionContent = sectionTuples[sectionIndex + 1];
    const sectionIdentifier = sectionTuples[sectionIndex] as string;

    songAST.sectionsMap[sectionIdentifier] = {
      sectionIdentifier,
      content: sectionContent,
    };

    if ([SongSection.TITLE].includes(sectionIdentifier)) {
      songAST.title = getTitleWithoutMeta(sectionContent);

      const metaSectionsFromTitle = getMetaSectionsFromTitle(sectionContent);
      const { author, id, rcId, contentHash, version, alternative } =
        metaSectionsFromTitle;

      songAST.id = id || getUniqueId();
      songAST.rcId = rcId || MISSING_RC_ID;
      songAST.author = author;

      // Just a basic one, but should be updated after any potential changes
      songAST.contentHash = computeUniqueContentHash(
        songAsString.replaceAll(contentHash, EMPTY_STRING),
      );
      songAST.version = version;
      songAST.alternative = alternative;
    }

    if ([SongSection.SEQUENCE].includes(sectionIdentifier)) {
      songAST.sequence = sectionContent.split(COMMA);
    }

    if (
      ![SongSection.TITLE, SongSection.SEQUENCE].includes(sectionIdentifier)
    ) {
      songAST.sectionOrder.push(sectionIdentifier);
    }
  }

  assertUniqueness(songAST.sectionOrder);

  return songAST;
};
