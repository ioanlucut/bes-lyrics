import { verifyStructure } from './contentStructureValidator.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { CARRIAGE_RETURN, COMMA, NEW_LINE } from './constants.js';

const createSongMock = (desiredSequence: string[]) => `[title]
My custom title

[sequence]
${desiredSequence.join(COMMA)}

${desiredSequence
  .map(
    (sequence) =>
      `[${sequence}]${CARRIAGE_RETURN}${NEW_LINE}Content for ${sequence}`,
  )
  .join(`${CARRIAGE_RETURN}${NEW_LINE}${CARRIAGE_RETURN}${NEW_LINE}`)}`;

describe('contentStructureValidator', () => {
  it('should not throw for a correct song', () => {
    expect(() => verifyStructure(SIMPLE_SONG_MOCK_FILE_CONTENT)).not.toThrow();
  });

  describe('title', () => {
    it('should reject missing [title] section', () => {
      expect(() =>
        verifyStructure(`My custom title

[sequence]
v1

[v1]
Row 1`),
      ).toThrowErrorMatchingInlineSnapshot(`"[title] is missing."`);
    });

    it('should allow alternative content', () => {
      expect(() =>
        verifyStructure(`[title]
My custom title {alternative: {Alt, Altb}, author: {Author}, version: {ii}}

[sequence]
c

[c]
Chorus`),
      ).not.toThrow();
    });
  });

  describe('section', () => {
    it('should reject missing [sequence] section', () => {
      expect(() =>
        verifyStructure(`[title]
My custom title

[v1]
Row 1`),
      ).toThrowErrorMatchingInlineSnapshot(`"[sequence] is missing."`);
    });

    it('should throw if the [sequence] does not match all the sections', () => {
      expect(() =>
        verifyStructure(SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT),
      ).toThrowErrorMatchingInlineSnapshot(
        `"The [31m[v2],[v3],[p],[p2],[p3],[c],[c2],[c3],[b],[b2],[b3][39m tags are present in the content but not in the sequence."`,
      );
    });

    it('should throw if the sections defined in the [sequence] are not present', () => {
      expect(() =>
        verifyStructure(SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT),
      ).toThrowErrorMatchingInlineSnapshot(
        `"The [31m[c][39m is defined in the sequence but missing as a [31m[c][39m section."`,
      );
    });
  });

  describe('content', () => {
    // ------------------------------------------------------------
    // ALLOW CASES
    // ------------------------------------------------------------

    it.each`
      songContent                                                                                   | explanation
      ${createSongMock(['v1', 'v2', 'v3', 'p', 'p2', 'p3', 'b', 'b2', 'b3', 'c', 'c2', 'c3', 'e'])} | ${'Supported chars.'}
      ${createSongMock(['c', 'v1', 'c2', 'c', 'v2', 'c2', 'c'])}                                    | ${'Supported chars.'}
      ${createSongMock(['v1', 'v2', 'v1', 'v2'])}                                                   | ${'Supported chars.'}
    `('should allow correctly for a `$explanation`', ({ songContent }) => {
      expect(() => verifyStructure(songContent)).not.toThrow();
    });

    // ------------------------------------------------------------
    // REJECT CASES
    // ------------------------------------------------------------

    it.each`
      songContent               | explanation
      ${``}                     | ${'Missing title!'}
      ${createSongMock(['v0'])} | ${'Unsupported chars in sequence.'}
      ${createSongMock(['p1'])} | ${'Unsupported chars in sequence.'}
      ${createSongMock(['b1'])} | ${'Unsupported chars in sequence.'}
      ${createSongMock(['c1'])} | ${'Unsupported chars in sequence.'}
      ${createSongMock(['e1'])} | ${'Unsupported chars in sequence.'}
    `(
      'should reject correctly for a `$explanation`',
      ({ songContent, explanation }) => {
        expect(() => verifyStructure(songContent)).toThrowErrorMatchingSnapshot(
          explanation,
        );
      },
    );

    it.each`
      songContent                            | explanation
      ${createSongMock(['v1', 'v3'])}        | ${"Supported v's chars in the bad order."}
      ${createSongMock(['v1', 'v2', 'v6'])}  | ${"Supported v's chars in the bad order."}
      ${createSongMock(['v3', 'v9', 'v12'])} | ${"Supported v's chars in the bad order."}
      ${createSongMock(['c', 'c2', 'c4'])}   | ${"Supported c's chars in the bad order."}
      ${createSongMock(['b', 'b2', 'b4'])}   | ${"Supported b's chars in the bad order."}
      ${createSongMock(['p', 'p2', 'p4'])}   | ${"Supported p's chars in the bad order."}
    `(
      'should reject correctly for a `$explanation`',
      ({ songContent, explanation }) => {
        expect(() => verifyStructure(songContent)).toThrowErrorMatchingSnapshot(
          explanation,
        );
      },
    );
  });
});
