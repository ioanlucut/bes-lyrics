import {
  getInvalidChordMarkups,
  stripChordMarkup,
  transferChordMarkup,
} from './chordMarkup.js';

describe('chordMarkup', () => {
  it('should remove normal and starred chord markup without changing lyrics', () => {
    expect(stripChordMarkup('^*{D/F#}lumi ^{G}nat')).toBe('lumi nat');
  });

  it('should transfer chords while preserving canonical punctuation, casing, and line breaks', () => {
    const canonicalContent = `Puternic Dumnezeu,
Pe Tine Te așteptăm.`;
    const recoveredContent = `Pu^{Am}ternic Dumnezeu pe ^{C}Tine Te așteptăm!`;

    expect(transferChordMarkup(canonicalContent, recoveredContent)).toBe(
      `Pu^{Am}ternic Dumnezeu,
Pe ^{C}Tine Te așteptăm.`,
    );
  });

  it('should keep a trailing chord on its original lyric line', () => {
    expect(transferChordMarkup('A,\nB', 'A^{G}, B')).toBe('A^{G},\nB');
  });

  it('should keep a line-leading chord before opening punctuation', () => {
    expect(transferChordMarkup('A\n(B)', 'A\n^{G}(B)')).toBe('A\n^{G}(B)');
  });

  it('should keep a mid-line chord before opening punctuation', () => {
    expect(transferChordMarkup('A, (B)', 'A, ^{G}(B)')).toBe('A, ^{G}(B)');
  });

  it('should not transfer chords when the lyrics differ', () => {
    expect(
      transferChordMarkup('Text canonical', '^{D}Alt text'),
    ).toBeUndefined();
  });

  it.each([
    '^{Am&}text',
    '^{7A}text',
    '^{Am text',
    '^{(F#m7)}text',
    '^{A/}text',
    '^{C---}text',
    '^{Garbage}text',
    '^{-Am}text',
    '^{7}text',
    '^{9/11}text',
    '^{A-7}text',
    '^**{D}text',
  ])('should reject malformed chord notation in "%s"', (content) => {
    expect(getInvalidChordMarkups(content)).not.toEqual([]);
  });

  it.each([
    '^{A/F#-E/G#-A-A/B}text',
    '^{BbMaj7}text',
    '^{B7/9}text',
    '^{E7/9}text',
  ])('should accept supported legacy chord notation in "%s"', (content) => {
    expect(getInvalidChordMarkups(content)).toEqual([]);
  });
});
