import { isEqual } from 'lodash-es';
import {
  getInvalidChordMarkups,
  hasChordMarkup,
  stripChordMarkup,
} from './chordMarkup.js';
import { parse } from './songParser.js';
import type { SongAST } from './types.js';

// Each source hashes its own body, so chorded and chord-free contentHash values differ.
const COMPARABLE_META_KEYS = [
  'alternative',
  'arranger',
  'band',
  'composer',
  'genre',
  'id',
  'interpreter',
  'key',
  'rcId',
  'tags',
  'tempo',
  'title',
  'version',
  'writer',
] as const satisfies ReadonlyArray<keyof SongAST>;

export const getLeadsheetSyncErrors = (
  canonicalContent: string,
  leadsheetContent: string,
) => {
  const errors: string[] = [];

  if (
    hasChordMarkup(canonicalContent) ||
    getInvalidChordMarkups(canonicalContent).length
  ) {
    errors.push('Canonical song contains chord markup.');
  }

  const invalidChordMarkups = getInvalidChordMarkups(leadsheetContent);

  if (invalidChordMarkups.length) {
    errors.push(`Invalid chord markup: ${invalidChordMarkups.join(', ')}.`);
  }

  const canonicalSong = parse(canonicalContent);
  const leadsheetSong = parse(leadsheetContent);
  const leadsheetSectionContent = leadsheetSong.sectionOrder
    .map(
      (sectionIdentifier) =>
        leadsheetSong.sectionsMap[sectionIdentifier].content,
    )
    .join('\n');

  if (!hasChordMarkup(leadsheetSectionContent)) {
    errors.push('Lead sheet does not contain chord markup in song sections.');
  }

  COMPARABLE_META_KEYS.forEach((metaKey) => {
    if (!isEqual(canonicalSong[metaKey], leadsheetSong[metaKey])) {
      errors.push(
        `Lead sheet metadata "${metaKey}" differs from canonical song.`,
      );
    }
  });

  if (!isEqual(canonicalSong.sequence, leadsheetSong.sequence)) {
    errors.push('Lead sheet sequence differs from canonical song.');
  }

  if (!isEqual(canonicalSong.sectionOrder, leadsheetSong.sectionOrder)) {
    errors.push('Lead sheet section order differs from canonical song.');
  }

  canonicalSong.sectionOrder.forEach((sectionIdentifier) => {
    const canonicalSection = canonicalSong.sectionsMap[sectionIdentifier];
    const leadsheetSection = leadsheetSong.sectionsMap[sectionIdentifier];

    if (!leadsheetSection) {
      return;
    }

    if (
      canonicalSection.content !== stripChordMarkup(leadsheetSection.content)
    ) {
      errors.push(
        `Lead sheet section "${sectionIdentifier}" differs from canonical song after removing chords.`,
      );
    }
  });

  return errors;
};
