import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SIMPLE_SONG_WO_ID__MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { ALLOWED_CHARS, EMPTY_STRING } from './constants.js';
import { createAdvancedSongMock } from './core.js';
import { parse } from './songParser.js';

jest.mock('short-uuid', () => ({
  generate: () => 'ANY_id',
}));

describe('Song parser', () => {
  describe('Well structured', () => {
    it('should parse a song (w/o subsections) correctly', () => {
      expect(parse(SIMPLE_SONG_MOCK_FILE_CONTENT)).toMatchInlineSnapshot(`
{
  "alternative": "alternative 1; alternative 2",
  "arranger": "arranger 1; arranger 2",
  "band": "band 1; band 2",
  "composer": "composer 1; composer 2",
  "contentHash": "0173a1",
  "genre": "genre 1; genre 2",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "interpreter": "interpreter 1; interpreter 2",
  "key": "*",
  "rcId": "*",
  "sectionOrder": [
    "[v1]",
    "[v2]",
    "[v3]",
    "[p]",
    "[p2]",
    "[p3]",
    "[c]",
    "[c2]",
    "[c3]",
    "[b]",
    "[b2]",
    "[b3]",
  ],
  "sectionsMap": {
    "[b2]": {
      "content": "Row for b2",
      "sectionIdentifier": "[b2]",
      "sectionSequenceType": "b",
    },
    "[b3]": {
      "content": "Row for b3",
      "sectionIdentifier": "[b3]",
      "sectionSequenceType": "b",
    },
    "[b]": {
      "content": "Row for b",
      "sectionIdentifier": "[b]",
      "sectionSequenceType": "b",
    },
    "[c2]": {
      "content": "Row for c2",
      "sectionIdentifier": "[c2]",
      "sectionSequenceType": "c",
    },
    "[c3]": {
      "content": "Row for c3",
      "sectionIdentifier": "[c3]",
      "sectionSequenceType": "c",
    },
    "[c]": {
      "content": "Row for c",
      "sectionIdentifier": "[c]",
      "sectionSequenceType": "c",
    },
    "[p2]": {
      "content": "Row for p2",
      "sectionIdentifier": "[p2]",
      "sectionSequenceType": "p",
    },
    "[p3]": {
      "content": "Row for p3",
      "sectionIdentifier": "[p3]",
      "sectionSequenceType": "p",
    },
    "[p]": {
      "content": "Row for p",
      "sectionIdentifier": "[p]",
      "sectionSequenceType": "p",
    },
    "[sequence]": {
      "content": "v1,v2,v3,p,p2,p3,c,c2,c3,b,b2,b3",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "Row for v1",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
    "[v2]": {
      "content": "Row for v2",
      "sectionIdentifier": "[v2]",
      "sectionSequenceType": "v",
    },
    "[v3]": {
      "content": "Row for v3",
      "sectionIdentifier": "[v3]",
      "sectionSequenceType": "v",
    },
  },
  "sequence": [
    "v1",
    "v2",
    "v3",
    "p",
    "p2",
    "p3",
    "c",
    "c2",
    "c3",
    "b",
    "b2",
    "b3",
  ],
  "tags": "tags 1; tags 2",
  "tempo": "*",
  "title": "My main title",
  "version": "ii",
  "writer": "writer 1; writer 2",
}
`);
    });

    it('should parse a song (w/o correct ID) correctly', () => {
      expect(parse(SIMPLE_SONG_WO_ID__MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
{
  "alternative": "alternative 1; alternative 2",
  "arranger": "arranger 1; arranger 2",
  "band": "band 1; band 2",
  "composer": "composer 1; composer 2",
  "contentHash": "0173a1",
  "genre": "genre 1; genre 2",
  "id": "ANY_id",
  "interpreter": "interpreter 1; interpreter 2",
  "key": "*",
  "rcId": "*",
  "sectionOrder": [
    "[v1]",
    "[v2]",
    "[v3]",
    "[p]",
    "[p2]",
    "[p3]",
    "[c]",
    "[c2]",
    "[c3]",
    "[b]",
    "[b2]",
    "[b3]",
  ],
  "sectionsMap": {
    "[b2]": {
      "content": "Row for b2",
      "sectionIdentifier": "[b2]",
      "sectionSequenceType": "b",
    },
    "[b3]": {
      "content": "Row for b3",
      "sectionIdentifier": "[b3]",
      "sectionSequenceType": "b",
    },
    "[b]": {
      "content": "Row for b",
      "sectionIdentifier": "[b]",
      "sectionSequenceType": "b",
    },
    "[c2]": {
      "content": "Row for c2",
      "sectionIdentifier": "[c2]",
      "sectionSequenceType": "c",
    },
    "[c3]": {
      "content": "Row for c3",
      "sectionIdentifier": "[c3]",
      "sectionSequenceType": "c",
    },
    "[c]": {
      "content": "Row for c",
      "sectionIdentifier": "[c]",
      "sectionSequenceType": "c",
    },
    "[p2]": {
      "content": "Row for p2",
      "sectionIdentifier": "[p2]",
      "sectionSequenceType": "p",
    },
    "[p3]": {
      "content": "Row for p3",
      "sectionIdentifier": "[p3]",
      "sectionSequenceType": "p",
    },
    "[p]": {
      "content": "Row for p",
      "sectionIdentifier": "[p]",
      "sectionSequenceType": "p",
    },
    "[sequence]": {
      "content": "v1,v2,v3,p,p2,p3,c,c2,c3,b,b2,b3",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {*}, contentHash: {655954}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "Row for v1",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
    "[v2]": {
      "content": "Row for v2",
      "sectionIdentifier": "[v2]",
      "sectionSequenceType": "v",
    },
    "[v3]": {
      "content": "Row for v3",
      "sectionIdentifier": "[v3]",
      "sectionSequenceType": "v",
    },
  },
  "sequence": [
    "v1",
    "v2",
    "v3",
    "p",
    "p2",
    "p3",
    "c",
    "c2",
    "c3",
    "b",
    "b2",
    "b3",
  ],
  "tags": "tags 1; tags 2",
  "tempo": "*",
  "title": "My main title",
  "version": "ii",
  "writer": "writer 1; writer 2",
}
`);
    });

    it('should parse a song (w/ subsections) correctly', () => {
      expect(parse(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
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
      "sectionSequenceType": "c",
    },
    "[c1.2]": {
      "content": "Să cunoască fiecare
Că Tu ești în adunare
Și-nsoțești a Ta lucrare
Cu puteri prin Duhul Sfânt! :/",
      "sectionIdentifier": "[c1.2]",
      "sectionSequenceType": "c",
    },
    "[sequence]": {
      "content": "v1.1,v1.2,c1.1,c1.2,v2.1,v2.2,c1.1,c1.2",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1.1]": {
      "content": "Aici să fie casa Celui veșnic Sfânt,
Aici s-aducem laudă și-nchinare,
Acelui care este veșnic viu și Sfânt
Și merită doar cinste și onoare!",
      "sectionIdentifier": "[v1.1]",
      "sectionSequenceType": "v",
    },
    "[v1.2]": {
      "content": "Aici să fie casa unde frații mei
Cădea-vor în genunchi în fața Ta,
Cu mâinile întinse către ceruri, ei
Un legământ cu Tine vor avea!",
      "sectionIdentifier": "[v1.2]",
      "sectionSequenceType": "v",
    },
    "[v2.1]": {
      "content": "Aici să fie casa unde ochii Tăi,
Zi și noapte, zilnic, vor privi,
Aici să fie casa unde frații mei
Cu rugăciuni, cu laude, vor veni!",
      "sectionIdentifier": "[v2.1]",
      "sectionSequenceType": "v",
    },
    "[v2.2]": {
      "content": "Atunci când va veni aici străinul,
Din pricina Numelui Tău Sfânt,
Să fie ascultat, să-i dai alinul,
Că Tu ești Dumnezeu și Tu ești Sfânt!",
      "sectionIdentifier": "[v2.2]",
      "sectionSequenceType": "v",
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
    });

    it('should parse a song (w/ subsections) by un-split them correctly (when option is set)', () => {
      expect(
        parse(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT, {
          rejoinSubsections: true,
        }),
      ).toMatchInlineSnapshot(`
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
    "[v1]",
    "[c1]",
    "[v2]",
  ],
  "sectionsMap": {
    "[c1]": {
      "content": "/: Din cântare în cântare,
Să se-aprindă-n adunare
Jertfa laudei de-nchinare
Ca pe muntele cel Sfânt!
Să cunoască fiecare
Că Tu ești în adunare
Și-nsoțești a Ta lucrare
Cu puteri prin Duhul Sfânt! :/",
      "sectionIdentifier": "[c1]",
      "sectionSequenceType": "c",
    },
    "[sequence]": {
      "content": "v1.1,v1.2,c1.1,c1.2,v2.1,v2.2,c1.1,c1.2",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "Aici să fie casa Celui veșnic Sfânt,
Aici s-aducem laudă și-nchinare,
Acelui care este veșnic viu și Sfânt
Și merită doar cinste și onoare!
Aici să fie casa unde frații mei
Cădea-vor în genunchi în fața Ta,
Cu mâinile întinse către ceruri, ei
Un legământ cu Tine vor avea!",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
    "[v2]": {
      "content": "Aici să fie casa unde ochii Tăi,
Zi și noapte, zilnic, vor privi,
Aici să fie casa unde frații mei
Cu rugăciuni, cu laude, vor veni!
Atunci când va veni aici străinul,
Din pricina Numelui Tău Sfânt,
Să fie ascultat, să-i dai alinul,
Că Tu ești Dumnezeu și Tu ești Sfânt!",
      "sectionIdentifier": "[v2]",
      "sectionSequenceType": "v",
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
    });
  });

  describe('Mismatching content', () => {
    it('should throw if certain sections are missing', () => {
      expect(parse(SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "arranger": "*",
  "band": "*",
  "composer": "Betania Dublin",
  "contentHash": "529fb9",
  "genre": "*",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "interpreter": "*",
  "key": "*",
  "rcId": "*",
  "sectionOrder": [
    "[v1]",
  ],
  "sectionsMap": {
    "[sequence]": {
      "content": "v1,c",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "Row 1",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
  },
  "sequence": [
    "v1",
    "c",
  ],
  "tags": "*",
  "tempo": "*",
  "title": "My custom title",
  "version": "ii",
  "writer": "*",
}
`);
    });

    it('should not throw if the issue can be fixed via this plugin (e.g. mismatching sequence)', () => {
      expect(parse(SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT))
        .toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "arranger": "*",
  "band": "*",
  "composer": "Betania Dublin",
  "contentHash": "302cb7",
  "genre": "*",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "interpreter": "*",
  "key": "*",
  "rcId": "*",
  "sectionOrder": [
    "[v1]",
    "[v2]",
    "[v3]",
    "[p]",
    "[p2]",
    "[p3]",
    "[c]",
    "[c2]",
    "[c3]",
    "[b]",
    "[b2]",
    "[b3]",
  ],
  "sectionsMap": {
    "[b2]": {
      "content": "Row for b2",
      "sectionIdentifier": "[b2]",
      "sectionSequenceType": "b",
    },
    "[b3]": {
      "content": "Row for b3",
      "sectionIdentifier": "[b3]",
      "sectionSequenceType": "b",
    },
    "[b]": {
      "content": "Row for b",
      "sectionIdentifier": "[b]",
      "sectionSequenceType": "b",
    },
    "[c2]": {
      "content": "Row for c2",
      "sectionIdentifier": "[c2]",
      "sectionSequenceType": "c",
    },
    "[c3]": {
      "content": "Row for c3",
      "sectionIdentifier": "[c3]",
      "sectionSequenceType": "c",
    },
    "[c]": {
      "content": "Row for c",
      "sectionIdentifier": "[c]",
      "sectionSequenceType": "c",
    },
    "[p2]": {
      "content": "Row for p2",
      "sectionIdentifier": "[p2]",
      "sectionSequenceType": "p",
    },
    "[p3]": {
      "content": "Row for p3",
      "sectionIdentifier": "[p3]",
      "sectionSequenceType": "p",
    },
    "[p]": {
      "content": "Row for p",
      "sectionIdentifier": "[p]",
      "sectionSequenceType": "p",
    },
    "[sequence]": {
      "content": "v1",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "Row for v1",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
    "[v2]": {
      "content": "Row for v2",
      "sectionIdentifier": "[v2]",
      "sectionSequenceType": "v",
    },
    "[v3]": {
      "content": "Row for v3",
      "sectionIdentifier": "[v3]",
      "sectionSequenceType": "v",
    },
  },
  "sequence": [
    "v1",
  ],
  "tags": "*",
  "tempo": "*",
  "title": "My custom title",
  "version": "ii",
  "writer": "*",
}
`);
    });
  });

  describe('Not-parsable', () => {
    it('should throw if is not parsable', () => {
      expect(parse(EMPTY_STRING)).toMatchInlineSnapshot(`
{
  "alternative": "",
  "composer": "",
  "contentHash": "",
  "id": "",
  "rcId": "",
  "sectionOrder": [],
  "sectionsMap": {},
  "sequence": [],
  "title": "",
  "version": "",
}
`);
    });
  });

  describe('All the allowed chars', () => {
    it('should throw if is not parsable', () => {
      expect(parse(EMPTY_STRING)).toMatchInlineSnapshot(`
{
  "alternative": "",
  "composer": "",
  "contentHash": "",
  "id": "",
  "rcId": "",
  "sectionOrder": [],
  "sectionsMap": {},
  "sequence": [],
  "title": "",
  "version": "",
}
`);
    });
  });

  describe('Chars', () => {
    it('should correctly allow the chars', () => {
      expect(
        parse(
          createAdvancedSongMock([['v1', ALLOWED_CHARS.join(EMPTY_STRING)]]),
        ),
      ).toMatchInlineSnapshot(`
{
  "alternative": "*",
  "arranger": "ANY_arranger",
  "band": "ANY_band",
  "composer": "ANY_composer",
  "contentHash": "4cf5d1",
  "genre": "ANY_genre",
  "id": "ANY_id",
  "interpreter": "ANY_interpreter",
  "key": "ANY_key",
  "rcId": "ANY_rcId",
  "sectionOrder": [
    "[v1]",
  ],
  "sectionsMap": {
    "[sequence]": {
      "content": "v1",
      "sectionIdentifier": "[sequence]",
      "sectionSequenceType": "s",
    },
    "[title]": {
      "content": "My custom title: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}",
      "sectionIdentifier": "[title]",
      "sectionSequenceType": "",
    },
    "[v1]": {
      "content": "*_{}&!()][\\,-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZYQabcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț‘’”„",
      "sectionIdentifier": "[v1]",
      "sectionSequenceType": "v",
    },
  },
  "sequence": [
    "v1",
  ],
  "tags": "ANY_tags",
  "tempo": "ANY_tempo",
  "title": "My custom title:",
  "version": "ANY_version",
  "writer": "ANY_writer",
}
`);
    });
  });
});
