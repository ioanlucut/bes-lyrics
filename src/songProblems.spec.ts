import { SIMPLE_SONG_MOCK_FILE_CONTENT } from '../mocks/index.js';
import { getSongProblems } from './songProblems.js';

const SONG_WITHOUT_SEQUENCE = `[title]
Titlu

[v1]
Text
`;

describe('songProblems', () => {
  it('finds nothing wrong with a valid song', () => {
    expect(getSongProblems('Titlu.txt', SIMPLE_SONG_MOCK_FILE_CONTENT)).toEqual(
      [],
    );
  });

  it('reports characters that are not allowed in the file name and content', () => {
    expect(
      getSongProblems(
        'Tit_lu.txt',
        SIMPLE_SONG_MOCK_FILE_CONTENT.replace('Row for v1', 'Row % for v1'),
      ),
    ).toEqual([
      'The file name contains characters that are not allowed: "_".',
      'The song contains characters that are not allowed: "%".',
    ]);
  });

  it('reports character and structure problems together', () => {
    expect(
      getSongProblems(
        'Titlu.txt',
        SONG_WITHOUT_SEQUENCE.replace('Text', 'Te$xt'),
      ),
    ).toEqual([
      'The song contains characters that are not allowed: "$".',
      '[sequence] is missing.',
    ]);
  });
});
