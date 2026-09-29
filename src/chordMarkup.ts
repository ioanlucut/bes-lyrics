const CHORD_MARKUP_PATTERN = /\^\*?\{([^}\n]+)\}/g;
const CHORD_MARKUP_SEARCH_PATTERN = /\^\*?\{[^}\n]+\}/;
const CHORD_MARKUP_START_PATTERN = /\^\**\{/g;
const SAFE_CHORD_PATTERN = /^[A-Za-z0-9#b+./-]+$/;
const CHORD_ATOM_PATTERN =
  /^[A-Ga-g](?:#|b)?(?:(?:m|M|maj|Maj|sus|dim|aug|add)\d*|\d+(?:sus)?|)$/;
const NUMERIC_TENSION_PATTERN = /^\d+$/;

export const hasChordMarkup = (content: string) =>
  CHORD_MARKUP_SEARCH_PATTERN.test(content);

export const stripChordMarkup = (content: string) =>
  content.replaceAll(CHORD_MARKUP_PATTERN, '');

const isValidChordSegment = (chordSegment: string) => {
  const [rootedChord, ...bassChordsOrTensions] = chordSegment.split('/');

  return (
    CHORD_ATOM_PATTERN.test(rootedChord) &&
    bassChordsOrTensions.every(
      (chordPart) =>
        CHORD_ATOM_PATTERN.test(chordPart) ||
        NUMERIC_TENSION_PATTERN.test(chordPart),
    )
  );
};

export const isValidChord = (chord: string) =>
  SAFE_CHORD_PATTERN.test(chord) && chord.split('-').every(isValidChordSegment);

export const getInvalidChordMarkups = (content: string) => {
  const chordMarkups = Array.from(content.matchAll(CHORD_MARKUP_PATTERN));
  const invalidChordMarkups = chordMarkups
    .filter(([, chord]) => !isValidChord(chord))
    .map(([chordMarkup]) => chordMarkup);
  const chordMarkupStarts = Array.from(
    content.matchAll(CHORD_MARKUP_START_PATTERN),
  ).length;

  if (chordMarkupStarts !== chordMarkups.length) {
    invalidChordMarkups.push('unclosed chord markup');
  }

  return invalidChordMarkups;
};
