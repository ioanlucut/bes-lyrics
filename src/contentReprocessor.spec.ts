import { reprocess } from './contentReprocessor.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';

describe('contentReprocessor', () => {
  it('should correctly rewrite certain text', () => {
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

  it('should convert from the old format correctly', () => {
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

  it('should not do anything for a simple correct song w/o sub sections', () => {
    expect(reprocess(SIMPLE_SONG_MOCK_FILE_CONTENT)).toMatchInlineSnapshot(`
      "[title]
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
      "
    `);
  });

  it('should not do anything for a correct song w/ sub sections', () => {
    expect(reprocess(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT))
      .toMatchInlineSnapshot(`
      "[title]
      Any title

      [sequence]
      v1.1,v1.2,c1.1,c1.2,v2.1,v2.2,c1.1,c1.2

      [v1.1]
      Aici să fie casa Celui veșnic Sfânt,
      Aici s-aducem laudă și-nchinare,
      Acelui care este veșnic viu și Sfânt
      Și merită doar cinste și onoare!

      [v1.2]
      Aici să fie casa unde frații mei
      Cădea-vor în genunchi în fața Ta,
      Cu mâinile întinse către ceruri, ei
      Un legământ cu Tine vor avea!

      [c1.1]
      /: Din cântare în cântare,
      Să se-aprindă-n adunare
      Jertfa laudei de-nchinare
      Ca pe muntele cel Sfânt!

      [c1.2]
      Să cunoască fiecare
      Că Tu ești în adunare
      Și-nsoțești a Ta lucrare
      Cu puteri prin Duhul Sfânt! :/

      [v2.1]
      Aici să fie casa unde ochii Tăi,
      Zi și noapte, zilnic, vor privi,
      Aici să fie casa unde frații mei
      Cu rugăciuni, cu laude, vor veni!

      [v2.2]
      Atunci când va veni aici străinul,
      Din pricina Numelui Tău Sfânt,
      Să fie ascultat, să-i dai alinul,
      Că Tu ești Dumnezeu și Tu ești Sfânt!
      "
    `);
  });

  it('should correctly add a hash version (when there is none)', () => {
    expect(
      reprocess(`[title]
My custom title

[sequence]
v1

[v1]
Row for v1`),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      v1

      [v1]
      Row for v1"
    `);
  });
});
