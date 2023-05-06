import _ from 'lodash';
import { Iconv } from 'iconv';
import { EMPTY_STRING } from '../constants';

const iconv = new Iconv('UTF-8', 'latin1');

export const normalizeFileName = (fileName: string) =>
  iconv
    .convert(
      _.trim(
        fileName
          .replaceAll('  ', ' ')
          .replaceAll(' .', '.')
          .replaceAll('!', EMPTY_STRING)
          .replaceAll('(', EMPTY_STRING)
          .replaceAll(')', EMPTY_STRING)
          .replaceAll(';', EMPTY_STRING)
          .replaceAll('[', EMPTY_STRING)
          .replaceAll(']', EMPTY_STRING)
          .replaceAll('\\', EMPTY_STRING)
          .replaceAll('/', EMPTY_STRING)
          .replaceAll('/', EMPTY_STRING)
          .replaceAll(':', EMPTY_STRING)
          .replaceAll('?', EMPTY_STRING)
          .replaceAll('Â', 'A')
          .replaceAll('â', 'a')
          .replaceAll('Î', 'I')
          .replaceAll('î', 'i')
          .replaceAll('Ă', 'A')
          .replaceAll('ă', 'a')
          .replaceAll('ă', 'a')
          .replaceAll('Ș', 'S')
          .replaceAll('ș', 's')
          .replaceAll('Ț', 'T')
          .replaceAll('ț', 't')
          .replaceAll('ţ', 't')
          .replaceAll('ş', 'ș')
          .replaceAll('isus', 'Isus')
          .replaceAll('domnul', 'Domnul')
          .replaceAll('dmnuLui', 'Domnului')
          .replaceAll('doamne', 'Doamne')
          .replaceAll('dumnezeu', 'Dumnezeu')
          .replaceAll('’', EMPTY_STRING)
          .replaceAll('”', EMPTY_STRING)
          .replaceAll('„', EMPTY_STRING)
          .replaceAll('–', '-')
          .replaceAll(/[0-9]*/gi, EMPTY_STRING),
      ),
    )
    .toString();
