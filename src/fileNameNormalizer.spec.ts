import { normalizeFileName } from './fileNameNormalizer';

describe('fileNameNormalizer', () => {
  it('should work correctly', () => {
    expect(
      normalizeFileName(
        '!(),-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„.txt',
      ),
    ).toMatchInlineSnapshot(
      `",-.ABCDEFGHIJKLMNOPRSTUVWXZYabcdefghijklmnopqrstuvwxyzIaiaASsATt.txt"`,
    );
    expect(normalizeFileName('file .txt')).toMatchInlineSnapshot(`"file.txt"`);
    expect(normalizeFileName('as  df  .txt')).toMatchInlineSnapshot(
      `"as df.txt"`,
    );
    expect(normalizeFileName('1. file .txt')).toMatchInlineSnapshot(
      `". file.txt"`,
    );
    expect(normalizeFileName('1 file .txt')).toMatchInlineSnapshot(
      `"file.txt"`,
    );
    expect(normalizeFileName('1, file .txt')).toMatchInlineSnapshot(
      `", file.txt"`,
    );
    expect(normalizeFileName(' file.txt ')).toMatchInlineSnapshot(`"file.txt"`);
    expect(normalizeFileName(' file isus.txt ')).toMatchInlineSnapshot(
      `"file Isus.txt"`,
    );
    expect(normalizeFileName(' file domnul.txt ')).toMatchInlineSnapshot(
      `"file Domnul.txt"`,
    );
    expect(normalizeFileName(' file dumnezeu.txt ')).toMatchInlineSnapshot(
      `"file Dumnezeu.txt"`,
    );
    expect(normalizeFileName('Vreau doamne iubirea.txt')).toMatchInlineSnapshot(
      `"Vreau Doamne iubirea.txt"`,
    );
  });
});
