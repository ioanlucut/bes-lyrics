import { reprocess } from './contentStructureReprocessor.js';

describe('contentStructureReprocessor', () => {
  it('prints a valid song in the canonical format', () => {
    expect(
      reprocess(`[title]
Cântarea mea {id: {abc}}

[sequence]
v1,c

[v1]
Prima strofă

[c]
Refrenul
`),
    ).toMatchInlineSnapshot(`
"[title]
Cântarea mea {alternative: {*}, composer: {*}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {*}, genre: {*}, rcId: {*}, id: {abc}, contentHash: {6f1515}}

[sequence]
v1,c

[v1]
Prima strofă

[c]
Refrenul
"
`);
  });

  it('leaves a song in the canonical format unchanged', () => {
    const canonicalSong = reprocess(`[title]
Cântarea mea {id: {abc}}

[sequence]
v1

[v1]
Prima strofă
`);

    expect(reprocess(canonicalSong)).toEqual(canonicalSong);
  });

  it('throws when the song has no sequence', () => {
    expect(() =>
      reprocess(`[title]
Cântarea mea

[v1]
Prima strofă
`),
    ).toThrow('[sequence] is missing.');
  });

  it('throws when the sequence skips a verse', () => {
    expect(() =>
      reprocess(`[title]
Cântarea mea

[sequence]
v1,v3

[v1]
Prima strofă

[v3]
A treia strofă
`),
    ).toThrow('are not consecutive');
  });
});
