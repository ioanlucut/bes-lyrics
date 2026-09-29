import { crlf, LF } from 'crlf-normalize';
import { EMPTY_STRING } from './constants.js';

const getRegexNotMatchingStartOfALine = (text: string) =>
  new RegExp(`(?<!^)(?<!/: )${text}(?!\\w)`, 'gm');

// A name is replaced only where a word starts, so it never changes the middle
// of another word.
const getRegexAtWordStart = (text: string) =>
  new RegExp(`(?<!\\p{L})${text}`, 'gu');

/**
 * Reprocesses the song content by just replacing certain string sections.
 * This is useful for songs that have been processed with the old version
 * of the app and bring the version up to date.
 *
 * @param songContent The song content to be reprocessed
 */
export const reprocess = (songContent: string) =>
  crlf(songContent, LF)
    .replaceAll(/\r/gi, EMPTY_STRING)
    // Not at the beginning of the line
    .replaceAll(getRegexNotMatchingStartOfALine('Nici o'), 'Nicio')
    .replaceAll(getRegexNotMatchingStartOfALine('nici o'), 'nicio')
    .replaceAll(getRegexNotMatchingStartOfALine('Nici un'), 'Niciun')
    .replaceAll(getRegexNotMatchingStartOfALine('nici un'), 'niciun')
    .replaceAll(getRegexNotMatchingStartOfALine('nici una'), 'niciuna')
    .replaceAll(getRegexNotMatchingStartOfALine('Nici una'), 'Niciuna')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Dumnezeu'), 'lui Dumnezeu')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Isus'), 'lui Isus')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Hristos'), 'lui Hristos')
    .replaceAll(getRegexNotMatchingStartOfALine('Lui Mesia'), 'lui Mesia')

    // Wherever a word starts
    .replaceAll(getRegexAtWordStart('doamne'), 'Doamne')
    .replaceAll(getRegexAtWordStart('domnul'), 'Domnul')
    .replaceAll(getRegexAtWordStart('dumnezeu'), 'Dumnezeu')
    .replaceAll(getRegexAtWordStart('golgota'), 'Golgota')
    .replaceAll(getRegexAtWordStart('isus'), 'Isus')
    .replaceAll(getRegexAtWordStart('mesia'), 'Mesia')
    .replaceAll(getRegexAtWordStart('miel'), 'Miel')
    .replaceAll(getRegexAtWordStart('Cristos'), 'Hristos')

    // Special chars
    .replaceAll('ş', 'ș')
    .replaceAll('Ş', 'Ș')
    .replaceAll('ţ', 'ț')
    .replaceAll('Ţ', 'Ț')
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll("'", '’')
    .replaceAll('"', '”')
    .replaceAll('…', '...')
    .replaceAll('//', '/');
