import { ALLOWED_CHARS, EMPTY_STRING, UNSET_META } from './constants.js';
import { deriveFromTitle } from './lyricsFileNameReprocessor.js';

describe('lyricsFileNameReprocessor', () => {
  it('should work correctly by correctly mapping the existing allowed chars', () => {
    expect(
      deriveFromTitle(ALLOWED_CHARS.join(EMPTY_STRING)),
    ).toMatchInlineSnapshot(`"*_.txt"`);
  });

  it('should work correctly - when `alternative` and `composer` is there', () => {
    expect(
      deriveFromTitle(
        'Ce mare ești Tu {alternative: {Splendoare de-mpărat}, composer: {Ekklesia}}',
      ),
    ).toMatchInlineSnapshot(
      `"Ekklesia - Ce mare esti Tu - Splendoare de-mparat.txt"`,
    );
  });

  it('should work correctly - when `composer` is there', () => {
    expect(
      deriveFromTitle('Ce mare ești Tu {composer: {Ekklesia}}'),
    ).toMatchInlineSnapshot(`"Ekklesia - Ce mare esti Tu.txt"`);
  });

  it(`should work correctly - when 'composer' is ${UNSET_META}`, () => {
    expect(
      deriveFromTitle(`Ce mare ești Tu {composer: {${UNSET_META}}}`),
    ).toMatchInlineSnapshot(`"Ce mare esti Tu.txt"`);
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

  it('should work correctly - with ; as separators', () => {
    expect(
deriveFromTitle(
'My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}')).

toMatchInlineSnapshot(`"composer 1 - composer 2 - writer 1 - writer 2 - arranger 1 - arranger 2 - band 1 - band 2 - interpreter 1 - interpreter 2 - My main title - alternative 1 - alternative 2 - ii.txt"`);
  });

  it('should work correctly - when all meta fields are there with missing data', () => {
    expect(
deriveFromTitle(
'Any title {alternative: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, title: {ANY_title}, version: {ANY_version}, writer: {ANY_writer}}')).

toMatchInlineSnapshot(`"ANY_composer - ANY_writer - ANY_arranger - ANY_band - ANY_interpreter - Any title - ANY_alternative - ANY_version.txt"`);
  });
});
