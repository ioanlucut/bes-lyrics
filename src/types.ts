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

export const SongSection = {
  SEQUENCE: '[sequence]',
  TITLE: '[title]',
};

/**
 * Meta information about the song.
 *
 * Inspired from https://github.com/cgnieder/leadsheets/blob/6fdc9fda64166b35fbcff736fa6938ba77a14233/leadsheets_en.tex#L788-L849
 */
export enum SongMeta {
  /* Alternative song title */
  ALTERNATIVE = 'alternative',

  /* Song version (can be multiple / duplicated) */
  VERSION = 'version',

  /* Song content hash (used to detect changes between the corrections & do partial deployments) */
  CONTENT_HASH = 'contentHash',

  /* Own BES song ID */
  ID = 'id',

  /* Resurse creștine song ID */
  RC_ID = 'rcId',

  /* The person who single-handedly created the melody and wrote the lyrics is called a writer. */
  WRITER = 'writer',

  /* The composer of the song. A person who creates the melody of a song is called a music composer. */
  COMPOSER = 'composer',

  /* Whoever arranged the song. An arranger is someone who takes an existing song and gives it new life. */
  ARRANGER = 'arranger',

  /* The interpreter of the song. */
  INTERPRETER = 'interpreter',

  /* The band who plays or played the song. */
  BAND = 'band',

  /* The genre of the song. */
  GENRE = 'genre',

  /* The key of the song. */
  KEY = 'key',

  /* The tempo of the song. */
  TEMPO = 'tempo',

  /* A comma separated list of tags. */
  TAGS = 'tags',
}

export type Section = {
  // E.g. v1, v2, v3, v4, etc.
  sectionIdentifier: string;

  // E.g. strophe/chorus content
  content: string;

  // E.g. v, p, c, b, e, s
  sectionSequenceType: SequenceChar;
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
  sectionOrder: SongSectionOrder;
  sectionsMap: SongSectionsMap;
  sequence: string[];
  alternative?: string;
  arranger?: string;
  band?: string;
  composer?: string;
  contentHash: string;
  genre?: string;
  id: string;
  interpreter?: string;
  key?: string;
  rcId?: string;
  tags?: string;
  tempo?: string;
  title: string;
  version?: string;
  writer?: string;
};

/** A song file as read from disk. */
export type SongFile = {
  content: string;
  fileName: string;
  filePath: string;
};
