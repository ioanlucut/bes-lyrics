import { reprocess } from './contentStructureReprocessor.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { createAdvancedSongMock, createSongMock } from './core.js';
import { DOUBLE_LINE_TUPLE } from './constants.js';

describe('contentStructureReprocessor', () => {
  it('should not adjust an already well structured song (w/o subsections)', () => {
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
      Row for b3"
    `);
  });

  it('should not adjust an already well structured song (w/ subsections)', () => {
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
      Că Tu ești Dumnezeu și Tu ești Sfânt!"
    `);
  });

  it('should correctly add the sub sections of a song (for verse)', () => {
    expect(
      reprocess(
        createAdvancedSongMock([
          ['v1', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

          ['v2', 'Section 2'],
          ['v3', 'Section 3'],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      v1.1,v1.2,v2,v3

      [v1.1]
      Subsection 1.1

      [v1.2]
      Subsection 1.2

      [v2]
      Section 2

      [v3]
      Section 3"
    `);
  });

  it('should correctly add the sub sections of a song (for bridge)', () => {
    expect(
      reprocess(
        createAdvancedSongMock([
          ['b', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

          ['b2', 'Section 2'],
          ['b3', 'Section 3'],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      b1.1,b1.2,b2,b3

      [b1.1]
      Subsection 1.1

      [b1.2]
      Subsection 1.2

      [b2]
      Section 2

      [b3]
      Section 3"
    `);
  });

  it('should correctly add the sub sections of a song (for chorus)', () => {
    expect(
      reprocess(
        createAdvancedSongMock([
          ['c', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

          ['c2', 'Section 2'],
          ['c3', 'Section 3'],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      c1.1,c1.2,c2,c3

      [c1.1]
      Subsection 1.1

      [c1.2]
      Subsection 1.2

      [c2]
      Section 2

      [c3]
      Section 3"
    `);
  });

  it('should correctly add the sub sections of a song (for prechorus)', () => {
    expect(
      reprocess(
        createAdvancedSongMock([
          ['p', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

          ['p2', 'Section 2'],
          ['p3', 'Section 3'],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      p1.1,p1.2,p2,p3

      [p1.1]
      Subsection 1.1

      [p1.2]
      Subsection 1.2

      [p2]
      Section 2

      [p3]
      Section 3"
    `);
  });

  it('should correctly not add the sub sections of a song (for ending)', () => {
    expect(
      reprocess(
        createAdvancedSongMock([
          ['e', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],
        ]),
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      My custom title

      [sequence]
      e1.1,e1.2

      [e1.1]
      Subsection 1.1

      [e1.2]
      Subsection 1.2"
    `);
  });

  it('should correctly add only the unique sections of a song', () => {
    expect(() =>
      reprocess(createSongMock(['v1', 'c', 'v2', 'c'])),
    ).toThrowErrorMatchingInlineSnapshot(`"There are duplicates: [c]"`);
  });
});
