import { reprocess } from './contentReprocessor';

describe('contentReprocessor', () => {
  it('should work correctly #1', () => {
    expect(
      reprocess(`
ş
ţ
doamne
domnul
duhul
dumnezeu
golgota
isus
isuse
mesia
…
`),
    ).toMatchInlineSnapshot(`
      "
      ș
      ț
      Doamne
      Domnul
      duhul
      Dumnezeu
      Golgota
      Isus
      Isuse
      Mesia
      ...
      "
    `);
  });

  it('should work correctly #2', () => {
    expect(
      reprocess(`
[title]
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
Row prechorus 2`),
    ).toMatchInlineSnapshot(`
      "
      [title]
      My custom title

      [sequence]
      v1,v2,v3,v4,c,c2,b,b2,e,p,p2,c,v3,c

      [v1]
      Row 1
      Row 2

      [v2]
      Row 3
      Row 4

      [v3]
      Row 5
      Row 6

      [v4]
      Row 7
      Row 8

      [b]
      Row bridge 1
      Row bridge 2

      [b2]
      Row bridge 1
      Row bridge 2

      [c]
      Row chorus 1
      Row chorus 2

      [c2]
      Row chorus 1
      Row chorus 2

      [e]
      Row ending 1
      Row ending 2

      [p]
      Row prechorus 1
      Row prechorus 2

      [p2]
      Row prechorus 1
      Row prechorus 2"
    `);
  });
});
