import _ from 'lodash';
import { EMPTY_STRING } from '../constants';

export const normalizeFileName = (fileName: string) =>
  _.trim(
    fileName
      .replaceAll('  ', ' ')
      .replaceAll(' .', '.')
      .replaceAll('!', EMPTY_STRING)
      .replaceAll('(', EMPTY_STRING)
      .replaceAll(')', EMPTY_STRING)
      .replaceAll(',', EMPTY_STRING)
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
      .replaceAll('Ș', 'S')
      .replaceAll('ș', 's')
      .replaceAll('Ț', 'T')
      .replaceAll('ț', 't')
      .replaceAll('’', EMPTY_STRING)
      .replaceAll('”', EMPTY_STRING)
      .replaceAll('„', EMPTY_STRING)
      .replaceAll(/[0-9]*/gi, EMPTY_STRING),
  );
