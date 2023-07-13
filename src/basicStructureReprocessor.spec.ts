import { reprocess } from './basicStructureReprocessor.js';

describe('basicStructureReprocessor', () => {
  it('should work correctly #1', () => {
    expect(
      reprocess(`[title]
Aleluia El e Domn

[sequence]
v1,2,3,4,5,6,7,8

[v1]
Aleluia, Aleluia, Aleluia
/: El e Domn :/
Aleluia, Aleluia, Aleluia
Isus Hristos e Domn.

[v2]
Ți-ai arătat puterea mare
Boldul morții L-ai înfrânt
Din mormânt ai înviat triumfător
Lanțurile le-ai zdrobit
Pe captivi ai eliberat
Prin a Ta îndurare sunt salvat

[v3]
Aleluia, Aleluia, Aleluia
/: El e Domn :/
Aleluia, Aleluia, Aleluia
Isus Hristos e Domn.
`),
    ).toMatchInlineSnapshot(`
      "[title]
      Aleluia El e Domn

      [sequence]
      v1,c

      [v1]
      Ți-ai arătat puterea mare
      Boldul morții L-ai înfrânt
      Din mormânt ai înviat triumfător
      Lanțurile le-ai zdrobit
      Pe captivi ai eliberat
      Prin a Ta îndurare sunt salvat

      [c]
      Aleluia, Aleluia, Aleluia
      /: El e Domn :/
      Aleluia, Aleluia, Aleluia
      Isus Hristos e Domn."
    `);
  });

  it('should work correctly #2', () => {
    expect(
      reprocess(`[title]
Tu mi stii viitorul

[sequence]
c,1

[v1]
/: Când eram doar un plod fără chip,
Ochii tăi ma vedeau!
În cartea ta de mult erau scrise
Zilele ce m-așteptau! :/

[c]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[v2]
/: De-aș încerca să m-ascund te Tine
Nu voi reuși, oriunde m-aș duce,
Chiar la marginea mării
Mâna Ta mă va călăuzi! :/

[c]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[v3]
/: Tu mă cunoști întru-totul, Doamne
Când stau jos sau mă ridic.
Îmi cunoști toate căile mele,
Nu pot ascunde nimic :/

[c]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[v4]
Nicicând n-ai să mă părăsești!`),
    ).toMatchInlineSnapshot(`
      "[title]
      Tu mi stii viitorul

      [sequence]
      v1,c,v2,c,v3,c,v4,c

      [v1]
      /: Când eram doar un plod fără chip,
      Ochii tăi ma vedeau!
      În cartea ta de mult erau scrise
      Zilele ce m-așteptau! :/

      [c]
      /: Tu-mi știi viitorul și ești lângă mine,
      De ce să mă îngrijorez?
      Mi-ai promis de voi sta lângă Tine
      Nicicând n-ai să mă părăsești. :/

      [v2]
      /: De-aș încerca să m-ascund te Tine
      Nu voi reuși, oriunde m-aș duce,
      Chiar la marginea mării
      Mâna Ta mă va călăuzi! :/

      [v3]
      /: Tu mă cunoști întru-totul, Doamne
      Când stau jos sau mă ridic.
      Îmi cunoști toate căile mele,
      Nu pot ascunde nimic :/

      [v4]
      Nicicând n-ai să mă părăsești!"
    `);
  });

  it('should work correctly #3', () => {
    expect(
      reprocess(`[title]
Tu n ai sub soare asemanare tu esti iubirea mea

[sequence]
1,2,3,4,5,6,7,8

[v1]
1. Tu n-ai sub soare, Asemănare,
Ești necuprins, Ești nemărginit;
Iubirea-Ți sfântă, E o splendoare,
Pe drept Isuse, Tu ești iubit.

[v2]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[v3]
2. Îți cântă marea, Îți cântă cerul,
Și mii de astre-n a lor loc;
Căci Tu ești Calea
Și-Adevărul,
Ești cel mai frumos
Din univers.

[v4]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[v5]
3. Tu ești iubirea, Neprihănirea,
Pe-a Tale buze, E-un râu de har;
Tu locuiești sus În strălucire,
Tu ești Eel mai scump mărgăritar.

[v6]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[v7]
4. Ești sprijin tare, În încercare,
Ești ușurare În ceasul greu;
În strâmtorare, Turn de scăpare,
Din veșnicii Ești Dumnezeu.

[v8]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.`),
    ).toMatchInlineSnapshot(`
      "[title]
      Tu n ai sub soare asemanare tu esti iubirea mea

      [sequence]
      v1,c,v2,c,v3,c,v4,c

      [v1]
      1. Tu n-ai sub soare, Asemănare,
      Ești necuprins, Ești nemărginit;
      Iubirea-Ți sfântă, E o splendoare,
      Pe drept Isuse, Tu ești iubit.

      [c]
      Tu ești iubirea mea,
      Tu-mi ești Comoara vieții,
      Soarele meu frumos Din zorii dimineții.

      [v2]
      2. Îți cântă marea, Îți cântă cerul,
      Și mii de astre-n a lor loc;
      Căci Tu ești Calea
      Și-Adevărul,
      Ești cel mai frumos
      Din univers.

      [v3]
      3. Tu ești iubirea, Neprihănirea,
      Pe-a Tale buze, E-un râu de har;
      Tu locuiești sus În strălucire,
      Tu ești Eel mai scump mărgăritar.

      [v4]
      4. Ești sprijin tare, În încercare,
      Ești ușurare În ceasul greu;
      În strâmtorare, Turn de scăpare,
      Din veșnicii Ești Dumnezeu."
    `);
  });

  it('should work correctly #3', () => {
    expect(
      reprocess(`[title]
Aici e duhul domnului

[sequence]
1,2,3,4

[v1]
Ce plăcut ce tainic trup slăvit
Da, noi știm, aici e Duhul Domnului
Căci Hristos prin
Duhul ne-a unit Da, noi știm, aici e Duhul Domnului

[v2]
O, Duh Prea-Sfânt
Tu, Sol Ceresc
Rămâi aici cu noi toarnă dragoste și har

[v3]
Și-n noi mereu să arzi tot ce-i lumesc
Să ne-nchinăm smeriți prin necuprinsu-Ți dar
În duh și-n adevăr

[v4]
Eu te iubesc Doamne te iubesc’
Naintea Ta Doamne drag, mă plec
Al meu Rege ești bucuria mea
Tu ești tot ce am și eu sunt al Tău
`),
    ).toMatchInlineSnapshot(`
      "[title]
      Aici e duhul domnului

      [sequence]
      v1,v2,v3,v4

      [v1]
      Ce plăcut ce tainic trup slăvit
      Da, noi știm, aici e Duhul Domnului
      Căci Hristos prin
      Duhul ne-a unit Da, noi știm, aici e Duhul Domnului

      [v2]
      O, Duh Prea-Sfânt
      Tu, Sol Ceresc
      Rămâi aici cu noi toarnă dragoste și har

      [v3]
      Și-n noi mereu să arzi tot ce-i lumesc
      Să ne-nchinăm smeriți prin necuprinsu-Ți dar
      În duh și-n adevăr

      [v4]
      Eu te iubesc Doamne te iubesc’
      Naintea Ta Doamne drag, mă plec
      Al meu Rege ești bucuria mea
      Tu ești tot ce am și eu sunt al Tău"
    `);
  });
});
