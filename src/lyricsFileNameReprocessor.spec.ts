import { ALLOWED_CHARS, EMPTY_STRING } from './constants.js';
import { deriveFromTitle } from './lyricsFileNameReprocessor.js';

describe('lyricsFileNameReprocessor', () => {
  it('should work correctly by correctly mapping the existing allowed chars', () => {
    expect(
      deriveFromTitle(ALLOWED_CHARS.join(EMPTY_STRING), '12'),
    ).toMatchInlineSnapshot(
      `"&#()-.1234567890ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzIaiaASsATt - #12.txt"`,
    );
  });

  it('should work correctly - when `alternative` and `author` is there', () => {
    expect(
      deriveFromTitle(
        'Ce mare ești Tu {alternative: {Splendoare de-mpărat}, author: {Ekklesia}}',
        'x2',
      ),
    ).toMatchInlineSnapshot(
      `"Ekklesia - Ce mare esti Tu - Splendoare de-mparat - #x2.txt"`,
    );
  });

  it('should work correctly - when `author` is there', () => {
    expect(
      deriveFromTitle('Ce mare ești Tu {author: {Ekklesia}}', '3f'),
    ).toMatchInlineSnapshot(`"Ekklesia - Ce mare esti Tu - #3f.txt"`);
  });

  it('should work correctly - when `version` is there', () => {
    expect(
      deriveFromTitle(
        'Domn al veșniciei, al lumii Creator {version: {i}}',
        '4f',
      ),
    ).toMatchInlineSnapshot(
      `"Domn al vesniciei al lumii Creator - i - #4f.txt"`,
    );
  });

  it('should work correctly - when no meta is there', () => {
    expect(
      deriveFromTitle('Domn al veșniciei, al lumii Creator', 'xf'),
    ).toMatchInlineSnapshot(`"Domn al vesniciei al lumii Creator - #xf.txt"`);
  });
});
