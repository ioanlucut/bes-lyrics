import { ALT_SONGS_FILE_SUFFIX, EMPTY_STRING, NEW_LINE } from './constants.js';
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

type LyricsFingerprint = {
  text: string;
  bigramCounts: Map<string, number>;
};

const toFingerprint = ({ content }: SongFile): LyricsFingerprint => {
  const text = getComparableLyrics(content).replace(/\s+/g, EMPTY_STRING);
  const bigramCounts = new Map<string, number>();

  for (let index = 0; index < text.length - 1; index++) {
    const bigram = text.slice(index, index + 2);
    bigramCounts.set(bigram, (bigramCounts.get(bigram) ?? 0) + 1);
  }

  return { text, bigramCounts };
};

/**
 * The Sørensen–Dice coefficient of the two texts' character bigrams, ignoring
 * whitespace: the measure `string-similarity` computed, from bigrams counted
 * once per song instead of once per pair. Only called for pairs that pass
 * `canExceedThreshold`, which excludes texts too short to have a bigram.
 */
const getLyricsSimilarity = (
  first: LyricsFingerprint,
  second: LyricsFingerprint,
) => {
  if (first.text === second.text) {
    return 1;
  }

  const [fewer, more] =
    first.bigramCounts.size <= second.bigramCounts.size
      ? [first, second]
      : [second, first];
  let sharedBigramCount = 0;

  fewer.bigramCounts.forEach((count, bigram) => {
    sharedBigramCount += Math.min(count, more.bigramCounts.get(bigram) ?? 0);
  });

  return (2 * sharedBigramCount) / (first.text.length + second.text.length - 2);
};

// Two texts cannot share more bigrams than the shorter one has, so their
// lengths alone rule out most pairs before any bigram is compared.
const canExceedThreshold = (
  first: LyricsFingerprint,
  second: LyricsFingerprint,
) => {
  const firstBigramTotal = first.text.length - 1;
  const secondBigramTotal = second.text.length - 1;

  return (
    first.text === second.text ||
    (2 * Math.min(firstBigramTotal, secondBigramTotal)) /
      (firstBigramTotal + secondBigramTotal) >
      SIMILARITY_THRESHOLD
  );
};

/**
 * Finds, for every song, the other songs whose lyrics are more similar than
 * `SIMILARITY_THRESHOLD`. Songs marked as alternative versions (`- i`,
 * `- ii`) are expected to resemble their original and are not reported.
 * Comparing a list with itself compares each pair once.
 */
export const findSimilarSongs = (
  songs: SongFile[],
  againstSongs: SongFile[],
): SimilarityMatch[] => {
  const isComparedWithItself = songs === againstSongs;
  const fingerprints = songs.map(toFingerprint);
  const againstFingerprints = isComparedWithItself
    ? fingerprints
    : againstSongs.map(toFingerprint);
  const similarSongLists = songs.map((): SimilarSong[] => []);

  songs.forEach((song, songIndex) => {
    againstSongs.forEach((againstSong, againstSongIndex) => {
      if (
        (isComparedWithItself && againstSongIndex <= songIndex) ||
        againstSong.filePath === song.filePath ||
        !canExceedThreshold(
          fingerprints[songIndex],
          againstFingerprints[againstSongIndex],
        )
      ) {
        return;
      }

      const similarity = getLyricsSimilarity(
        fingerprints[songIndex],
        againstFingerprints[againstSongIndex],
      );

      if (similarity <= SIMILARITY_THRESHOLD) {
        return;
      }

      similarSongLists[songIndex].push({ ...againstSong, similarity });

      if (isComparedWithItself) {
        similarSongLists[againstSongIndex].push({ ...song, similarity });
      }
    });
  });

  return songs
    .map((song, songIndex) => ({
      song,
      similarSongs: similarSongLists[songIndex],
    }))
    .filter(({ song }) => !isAlternativeVersion(song))
    .filter(
      ({ similarSongs }) =>
        similarSongs.length > 0 && !similarSongs.every(isAlternativeVersion),
    );
};

/**
 * Plans how to resolve candidates that duplicate a verified song: one action
 * per candidate, against the first verified song it resembles, so a candidate
 * resembling several songs needs another run for the rest. Only the
 * candidates-against-verified comparison may be resolved this way; the other
 * comparisons have no side that is safe to delete or overwrite. When several
 * candidates would replace the same verified song, none of them does, because
 * only the last one would survive.
 */
export const planDuplicateResolution = (
  candidateMatches: SimilarityMatch[],
  resolution: DuplicateResolution,
): DuplicateAction[] => {
  if (resolution === DuplicateResolution.REMOVE_CANDIDATE) {
    return candidateMatches.map(({ song }) => ({
      type: resolution,
      candidatePath: song.filePath,
    }));
  }

  const replacements = candidateMatches.map(
    ({ song, similarSongs: [existingSong] }) => ({
      type: resolution,
      candidatePath: song.filePath,
      existingPath: existingSong.filePath,
    }),
  );

  return replacements.filter(
    ({ existingPath }) =>
      replacements.filter(
        (replacement) => replacement.existingPath === existingPath,
      ).length === 1,
  );
};
