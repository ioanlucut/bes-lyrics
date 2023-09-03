import { parse } from './songParser.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT,
  SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';
import { EMPTY_STRING } from './constants.js';

describe('Song parser', () => {
  describe('Well structured', () => {
    it('should parse a song (w/o subsections) correctly', () => {
      expect(parse(SIMPLE_SONG_MOCK_FILE_CONTENT)).toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "author": "Betania Dublin",
  "contentHash": "655954",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "rcId": "__R__",
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
    },
    "[b3]": {
      "content": "Row for b3",
      "sectionIdentifier": "[b3]",
    },
    "[b]": {
      "content": "Row for b",
      "sectionIdentifier": "[b]",
    },
    "[c2]": {
      "content": "Row for c2",
      "sectionIdentifier": "[c2]",
    },
    "[c3]": {
      "content": "Row for c3",
      "sectionIdentifier": "[c3]",
    },
    "[c]": {
      "content": "Row for c",
      "sectionIdentifier": "[c]",
    },
    "[p2]": {
      "content": "Row for p2",
      "sectionIdentifier": "[p2]",
    },
    "[p3]": {
      "content": "Row for p3",
      "sectionIdentifier": "[p3]",
    },
    "[p]": {
      "content": "Row for p",
      "sectionIdentifier": "[p]",
    },
    "[sequence]": {
      "content": "v1,v2,v3,p,p2,p3,c,c2,c3,b,b2,b3",
      "sectionIdentifier": "[sequence]",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, author: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
    },
    "[v1]": {
      "content": "Row for v1",
      "sectionIdentifier": "[v1]",
    },
    "[v2]": {
      "content": "Row for v2",
      "sectionIdentifier": "[v2]",
    },
    "[v3]": {
      "content": "Row for v3",
      "sectionIdentifier": "[v3]",
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
  "title": "My custom title",
  "version": "ii",
}
`);
    });

    it('should parse a song (w/ subsections) correctly', () => {
      expect(parse(SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT)).
toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "author": "Betania Dublin",
  "contentHash": "085aa8",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "rcId": "__R__",
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
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, author: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
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
  "title": "My custom title",
  "version": "ii",
}
`);
    });
  });

  describe('Mismatching content', () => {
    it('should throw if certain sections are missing', () => {
      expect(parse(SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT)).
toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "author": "Betania Dublin",
  "contentHash": "529fb9",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "rcId": "__R__",
  "sectionOrder": [
    "[v1]",
  ],
  "sectionsMap": {
    "[sequence]": {
      "content": "v1,c",
      "sectionIdentifier": "[sequence]",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, author: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
    },
    "[v1]": {
      "content": "Row 1",
      "sectionIdentifier": "[v1]",
    },
  },
  "sequence": [
    "v1",
    "c",
  ],
  "title": "My custom title",
  "version": "ii",
}
`);
    });

    it('should not throw if the issue can be fixed via this plugin (e.g. mismatching sequence)', () => {
      expect(parse(SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT)).
toMatchInlineSnapshot(`
{
  "alternative": "Când eram fără speranță",
  "author": "Betania Dublin",
  "contentHash": "302cb7",
  "id": "7RURbpko41pWYEgVkHD4Pq",
  "rcId": "__R__",
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
    },
    "[b3]": {
      "content": "Row for b3",
      "sectionIdentifier": "[b3]",
    },
    "[b]": {
      "content": "Row for b",
      "sectionIdentifier": "[b]",
    },
    "[c2]": {
      "content": "Row for c2",
      "sectionIdentifier": "[c2]",
    },
    "[c3]": {
      "content": "Row for c3",
      "sectionIdentifier": "[c3]",
    },
    "[c]": {
      "content": "Row for c",
      "sectionIdentifier": "[c]",
    },
    "[p2]": {
      "content": "Row for p2",
      "sectionIdentifier": "[p2]",
    },
    "[p3]": {
      "content": "Row for p3",
      "sectionIdentifier": "[p3]",
    },
    "[p]": {
      "content": "Row for p",
      "sectionIdentifier": "[p]",
    },
    "[sequence]": {
      "content": "v1",
      "sectionIdentifier": "[sequence]",
    },
    "[title]": {
      "content": "My custom title {version: {ii}, alternative: {Când eram fără speranță}, author: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}",
      "sectionIdentifier": "[title]",
    },
    "[v1]": {
      "content": "Row for v1",
      "sectionIdentifier": "[v1]",
    },
    "[v2]": {
      "content": "Row for v2",
      "sectionIdentifier": "[v2]",
    },
    "[v3]": {
      "content": "Row for v3",
      "sectionIdentifier": "[v3]",
    },
  },
  "sequence": [
    "v1",
  ],
  "title": "My custom title",
  "version": "ii",
}
`);
    });
  });

  describe('Not-parsable', () => {
    it('should throw if is not parsable', () => {
      expect(parse(EMPTY_STRING)).toMatchInlineSnapshot(`
{
  "alternative": "",
  "author": "",
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
});
