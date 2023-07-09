export enum SequenceChar {
  VERSE = 'v',
  PRECHORUS = 'p',
  CHORUS = 'c',
  BRIDGE = 'b',
  ENDING = 'e',
}

/**
 * Verse 1 will always be 1 (cannot be just `v`)
 */
const V_START_INDEX = 0;

/**
 * Pre-chorus 1 will always be 1 (cannot be just `p`, thus `p,p2`)
 */
const P_START_INDEX = 1;

/**
 * Chorus 1 will always be 1 (cannot be just `c`, thus `c,c2`)
 */
const C_START_INDEX = 1;

/**
 * Bridge 1 will always be 1 (cannot be just `b`, thus `b,b2`)
 */

const B_START_INDEX = 1;

export const SongSection = {
  SEQUENCE: '[sequence]',
  TITLE: '[title]',
  VERSE: (index = 0) =>
    `[${
      index > V_START_INDEX
        ? `${SequenceChar.VERSE}${index}`
        : SequenceChar.VERSE
    }]`,
  PRECHORUS: (index = 0) =>
    `[${
      index > P_START_INDEX
        ? `${SequenceChar.PRECHORUS}${index}`
        : SequenceChar.PRECHORUS
    }]`,
  CHORUS: (index = 0) =>
    `[${
      index > C_START_INDEX
        ? `${SequenceChar.CHORUS}${index}`
        : SequenceChar.CHORUS
    }]`,
  BRIDGE: (index = 0) =>
    `[${
      index > B_START_INDEX
        ? `${SequenceChar.BRIDGE}${index}`
        : SequenceChar.BRIDGE
    }]`,
  ENDING: `[${SequenceChar.ENDING}]`,
};

export enum SongMeta {
  ALTERNATIVE = 'alternative',
  AUTHOR = 'author',
  VERSION = 'version',
}
