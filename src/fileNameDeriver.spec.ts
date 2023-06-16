import { deriveFromTitle } from './fileNameDeriver';
import { ALLOWED_CHARS, EMPTY_STRING } from '../constants';

describe('fileNameDeriver', () => {
  it('should work correctly by correctly mapping the existing allowed chars', () => {
    expect(
      deriveFromTitle(ALLOWED_CHARS.join(EMPTY_STRING)),
    ).toMatchInlineSnapshot(
      `"&#()-.1234567890ABCDEFGHIJKLMNOPRSTUVWXZY[\\]abcdefghijklmnopqrstuvwxyzIaiaASsATt.txt"`,
    );
  });

  it('should work correctly - when `Alternative` and `Author` is there', () => {
    expect(
      deriveFromTitle(
        'Ce mare ești Tu {Alternative: {Splendoare de-mpărat}, Author: {Ekklesia}}',
      ),
    ).toMatchInlineSnapshot(
      `"Ekklesia - Ce mare esti Tu - Splendoare de-mparat.txt"`,
    );
  });

  it('should work correctly - when `Author` is there', () => {
    expect(
      deriveFromTitle('Ce mare ești Tu {Author: {Ekklesia}}'),
    ).toMatchInlineSnapshot(`"Ekklesia - Ce mare esti Tu.txt"`);
  });

  it('should work correctly - when `Version` is there', () => {
    expect(
      deriveFromTitle('Domn al veșniciei, al lumii Creator {Version: {i}}'),
    ).toMatchInlineSnapshot(`"Domn al vesniciei al lumii Creator - i.txt"`);
  });

  it('should work correctly - when no meta is there', () => {
    expect(
      deriveFromTitle('Domn al veșniciei, al lumii Creator'),
    ).toMatchInlineSnapshot(`"Domn al vesniciei al lumii Creator.txt"`);
  });
});
