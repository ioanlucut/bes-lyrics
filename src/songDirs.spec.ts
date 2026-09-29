import { getCandidatesDir, getVerifiedDir } from './songDirs.js';

describe('songDirs', () => {
  it('returns a song directory as configured', () => {
    expect(getVerifiedDir({ VERIFIED_DIR: './mocks' })).toEqual('./mocks');
    expect(getCandidatesDir({ CANDIDATES_DIR: './docs' })).toEqual('./docs');
  });

  it('throws when the variable is not set', () => {
    expect(() => getVerifiedDir({})).toThrow(
      'VERIFIED_DIR is not set; add it to .env.',
    );
  });

  it.each(['./missing', './package.json'])(
    'throws when "%s" is not a directory',
    (dir) => {
      expect(() => getCandidatesDir({ CANDIDATES_DIR: dir })).toThrow(
        `CANDIDATES_DIR is "${dir}", which is not a directory.`,
      );
    },
  );

  it('throws when the verified directory contains no songs', () => {
    expect(() => getVerifiedDir({ VERIFIED_DIR: './docs' })).toThrow(
      'VERIFIED_DIR is "./docs", which contains no songs.',
    );
  });

  it('reads the process environment by default', () => {
    const { VERIFIED_DIR, CANDIDATES_DIR } = process.env;
    process.env.VERIFIED_DIR = './mocks';
    process.env.CANDIDATES_DIR = './docs';

    try {
      expect(getVerifiedDir()).toEqual('./mocks');
      expect(getCandidatesDir()).toEqual('./docs');
    } finally {
      process.env.VERIFIED_DIR = VERIFIED_DIR;
      process.env.CANDIDATES_DIR = CANDIDATES_DIR;
    }
  });
});
