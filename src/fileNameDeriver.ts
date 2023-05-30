import _ from 'lodash';
import { Iconv } from 'iconv';
import { EMPTY_STRING, TXT_EXTENSION } from '../constants';

const iconv = new Iconv('UTF-8', 'latin1');

export const deriveFromTitle = (title: string) => {
  const generatedFilename = title
    .replaceAll('!', EMPTY_STRING)
    .replaceAll(',', EMPTY_STRING)
    .replaceAll('/', EMPTY_STRING)
    .replaceAll(':', EMPTY_STRING)
    .replaceAll(';', EMPTY_STRING)
    .replaceAll('?', EMPTY_STRING)
    .replaceAll('’', EMPTY_STRING)
    .replaceAll('”', EMPTY_STRING)
    .replaceAll('„', EMPTY_STRING)
    .replaceAll('„', EMPTY_STRING)
    .replaceAll('â', 'a')
    .replaceAll('Â', 'A')
    .replaceAll('Î', 'I')
    .replaceAll('î', 'i')
    .replaceAll('ă', 'a')
    .replaceAll('Ă', 'A')
    .replaceAll('Ș', 'S')
    .replaceAll('ș', 's')
    .replaceAll('Ț', 'T')
    .replaceAll('ț', 't');

  const maybeRenamedFile = iconv.convert(_.trim(generatedFilename)).toString();

  return `${maybeRenamedFile}${TXT_EXTENSION}`;
};
