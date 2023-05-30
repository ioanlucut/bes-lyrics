import { reprocessTextContent } from './textEnhancer';

describe('contentReprocessor', () => {
  it('should work correctly #1', () => {
    expect(
      reprocessTextContent(`
ş
ţ
doamne
domnul
duhul
dumnezeu
golgota
isus
isuse
mesia
…
`),
    ).toMatchInlineSnapshot(`
      "ș
      ț
      Doamne
      Domnul
      Duhul
      Dumnezeu
      Golgota
      Isus
      Isuse
      Mesia
      ..."
    `);
  });
});
