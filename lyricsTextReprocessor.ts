// ---
// This is to be used sporadically for different use cases where we want to
// adjust the content of the candidates slides.
// ---
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { EMPTY_STRING, NEW_LINE } from './constants';
import { SongSection } from './src';

dotenv.config();

const TAG_START = '[';
const CHORUS_START_V_1 = ':/';
const CHORUS_START_V_2 = '/:';
const CHORUS_SEQUENCE = 'c';
const SEQUENCE_SEPARATOR = ',';

const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const normalizeContentByAddingBasicStructure = (sections: string[]) => {
  const content = [] as string[];
  let missingTitle;
  let hasChorus = false;
  let verseIndex = 1;

  sections.forEach((section, index) => {
    if (section.startsWith(TAG_START)) {
      content.push(section);

      return;
    }

    if (index === 0) {
      missingTitle = capitalizeFirstLetter(section.toLowerCase());

      return;
    }

    if (
      section.startsWith(CHORUS_START_V_1) ||
      section.startsWith(CHORUS_START_V_2)
    ) {
      hasChorus = true;
      content.push(
        [SongSection.CHORUS, NEW_LINE, section, NEW_LINE].join(EMPTY_STRING),
      );

      return;
    }

    content.push(
      [`[${verseIndex++}]`, NEW_LINE, section, NEW_LINE].join(EMPTY_STRING),
    );
  });

  const array = [
    missingTitle
      ? [
          SongSection.TITLE,
          NEW_LINE,
          missingTitle,
          NEW_LINE,
          NEW_LINE,
          SongSection.SEQUENCE,
          NEW_LINE,
          hasChorus
            ? _.range(1, verseIndex)
                .map((verse) => [verse, CHORUS_SEQUENCE])
                .flat()
                .join(SEQUENCE_SEPARATOR)
            : _.range(1, verseIndex).join(SEQUENCE_SEPARATOR),
          NEW_LINE,
        ].join(EMPTY_STRING)
      : EMPTY_STRING,
    ...content,
  ].filter(Boolean);

  return _.trim(_.flatten(array).join(NEW_LINE));
};

const reprocess = (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(__dirname, dir, fileName);
    const fileContent = fs.readFileSync(filePath).toString();

    const songSections = fileContent
      .replaceAll('\r\n\r\n\r\n', '\r\n\r\n')
      .split(/\r\n\r\n/gim)
      .filter(Boolean)
      .map(_.trim);

    fs.writeFileSync(
      filePath,
      normalizeContentByAddingBasicStructure(songSections),
    );
  });
};

(async () => {
  reprocess(process.env.CANDIDATES_DIR);
})();
