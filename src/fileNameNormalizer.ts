import _ from 'lodash';
import { Iconv } from 'iconv';
import { EMPTY_STRING, TXT_EXTENSION } from '../constants';

const iconv = new Iconv('UTF-8', 'latin1');

export const normalizeFileName = (fileName: string) => {
  const filenameWithPotentiallyDiacritics = fileName
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll('!', EMPTY_STRING)
    .replaceAll(',', EMPTY_STRING)
    .replaceAll(';', EMPTY_STRING)
    .replaceAll('/', EMPTY_STRING)
    .replaceAll('/', EMPTY_STRING)
    .replaceAll(':', EMPTY_STRING)
    .replaceAll('?', EMPTY_STRING)
    .replaceAll('’', EMPTY_STRING)
    .replaceAll('”', EMPTY_STRING)
    .replaceAll('„', EMPTY_STRING)
    .replaceAll('Â', 'A')
    .replaceAll('â', 'a')
    .replaceAll('Î', 'I')
    .replaceAll('î', 'i')
    .replaceAll('Ă', 'A')
    .replaceAll('ă', 'a')
    .replaceAll('ş', 'ș')
    .replaceAll('ș', 's')
    .replaceAll('ţ', 't')
    .replaceAll('ț', 't')
    .replaceAll('Ț', 'T')
    .replaceAll('Ș', 'S')
    .replaceAll('–', '-')
    .replaceAll('betleem', 'Betleem')
    .replaceAll('dmnuLui', 'Domnului')
    .replaceAll('doamne', 'Doamne')
    .replaceAll('domnul', 'Domnul')
    .replaceAll('duhul', 'Duhul')
    .replaceAll('dumnezeu', 'Dumnezeu')
    .replaceAll('golgota', 'Golgota')
    .replaceAll('isus', 'Isus')
    .replaceAll('isuse', 'Isuse')
    .replaceAll('mesia', 'Mesia')
    .replaceAll('tata', 'Tata')
    .replaceAll(')(', ') (')
    .replaceAll(TXT_EXTENSION, EMPTY_STRING);

  const maybeRenamedFile = iconv
    .convert(_.trim(filenameWithPotentiallyDiacritics))
    .toString();

  return `${maybeRenamedFile}${TXT_EXTENSION}`;
};
