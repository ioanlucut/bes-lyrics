import { getLeadsheetSyncErrors } from './leadsheetSyncValidator.js';

const getSong = ({
  content,
  contentHash = 'hash',
  id = 'song-id',
  title = 'Cântarea mea',
}: {
  content: string;
  contentHash?: string;
  id?: string;
  title?: string;
}) => `[title]
${title} {composer: {Compozitor}, key: {D}, id: {${id}}, contentHash: {${contentHash}}}

[sequence]
v1

[v1]
${content}
`;

describe('leadsheetSyncValidator', () => {
  it('should accept a lead sheet that only adds chords to its canonical song', () => {
    const canonicalSong = getSong({ content: 'Aceasta este cântarea.' });
    const leadsheetSong = getSong({
      content: '^{D}Aceasta este ^{G}cântarea.',
    });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toEqual([]);
  });

  it('should reject chord-free lead-sheet files', () => {
    const canonicalSong = getSong({ content: 'Aceasta este cântarea.' });
    const leadsheetSong = getSong({ content: 'Aceasta este cântarea.' });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Lead sheet does not contain chord markup in song sections.',
    );
  });

  it('should not count chord markup in metadata as a chorded song section', () => {
    const canonicalSong = getSong({ content: 'Aceasta este cântarea.' });
    const leadsheetSong = getSong({
      content: 'Aceasta este cântarea.',
      contentHash: 'hash^{D}',
    });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Lead sheet does not contain chord markup in song sections.',
    );
  });

  it('should reject canonical songs containing chord markup', () => {
    const canonicalSong = getSong({ content: '^{D}Aceasta este cântarea.' });
    const leadsheetSong = getSong({ content: '^{D}Aceasta este cântarea.' });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Canonical song contains chord markup.',
    );
  });

  it('should reject malformed chord starts in canonical songs', () => {
    const canonicalSong = getSong({
      content: 'Aceasta ^{Am este cântarea.',
    });
    const leadsheetSong = getSong({
      content: '^{D}Aceasta ^{Am este cântarea.',
    });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Canonical song contains chord markup.',
    );
  });

  it('should reject lyric drift after removing chords', () => {
    const canonicalSong = getSong({ content: 'Aceasta este cântarea.' });
    const leadsheetSong = getSong({
      content: '^{D}Aceasta este altă cântare.',
    });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Lead sheet section "[v1]" differs from canonical song after removing chords.',
    );
  });

  it('should reject pairing songs with different IDs', () => {
    const canonicalSong = getSong({
      content: 'Aceasta este cântarea.',
      id: 'canonical-id',
    });
    const leadsheetSong = getSong({
      content: '^{D}Aceasta este cântarea.',
      id: 'leadsheet-id',
    });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Lead sheet metadata "id" differs from canonical song.',
    );
  });

  it('should reject malformed chords', () => {
    const canonicalSong = getSong({ content: 'Aceasta este cântarea.' });
    const leadsheetSong = getSong({ content: '^{7A}Aceasta este cântarea.' });

    expect(getLeadsheetSyncErrors(canonicalSong, leadsheetSong)).toContain(
      'Invalid chord markup: ^{7A}.',
    );
  });
});
