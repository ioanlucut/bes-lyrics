import { assemblyCharsStats } from './charsStatsCollector.js';

describe('fileNameNormalizer', () => {
  it('should work correctly and not signalize any differences when only allowed chars exist', () => {
    const stats = assemblyCharsStats(
      'file.txt',
      '!(),-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZY' +
        '[\\]abcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„!(),-./1234567890:;?' +
        'ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„',
    );

    expect(stats.differenceInContent).toHaveLength(0);
    expect(stats.differenceInFileName).toHaveLength(0);

    expect(stats).toMatchInlineSnapshot(`
      {
        "differenceInContent": [],
        "differenceInFileName": [],
        "fileName": "file.txt",
        "uniqueCharsFromContent": [
          "!",
          "(",
          ")",
          ",",
          "-",
          ".",
          "/",
          "0",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          ":",
          ";",
          "?",
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
          "N",
          "O",
          "P",
          "R",
          "S",
          "T",
          "U",
          "V",
          "W",
          "X",
          "Y",
          "Z",
          "[",
          "\\",
          "]",
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
          "g",
          "h",
          "i",
          "j",
          "k",
          "l",
          "m",
          "n",
          "o",
          "p",
          "q",
          "r",
          "s",
          "t",
          "u",
          "v",
          "w",
          "x",
          "y",
          "z",
          "Â",
          "Î",
          "â",
          "î",
          "Ă",
          "ă",
          "Ș",
          "ș",
          "Ț",
          "ț",
          "’",
          "”",
          "„",
        ],
        "uniqueCharsFromFileName": [
          ".",
          "e",
          "f",
          "i",
          "l",
          "t",
          "x",
        ],
      }
    `);
  });

  it('should work correctly by signalize differences', () => {
    expect(assemblyCharsStats('aböÛÜÙ', 'aböÛÜÙ')).toMatchInlineSnapshot(`
      {
        "differenceInContent": [
          "Ù",
          "Û",
          "Ü",
          "ö",
        ],
        "differenceInFileName": [
          "Ù",
          "Û",
          "Ü",
          "ö",
        ],
        "fileName": "aböÛÜÙ",
        "uniqueCharsFromContent": [
          "a",
          "b",
          "Ù",
          "Û",
          "Ü",
          "ö",
        ],
        "uniqueCharsFromFileName": [
          "a",
          "b",
          "Ù",
          "Û",
          "Ü",
          "ö",
        ],
      }
    `);
  });
});
