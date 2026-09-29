import { languages, parsers, printers } from './index.js';

const UNFORMATTED_SONG = `[title]
Cântarea mea {id: {abc}}

[sequence]
v1

[v1]
Prima strofă
`;

describe('prettier-bes-txt-plugin', () => {
  it('claims ".txt" files for the song parser', () => {
    expect(languages).toEqual([
      expect.objectContaining({ extensions: ['.txt'], parsers: ['bes-txt'] }),
    ]);
  });

  it('formats a song with the song printer', () => {
    const { astFormat, parse } = parsers['bes-txt'];
    const songAST = parse(UNFORMATTED_SONG);

    expect(astFormat).toEqual('bes-txt-ast');
    expect(printers['bes-txt-ast'].print({ getValue: () => songAST }))
      .toMatchInlineSnapshot(`
"[title]
Cântarea mea {alternative: {*}, composer: {*}, writer: {*}, arranger: {*}, interpreter: {*}, band: {*}, key: {*}, tempo: {*}, tags: {*}, version: {*}, genre: {*}, rcId: {*}, id: {abc}, contentHash: {fd3e9c}}

[sequence]
v1

[v1]
Prima strofă
"
`);
  });
});
