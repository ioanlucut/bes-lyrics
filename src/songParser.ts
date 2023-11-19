import { isEqual } from 'lodash-es';
import { COMMA, EMPTY_STRING, UNSET_META } from './constants.js';
import {
  assertUniqueness,
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getUniqueId,
  multiToSingle,
} from './core.js';
import { SongAST, SongSection } from './types.js';

/**
 * Parses the content of a song to its basic AST structure.
 *
 * It's important to note that the song should be valid.
 *
 * @param songAsString The content of the song
 * @param ignoreUniquenessErrors if the uniqueness errors should be ignored
 * if
 */
export const parse = (
  songAsString: string,
  {
    ignoreUniquenessErrors,
  }: {
    ignoreUniquenessErrors?: boolean;
  } = {},
) => {
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

      songAST.alternative = multiToSingle(alternative) || UNSET_META;
      songAST.composer = multiToSingle(composer) || UNSET_META;
      songAST.writer = multiToSingle(writer) || UNSET_META;
      songAST.arranger = multiToSingle(arranger) || UNSET_META;
      songAST.interpreter = multiToSingle(interpreter) || UNSET_META;
      songAST.band = multiToSingle(band) || UNSET_META;
      songAST.genre = multiToSingle(genre) || UNSET_META;
      songAST.key = multiToSingle(key) || UNSET_META;
      songAST.tags = multiToSingle(tags) || UNSET_META;
      songAST.tempo = multiToSingle(tempo) || UNSET_META;
      songAST.version = version || UNSET_META;

      songAST.rcId = rcId || UNSET_META;
      songAST.id = id && !isEqual(id, UNSET_META) ? id : getUniqueId();
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

  if (!ignoreUniquenessErrors) {
    assertUniqueness(songAST.sectionOrder);
  }

  return songAST;
};
