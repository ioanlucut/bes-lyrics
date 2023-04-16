import { verifyStructure } from './contentStructureValidator';

const SIMPLE_SONG = `[title]
My custom title

[sequence]
1,2,3,4,c,t,b,w,e,p,q,c,3,c

[1]
Row 1
Row 2

[2]
Row 3
Row 4

[3]
Row 5
Row 6

[4]
Row 7
Row 8

[bridge]
Row bridge 1
Row bridge 2

[bridge 2]
Row bridge 1
Row bridge 2

[chorus]
Row chorus 1
Row chorus 2

[chorus 2]
Row chorus 1
Row chorus 2

[ending]
Row ending 1
Row ending 2

[prechorus]
Row prechorus 1
Row prechorus 2

[prechorus 2]
Row prechorus 1
Row prechorus 2

[title]
Row title 1
Row title 2

[sequence]
Row sequence 1
Row sequence 2`;

const SONG_WITH_MISMATCHING_SEQUENCE = `[title]
My custom title

[sequence]
1,c,2,c,3,c,4,c

[1]
Row 1

[2]
Row 3

[3]
Row 5

[4]
Row 7

[bridge]
Row bridge 1

[bridge 2]
Row bridge 1

[chorus]
Row chorus 1

[chorus 2]
Row chorus 1

[ending]
Row ending 1

[prechorus]
Row prechorus 1

[prechorus 2]
Row prechorus 1

[title]
Row title 1

[sequence]
Row sequence 2`;

const SONG_WITH_MISMATCHING_SECTIONS = `[title]
My custom title

[sequence]
1,c

[1]
Row 1`;

describe('contentStructureValidator', () => {
  it('should reject missing title', () => {
    expect(() =>
      verifyStructure(`
My custom title

[sequence]
1,c

[1]
Row 1`),
    ).toThrowErrorMatchingInlineSnapshot(`"[title] is missing."`);
  });

  it('should reject missing sequence', () => {
    expect(() =>
      verifyStructure(`[title]
My custom title

[1]
Row 1`),
    ).toThrowErrorMatchingInlineSnapshot(`"[sequence] is missing."`);
  });

  it('should not throw for a correct song', () => {
    expect(() => verifyStructure(SIMPLE_SONG)).not.toThrow();
  });

  it('should throw if the sequence does not contain all the sections', () => {
    expect(() =>
      verifyStructure(SONG_WITH_MISMATCHING_SEQUENCE),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The following are present in the content but not in the sequence: [bridge],[bridge 2],[chorus 2],[ending],[prechorus],[prechorus 2]"`,
    );
  });

  it('should throw if the sections defined in the sequence are not defined', () => {
    expect(() =>
      verifyStructure(SONG_WITH_MISMATCHING_SECTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The [chorus] is defined in the sequence but missing as a section.."`,
    );
  });
});
