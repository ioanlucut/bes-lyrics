import { SongAST, SongSection } from './types.js';
import {
  assertUniqueness,
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getUniqueId,
} from './core.js';
import { COMMA, EMPTY_STRING } from './constants.js';

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
    composer: EMPTY_STRING,
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
      const {
        alternative,
        arranger,
        composer,
        band,
        contentHash,
        genre,
        id,
        interpreter,
        key,
        rcId,
        tags,
        tempo,
        version,
        writer,
      } = metaSectionsFromTitle;

      // Just a basic one, but should be updated after any potential changes
      songAST.contentHash = computeUniqueContentHash(
        songAsString.replaceAll(
          songAST.sectionsMap[SongSection.TITLE].content,
          songAST.title,
        ),
      );

      songAST.alternative = alternative;
      songAST.composer = composer;
      songAST.writer = writer;
      songAST.arranger = arranger;
      songAST.interpreter = interpreter;
      songAST.band = band;
      songAST.genre = genre;
      songAST.key = key;
      songAST.tags = tags;
      songAST.tempo = tempo;
      songAST.version = version;

      songAST.rcId = rcId;
      songAST.id = id || getUniqueId();
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
