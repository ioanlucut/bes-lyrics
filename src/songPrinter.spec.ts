import { print } from './songPrinter.js';
import { parse } from './songParser.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_SPLIT_MOCK_FILE_CONTENT,
  SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_UN_SPLIT_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { createAdvancedSongMock } from './core.js';
import { DOUBLE_LINE_TUPLE } from './constants.js';

describe('songPrinter', () => {
  it('should not adjust an already well structured song (w/o subsections)', () => {
    expect(print(parse(SIMPLE_SONG_MOCK_FILE_CONTENT))).toMatchInlineSnapshot(`
"[title]
My custom title {alternative: {Când eram fără speranță}, composer: {Betania Dublin}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {ii}, genre: {*}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}

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

  it('should not adjust an already well structured song (w/ subsections)', () => {
    const parsedSong = parse(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT);

    expect(parsedSong).toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "arranger": "*",
  "band": "*",
  "composer": "Betania Dublin",
  "contentHash": "085aa8",
  "genre": "*",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "interpreter": "*",
  "key": "*",
  "rcId": "*",
  "sectionOrder": [
    "[v1.1]",
    "[v1.2]",
    "[c1.1]",
    "[c1.2]",
    "[v2.1]",
    "[v2.2]",
  ],
  "sectionsMap": {
    "[c1.1]": {
      "content": "/: Din cântare în cântare,
Să se-aprindă-n adunare
Jertfa laudei de-nchinare
Ca pe muntele cel Sfânt!",
      "sectionIdentifier": "[c1.1]",
    },
    "[c1.2]": {
      "content": "Să cunoască fiecare
Că Tu ești în adunare
Și-nsoțești a Ta lucrare
Cu puteri prin Duhul Sfânt! :/",
      "sectionIdentifier": "[c1.2]",
    },
    "[sequence]": {
      "content": "v1.1,v1.2,c1.1,c1.2,v2.1,v2.2,c1.1,c1.2",
      "sectionIdentifier": "[sequence]",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
    },
    "[v1.1]": {
      "content": "Aici să fie casa Celui veșnic Sfânt,
Aici s-aducem laudă și-nchinare,
Acelui care este veșnic viu și Sfânt
Și merită doar cinste și onoare!",
      "sectionIdentifier": "[v1.1]",
    },
    "[v1.2]": {
      "content": "Aici să fie casa unde frații mei
Cădea-vor în genunchi în fața Ta,
Cu mâinile întinse către ceruri, ei
Un legământ cu Tine vor avea!",
      "sectionIdentifier": "[v1.2]",
    },
    "[v2.1]": {
      "content": "Aici să fie casa unde ochii Tăi,
Zi și noapte, zilnic, vor privi,
Aici să fie casa unde frații mei
Cu rugăciuni, cu laude, vor veni!",
      "sectionIdentifier": "[v2.1]",
    },
    "[v2.2]": {
      "content": "Atunci când va veni aici străinul,
Din pricina Numelui Tău Sfânt,
Să fie ascultat, să-i dai alinul,
Că Tu ești Dumnezeu și Tu ești Sfânt!",
      "sectionIdentifier": "[v2.2]",
    },
  },
  "sequence": [
    "v1.1",
    "v1.2",
    "c1.1",
    "c1.2",
    "v2.1",
    "v2.2",
    "c1.1",
    "c1.2",
  ],
  "tags": "*",
  "tempo": "*",
  "title": "My custom title",
  "version": "ii",
  "writer": "*",
}
`);

    expect(print(parsedSong)).toMatchInlineSnapshot(`
"[title]
My custom title {alternative: {Când eram fără speranță}, composer: {Betania Dublin}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {ii}, genre: {*}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {085aa8}}

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

  it('should correctly add the sub sections of a song (for verse)', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock([
            [
              'v1',
              ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE),
            ],

            ['v2', 'Section 2'],
            ['v3', 'Section 3'],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {d046df}}

[sequence]
v1.1,v1.2,v2,v3

[v1.1]
Subsection 1.1

[v1.2]
Subsection 1.2

[v2]
Section 2

[v3]
Section 3
"
`);
  });

  it('should correctly split a song with split makers', () => {
    expect(
      print(
        parse(SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_SPLIT_MOCK_FILE_CONTENT),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title {alternative: {Când eram fără speranță}, composer: {Betania Dublin}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {ii}, genre: {*}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {048898}}

[sequence]
c,v1.1,v1.2,c,v2

[c]
/: Zidurile ’nalte de la Ierihon,
Ierihon, Ierihon,
Zidurile ’nalte de la Ierihon
Nu se vor zidi din nou. :/

[v1.1]
În cetatea Ierihon trăia
Un popor care nu se temea

[v1.2]
De Domnul și a trebuit
Să fie nimicit.

[v2]
Israel nu s-a luptat,
Într-un glas cu toții au strigat.
În Dumnezeu ei s-au încrezut
Și zidurile-au căzut.
"
`);
  });

  it('should correctly un-split a song with un-split makers', () => {
    expect(
      print(
        parse(SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_UN_SPLIT_MOCK_FILE_CONTENT),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title {alternative: {Când eram fără speranță}, composer: {Betania Dublin}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {ii}, genre: {*}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {051e3c}}

[sequence]
c,v1,c,v2

[c]
/: Chorus content :/

[v1]
Verse 1.1 to be joined row 1
Verse 1.1 to be joined row 2

[v2]
Verse 2 row 1
Verse 2 row 2
"
`);
  });

  it('should correctly add the sub sections of a song by updating the non-unique occurrences in the song sequence', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock(
            [
              [
                'v1',
                ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE),
              ],

              ['c', 'Chorus'],
              ['v2', 'Section 3'],
            ],

            ['v1', 'c', 'v2', 'v1', 'c'],
          ),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {fc7723}}

[sequence]
v1.1,v1.2,c,v2,v1.1,v1.2,c

[v1.1]
Subsection 1.1

[v1.2]
Subsection 1.2

[c]
Chorus

[v2]
Section 3
"
`);
  });

  it('should correctly add the sub sections of a song (for bridge)', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock([
            ['b', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

            ['b2', 'Section 2'],
            ['b3', 'Section 3'],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {734aa4}}

[sequence]
b1.1,b1.2,b2,b3

[b1.1]
Subsection 1.1

[b1.2]
Subsection 1.2

[b2]
Section 2

[b3]
Section 3
"
`);
  });

  it('should correctly add the sub sections of a song (for chorus)', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock([
            ['c', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

            ['c2', 'Section 2'],
            ['c3', 'Section 3'],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {2a9d64}}

[sequence]
c1.1,c1.2,c2,c3

[c1.1]
Subsection 1.1

[c1.2]
Subsection 1.2

[c2]
Section 2

[c3]
Section 3
"
`);
  });

  it('should correctly add the sub sections of a song (for prechorus)', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock([
            ['p', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],

            ['p2', 'Section 2'],
            ['p3', 'Section 3'],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {b0afbb}}

[sequence]
p1.1,p1.2,p2,p3

[p1.1]
Subsection 1.1

[p1.2]
Subsection 1.2

[p2]
Section 2

[p3]
Section 3
"
`);
  });

  it('should correctly not add the sub sections of a song (for ending)', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock([
            ['e', ['Subsection 1.1', 'Subsection 1.2'].join(DOUBLE_LINE_TUPLE)],
          ]),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {0c90cd}}

[sequence]
e1.1,e1.2

[e1.1]
Subsection 1.1

[e1.2]
Subsection 1.2
"
`);
  });

  it('should correctly add only the unique sections of a song', () => {
    expect(
      print(
        parse(
          createAdvancedSongMock(
            [
              ['v1', 'Verse 1'],

              ['c', 'Chorus'],
              ['v2', 'Section 3'],
            ],

            ['v1', 'c', 'v2', 'c'],
          ),
        ),
      ),
    ).toMatchInlineSnapshot(`
"[title]
My custom title: {alternative: {*}, composer: {ANY_composer}, writer: {ANY_writer}, arranger: {ANY_arranger}, interpreter: {ANY_interpreter}, band: {ANY_band}, key: {ANY_key}, tempo: {ANY_tempo}, tags: {ANY_tags}, version: {ANY_version}, genre: {ANY_genre}, rcId: {ANY_rcId}, id: {ANY_id}, contentHash: {f1b714}}

[sequence]
v1,c,v2,c

[v1]
Verse 1

[c]
Chorus

[v2]
Section 3
"
`);
  });
});
