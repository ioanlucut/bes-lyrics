import {
  DuplicateResolution,
  SongFile,
  findSimilarSongs,
  planDuplicateResolution,
} from './songSimilarity.js';

const createSongFile = (filePath: string, lyrics: string): SongFile => ({
  content: `[title]
Titlu {id: {${filePath}}}

[sequence]
v1

[v1]
${lyrics}
`,
  fileName: filePath.split('/').at(-1) ?? filePath,
  filePath,
});

const LYRICS = 'Cât de mare ești Tu, Doamne, cât de mare ești';
const OTHER_LYRICS = 'Pe munte sus la Golgota o cruce se-nălța';

const CANDIDATE = createSongFile(
  'candidates/Autor - Cat de mare esti.txt',
  LYRICS,
);
const VERIFIED_DUPLICATE = createSongFile(
  'verified/Autor - Cat de mare.txt',
  LYRICS,
);
const VERIFIED_OTHER = createSongFile(
  'verified/Autor - Pe munte sus.txt',
  OTHER_LYRICS,
);

describe('songSimilarity', () => {
  describe('findSimilarSongs', () => {
    it('reports a song whose lyrics match another song', () => {
      const [match] = findSimilarSongs(
        [CANDIDATE],
        [VERIFIED_DUPLICATE, VERIFIED_OTHER],
      );

      expect(match.song).toBe(CANDIDATE);
      expect(match.similarSongs).toEqual([
        { ...VERIFIED_DUPLICATE, similarity: 1 },
      ]);
    });

    it('ignores songs with different lyrics', () => {
      expect(findSimilarSongs([CANDIDATE], [VERIFIED_OTHER])).toEqual([]);
    });

    it('does not compare a song with itself', () => {
      expect(findSimilarSongs([CANDIDATE], [CANDIDATE])).toEqual([]);
    });

    it("scores the Dice coefficient of the lyrics' character bigrams", () => {
      const [match] = findSimilarSongs(
        [createSongFile('candidates/Healed.txt', 'healed')],
        [createSongFile('verified/Sealed.txt', 'sealed')],
      );

      expect(match.similarSongs[0].similarity).toBe(0.8);
    });

    it('ignores whitespace', () => {
      const [match] = findSimilarSongs(
        [createSongFile('candidates/Spaced.txt', 'Cât de   mare\nești')],
        [createSongFile('verified/Joined.txt', 'Câtdemareești')],
      );

      expect(match.similarSongs[0].similarity).toBe(1);
    });

    it('ignores lyrics too short to compare', () => {
      expect(
        findSimilarSongs(
          [createSongFile('candidates/A.txt', 'a')],
          [createSongFile('verified/B.txt', 'b')],
        ),
      ).toEqual([]);
    });

    it('reports both songs of a pair when a list is compared with itself', () => {
      const songs = [VERIFIED_DUPLICATE, VERIFIED_OTHER, CANDIDATE];

      expect(findSimilarSongs(songs, songs)).toEqual([
        {
          song: VERIFIED_DUPLICATE,
          similarSongs: [{ ...CANDIDATE, similarity: 1 }],
        },
        {
          song: CANDIDATE,
          similarSongs: [{ ...VERIFIED_DUPLICATE, similarity: 1 }],
        },
      ]);
    });

    it('ignores lyrics that differ only in letter case', () => {
      const shouting = createSongFile(
        'verified/Shouting.txt',
        LYRICS.toUpperCase(),
      );

      expect(findSimilarSongs([CANDIDATE], [shouting])).toHaveLength(1);
    });

    it.each([
      [
        'the song is',
        createSongFile('candidates/Autor - Cat de mare - ii.txt', LYRICS),
        VERIFIED_DUPLICATE,
      ],
      [
        'every similar song is',
        CANDIDATE,
        createSongFile('verified/Autor - Cat de mare - i.txt', LYRICS),
      ],
    ])(
      'ignores a match when %s an alternative version',
      (_, song, againstSong) => {
        expect(findSimilarSongs([song], [againstSong])).toEqual([]);
      },
    );
  });

  describe('planDuplicateResolution', () => {
    const candidateMatches = findSimilarSongs(
      [CANDIDATE],
      [VERIFIED_DUPLICATE, VERIFIED_OTHER],
    );

    it('removes only the candidate', () => {
      expect(
        planDuplicateResolution(
          candidateMatches,
          DuplicateResolution.REMOVE_CANDIDATE,
        ),
      ).toEqual([
        {
          type: DuplicateResolution.REMOVE_CANDIDATE,
          candidatePath: CANDIDATE.filePath,
        },
      ]);
    });

    it('replaces only the verified song the candidate duplicates', () => {
      expect(
        planDuplicateResolution(
          candidateMatches,
          DuplicateResolution.REPLACE_EXISTING,
        ),
      ).toEqual([
        {
          type: DuplicateResolution.REPLACE_EXISTING,
          candidatePath: CANDIDATE.filePath,
          existingPath: VERIFIED_DUPLICATE.filePath,
        },
      ]);
    });

    it('plans one action per candidate even when it matches several songs', () => {
      const [match] = findSimilarSongs(
        [CANDIDATE],
        [VERIFIED_DUPLICATE, createSongFile('verified/Copie.txt', LYRICS)],
      );

      expect(match.similarSongs).toHaveLength(2);
      expect(
        planDuplicateResolution([match], DuplicateResolution.REMOVE_CANDIDATE),
      ).toHaveLength(1);
    });

    it('replaces nothing when several candidates duplicate the same verified song', () => {
      const secondCandidate = createSongFile(
        'candidates/Alt autor - Cat de mare.txt',
        LYRICS,
      );

      expect(
        planDuplicateResolution(
          findSimilarSongs([CANDIDATE, secondCandidate], [VERIFIED_DUPLICATE]),
          DuplicateResolution.REPLACE_EXISTING,
        ),
      ).toEqual([]);
    });
  });
});
