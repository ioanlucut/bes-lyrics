import { SongAST, SongSection } from './types.js';
import {
  assertUniqueness,
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getUniqueId,
} from './core.js';
import {
  COMMA,
  EMPTY_STRING,
  MISSING_AUTHOR,
  MISSING_RC_ID,
} from './constants.js';

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
      const { author, id, rcId, version, alternative } = metaSectionsFromTitle;

      songAST.id = id || getUniqueId();
      songAST.author = author || MISSING_AUTHOR;
      songAST.rcId = rcId || MISSING_RC_ID;

      // Just a basic one, but should be updated after any potential changes
      songAST.contentHash = computeUniqueContentHash(
        songAsString.replaceAll(
          songAST.sectionsMap[SongSection.TITLE].content,
          songAST.title,
        ),
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
