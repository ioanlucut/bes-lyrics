import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import dictionaryRo, { Dictionary } from 'dictionary-ro';
import nspell from 'nspell';
import * as util from 'util';
import NSpell from 'nspell';

const OUTPUT_DIR = './inverification';
const EMPTY_STRING = '';
const NEW_LINE = '\n';
const CARRIAGE_RETURN = '\r';

export enum SongSection {
  TITLE = '[title]',
  SEQUENCE = '[sequence]',
}

const incorrectWords = [] as string[];

const getSongInSections = (songText: string) =>
  songText
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(_.trim);

const reprocess = (strings: string[], speller: NSpell) => {
  strings.forEach((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));

    console.log(`Processing "${fileName}" ..`);

    const songAsString = fs.readFileSync(filePath).toString();
    const songSections = getSongInSections(songAsString);

    const fileNameFromTheTitle =
      !songSections[1] || songSections[1] === SongSection.TITLE
        ? songSections[2]
        : songSections[1];

    const computedTitle = _.trim(
      fileNameFromTheTitle
        .replaceAll(':/', EMPTY_STRING)
        .replaceAll('/:', EMPTY_STRING)
        .replaceAll('.', EMPTY_STRING)
        .replaceAll('!', EMPTY_STRING)
        .replaceAll('?', EMPTY_STRING)
        .replaceAll('„', EMPTY_STRING)
        .replaceAll('”', EMPTY_STRING)
        .replaceAll(':', EMPTY_STRING)
        .replaceAll('  ', EMPTY_STRING)
        .replaceAll(',', EMPTY_STRING)
        .replaceAll('1X', EMPTY_STRING)
        .replaceAll('1x', EMPTY_STRING)
        .replaceAll('2X', EMPTY_STRING)
        .replaceAll('2x', EMPTY_STRING)
        .replaceAll('3X', EMPTY_STRING)
        .replaceAll('3x', EMPTY_STRING)
        .replaceAll('4X', EMPTY_STRING)
        .replaceAll('4x', EMPTY_STRING),
    );

    const maybeNewFilePath = path.join(
      __dirname,
      OUTPUT_DIR,
      `${computedTitle}.txt`,
    );

    const normalizedContent = _.trim(
      _.flatten(
        songSections.map((section) => {
          if (section.startsWith('[')) {
            return [CARRIAGE_RETURN, section];
          }
          return section;
        }),
      ).join(NEW_LINE),
    );

    const songSectionsTuples = getSongInSections(normalizedContent);

    for (
      let sectionIndex = 0;
      sectionIndex < songSectionsTuples.length;
      sectionIndex = sectionIndex + 2
    ) {
      const sectionKey = songSectionsTuples[sectionIndex] as SongSection;
      const sectionContent = songSectionsTuples[sectionIndex + 1];

      if (sectionKey !== SongSection.SEQUENCE) {
        sectionContent
          .split(/\n/gim)
          .map((sectionRow) => sectionRow.split(/ /gi))
          .forEach((wordOrExpressionChunks: string[]) =>
            wordOrExpressionChunks.map((wordOrExpression) => {
              wordOrExpression
                .split(/[ !(),./:;?’”„]+/)
                .filter(Boolean)
                .forEach((relevantWord) => {
                  if (!speller.correct(relevantWord)) {
                    incorrectWords.push(relevantWord);
                  }
                });
            }),
          );
      }

      if (!_.isEqual(songAsString, songAsString)) {
        fs.writeFileSync(maybeNewFilePath, normalizedContent);

        console.log(`"${fileName}" successfully processed.`);
      } else {
        console.log(`"${fileName}" ignored as the content is not changed.`);
      }
    }
  });
};

(async () => {
  try {
    const getDictionaryAsync = util.promisify(dictionaryRo);
    const romanianDictionary = (await getDictionaryAsync()) as Dictionary;
    const speller = nspell(romanianDictionary);
    reprocess(fs.readdirSync(OUTPUT_DIR), speller);

    if (!_.isEmpty(incorrectWords)) {
      console.log(
        `We have spotted incorrect/unknown words: ${_.uniq(incorrectWords)
          .sort()
          .join(NEW_LINE)}`,
      );
    }
  } catch (error) {
    console.error(error);
  }
})();
