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
  });
});
