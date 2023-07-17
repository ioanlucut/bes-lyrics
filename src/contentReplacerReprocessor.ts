import { trim } from 'lodash-es';
import { COMMA, EMPTY_STRING, NEW_LINE_TUPLE } from './constants.js';
import { SongSection } from './types.js';
import {
  computeUniqueContentHash,
  getUniqueId,
  isKnownSongSequence,
  isTestEnv,
} from './core.js';

/**
 * Reprocesses the song content by just replacing certain string sections.
 * This is useful for songs that have been processed with the old version
 * of the app and bring the version up to date.
 *
 * @param songContent The song content to be reprocessed
 */
export const reprocess = (songContent: string) => {
  return songContent
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll('ş', 'ș')
    .replaceAll('Ş', 'Ș')
    .replaceAll('ţ', 'ț')
    .replaceAll('Ţ', 'Ț')
    .replaceAll('doamne', 'Doamne')
    .replaceAll('domnul', 'Domnul')
    .replaceAll('dumnezeu', 'Dumnezeu')
    .replaceAll('golgota', 'Golgota')
    .replaceAll('isus', 'Isus')
    .replaceAll('isuse', 'Isuse')
    .replaceAll('mesia', 'Mesia')
    .replaceAll('miel', 'Miel')
    .replaceAll("'", '’')
    .replaceAll('‘', '’')
    .replaceAll('"', '”')
    .replaceAll('…', '...')
    .replaceAll('//', '/')
    .replaceAll('[1]', SongSection.VERSE(1))
    .replaceAll('[2]', SongSection.VERSE(2))
    .replaceAll('[3]', SongSection.VERSE(3))
    .replaceAll('[4]', SongSection.VERSE(4))
    .replaceAll('[5]', SongSection.VERSE(5))
    .replaceAll('[6]', SongSection.VERSE(6))
    .replaceAll('[7]', SongSection.VERSE(7))
    .replaceAll('[8]', SongSection.VERSE(8))
    .replaceAll('[9]', SongSection.VERSE(9))
    .replaceAll('[10]', SongSection.VERSE(10))
    .replaceAll('[11]', SongSection.VERSE(11))
    .replaceAll('[12]', SongSection.VERSE(12))
    .replaceAll('[13]', SongSection.VERSE(13))
    .replaceAll('[chorus]', SongSection.CHORUS())
    .replaceAll('[chorus 2]', SongSection.CHORUS(2))
    .replaceAll('[bridge]', SongSection.BRIDGE())
    .replaceAll('[bridge 2]', SongSection.BRIDGE(2))
    .replaceAll('[prechorus]', SongSection.PRECHORUS())
    .replaceAll('[prechorus 2]', SongSection.PRECHORUS(2))
    .replaceAll('[ending]', SongSection.ENDING)
    .replaceAll('[Sequence]', SongSection.SEQUENCE)
    .replaceAll('[Title]', SongSection.TITLE)
    .replaceAll('#TEMP_ID', getUniqueId())
    .replaceAll(
      '#TEMP_HASH_CONTEN',
      `#${computeUniqueContentHash(songContent)}`,
    )
    .replaceAll(
      isTestEnv() ? /(\[sequence])(\n.*)/gim : /(\[sequence])(\r\n.*)/gim,
      (ignore, firstMatch, secondMatch) => {
        const secondMatchRemapped = secondMatch
          .split(COMMA)
          .map((sequenceChar: string) => {
            switch (trim(sequenceChar)) {
              case '1':
                return SongSection.VERSE(1);
              case '2':
                return SongSection.VERSE(2);
              case '3':
                return SongSection.VERSE(3);
              case '4':
                return SongSection.VERSE(4);
              case '5':
                return SongSection.VERSE(5);
              case '6':
                return SongSection.VERSE(6);
              case '7':
                return SongSection.VERSE(7);
              case '8':
                return SongSection.VERSE(8);
              case '9':
                return SongSection.VERSE(9);
              case '10':
                return SongSection.VERSE(10);
              case '11':
                return SongSection.VERSE(11);
              case '12':
                return SongSection.VERSE(12);
              case 'c':
                return SongSection.CHORUS();
              case 't':
                return SongSection.CHORUS(2);
              case 'b':
                return SongSection.BRIDGE();
              case 'w':
                return SongSection.BRIDGE(2);
              case 'p':
                return SongSection.PRECHORUS();
              case 'q':
                return SongSection.PRECHORUS(2);
              case 'e':
                return SongSection.ENDING;
              default: {
                if (isKnownSongSequence(sequenceChar)) {
                  return sequenceChar;
                }

                throw new Error(`Unknown ${sequenceChar} sequence char.`);
              }
            }
          })
          .map((charWithMarkup: string) =>
            charWithMarkup
              .replaceAll('[', EMPTY_STRING)
              .replaceAll(']', EMPTY_STRING),
          )
          .join(COMMA);

        return [
          firstMatch.replaceAll(/[\r\n]/gim, EMPTY_STRING),
          secondMatchRemapped.replaceAll(/[\r\n]/gim, EMPTY_STRING),
        ].join(NEW_LINE_TUPLE);
      },
    );
};
