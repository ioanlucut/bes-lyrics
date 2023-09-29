### Cântări Biserica Emanuel Sibiu (BES)

Acest repository conține cântări scrise/folosite de trupele de laudă și închinare ale bisericii Emanuel Sibiu.

#### Formatul

_inspirat din `EasySlides`, `OpenSongs` și https://www.learnchordal.com/how-to-read-charts_.

Formatul folosit este unul simplu, după cum urmează:

```
[title]
Aceasta mi-e dorința să Te-onorez: {
  version: {..write here..},
  rcId: {..write here..},
  composer: {..write here..},
  writer: {..write here..},
  arranger: {..write here..},
  interpreter: {..write here..},
  band: {..write here..},
  genre: {..write here..},
  key: {..write here..},
  tempo: {..write here..},
  tags: {..write here..}
}

[sequence]
v1,c,v2,c

[v1]
Aceasta mi-e dorința, să Te-onorez,
Cu ființa-ntreagă să Te slăvesc.
Te ador, Stăpâne, și mă închin,
Lauda și onoarea Ți se cuvin!

[c]
Ție-Ți dau inima și sufletul meu,
Pentru Tine vreau să trăiesc!
Domnul meu, Te iubesc!
Zi de zi vreau să-mplinesc
Doar sfântă voia Ta!

[v2]
Vrednic ești de cinste, fii lăudat!
Împărat al slavei, fii înălțat!
Alfa și Omega, de-a pururi viu,
Domn al veșniciei, în veci! Amin!
```

#### Explicații ale formatului

> **Notă**: Înainte de a continua, trebuie să știi că toate cântările trebuie să aibă un `[title]` și un `[sequence]`.
> De asemenea, trebuie să știi că `[title]` trebuie să fie primul element din cântare iar `[sequence]` trebuie să fie al
> doilea element din cântare.
> Restul elementelor pot fi în orice ordine. De asemenea, nu este nevoie să folosești toate elementele.

##### `[title]`

- Reprezintă titlul cântecului. Exemplu: `[title] Aceasta mi-e dorința să Te-onorez`.
- Necesar? Da.

###### `writer: {Any Writer}`

- The person who single-handedly created the melody and wrote the lyrics is called a writer.
- See https://en.wikipedia.org/wiki/Songwriter

###### `composer: {Any Composer}`

- The composer of the song. A person who creates the melody of a song is called a music composer.
- See https://ro.wikipedia.org/wiki/Compozitor

###### `arranger: {Any Arranger}`

- Whoever arranged the song. An arranger is someone who takes an existing song and gives it new life.
- See https://dexonline.ro/definitie/aranjor

###### `interpreter: {Any Interpreter}`

- The interpreter of the song.
- See https://ro.wikipedia.org/wiki/C%C3%A2nt%C4%83re%C8%9B

##### `[sequence]`

- Reprezintă secvența cântării sau ordinea în care se cântă această cântare.
- Necesar? Da.

#### `[v#{numar}]`

- Reprezintă strofa cântării.
- Exemplu: `[v1]` reprezintă strofa 1 a cântării.
- Necesar? Da.

#### `[b#{numar?}]`

- Reprezintă bridge-ul 1 (sau singurul) al cântării. Bridge-ul este o secțiune a cântării care se află înaintea
  corului (dar nu neapărat întotdeauna).
- Exemplu: `[b]` reprezintă bridge-ul 1 al cântării.
- Necesar? Nu.

#### `[c#{numar?}]`

- Reprezintă chorus-ul 1 (sau singurul) al cântării
- Exemplu: `[c]` reprezintă chorus-ul 1 al cântării.
- Necesar? Nu.

#### `[p#{numar?}]`

- Reprezintă pre-chorus-ul (sau singurul) al cântării (care se cântă întotdeauna înaintea corului)
- Exemplu: `[p]` reprezintă pre-chorus-ul 1 al cântării.
- Necesar? Nu.
- Necesar? Nu.

#### `[s#{numar?}]`

- Reprezintă o secțiune de recital
- Exemplu: `[s]` reprezintă recitalul 1 al cântării.
- Necesar? Nu.

#### `[e]`

- Reprezintă ending-ul cântecului
- Necesar? Nu.

#### Caractere

Caracterele pe care le putem folosi sunt foarte importante, așa că am definit o listă:

```
 *_{}&!(),-./][1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZYQabcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț‘’”„\n
```

Întrucât sunt foarte multe versiuni ale caracterelor e.g. `ş` în loc de `ș`, e nevoie să folosim aceleași caractere cu
același format unicode. Un exemplu de variațiuni poate fi văzut aici: https://www.compart.com/en/unicode/U+201D.
> Detalii despre `‘’` poți să găsești și aici: https://github.com/ioanlucut/bes-lyrics/issues/105.

#### Dacă vrei să imporți cântece din resurse creștine

- Asigură-te că ultima versiune a repo-ului https://github.com/ioanlucut/bes-lyrics-parser este instalată in același
  folder părinte cu acest repository.
- Copiază `ID`-ul din `URL`. E.g. https://www.resursecrestine.ro/cantece/212152/cuvantul-intrupat (-> **212152**)
- Adaugă-l în fișierul `temp_runners/rc_ids_to_process.txt` într-o linie nouă.
- Rulează scriptul `npm run import:rc:by-ids`
- Branch nou, commit, push și `PR`.

#### Cum poți să te implici altfel?

- Pull request cu o cântare nouă in directory-ul `candidates`.
