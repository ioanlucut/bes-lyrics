import _ from 'lodash';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './md';
const EMPTY_STRING = '';
const EMPTY_SPACE = ' ';

enum SongSection {
  VERSE_1 = '[1]',
  VERSE_2 = '[2]',
  VERSE_3 = '[3]',
  VERSE_4 = '[4]',
  VERSE_5 = '[5]',
  VERSE_6 = '[6]',
  VERSE_7 = '[7]',
  VERSE_8 = '[8]',
  BRIDGE = '[bridge]',
  BRIDGE_2 = '[bridge 2]',
  CHORUS = '[chorus]',
  CHORUS_2 = '[chorus 2]',
  ENDING = '[ending]',
  PRECHORUS = '[prechorus]',
  PRECHORUS_2 = '[prechorus 2]',
  TITLE = '[title]',
  SEQUENCE = '[sequence]',
}

const SONG_SECTION_LABEL = {
  [SongSection.VERSE_1]: 'Verse 1',
  [SongSection.VERSE_2]: 'Verse 2',
  [SongSection.VERSE_3]: 'Verse 3',
  [SongSection.VERSE_4]: 'Verse 4',
  [SongSection.VERSE_5]: 'Verse 5',
  [SongSection.VERSE_6]: 'Verse 6',
  [SongSection.VERSE_7]: 'Verse 7',
  [SongSection.VERSE_8]: 'Verse 8',
  [SongSection.BRIDGE]: 'Bridge',
  [SongSection.BRIDGE_2]: 'Bridge',
  [SongSection.CHORUS]: 'Chorus',
  [SongSection.CHORUS_2]: 'Chorus 2',
  [SongSection.ENDING]: 'Ending',
  [SongSection.PRECHORUS]: 'Prechorus',
  [SongSection.PRECHORUS_2]: 'Prechorus 2',
  [SongSection.TITLE]: 'Title',
  [SongSection.SEQUENCE]: 'ence',
};

const generateFileNameByTitle = (title: string) => {
  const normalizedTitle = title.replaceAll('/', EMPTY_STRING).replaceAll('!', EMPTY_STRING);

  const fileName = _.capitalize(
    _.trimStart(_.trimEnd(normalizedTitle)).split(EMPTY_SPACE).filter(Boolean).join(EMPTY_SPACE).toLowerCase(),
  );

  return `${OUTPUT_DIR}/BES 2023 ${fileName}`;
};

(async () => {
  const filenames = fs.readdirSync(OUTPUT_DIR);

  [filenames[0]].forEach((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));
    console.log('filePath', filePath);
    const fileAsMarkdown = fs.readFileSync(filePath).toString();
    const songInSections = fileAsMarkdown
      .split(/(\[.*])/gim)
      .filter(Boolean)
      .map(_.trim);

    for (let sectionIndex = 0; sectionIndex < songInSections.length; sectionIndex = sectionIndex + 2) {
      const sectionKey = songInSections[sectionIndex];
      const sectionContent = songInSections[sectionIndex + 1];

      console.log(SONG_SECTION_LABEL[sectionKey as SongSection]);
      console.log(sectionContent);
      console.log('----');
    }

    // console.log('songInSections', songInSections);
  });
})();
