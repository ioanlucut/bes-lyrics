import { processContent } from './contentReprocessor';

describe('contentReprocessor', () => {
  it('should not change a correct song structure w/ a chorus', () => {
    expect(
      processContent(`[title]
A bătut la ușa ta Cineva

[sequence]
1,2,3,4,5

[1]
A bătut la ușa ta Cineva...
Și n-a deschis nimenea.
În tăcerea negrei nopți,
Stă un om și plânge.
/: Fața Lui e numai răni,
Pieptul - numai sânge! :/

[2]
Cine ești, străin pribeag? Cine ești?...
De-al cui dor, Tu pribegești?
Pentru cine Te-au brăzdat
Bice fără număr?
/: Ce povară Ți-a lăsat
Rana de pe umăr? :/

[3]
Eu sunt Robul ce slujesc tuturor,
Un om al durerilor.
Nimeni plată nu Mi-a dat,
Decât spini și ură.
/: Numai roșii trandafiri,
Pieptul Mi-l umplură. :/

[4]
Eu sunt Pâinea ce s-a frânt lumii-ntregi
Și sunt Vinul noii legi.
N-am venit să plâng, în drum,
Răni usturătoare,
/: Plâng pe-acei ce pierd acum
Ultima chemare. :/

[5]
A bătut la ușa ta Cineva.
O, deschide-I, nu mai sta!
Nu-L lăsa să plece trist,
Poate, niciodată,
/: Mâna Lui, la ușa ta,
N-are să mai bată. :/`),
    ).toMatchInlineSnapshot(`
      "[title]
      A bătut la ușa ta Cineva


      1,2,3,4,5


      A bătut la ușa ta Cineva...
      Și n-a deschis nimenea.
      În tăcerea negrei nopți,
      Stă un om și plânge.
      /: Fața Lui e numai răni,
      Pieptul - numai sânge! :/


      Cine ești, străin pribeag? Cine ești?...
      De-al cui dor, Tu pribegești?
      Pentru cine Te-au brăzdat
      Bice fără număr?
      /: Ce povară Ți-a lăsat
      Rana de pe umăr? :/


      Eu sunt Robul ce slujesc tuturor,
      Un om al durerilor.
      Nimeni plată nu Mi-a dat,
      Decât spini și ură.
      /: Numai roșii trandafiri,
      Pieptul Mi-l umplură. :/


      Eu sunt Pâinea ce s-a frânt lumii-ntregi
      Și sunt Vinul noii legi.
      N-am venit să plâng, în drum,
      Răni usturătoare,
      /: Plâng pe-acei ce pierd acum
      Ultima chemare. :/


      A bătut la ușa ta Cineva.
      O, deschide-I, nu mai sta!
      Nu-L lăsa să plece trist,
      Poate, niciodată,
      /: Mâna Lui, la ușa ta,
      N-are să mai bată. :/

      [sequence]
      1"
    `);
  });

  it('should not change a correct song structure w/o a chorus', () => {
    expect(
      processContent(`[title]
Ai auzit vreodată, prietene, de Mine

[sequence]
1,2,3

[1]
Ai auzit vreodată, prietene, de Mine
Pe când în largul lumii cutreierai semeț?
Pe când cu lănci și scuturi cohortele străine
Te căutau să-ți ceară al vieții tale preț?

Ai auzit vreodată, prietene, de Mine
Când floarea vieții tale își scutura podoaba?...
Ca să te scap de lanțuri, de moarte și rușine,
Eu am murit pe cruce, în locul tău, Baraba!

[2]
Eu răsădisem pacea, tu semănai furtuna
Și pe-amândoi mulțimea ne-a pus pe un cântar.
Minciuna cea din umbră alese-atunci minciuna
Tâlharii cei cu vază cerură pe-un tâlhar.

Puteam să zbor din lume, sătul de-a ei urgie,
Și-atunci mulțimea oarbă te-ar fi cerut degeaba,
Dar M-am gândit la tine privind spre veșnicie,
Și am murit pe cruce, în locul tău, Baraba!

[3]
Te chem și astăzi... Vino și vom străbate norii!
Te-am căutat cu lacrimi prin spini și bolovani,
Dar vremea e târzie, mijesc pe dealuri zorii
Și ceru-ntreg te-așteaptă de două mii de ani!

De-ai ști ce neagră noapte și ce adânc fierbinte
Va fi când suferința nu va cunoaște graba;
Vei plânge-ntotdeauna și-ți vei aduce aminte
Că am murit pe cruce în locul tău, Baraba!`),
    ).toMatchInlineSnapshot(`
      "[title]
      Ai auzit vreodată, prietene, de Mine


      1,2,3


      Ai auzit vreodată, prietene, de Mine
      Pe când în largul lumii cutreierai semeț?
      Pe când cu lănci și scuturi cohortele străine
      Te căutau să-ți ceară al vieții tale preț?

      Ai auzit vreodată, prietene, de Mine
      Când floarea vieții tale își scutura podoaba?...
      Ca să te scap de lanțuri, de moarte și rușine,
      Eu am murit pe cruce, în locul tău, Baraba!


      Eu răsădisem pacea, tu semănai furtuna
      Și pe-amândoi mulțimea ne-a pus pe un cântar.
      Minciuna cea din umbră alese-atunci minciuna
      Tâlharii cei cu vază cerură pe-un tâlhar.

      Puteam să zbor din lume, sătul de-a ei urgie,
      Și-atunci mulțimea oarbă te-ar fi cerut degeaba,
      Dar M-am gândit la tine privind spre veșnicie,
      Și am murit pe cruce, în locul tău, Baraba!


      Te chem și astăzi... Vino și vom străbate norii!
      Te-am căutat cu lacrimi prin spini și bolovani,
      Dar vremea e târzie, mijesc pe dealuri zorii
      Și ceru-ntreg te-așteaptă de două mii de ani!

      De-ai ști ce neagră noapte și ce adânc fierbinte
      Va fi când suferința nu va cunoaște graba;
      Vei plânge-ntotdeauna și-ți vei aduce aminte
      Că am murit pe cruce în locul tău, Baraba!

      [sequence]
      1"
    `);
  });

  it('should identify a chorus by common section', () => {
    expect(
      processContent(
        `[title]
Acum când încă se mai poate

[sequence]
1,2,3,4,5,6

[1]
Acum când încă se mai poate
Lucrează frate cu folos
Căci nu-i mai prețios din toate
Decât ce faci pentru Hristos
Cât încă ai suflare-n tine
Mai poți ofrande să-I aduci
Dar s-ar putea ziua de mâine
Amicul meu să n-o apuci.

[2]
FĂ-TI TIMP PENTRU EL,
FĂ-TI TIMP PENTRU CER
DIN TOATE, ACEASTA-I MAI PRESUS
FĂ-TI TIMP SĂ IUBESTI,
FĂ-TI TIMP SĂ TE JERTFESTI
FĂ-TI TIMP PENTRU ISUS!

[3]
Fă-ți timp pentru acei ce-n lume
Aleargă din rău spre mai rău
Nu obosi ci spune, spune
De dragostea lui Dumnezeu
Fă-ți timp și mergi fără cârtire
La patul celor suferinzi
Căci ei așteaptă cu iubire
Măcar o mână să le-ntinzi!

[4]
FĂ-TI TIMP PENTRU EL,
FĂ-TI TIMP PENTRU CER
DIN TOATE, ACEASTA-I MAI PRESUS
FĂ-TI TIMP SĂ IUBESTI,
FĂ-TI TIMP SĂ TE JERTFESTI
FĂ-TI TIMP PENTRU ISUS!

[5]
Fă-ți timp pentru copiii care
Rămas-au fără de părinți
Să-i dai o simplă sărutare
Și-o clipă doar să îi alini
Cât încă ai suflare-n tine
Lucrează frate cu folos
Căci ce faci pentru el rămâne
Fă-ți astăzi timp pentru HRISTOS!

[6]
FĂ-TI TIMP PENTRU EL,
FĂ-TI TIMP PENTRU CER
DIN TOATE, ACEASTA-I MAI PRESUS
FĂ-TI TIMP SĂ IUBESTI,
FĂ-TI TIMP SĂ TE JERTFESTI
FĂ-TI TIMP PENTRU ISUS!`,
      ),
    ).toMatchInlineSnapshot(`
      "[title]
      Acum când încă se mai poate


      1,2,3,4,5,6


      Acum când încă se mai poate
      Lucrează frate cu folos
      Căci nu-i mai prețios din toate
      Decât ce faci pentru Hristos
      Cât încă ai suflare-n tine
      Mai poți ofrande să-I aduci
      Dar s-ar putea ziua de mâine
      Amicul meu să n-o apuci.


      FĂ-TI TIMP PENTRU EL,
      FĂ-TI TIMP PENTRU CER
      DIN TOATE, ACEASTA-I MAI PRESUS
      FĂ-TI TIMP SĂ IUBESTI,
      FĂ-TI TIMP SĂ TE JERTFESTI
      FĂ-TI TIMP PENTRU ISUS!


      Fă-ți timp pentru acei ce-n lume
      Aleargă din rău spre mai rău
      Nu obosi ci spune, spune
      De dragostea lui Dumnezeu
      Fă-ți timp și mergi fără cârtire
      La patul celor suferinzi
      Căci ei așteaptă cu iubire
      Măcar o mână să le-ntinzi!


      FĂ-TI TIMP PENTRU EL,
      FĂ-TI TIMP PENTRU CER
      DIN TOATE, ACEASTA-I MAI PRESUS
      FĂ-TI TIMP SĂ IUBESTI,
      FĂ-TI TIMP SĂ TE JERTFESTI
      FĂ-TI TIMP PENTRU ISUS!


      Fă-ți timp pentru copiii care
      Rămas-au fără de părinți
      Să-i dai o simplă sărutare
      Și-o clipă doar să îi alini
      Cât încă ai suflare-n tine
      Lucrează frate cu folos
      Căci ce faci pentru el rămâne
      Fă-ți astăzi timp pentru HRISTOS!


      FĂ-TI TIMP PENTRU EL,
      FĂ-TI TIMP PENTRU CER
      DIN TOATE, ACEASTA-I MAI PRESUS
      FĂ-TI TIMP SĂ IUBESTI,
      FĂ-TI TIMP SĂ TE JERTFESTI
      FĂ-TI TIMP PENTRU ISUS!

      [sequence]
      1"
    `);
  });
});
