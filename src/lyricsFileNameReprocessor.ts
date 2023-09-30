import { isEqual, trim } from 'lodash-es';
import {
  COLON,
  COMMA,
  EMPTY_STRING,
  NULL,
  TXT_EXTENSION,
  UNSET_META,
} from './constants.js';
import { SongMeta } from './types.js';
import { getTitleByRawSection } from './core.js';

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
    .replaceAll('‘', EMPTY_STRING)
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
  const [title, meta] = getTitleByRawSection(titleContent);

  const metaSections =
    (meta
      ?.split(COMMA)
      ?.map((hit) => {
        const [type, value] = hit.split(COLON).map(trim);

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
        (accumulator, { type, value }) => ({
          ...accumulator,
          [type]: value,
        }),
        {},
      ) as Record<SongMeta, string>) || {};

  return `${[
    isEqual(metaSections[SongMeta.COMPOSER], UNSET_META)
      ? NULL
      : metaSections[SongMeta.COMPOSER],
    trim(getCleanVersion(title)),
    isEqual(metaSections[SongMeta.ALTERNATIVE], UNSET_META)
      ? NULL
      : getCleanVersion(metaSections[SongMeta.ALTERNATIVE]),
    isEqual(metaSections[SongMeta.VERSION], UNSET_META)
      ? NULL
      : metaSections[SongMeta.VERSION],
  ]
    .filter(Boolean)
    .join(' - ')}${TXT_EXTENSION}`;
};
