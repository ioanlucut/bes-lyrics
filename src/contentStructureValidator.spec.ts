import { verifyStructure } from './contentStructureValidator';

const SIMPLE_SONG = `[title]
My custom title

[sequence]
v1,v2,v3,p,p2,p3,c,c2,c3,b,b2,b3

[v1]
Row for v1 

[v2]
Row for v2 

[v3]
Row for v3 

[p]
Row for p 

[p2]
Row for p2 

[p3]
Row for p3 

[c]
Row for c 

[c2]
Row for c2 

[c3]
Row for c3 

[b]
Row for b 

[b2]
Row for b2 

[b3]
Row for b3 

`;

const SONG_WITH_MISMATCHING_SEQUENCE = `[title]
My custom title

[sequence]
v1

[v1]
Row for v1 

[v2]
Row for v2 

[v3]
Row for v3 

[p]
Row for p 

[p2]
Row for p2 

[p3]
Row for p3 

[c]
Row for c 

[c2]
Row for c2 

[c3]
Row for c3 

[b]
Row for b 

[b2]
Row for b2 

[b3]
Row for b3 
`;

const SONG_WITH_MISMATCHING_SECTIONS = `[title]
My custom title

[sequence]
v1,c

[v1]
Row 1`;

describe('contentStructureValidator', () => {
  it('should reject missing title', () => {
    expect(() =>
      verifyStructure(`
My custom title

[sequence]
1,c

[v1]
Row 1`),
    ).toThrowErrorMatchingInlineSnapshot(`"[title] is missing."`);
  });

  it('should reject missing sequence', () => {
    expect(() =>
      verifyStructure(`[title]
My custom title

[v1]
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
      `"The [31m[v2],[v3],[p],[p2],[p3],[c],[c2],[c3],[b],[b2],[b3][39m tags are present in the content but not in the sequence."`,
    );
  });

  it('should throw if the sections defined in the sequence are not defined', () => {
    expect(() =>
      verifyStructure(SONG_WITH_MISMATCHING_SECTIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The [31m[c][39m is defined in the sequence but missing as a [31m[c][39m section."`,
    );
  });
});
