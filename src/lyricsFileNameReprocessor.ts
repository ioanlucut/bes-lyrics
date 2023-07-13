import { trim } from 'lodash-es';
import { COMMA, EMPTY_STRING, TXT_EXTENSION } from '../constants.js';
import { SongMeta } from './types.js';
import { getTitleContent } from './utils.js';

const getCleanVersion = (title: string) => {
  if (!title) {
    return title;
  }

  return title
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
};

export const deriveFromTitle = (titleContent: string) => {
  const [title, meta] = getTitleContent(titleContent);

  const metaSections =
    (meta
      ?.split(COMMA)
      ?.map((hit) => {
        const [type, value] = hit.split(':').map(trim);

        return {
          type,
          value: value
            ?.replace(/{/gim, EMPTY_STRING)
            ?.replace(/}/gim, EMPTY_STRING),
        } as {
          type: SongMeta;
          value: string;
        };
      })
      ?.reduce(
        (acc, { type, value }) => ({ ...acc, [type]: value }),
        {},
      ) as Record<SongMeta, string>) || {};

  const maybeRenamedFile = [
    metaSections[SongMeta.AUTHOR],
    trim(getCleanVersion(title)),
    getCleanVersion(metaSections[SongMeta.ALTERNATIVE]),
    metaSections[SongMeta.VERSION],
  ]
    .filter(Boolean)
    .join(' - ');

  return `${maybeRenamedFile}${TXT_EXTENSION}`;
};
