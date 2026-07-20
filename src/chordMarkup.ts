const CHORD_MARKUP_PATTERN = /\^\*?\{([^}\n]+)\}/g;
const CHORD_MARKUP_SEARCH_PATTERN = /\^\*?\{[^}\n]+\}/;
const CHORD_MARKUP_START_PATTERN = /\^\**\{/g;
const SAFE_CHORD_PATTERN = /^[A-Za-z0-9#b+./-]+$/;
const CHORD_ATOM_PATTERN =
  /^[A-Ga-g](?:#|b)?(?:(?:m|M|maj|Maj|sus|dim|aug|add)\d*|\d+(?:sus)?|)$/;
const NUMERIC_TENSION_PATTERN = /^\d+$/;
const SIGNIFICANT_CHAR_PATTERN = /[\p{L}\p{N}]/u;
const OPENING_PUNCTUATION = new Set(['(', '[', '{', '"', "'", '“', '„']);

export const hasChordMarkup = (content: string) =>
  CHORD_MARKUP_SEARCH_PATTERN.test(content);

export const stripChordMarkup = (content: string) =>
  content.replaceAll(CHORD_MARKUP_PATTERN, '');

const getComparableContent = (content: string) =>
  Array.from(stripChordMarkup(content).normalize('NFC'))
    .filter((char) => SIGNIFICANT_CHAR_PATTERN.test(char))
    .join('')
    .toLowerCase();

const getSignificantCharCount = (content: string) =>
  Array.from(stripChordMarkup(content).normalize('NFC')).filter((char) =>
    SIGNIFICANT_CHAR_PATTERN.test(char),
  ).length;

const getCanonicalLeadingOffset = (
  canonicalContent: string,
  significantCharsBeforeChord: number,
) => {
  let significantCharsSeen = 0;

  for (let index = 0; index < canonicalContent.length; index += 1) {
    if (!SIGNIFICANT_CHAR_PATTERN.test(canonicalContent[index])) {
      continue;
    }

    if (significantCharsSeen === significantCharsBeforeChord) {
      let chordOffset = index;

      while (
        chordOffset &&
        OPENING_PUNCTUATION.has(canonicalContent[chordOffset - 1])
      ) {
        chordOffset -= 1;
      }

      return chordOffset;
    }

    significantCharsSeen += 1;
  }

  return canonicalContent.length;
};

const getCanonicalLineLeadingOffset = (
  canonicalContent: string,
  significantCharsBeforeChord: number,
) => {
  const nextSignificantCharOffset = getCanonicalLeadingOffset(
    canonicalContent,
    significantCharsBeforeChord,
  );

  return canonicalContent.lastIndexOf('\n', nextSignificantCharOffset - 1) + 1;
};

const getCanonicalTrailingOffset = (
  canonicalContent: string,
  significantCharsBeforeChord: number,
) => {
  if (!significantCharsBeforeChord) {
    return 0;
  }

  let significantCharsSeen = 0;

  for (let index = 0; index < canonicalContent.length; index += 1) {
    if (!SIGNIFICANT_CHAR_PATTERN.test(canonicalContent[index])) {
      continue;
    }

    significantCharsSeen += 1;

    if (significantCharsSeen === significantCharsBeforeChord) {
      return index + 1;
    }
  }

  return canonicalContent.length;
};

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

const isValidChord = (chord: string) =>
  chord.split('-').every(isValidChordSegment);

export const transferChordMarkup = (
  canonicalContent: string,
  chordedContent: string,
) => {
  if (
    getComparableContent(canonicalContent) !==
    getComparableContent(chordedContent)
  ) {
    return;
  }

  const chordMarkupsByCanonicalOffset = new Map<number, string[]>();

  Array.from(chordedContent.matchAll(CHORD_MARKUP_PATTERN)).forEach((match) => {
    const chordMarkup = match[0];
    const chordMarkupOffset = match.index || 0;
    const significantCharsBeforeChord = getSignificantCharCount(
      chordedContent.slice(0, chordMarkupOffset),
    );
    const chordMarkupEnd = chordMarkupOffset + chordMarkup.length;
    const currentLineStart =
      chordedContent.lastIndexOf('\n', chordMarkupOffset - 1) + 1;
    const isLineLeadingChord = !SIGNIFICANT_CHAR_PATTERN.test(
      stripChordMarkup(
        chordedContent.slice(currentLineStart, chordMarkupOffset),
      ),
    );
    const nextChar = chordedContent[chordMarkupEnd] || '';
    const currentLineEnd = chordedContent.indexOf('\n', chordMarkupEnd);
    const remainingCurrentLine = chordedContent.slice(
      chordMarkupEnd,
      currentLineEnd === -1 ? undefined : currentLineEnd,
    );
    const hasFollowingLyricOnCurrentLine = SIGNIFICANT_CHAR_PATTERN.test(
      stripChordMarkup(remainingCurrentLine),
    );
    const isLeadingChord =
      SIGNIFICANT_CHAR_PATTERN.test(nextChar) ||
      (hasFollowingLyricOnCurrentLine &&
        (/\s/u.test(chordedContent[chordMarkupOffset - 1] || '') ||
          OPENING_PUNCTUATION.has(nextChar)));
    const canonicalOffset = isLineLeadingChord
      ? getCanonicalLineLeadingOffset(
          canonicalContent,
          significantCharsBeforeChord,
        )
      : isLeadingChord
        ? getCanonicalLeadingOffset(
            canonicalContent,
            significantCharsBeforeChord,
          )
        : getCanonicalTrailingOffset(
            canonicalContent,
            significantCharsBeforeChord,
          );
    const chordMarkups =
      chordMarkupsByCanonicalOffset.get(canonicalOffset) || [];

    chordMarkups.push(chordMarkup);
    chordMarkupsByCanonicalOffset.set(canonicalOffset, chordMarkups);
  });

  return Array.from(
    { length: canonicalContent.length + 1 },
    (_, index) =>
      `${(chordMarkupsByCanonicalOffset.get(index) || []).join('')}${canonicalContent[index] || ''}`,
  ).join('');
};

export const getInvalidChordMarkups = (content: string) => {
  const chordMarkups = Array.from(content.matchAll(CHORD_MARKUP_PATTERN));
  const invalidChordMarkups = chordMarkups
    .filter(
      ([, chord]) => !SAFE_CHORD_PATTERN.test(chord) || !isValidChord(chord),
    )
    .map(([chordMarkup]) => chordMarkup);
  const chordMarkupStarts = Array.from(
    content.matchAll(CHORD_MARKUP_START_PATTERN),
  ).length;

  if (chordMarkupStarts !== chordMarkups.length) {
    invalidChordMarkups.push('unclosed chord markup');
  }

  return invalidChordMarkups;
};
