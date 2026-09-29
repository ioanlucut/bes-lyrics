import { getInvalidChordMarkups, stripChordMarkup } from './chordMarkup.js';

describe('chordMarkup', () => {
  it('should remove normal and starred chord markup without changing lyrics', () => {
    expect(stripChordMarkup('^*{D/F#}lumi ^{G}nat')).toBe('lumi nat');
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
