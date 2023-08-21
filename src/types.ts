export enum SequenceChar {
  /**
   * Simple verse section
   */
  VERSE = 'v',

  /**
   * Pre-chorus section
   */
  PRECHORUS = 'p',

  /**
   * Chorus section
   */
  CHORUS = 'c',

  /**
   * Bridge section
   */
  BRIDGE = 'b',

  /**
   * Ending section
   */
  ENDING = 'e',

  /**
   * Recital section
   */
  RECITAL = 's',
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

/**
 * Recital 1 will always be 1 (cannot be just `s`, thus `s,s2`)
 */
const S_START_INDEX = 1;

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
  RECITAL: (index = 0) =>
    `[${
      index > S_START_INDEX
        ? `${SequenceChar.RECITAL}${index}`
        : SequenceChar.RECITAL
    }]`,
  ENDING: `[${SequenceChar.ENDING}]`,
};

export enum SongMeta {
  /**
   * Alternative song title
   */
  ALTERNATIVE = 'alternative',

  /**
   * Song author
   */
  AUTHOR = 'author',

  /**
   * Song version (can be multiple / duplicated)
   */
  VERSION = 'version',

  /**
   * Song content hash (used to detect changes between the corrections & do partial deployments)
   */
  CONTENT_HASH = 'contentHash',

  /**
   * Own BES song ID
   */
  ID = 'id',

  /**
   * Resurse creștine song ID
   */
  RC_ID = 'rcId',
}

export type Section = {
  // E.g. v1, v2, v3, v4, etc.
  sectionIdentifier: string;

  // E.g. strophe/chorus content
  content: string;
};

/**
 * Represents the sections of the song as a hash map
 */
export type SongSectionsMap = Record<string, Section>;

/**
 * Represents the order of the sections from the hash-map as an array
 */
export type SongSectionOrder = string[];

export type SongAST = {
  alternative?: string;
  author?: string;
  contentHash: string;
  id: string;
  rcId?: string;
  sectionOrder: SongSectionOrder;
  sectionsMap: SongSectionsMap;
  sequence: string[];
  title: string;
  version?: string;
};
