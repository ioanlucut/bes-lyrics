import { SIMPLE_SONG_MOCK_FILE_CONTENT } from '../mocks/index.js';
import { ALLOWED_CHARS, EMPTY_STRING } from './constants.js';
import {
  computeUniqueContentHash,
  getMetaSectionsFromTitle,
  getSongInSectionTuples,
  getTitleWithoutMeta,
  getUniqueCharsAndRelevantChars,
  isKnownSongSequence,
  multiToSingle,
} from './core.js';

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
  "*",
  ",",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "9",
  ":",
  ";",
  "D",
  "E",
  "H",
  "I",
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
]
`);
    });
  });

  describe('computeUniqueContentHash', () => {
    it('should work correctly', () => {
      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT),
      ).toMatchInlineSnapshot(`"852906"`);

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
      ).toMatchInlineSnapshot(`"61c9c6"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'X'),
      ).toMatchInlineSnapshot(`"f440c8"`);

      expect(
        computeUniqueContentHash(SIMPLE_SONG_MOCK_FILE_CONTENT + 'Y'),
      ).toMatchInlineSnapshot(`"5673cf"`);
    });
  });

  describe('getSongInSectionTuples', () => {
    it('should work correctly', () => {
      expect(getSongInSectionTuples(SIMPLE_SONG_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
[
  "[title]",
  "My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}",
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

    it('should work correctly', () => {
      expect(getSongInSectionTuples(ALLOWED_CHARS.join(EMPTY_STRING)))
        .toMatchInlineSnapshot(`
[
  "*_{}&!()][\\,-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZYQabcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț‘’”„",
]
`);
    });
  });
});
describe('getTitleWithoutMeta', () => {
  it('should work correctly', () => {
    expect(
      getTitleWithoutMeta(
        'Any title {alternative: {Any other title}, composer: {CustomAuthor}, contentHash: {customHash}, id: {customId}}',
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
        'My custom title {alternative: { ALT1; ALT2 }, composer: {COMPOSER1; COMPOSER2}, writer: {WRITER1; WRITER2}, arranger: {ARRANGER1;ARRANGER2}, interpreter: {INTERPRETER1;INTERPRETER2}, band: {BAND1;BAND2}, key: {*}, tempo: {*}, tags: {T1;T2}, version: {ii}, genre: {A;B}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}',
      ),
    ).toMatchInlineSnapshot(`
{
  "alternative": "ALT1; ALT2",
  "arranger": "ARRANGER1;ARRANGER2",
  "band": "BAND1;BAND2",
  "composer": "COMPOSER1; COMPOSER2",
  "contentHash": "655954",
  "genre": "A;B",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "interpreter": "INTERPRETER1;INTERPRETER2",
  "key": "*",
  "rcId": "*",
  "tags": "T1;T2",
  "tempo": "*",
  "version": "ii",
  "writer": "WRITER1; WRITER2",
}
`);
  });
});

describe('multiToSingle', () => {
  it('should work correctly with ":"', () => {
    expect(
      multiToSingle('ANY_alternative;ANY_alternative2;ANY_alternative3'),
    ).toMatchInlineSnapshot(
      `"ANY_alternative; ANY_alternative2; ANY_alternative3"`,
    );
  });

  it('should work correctly with ":" and "," in the text', () => {
    expect(
      multiToSingle(
        'ANY_alternative;ANY_alternative part1, part2;ANY_alternative3',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_alternative; ANY_alternative part1, part2; ANY_alternative3"`,
    );
  });
});
