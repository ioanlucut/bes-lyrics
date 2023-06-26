### Cântări Biserica Emanuel Sibiu (BES)

Acest repository conține cântări scrise/folosite de trupele de laudă si închinare ale bisericii Emanuel Sibiu.

#### Formatul

_inspirat din `EasySlides`, `OpenSongs` si https://www.learnchordal.com/how-to-read-charts_.

Formatul folosit este unul simplu, similar cu cel din `OpenSong`, după cum urmează:

```
[title]
Aceasta mi-e dorința să Te-onorez

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
> De asemenea, trebuie să știi că `[title]` trebuie să fie primul element din cântare iar `[sequence]` trebuie să fie al doilea element din cântare.
> Restul elementelor pot fi în orice ordine. De asemenea, nu este nevoie să folosești toate elementele.
> De exemplu, dacă cântarea nu are bridge, nu este nevoie să folosești `[b]`.

##### `[title]`

- Reprezintă titlul cântecului. Exemplu: `[title] Aceasta mi-e dorința să Te-onorez`.
- Necesar? Da.

#### `[v#{numar}]`

- Reprezintă strofa cântării.
- Exemplu: `[v1]` reprezintă strofa 1 a cântării.
- Necesar? Da.

#### `[b#{numar?}]`

- Reprezintă bridge-ul 1 (sau singurul) al cântării. Bridge-ul este o secțiune a cântării care se află înaintea corului (dar nu neapărat întotdeauna).
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

##### `[sequence]`

- Reprezintă secvența cântării sau ordinea în care se cântă această cântare.
- Necesar? Da.

#### Caractere

Caracterele pe care le putem folosi sunt foarte importante, așa că am definit o listă pe care o putem folosi:

```
 !(),-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZY[\]abcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„
```

Întrucât sunt foarte multe versiuni ale caracterelor e.g. `ş` în loc de `ș`, e nevoie să folosim aceleași caractere cu
același format unicode. Un exemplu de variațiuni poate fi văzut aici: https://www.compart.com/en/unicode/U+201D.

#### Cum poți să te implici?

- Pull request cu o cântare nouă in directory-ul `candidates`.
