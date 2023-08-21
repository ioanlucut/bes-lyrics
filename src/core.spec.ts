import {
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
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
      ${`s`}
      ${`s2`}
      ${`s1000`}
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
      ${`s-1`}
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
  "4",
  "5",
  "6",
  "7",
  "8",
  ":",
  "B",
  "C",
  "D",
  "E",
  "H",
  "M",
  "P",
  "R",
  "U",
  "V",
  "W",
  "Y",
  "[",
  "]",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "k",
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
  "{",
  "}",
  "â",
  "ă",
  "ț",
]
`);
    });
  });

  describe('computeUniqueContentHash', () => {
    it('should work correctly', () => {
      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT),
      ).toMatchInlineSnapshot(`"d4c950"`);

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
      ).toMatchInlineSnapshot(`"83c6a9"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'X'),
      ).toMatchInlineSnapshot(`"300764"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'Y'),
      ).toMatchInlineSnapshot(`"6277d0"`);
    });
  });

  describe('getSongInSectionTuples', () => {
    it('should work correctly', () => {
      expect(getSongInSectionTuples(SIMPLE_SONG_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
[
  "[title]",
  "My custom title {version: {ii}, alternative: {Când eram fără speranță}, author: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
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
describe('getTitleWithoutMeta', () => {
  it('should work correctly', () => {
    expect(
      getTitleWithoutMeta(
        'Any title {alternative: {Any other title}, author: {CustomAuthor}, contentHash: {customHash}, id: {customId}}',
      ),
    ).toMatchInlineSnapshot(`"Any title"`);

    expect(getTitleWithoutMeta('Any title ')).toMatchInlineSnapshot(
      `"Any title"`,
    );
  });
});

describe('getMetaSectionsFromTitle', () => {
  it('should work correctly', () => {
    expect(
      getMetaSectionsFromTitle(
        'Any title {alternative: {Any other title}, author: {CustomAuthor}, contentHash: {customHash}, id: {customId}}',
      ),
    ).toMatchInlineSnapshot(`
{
  "alternative": "Any other title",
  "author": "CustomAuthor",
  "contentHash": "customHash",
  "id": "customId",
}
`);
  });
});
