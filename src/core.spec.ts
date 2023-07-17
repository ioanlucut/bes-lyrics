import {
  computeUniqueContentHash,
  getSongInSectionTuples,
  getUniqueCharsAndRelevantChars,
  isKnownSongSequence,
} from './core.js';
import { SIMPLE_SONG_MOCK_FILE_CONTENT } from '../mocks/index.js';

describe('core', () => {
  describe('isKnownSongSequence', () => {
    it.each`
      songKey
      ${`v1`}
      ${`v99`}
      ${`v1000`}
      ${`p`}
      ${`p2`}
      ${`p1000`}
      ${`b`}
      ${`b2`}
      ${`b1000`}
      ${`c`}
      ${`c2`}
      ${`c1000`}
      ${`e`}
    `('Known: should correctly identify `$songKey`', ({ songKey }) => {
      expect(isKnownSongSequence(songKey)).toBeTruthy();
    });

    it.each`
      songKey
      ${`v-1`}
      ${`c-1`}
      ${`p-1`}
      ${`e-1`}
      ${`b-1`}
      ${`v0`}
      ${`v`}
      ${`p0`}
      ${`e0`}
      ${`e1`}
      ${`e99`}
    `('Not known: should correctly identify `$songKey`', ({ songKey }) => {
      expect(isKnownSongSequence(songKey)).toBeFalsy();
    });
  });

  describe('getUniqueCharsAndRelevantChars', () => {
    it('should work correctly', () => {
      expect(getUniqueCharsAndRelevantChars(SIMPLE_SONG_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
        [
          "
        ",
          " ",
          ",",
          "1",
          "2",
          "3",
          "M",
          "R",
          "[",
          "]",
          "b",
          "c",
          "e",
          "f",
          "i",
          "l",
          "m",
          "n",
          "o",
          "p",
          "q",
          "r",
          "s",
          "t",
          "u",
          "v",
          "w",
          "y",
        ]
      `);
    });
  });

  describe('computeUniqueContentHash', () => {
    it('should work correctly', () => {
      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT),
      ).toMatchInlineSnapshot(`"655954"`);

      expect(computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT)).toEqual(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT),
      );
    });

    it('should update correctly', () => {
      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT),
      ).not.toEqual(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'A'),
      );
    });

    it('should update correctly', () => {
      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + ' '),
      ).toMatchInlineSnapshot(`"f827db"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'X'),
      ).toMatchInlineSnapshot(`"8131b7"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'Y'),
      ).toMatchInlineSnapshot(`"1e90a4"`);
    });
  });

  describe('getSongInSectionTuples', () => {
    it('should work correctly', () => {
      expect(getSongInSectionTuples(SIMPLE_SONG_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
        [
          "[title]",
          "My custom title",
          "[sequence]",
          "v1,v2,v3,p,p2,p3,c,c2,c3,b,b2,b3",
          "[v1]",
          "Row for v1",
          "[v2]",
          "Row for v2",
          "[v3]",
          "Row for v3",
          "[p]",
          "Row for p",
          "[p2]",
          "Row for p2",
          "[p3]",
          "Row for p3",
          "[c]",
          "Row for c",
          "[c2]",
          "Row for c2",
          "[c3]",
          "Row for c3",
          "[b]",
          "Row for b",
          "[b2]",
          "Row for b2",
          "[b3]",
          "Row for b3",
        ]
      `);
    });
  });
});
