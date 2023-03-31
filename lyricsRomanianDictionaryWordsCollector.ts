import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dictionaryRo, { Dictionary } from 'dictionary-ro';
import nspell from 'nspell';
import NSpell from 'nspell';
import * as util from 'util';
import dotenv from 'dotenv';

const CHARS_SEPARATORS = /[ !(),./:;?’”„]+/;
const NEW_LINE = '\n';
const CARRIAGE_RETURN = '\r';
const ERROR_CODE = 1;

export enum SongSection {
  SEQUENCE = '[sequence]',
}

dotenv.config();

const incorrectWords = [] as string[];

const getSongInSections = (songText: string) =>
  songText
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(_.trim);

const reprocess = (strings: string[], speller: NSpell) => {
  strings.forEach((fileName) => {
    const filePath = path.join(__dirname, process.env.CANDIDATES_DIR, fileName);

    const songAsString = fs.readFileSync(filePath).toString();
    const songSections = getSongInSections(songAsString);
    const normalizedSongSections = songSections.map((section) => {
      if (section.startsWith('[')) {
        return [CARRIAGE_RETURN, section];
      }
      return section;
    });
    const songSectionsTuples = getSongInSections(
      _.trim(_.flatten(normalizedSongSections).join(NEW_LINE)),
    );

    const iterateAndCollect = (wordOrExpression: string) => {
      wordOrExpression
        .split(CHARS_SEPARATORS)
        .filter(Boolean)
        .forEach((relevantWord) => {
          if (!speller.correct(relevantWord)) {
            incorrectWords.push(relevantWord);
          }
        });
    };

    const peekByCollectingUnknownWords = (wordOrExpressionChunks: string[]) =>
      wordOrExpressionChunks.map(iterateAndCollect);

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
          .forEach(peekByCollectingUnknownWords);
      }
    }
  });
};

(async () => {
  const getDictionaryAsync = util.promisify(dictionaryRo);
  const romanianDictionary = (await getDictionaryAsync()) as Dictionary;
  const speller = nspell(romanianDictionary);
  reprocess(fs.readdirSync(process.env.CANDIDATES_DIR), speller);

  if (!_.isEmpty(incorrectWords)) {
    console.log(
      `We have spotted incorrect/unknown words: ${_.uniq(incorrectWords)
        .sort()
        .join(NEW_LINE)}`,
    );

    process.exit(ERROR_CODE);
  }
})();
