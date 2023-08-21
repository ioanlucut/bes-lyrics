import { verifyStructure } from './contentStructureValidator.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { createSongMock } from './core.js';

describe('contentStructureValidator', () => {
  it('should not throw for a correct song', () => {
    expect(() => verifyStructure(SIMPLE_SONG_MOCK_FILE_CONTENT)).not.toThrow();
  });

  it('should not throw for a correct song w/ sub sections', () => {
    expect(() =>
      verifyStructure(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT),
    ).not.toThrow();
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
        `"The [v2],[v3],[p],[p2],[p3],[c],[c2],[c3],[b],[b2],[b3] tags are present in the content but not in the sequence."`,
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
      songContent                                                                                                   | explanation
      ${createSongMock(['v1', 'v2.1', 'v2.2', 'v3'])}                                                               | ${'Supported chars.'}
      ${createSongMock(['v1.1', 'v1.2', 'v2.1', 'v2.2', 'v3', 'c'])}                                                | ${'Supported chars.'}
      ${createSongMock(['c1.1', 'c1.2', 'c2.1', 'c2.2', 'c3'])}                                                     | ${'Supported chars.'}
      ${createSongMock(['b1.1', 'b1.2', 'b2.1', 'b2.2', 'b3'])}                                                     | ${'Supported chars.'}
      ${createSongMock(['s1.1', 's1.2', 's2.1', 's2.2', 's3'])}                                                     | ${'Supported chars.'}
      ${createSongMock(['p1.1', 'p1.2', 'p2.1', 'p2.2', 'p3'])}                                                     | ${'Supported chars.'}
      ${createSongMock(['v1', 'v2', 'v3.1', 'v3.2', 'v3.3', 'v4', 'c1.1', 'c1.2', 'b1.1', 'b1.2', 'p1.1', 'p1.2'])} | ${'Supported chars.'}
    `('should allow correctly for a `$explanation`', ({ songContent }) => {
      expect(() => verifyStructure(songContent)).not.toThrow();
    });

    // ------------------------------------------------------------
    // REJECT CASES
    // ------------------------------------------------------------

    it.each`
      songContent                         | explanation
      ${``}                               | ${'Missing title!'}
      ${createSongMock(['v1', 'c', 'c'])} | ${'Duplicate section.'}
      ${createSongMock(['v0'])}           | ${'Unsupported chars in sequence.'}
      ${createSongMock(['p1'])}           | ${'Unsupported chars in sequence.'}
      ${createSongMock(['b1'])}           | ${'Unsupported chars in sequence.'}
      ${createSongMock(['c1'])}           | ${'Unsupported chars in sequence.'}
      ${createSongMock(['e1'])}           | ${'Unsupported chars in sequence.'}
      ${createSongMock(['s1'])}           | ${'Unsupported chars in sequence.'}
    `(
      'should reject correctly for a `$explanation`',
      ({ songContent, explanation }) => {
        expect(() => verifyStructure(songContent)).toThrowErrorMatchingSnapshot(
          explanation,
        );
      },
    );

    it.each`
      songContent                               | explanation
      ${createSongMock(['v1', 'v3'])}           | ${"Supported v's chars in the bad order."}
      ${createSongMock(['v1', 'v2', 'v6'])}     | ${"Supported v's chars in the bad order."}
      ${createSongMock(['v3', 'v9', 'v12'])}    | ${"Supported v's chars in the bad order."}
      ${createSongMock(['c', 'c2', 'c4'])}      | ${"Supported c's chars in the bad order."}
      ${createSongMock(['b', 'b2', 'b4'])}      | ${"Supported b's chars in the bad order."}
      ${createSongMock(['p', 'p2', 'p4'])}      | ${"Supported p's chars in the bad order."}
      ${createSongMock(['v1.1', 'v1.3'])}       | ${'Wrong sub section order (missing v1.2).'}
      ${createSongMock(['v1.1', 'v2.1'])}       | ${'Wrong sub section order (not required to have v1.1).'}
      ${createSongMock(['v1.1', 'v1.2', 'v3'])} | ${'Wrong sub section order (missing v2).'}
      ${createSongMock(['v1', 'v1.2'])}         | ${'Wrong sub section order (v1 and v1.2 together do not make sense).'}
      ${createSongMock(['c1.1', 'c1.3'])}       | ${'Wrong sub section order (missing c1.2).'}
      ${createSongMock(['c1.1', 'c2.1'])}       | ${'Wrong sub section order (not required to have c1.1).'}
      ${createSongMock(['c1.1', 'c1.2', 'c3'])} | ${'Wrong sub section order (missing c2).'}
      ${createSongMock(['c1', 'c1.2'])}         | ${'Wrong sub section order (c1 and c1.2 together do not make sense).'}
      ${createSongMock(['p1.1', 'p1.3'])}       | ${'Wrong sub section order (missing p1.2).'}
      ${createSongMock(['p1.1', 'p2.1'])}       | ${'Wrong sub section order (not required to have p1.1).'}
      ${createSongMock(['p1.1', 'p1.2', 'p3'])} | ${'Wrong sub section order (missing p2).'}
      ${createSongMock(['p1', 'p1.2'])}         | ${'Wrong sub section order (p1 and p1.2 together do not make sense).'}
      ${createSongMock(['b1.1', 'b1.3'])}       | ${'Wrong sub section order (missing b1.2).'}
      ${createSongMock(['b1.1', 'b2.1'])}       | ${'Wrong sub section order (not required to have b1.1).'}
      ${createSongMock(['b1.1', 'b1.2', 'b3'])} | ${'Wrong sub section order (missing b2).'}
      ${createSongMock(['b1', 'b1.2'])}         | ${'Wrong sub section order (b1 and b1.2 together do not make sense).'}
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
