// ---
// This plugin is listing the unknown words found in the lyrics, but it's not
// 100% reliable thus it cannot be used as a validator per se
// ---

import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import dictionaryRo, { Dictionary } from 'dictionary-ro';
import nspell from 'nspell';
import NSpell from 'nspell';
import * as util from 'util';
import { parseArgs } from 'node:util';
import dotenv from 'dotenv';
import {
  CARRIAGE_RETURN,
  CHARS_SEPARATORS,
  ERROR_CODE,
  NEW_LINE,
  TEST_FILE,
} from './constants';
import { SongSection } from './src';

const CUSTOM_DICTIONARY_RO_FILENAME = 'custom-dictionary_ro.txt';

dotenv.config();

const getSongInSections = (songText: string) =>
  songText
    .split(/(\[.*])/gim)
    .filter(Boolean)
    .map(_.trim);

const analyzeAndGet = (dir: string, speller: NSpell) => {
  const incorrectWords = [] as string[];

  fs.readdirSync(dir)
    .filter((file) => !_.isEqual(file, TEST_FILE))
    .forEach((fileName) => {
      const filePath = path.join(__dirname, dir, fileName);

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

  return incorrectWords;
};

(async () => {
  const {
    values: { saveToDictionary },
  } = parseArgs({
    options: {
      saveToDictionary: {
        type: 'boolean',
      },
    },
  });

  const customDictionaryFileName = path.join(
    __dirname,
    CUSTOM_DICTIONARY_RO_FILENAME,
  );
  const existingCustomWordsAsString = fs
    .readFileSync(customDictionaryFileName)
    .toString();
  const existingCustomWords = existingCustomWordsAsString.split(NEW_LINE);

  const getDictionaryAsync = util.promisify(dictionaryRo);
  const romanianDictionary = (await getDictionaryAsync()) as Dictionary;
  const speller = nspell(romanianDictionary).personal(
    existingCustomWordsAsString,
  );

  const rawWords = analyzeAndGet(process.env.VERIFIED_DIR, speller);
  const unknownOrIncorrectWords = _.without(
    _.uniq(rawWords).sort(),
    CARRIAGE_RETURN,
    NEW_LINE,
  );

  if (!_.isEmpty(unknownOrIncorrectWords)) {
    console.log(
      `We have spotted incorrect/unknown words: ${unknownOrIncorrectWords.join(
        NEW_LINE,
      )}`,
    );

    if (saveToDictionary) {
      fs.writeFileSync(
        customDictionaryFileName,
        _.uniq([...existingCustomWords, ...unknownOrIncorrectWords])
          .sort()
          .join(NEW_LINE),
      );
    }

    process.exit(ERROR_CODE);
  }
})();
