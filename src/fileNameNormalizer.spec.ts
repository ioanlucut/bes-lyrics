import { normalizeFileName } from './fileNameNormalizer';

describe('fileNameNormalizer', () => {
  it('should work correctly', () => {
    expect(
      normalizeFileName(
        '!(),-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„.txt',
      ),
    ).toMatchInlineSnapshot(
      `"-.;ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzIaiaASsATt.txt"`,
    );
    expect(normalizeFileName('asdf .txt')).toMatchInlineSnapshot(`"asdf.txt"`);
    expect(normalizeFileName('as  df  .txt')).toMatchInlineSnapshot(
      `"as df.txt"`,
    );
    expect(normalizeFileName('1. asdf .txt')).toMatchInlineSnapshot(
      `". asdf.txt"`,
    );
    expect(normalizeFileName('1 asdf .txt')).toMatchInlineSnapshot(
      `"asdf.txt"`,
    );
    expect(normalizeFileName('1, asdf .txt')).toMatchInlineSnapshot(
      `"asdf.txt"`,
    );
  });
});
