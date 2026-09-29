import { find, isEmpty, isEqual, negate, trim, uniq } from 'lodash-es';
import {
  EMPTY_STRING,
  NAME_SEPARATOR,
  NULL,
  SEMICOLON,
  TXT_EXTENSION,
  UNSET_META,
} from './constants.js';
import { getMetaSectionsFromTitle, getTitleByRawSection } from './core.js';
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
  const [title] = getTitleByRawSection(titleContent);
  const metaSections = getMetaSectionsFromTitle(titleContent);

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

export type FileRename = { from: string; to: string };

export type RenamePlan = {
  renames: FileRename[];
  conflicts: FileRename[];
};

// macOS and Windows file systems ignore case, so two names that differ only
// in case are the same file.
const toFileKey = (filePath: string) => filePath.toLowerCase();

/**
 * Plans renames without letting any song replace another: a rename whose
 * target is another song's file, or the target of a second rename, is a
 * conflict instead.
 */
export const planFileRenames = (requestedRenames: FileRename[]): RenamePlan => {
  const existingFileKeys = new Set(
    requestedRenames.map(({ from }) => toFileKey(from)),
  );
  const changedRenames = requestedRenames.filter(({ from, to }) => from !== to);
  const renameCountByTarget = changedRenames.reduce(
    (counts, { to }) =>
      counts.set(toFileKey(to), (counts.get(toFileKey(to)) ?? 0) + 1),
    new Map<string, number>(),
  );
  const isConflict = ({ from, to }: FileRename) =>
    renameCountByTarget.get(toFileKey(to)) !== 1 ||
    (toFileKey(to) !== toFileKey(from) && existingFileKeys.has(toFileKey(to)));

  return {
    renames: changedRenames.filter(negate(isConflict)),
    conflicts: changedRenames.filter(isConflict),
  };
};
