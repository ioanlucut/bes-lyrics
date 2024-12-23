import { find, isEmpty, isEqual, negate, trim, uniq } from 'lodash-es';
import {
  COLON,
  COMMA,
  EMPTY_STRING,
  NAME_SEPARATOR,
  NULL,
  SEMICOLON,
  TXT_EXTENSION,
  UNSET_META,
} from './constants.js';
import { getTitleByRawSection } from './core.js';
import { SongMeta } from './types.js';

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

  const getSectionBy = (metaKey: SongMeta) =>
    isEqual(metaSections[metaKey], UNSET_META)
      ? NULL
      : metaSections[metaKey]
          ?.split(SEMICOLON)
          ?.map(getCleanVersion)
          ?.map(trim)
          .join(NAME_SEPARATOR);

  return `${uniq(
    [
      find(
        [
          getSectionBy(SongMeta.BAND),
          getSectionBy(SongMeta.INTERPRETER),
          getSectionBy(SongMeta.COMPOSER),
          getSectionBy(SongMeta.WRITER),
          getSectionBy(SongMeta.ARRANGER),
        ],
        negate(isEmpty),
      ),
      trim(getCleanVersion(title)),
      getSectionBy(SongMeta.ALTERNATIVE),
      getSectionBy(SongMeta.VERSION),
    ].filter(Boolean),
  ).join(NAME_SEPARATOR)}${TXT_EXTENSION}`;
};
