import { deriveFromTitle } from './fileNameDeriver';

describe('fileNameNormalizer', () => {
  it('should work correctly', () => {
    expect(
      deriveFromTitle(
        '!(),-./1234567890:;?ABCDEFGHIJKLMNOPRSTUVWXZYabcdefghijklmnopqrstuvwxyzÎâîăÂȘșĂȚț’”„',
      ),
    ).toMatchInlineSnapshot(
      `"()-.1234567890ABCDEFGHIJKLMNOPRSTUVWXZYabcdefghijklmnopqrstuvwxyzIaiaASsATt.txt"`,
    );
  });

  it('should work correctly - when author is there #1', () => {
    expect(
      deriveFromTitle('Aleluia, laudă Lui (Otto Pascal)'),
    ).toMatchInlineSnapshot(`"Aleluia lauda Lui (Otto Pascal).txt"`);
  });

  it('should work correctly - when author is there #2', () => {
    expect(
      deriveFromTitle(
        'Tu spui (You Say - Traducere adaptata de Onita Halunga) (Lauren Daigle)',
      ),
    ).toMatchInlineSnapshot(
      `"Tu spui (You Say - Traducere adaptata de Onita Halunga) (Lauren Daigle).txt"`,
    );
  });

  it('should work correctly - when author is there #2', () => {
    expect(
      deriveFromTitle(
        'Tu spui (You Say - Traducere adaptata de Onita Halunga) (Lauren Daigle)',
      ),
    ).toMatchInlineSnapshot(
      `"Tu spui (You Say - Traducere adaptata de Onita Halunga) (Lauren Daigle).txt"`,
    );
  });
});
