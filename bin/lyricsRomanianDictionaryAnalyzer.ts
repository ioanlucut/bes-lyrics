// ---
// This plugin is listing the unknown words found in the lyrics, but it's not
// 100% reliable thus it cannot be used as a validator per se
// ---

import dictionaryRo, { Dictionary } from 'dictionary-ro';
import dotenv from 'dotenv';
import fs from 'fs';
import {
  first,
  flatten,
  includes,
  isEmpty,
  trim,
  uniq,
  without,
} from 'lodash-es';
import { parseArgs } from 'node:util';
import { default as NSpell, default as nspell } from 'nspell';
import path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
import * as util from 'util';
import {
  CHARS_SEPARATORS,
  ERROR_CODE,
  NEW_LINE,
  SongSection,
  TEST_FILE,
  TXT_EXTENSION,
  getSongInSectionTuples,
  getTitleByRawSection,
  readTxtFilesRecursively,
} from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CUSTOM_DICTIONARY_RO_FILENAME = 'custom-dictionary_ro.txt';

dotenv.config();

const analyzeAndGet = async (dir: string, speller: NSpell) => {
  const incorrectWords = [] as string[];

  (await readTxtFilesRecursively(dir))
    .filter((file) => !includes(file, TEST_FILE))
    .filter((filePath) => path.extname(filePath) === TXT_EXTENSION)
    .forEach((filePath) => {
      const songAsString = fs.readFileSync(filePath).toString();
      const songSections = getSongInSectionTuples(songAsString);
      const normalizedSongSections = songSections.map((section) => {
        if (section.startsWith('[')) {
          return [NEW_LINE, section];
        }
        return section;
      });
      const songSectionsTuples = getSongInSectionTuples(
        trim(flatten(normalizedSongSections).join(NEW_LINE)),
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
        const sectionKey = songSectionsTuples[sectionIndex];
        const sectionContent = songSectionsTuples[sectionIndex + 1] as string;

        if (sectionKey !== SongSection.SEQUENCE) {
          const sectionToBeVerified =
            sectionKey === SongSection.TITLE
              ? // Ignore the meta data
                (first(getTitleByRawSection(sectionContent)) as string)
              : sectionContent;

          sectionToBeVerified
            .split(/\n/gim)
            .map((sectionRow) => sectionRow.split(/ /gi))
            .forEach(peekByCollectingUnknownWords);
        }
      }
    });

  return incorrectWords;
};

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
  '..',
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

const rawWords = await analyzeAndGet(process.env.VERIFIED_DIR, speller);
const unknownOrIncorrectWords = without(uniq(rawWords).sort(), NEW_LINE);

if (!isEmpty(unknownOrIncorrectWords)) {
  console.log(
    `We have spotted incorrect/unknown words: ${unknownOrIncorrectWords.join(
      NEW_LINE,
    )}`,
  );

  if (saveToDictionary) {
    fs.writeFileSync(
      customDictionaryFileName,
      uniq([...existingCustomWords, ...unknownOrIncorrectWords]).join(NEW_LINE),
    );
  }

  process.exit(ERROR_CODE);
}
