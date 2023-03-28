### Cântări Biserica Emanuel Sibiu (BES)

Acest repository conține cântări scrise/folosite de trupele de laudă si închinare ale bisericii Emanuel Sibiu.

#### Formatul

Formatul folosit este unul simplu, după cum urmează:

```
[title]
Aceasta mi-e dorința să Te onorez

[sequence]
1,c,2,c

[1]
Aceasta mi-e dorința, să Te onorez,
Cu ființa-ntreagă să Te slăvesc.
Te ador, Stăpâne, și mă închin,
Lauda și onoarea Ți se cuvin!

[chorus]
Ție-Ți dau inima și sufletul meu,
Pentru Tine vreau să trăiesc!
Domnul meu, Te iubesc!
Zi de zi vreau să-mplinesc
Doar sfântă voia Ta!

[2]
Vrednic ești de cinste, fii lăudat!
Împărat al slavei, fii înălțat!
Alfa și Omega, de-a pururi viu,
Domn al veșniciei, în veci! Amin!
```

#### Caractere

Caracterele pe care le putem folosi sunt foarte importante, așa că am definit o listă pe care o putem folosi:

```
 !(),-./1234567890:;?ABCDEFGHIJLMNOPRSTUVZ[\\]abcdefghijlmnopqrstuvwxzÎâîăÂȘșĂȚț’”„
```

Întrucât sunt foarte multe versiuni ale caracterelor e.g. `ș`, e nevoie să folosim aceleași caractere cu același format unicode. Un exemplu poate fi văzut aici: https://www.compart.com/en/unicode/U+201D

#### Explicații ale formatului

##### `[title]`

Reprezintă titlul cântării

#### `[1]`

Reprezintă strofa 1 a cântării

#### `[2]`

Reprezintă stofa 2 a cântării

#### `[3]`

Reprezintă strofa 3 a cântării

#### `[4]`

Reprezintă strofa 4 a cântării

#### `[5]`

Reprezintă strofa 5 a cântării

#### `[6]`

Reprezintă strofa 6 a cântării

#### `[7]`

Reprezintă strofa 7 a cântării

#### `[8]`

Reprezintă strofa 8 a cântării

#### `[bridge]`

Reprezintă bridge-ul 1 (sau singurul) al cântării

#### `[bridge 2]`

Reprezintă bridge-ul 2 al cântării

#### `[chorus]`

Reprezintă chorus-ul 1 (sau singurul) al cântării

#### `[chorus 2]`

Reprezintă chorus-ul 2 al cântării

#### `[prechorus]`

Reprezintă prechorus-ul 1 (sau singurul) al cântării (care se află chiar înaintea corului)

#### `[prechorus 2]`

Reprezintă prechorus-ul 2 (sau singurul) al cântării (care se află chiar înaintea corului)

##### `[sequence]`

Reprezintă secvența cântării sau ordinea în care se cântă această cântare. E foarte importantă această configurație pentru că va fi mapată într-un aranjament în `ProPresenter7`. Mai multe detalii despre aranjamente se pot găsi aici: https://youtu.be/tb7UatDBGAI?t=1665.

Tag-urile suportate aici sunt următoarele:

```
["1","2","3","4","5","6","7","8","c","t","p","q","e","b","w"]
```

Ele sunt mapate la secțiunile de mai sus.

```
  "[1]": "1",
  "[2]": "2",
  "[3]": "3",
  "[4]": "4",
  "[5]": "5",
  "[6]": "6",
  "[7]": "7",
  "[8]": "8",
  "[chorus]": "c",
  "[chorus 2]": "t",
  "[prechorus]": "p",
  "[prechorus 2]": "q",
  "[ending]": "e",
  "[bridge]": "b",
  "[bridge 2]": "w",
```

#### Cum poți să te implici?

- Faci un fork al repo-ului
- Pull request cu o cântare nouă
