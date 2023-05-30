import { rewriteByAddingBasicStructure } from './basicStructureEnhancer';

describe('contentReprocessor', () => {
  it('should work correctly #1', () => {
    expect(
      rewriteByAddingBasicStructure(`[title]
Aleluia el domnce bine e

[sequence]
1,2,3,4,5,6,7,8

[1]
Aleluia, Aleluia, Aleluia
/: El e Domn :/
Aleluia, Aleluia, Aleluia
Isus Hristos e Domn.

[2]
Ți-ai arătat puterea mare
Boldul morții L-ai înfrânt
Din mormânt ai înviat triumfător
Lanțurile le-ai zdrobit
Pe captivi ai eliberat
Prin a Ta îndurare sunt salvat

[3]
Aleluia, Aleluia, Aleluia
/: El e Domn :/
Aleluia, Aleluia, Aleluia
Isus Hristos e Domn.
`),
    ).toMatchInlineSnapshot(`
      "[title]
      Aleluia el domnce bine e

      [sequence]
      1,c

      [1]
      Ți-ai arătat puterea mare
      Boldul morții L-ai înfrânt
      Din mormânt ai înviat triumfător
      Lanțurile le-ai zdrobit
      Pe captivi ai eliberat
      Prin a Ta îndurare sunt salvat

      [chorus]
      Aleluia, Aleluia, Aleluia
      /: El e Domn :/
      Aleluia, Aleluia, Aleluia
      Isus Hristos e Domn."
    `);
  });

  it('should work correctly #2', () => {
    expect(
      rewriteByAddingBasicStructure(`[title]
Tu mi stii viitorul

[sequence]
c,1

[chorus]
/: Când eram doar un plod fără chip,
Ochii tăi ma vedeau!
În cartea ta de mult erau scrise
Zilele ce m-așteptau! :/

[chorus]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[chorus]
/: De-aș încerca să m-ascund te Tine
Nu voi reuși, oriunde m-aș duce,
Chiar la marginea mării
Mâna Ta mă va călăuzi! :/

[chorus]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[chorus]
/: Tu mă cunoști întru-totul, Doamne
Când stau jos sau mă ridic.
Îmi cunoști toate căile mele,
Nu pot ascunde nimic :/

[chorus]
/: Tu-mi știi viitorul și ești lângă mine,
De ce să mă îngrijorez?
Mi-ai promis de voi sta lângă Tine
Nicicând n-ai să mă părăsești. :/

[1]
Nicicând n-ai să mă părăsești!`),
    ).toMatchInlineSnapshot(`
      "[title]
      Tu mi stii viitorul

      [sequence]
      1,c,2,c,3,c,4,c

      [1]
      /: Când eram doar un plod fără chip,
      Ochii tăi ma vedeau!
      În cartea ta de mult erau scrise
      Zilele ce m-așteptau! :/

      [chorus]
      /: Tu-mi știi viitorul și ești lângă mine,
      De ce să mă îngrijorez?
      Mi-ai promis de voi sta lângă Tine
      Nicicând n-ai să mă părăsești. :/

      [2]
      /: De-aș încerca să m-ascund te Tine
      Nu voi reuși, oriunde m-aș duce,
      Chiar la marginea mării
      Mâna Ta mă va călăuzi! :/

      [3]
      /: Tu mă cunoști întru-totul, Doamne
      Când stau jos sau mă ridic.
      Îmi cunoști toate căile mele,
      Nu pot ascunde nimic :/

      [4]
      Nicicând n-ai să mă părăsești!"
    `);
  });

  it('should work correctly #3', () => {
    expect(
      rewriteByAddingBasicStructure(`[title]
Tu n ai sub soare asemanare tu esti iubirea mea

[sequence]
1,2,3,4,5,6,7,8

[1]
1. Tu n-ai sub soare, Asemănare,
Ești necuprins, Ești nemărginit;
Iubirea-Ți sfântă, E o splendoare,
Pe drept Isuse, Tu ești iubit.

[2]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[3]
2. Îți cântă marea, Îți cântă cerul,
Și mii de astre-n a lor loc;
Căci Tu ești Calea
Și-Adevărul,
Ești cel mai frumos
Din univers.

[4]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[5]
3. Tu ești iubirea, Neprihănirea,
Pe-a Tale buze, E-un râu de har;
Tu locuiești sus În strălucire,
Tu ești Eel mai scump mărgăritar.

[6]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.

[7]
4. Ești sprijin tare, În încercare,
Ești ușurare În ceasul greu;
În strâmtorare, Turn de scăpare,
Din veșnicii Ești Dumnezeu.

[8]
Tu ești iubirea mea,
Tu-mi ești Comoara vieții,
Soarele meu frumos Din zorii dimineții.`),
    ).toMatchInlineSnapshot(`
      "[title]
      Tu n ai sub soare asemanare tu esti iubirea mea

      [sequence]
      1,c,2,c,3,c,4,c

      [1]
      1. Tu n-ai sub soare, Asemănare,
      Ești necuprins, Ești nemărginit;
      Iubirea-Ți sfântă, E o splendoare,
      Pe drept Isuse, Tu ești iubit.

      [chorus]
      Tu ești iubirea mea,
      Tu-mi ești Comoara vieții,
      Soarele meu frumos Din zorii dimineții.

      [2]
      2. Îți cântă marea, Îți cântă cerul,
      Și mii de astre-n a lor loc;
      Căci Tu ești Calea
      Și-Adevărul,
      Ești cel mai frumos
      Din univers.

      [3]
      3. Tu ești iubirea, Neprihănirea,
      Pe-a Tale buze, E-un râu de har;
      Tu locuiești sus În strălucire,
      Tu ești Eel mai scump mărgăritar.

      [4]
      4. Ești sprijin tare, În încercare,
      Ești ușurare În ceasul greu;
      În strâmtorare, Turn de scăpare,
      Din veșnicii Ești Dumnezeu."
    `);
  });

  it('should work correctly #3', () => {
    expect(
      rewriteByAddingBasicStructure(`[title]
Aici e duhul domnului

[sequence]
1,2,3,4

[1]
Ce plăcut ce tainic trup slăvit
Da, noi știm, aici e Duhul Domnului
Căci Hristos prin
Duhul ne-a unit Da, noi știm, aici e Duhul Domnului

[2]
O, Duh Prea-Sfânt
Tu, Sol Ceresc
Rămâi aici cu noi toarnă dragoste și har

[3]
Și-n noi mereu să arzi tot ce-i lumesc
Să ne-nchinăm smeriți prin necuprinsu-Ți dar
În duh și-n adevăr

[4]
Eu te iubesc Doamne te iubesc’
Naintea Ta Doamne drag, mă plec
Al meu Rege ești bucuria mea
Tu ești tot ce am și eu sunt al Tău
`),
    ).toMatchInlineSnapshot(`
      "[title]
      Aici e duhul domnului

      [sequence]
      1,2,3,4

      [1]
      Ce plăcut ce tainic trup slăvit
      Da, noi știm, aici e Duhul Domnului
      Căci Hristos prin
      Duhul ne-a unit Da, noi știm, aici e Duhul Domnului

      [2]
      O, Duh Prea-Sfânt
      Tu, Sol Ceresc
      Rămâi aici cu noi toarnă dragoste și har

      [3]
      Și-n noi mereu să arzi tot ce-i lumesc
      Să ne-nchinăm smeriți prin necuprinsu-Ți dar
      În duh și-n adevăr

      [4]
      Eu te iubesc Doamne te iubesc’
      Naintea Ta Doamne drag, mă plec
      Al meu Rege ești bucuria mea
      Tu ești tot ce am și eu sunt al Tău"
    `);
  });
});
