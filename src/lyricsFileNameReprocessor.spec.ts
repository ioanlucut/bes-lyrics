import { ALLOWED_CHARS, EMPTY_STRING } from './constants.js';
import { deriveFromTitle } from './lyricsFileNameReprocessor.js';

describe('lyricsFileNameReprocessor', () => {
  it('should work correctly by correctly mapping the existing allowed chars', () => {
    expect(
      deriveFromTitle(ALLOWED_CHARS.join(EMPTY_STRING)),
    ).toMatchInlineSnapshot(
      `"&#()-.1234567890ABCDEFGHIJKLMNOPRSTUVWXZYQ[\\]abcdefghijklmnopqrstuvwxyzIaiaASsATt.txt"`,
    );
  });

  it('should work correctly - when `alternative` and `author` is there', () => {
    expect(
      deriveFromTitle(
        'Ce mare ești Tu {alternative: {Splendoare de-mpărat}, author: {Ekklesia}}',
      ),
    ).toMatchInlineSnapshot(
      `"Ekklesia - Ce mare esti Tu - Splendoare de-mparat.txt"`,
    );
  });

  it('should work correctly - when `author` is there', () => {
    expect(
      deriveFromTitle('Ce mare ești Tu {author: {Ekklesia}}'),
    ).toMatchInlineSnapshot(`"Ekklesia - Ce mare esti Tu.txt"`);
  });

  it('should work correctly - when `version` is there', () => {
    expect(
      deriveFromTitle('Domn al veșniciei, al lumii Creator {version: {i}}'),
    ).toMatchInlineSnapshot(`"Domn al vesniciei al lumii Creator - i.txt"`);
  });

  it('should work correctly - when no meta is there', () => {
    expect(
      deriveFromTitle('Domn al veșniciei, al lumii Creator'),
    ).toMatchInlineSnapshot(`"Domn al vesniciei al lumii Creator.txt"`);
  });
});
