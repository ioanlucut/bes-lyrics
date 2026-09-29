import stringSimilarity from 'string-similarity';
import { ALT_SONGS_FILE_SUFFIX, NEW_LINE } from './constants.js';
import { parse } from './songParser.js';

export const SIMILARITY_THRESHOLD = 0.65;

export type SongFile = {
  content: string;
  fileName: string;
  filePath: string;
};

export type SimilarSong = SongFile & { similarity: number };

export type SimilarityMatch = {
  song: SongFile;
  similarSongs: SimilarSong[];
};

export enum DuplicateResolution {
  REMOVE_CANDIDATE = 'removeCandidate',
  REPLACE_EXISTING = 'replaceExisting',
}

export type DuplicateAction =
  | { type: DuplicateResolution.REMOVE_CANDIDATE; candidatePath: string }
  | {
      type: DuplicateResolution.REPLACE_EXISTING;
      candidatePath: string;
      existingPath: string;
    };

const getComparableLyrics = (content: string) => {
  const { sectionOrder, sectionsMap } = parse(content, {
    ignoreUniquenessErrors: true,
  });

  return sectionOrder
    .map((sectionIdentifier) => sectionsMap[sectionIdentifier].content)
    .join(NEW_LINE)
    .toLowerCase();
};

const isAlternativeVersion = ({ fileName }: SongFile) =>
  ALT_SONGS_FILE_SUFFIX.test(fileName);

/**
 * Finds, for every song, the other songs whose lyrics are more similar than
 * `SIMILARITY_THRESHOLD`. Songs marked as alternative versions (`- i`,
 * `- ii`) are expected to resemble their original and are not reported.
 */
export const findSimilarSongs = (
  songs: SongFile[],
  againstSongs: SongFile[],
): SimilarityMatch[] =>
  songs
    .filter((song) => !isAlternativeVersion(song))
    .map((song) => ({
      song,
      similarSongs: againstSongs
        .filter(({ filePath }) => filePath !== song.filePath)
        .map((againstSong) => ({
          ...againstSong,
          similarity: stringSimilarity.compareTwoStrings(
            getComparableLyrics(againstSong.content),
            getComparableLyrics(song.content),
          ),
        }))
        .filter(({ similarity }) => similarity > SIMILARITY_THRESHOLD),
    }))
    .filter(
      ({ similarSongs }) =>
        similarSongs.length > 0 && !similarSongs.every(isAlternativeVersion),
    );

/**
 * Plans how to resolve candidates that duplicate a verified song: one action
 * per candidate, against the first verified song it resembles. Only the
 * candidates-against-verified comparison may be resolved this way; the other
 * comparisons have no side that is safe to delete or overwrite.
 */
export const planDuplicateResolution = (
  candidateMatches: SimilarityMatch[],
  resolution: DuplicateResolution,
): DuplicateAction[] =>
  candidateMatches.map(({ song, similarSongs: [existingSong] }) =>
    resolution === DuplicateResolution.REMOVE_CANDIDATE
      ? { type: resolution, candidatePath: song.filePath }
      : {
          type: resolution,
          candidatePath: song.filePath,
          existingPath: existingSong.filePath,
        },
  );
