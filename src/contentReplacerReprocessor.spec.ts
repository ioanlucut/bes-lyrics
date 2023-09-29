import { reprocess } from './contentReplacerReprocessor.js';
import {
  SIMPLE_SONG_MOCK_FILE_CONTENT,
  SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT,
} from '../mocks/index.js';

describe('contentReplacerReprocessor', () => {
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

  it('should correctly rewrite "nici o" & friends text', () => {
    expect(
reprocess(`
Nici o
Nici un
nici o
nici un
nici una

‘Nici o
‘Nici un
‘nici o
‘nici un
‘nici una

Nici oX
Nici unX
Nici unaX
nici oX
nici unX
nici unaX
…
`)).
toMatchInlineSnapshot(`
"
Nici o
Nici un
nici o
nici un
nici una

‘Nicio
‘Niciun
‘nicio
‘niciun
‘niciuna

Nici oX
Nici unX
Nici unaX
nici oX
nici unX
nici unaX
...
"
`);
  });

  it('should correctly rewrite "Lui Majuscula"', () => {
    expect(
      reprocess(`
Lui Dumnezeu
Lui Isus
Lui Hristos
Lui Mesia

a Lui Dumnezeu
a Lui Isus
a Lui Hristos
a Lui Mesia

’Lui Isus
”Lui Isus

Lui DumnezeuX
Lui IsusX
Lui HristosX
Lui MesiaX
`),
    ).toMatchInlineSnapshot(`
"
Lui Dumnezeu
Lui Isus
Lui Hristos
Lui Mesia

a lui Dumnezeu
a lui Isus
a lui Hristos
a lui Mesia

’lui Isus
”lui Isus

Lui DumnezeuX
Lui IsusX
Lui HristosX
Lui MesiaX
"
`);
  });

  it('should not do anything for a simple correct song w/o sub sections', () => {
    expect(reprocess(SIMPLE_SONG_MOCK_FILE_CONTENT)).toMatchInlineSnapshot(`
"[title]
My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}

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
My custom title {version: {ii}, alternative: {Când eram fără speranță}, composer: {Betania Dublin}, contentHash: {cd856b}, id: {7RURbpko41pWYEgVkHD4Pq}}

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
});
