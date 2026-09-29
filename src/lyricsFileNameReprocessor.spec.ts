import { ALLOWED_CHARS, EMPTY_STRING, UNSET_META } from './constants.js';
import {
  deriveFromTitle,
  planFileRenames,
} from './lyricsFileNameReprocessor.js';

describe('lyricsFileNameReprocessor', () => {
  it('should work correctly by correctly mapping the existing allowed chars', () => {
    expect(
      deriveFromTitle(ALLOWED_CHARS.join(EMPTY_STRING)),
    ).toMatchInlineSnapshot(`"*.txt"`);
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
        'My main title {alternative: { alternative 1; alternative 2 }, composer: {composer 1; composer 2}, writer: {writer 1; writer 2}, arranger: {arranger 1;arranger 2}, interpreter: {interpreter 1;interpreter 2}, band: {band 1;band 2}, key: {*}, tempo: {*}, tags: {tags 1; tags 2}, version: {ii}, genre: {genre 1; genre 2}, rcId: {*}, id: {7RURbpko41pWYEgVkHD4Pq}, contentHash: {655954}}',
      ),
    ).toMatchInlineSnapshot(
      `"band 1 - band 2 - My main title - alternative 1 - alternative 2 - ii.txt"`,
    );
  });

  it('should work correctly - when all meta fields are there with missing data', () => {
    expect(
      deriveFromTitle(
        'Any title {alternative: {ANY_alternative}, arranger: {ANY_arranger}, band: {ANY_band}, composer: {ANY_composer}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {ANY_interpreter}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_band - Any title - ANY_alternative - ANY_version.txt"`,
    );
  });

  it('should remove duplicates', () => {
    expect(
      deriveFromTitle(
        'Any title {alternative: {Any title}, arranger: {SAME}, band: {ANY_band}, composer: {SAME}, contentHash: {ANY_contentHash}, genre: {ANY_genre}, id: {ANY_id}, interpreter: {SAME}, key: {ANY_key}, rcId: {ANY_rcId}, tags: {ANY_tags}, tempo: {ANY_tempo}, version: {ANY_version}, writer: {ANY_writer}}',
      ),
    ).toMatchInlineSnapshot(`"ANY_band - Any title - ANY_version.txt"`);
  });

  it('should pick a single info from the BAND, INTERPRETER, COMPOSER, WRITER, ARRANGER', () => {
    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'band: {ANY_BAND}, ' +
          'composer: {ANY_COMPOSER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'interpreter: {ANY_INTERPRETER}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          'writer: {ANY_WRITER}' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_BAND - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );

    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'composer: {ANY_COMPOSER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'interpreter: {ANY_INTERPRETER}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          'writer: {ANY_WRITER}' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_INTERPRETER - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );

    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'composer: {ANY_COMPOSER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          'writer: {ANY_WRITER}' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_COMPOSER - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );

    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'interpreter: {ANY_INTERPRETER}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          'writer: {ANY_WRITER}' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_INTERPRETER - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );

    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          'writer: {ANY_WRITER}' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_WRITER - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );

    expect(
      deriveFromTitle(
        'Any title {' +
          'alternative: {ANY_ALTERNATIVE}, ' +
          'arranger: {ANY_ARRANGER}, ' +
          'contentHash: {ANY_CONTENT_HASH}, ' +
          'genre: {ANY_GENRE}, ' +
          'id: {ANY_ID}, ' +
          'key: {ANY_KEY}, ' +
          'rcId: {ANY_RC_ID}, ' +
          'tags: {ANY_TAGS}, ' +
          'tempo: {ANY_TEMPO}, ' +
          'version: {ANY_VERSION}, ' +
          '}',
      ),
    ).toMatchInlineSnapshot(
      `"ANY_ARRANGER - Any title - ANY_ALTERNATIVE - ANY_VERSION.txt"`,
    );
  });
});

describe('deriveFromTitle', () => {
  it('skips an empty composer', () => {
    expect(deriveFromTitle('Titlu {composer: {}, writer: {Ana}}')).toEqual(
      'Ana - Titlu.txt',
    );
  });

  it('keeps a composer whose name contains a comma', () => {
    expect(
      deriveFromTitle('Titlu {composer: {Ana, Ion}, tags: {Psalmul 23:1}}'),
    ).toEqual('Ana Ion - Titlu.txt');
  });
});

describe('planFileRenames', () => {
  it('renames a song to a free file name', () => {
    expect(
      planFileRenames([
        { from: 'verified/Old.txt', to: 'verified/New.txt' },
        { from: 'verified/Other.txt', to: 'verified/Other.txt' },
      ]),
    ).toEqual({
      renames: [{ from: 'verified/Old.txt', to: 'verified/New.txt' }],
      conflicts: [],
    });
  });

  it('refuses to rename a song onto another song', () => {
    const renameOntoOther = {
      from: 'verified/Old.txt',
      to: 'verified/Other.txt',
    };

    expect(
      planFileRenames([
        renameOntoOther,
        { from: 'verified/Other.txt', to: 'verified/Other.txt' },
      ]),
    ).toEqual({ renames: [], conflicts: [renameOntoOther] });
  });

  it('refuses to rename a song onto another song whose name differs only in case', () => {
    const renameOntoOther = {
      from: 'verified/Old.txt',
      to: 'verified/other.txt',
    };

    expect(
      planFileRenames([
        renameOntoOther,
        { from: 'verified/Other.txt', to: 'verified/Other.txt' },
      ]),
    ).toEqual({ renames: [], conflicts: [renameOntoOther] });
  });

  it('refuses two renames onto the same file name', () => {
    const renames = [
      { from: 'verified/A.txt', to: 'verified/Same.txt' },
      { from: 'verified/B.txt', to: 'verified/Same.txt' },
    ];

    expect(planFileRenames(renames)).toEqual({
      renames: [],
      conflicts: renames,
    });
  });

  it('allows a rename that only changes the case of the file name', () => {
    const caseRename = { from: 'verified/old.txt', to: 'verified/Old.txt' };

    expect(planFileRenames([caseRename])).toEqual({
      renames: [caseRename],
      conflicts: [],
    });
  });

  it('refuses to rename a song onto a file that is itself being renamed away', () => {
    const chain = [
      { from: 'verified/A.txt', to: 'verified/B.txt' },
      { from: 'verified/B.txt', to: 'verified/C.txt' },
    ];

    expect(planFileRenames(chain)).toEqual({
      renames: [chain[1]],
      conflicts: [chain[0]],
    });
  });
});
