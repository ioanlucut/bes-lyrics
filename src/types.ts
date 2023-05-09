export enum SongSection {
  BRIDGE = '[bridge]',
  BRIDGE_2 = '[bridge 2]',
  CHORUS = '[chorus]',
  CHORUS_2 = '[chorus 2]',
  ENDING = '[ending]',
  PRECHORUS = '[prechorus]',
  PRECHORUS_2 = '[prechorus 2]',
  SEQUENCE = '[sequence]',
  TAGS = '[tags]',
  TITLE = '[title]',
  VERSE_1 = '[1]',
  VERSE_2 = '[2]',
  VERSE_3 = '[3]',
  VERSE_4 = '[4]',
  VERSE_5 = '[5]',
  VERSE_6 = '[6]',
  VERSE_7 = '[7]',
  VERSE_8 = '[8]',
  VERSE_9 = '[9]',
  VERSE_10 = '[10]',
}

export const SequenceChar = {
  [SongSection.VERSE_1]: '1',
  [SongSection.VERSE_2]: '2',
  [SongSection.VERSE_3]: '3',
  [SongSection.VERSE_4]: '4',
  [SongSection.VERSE_5]: '5',
  [SongSection.VERSE_6]: '6',
  [SongSection.VERSE_7]: '7',
  [SongSection.VERSE_8]: '8',
  [SongSection.VERSE_9]: '9',
  [SongSection.VERSE_10]: '10',
  [SongSection.CHORUS]: 'c',
  [SongSection.CHORUS_2]: 't',
  [SongSection.PRECHORUS]: 'p',
  [SongSection.PRECHORUS_2]: 'q',
  [SongSection.ENDING]: 'e',
  [SongSection.BRIDGE]: 'b',
  [SongSection.BRIDGE_2]: 'w',
} as const;
