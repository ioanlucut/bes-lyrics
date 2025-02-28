import chalk from 'chalk';
import { isEmpty, isEqual, trim } from 'lodash-es';
import {
  COMMA,
  DOUBLE_LINE_TUPLE,
  EMPTY_STRING,
  NEW_LINE,
  SPACE_CHAR,
  UNSET_META,
} from './constants.js';
import { isTestEnv, padForTex } from './core.js';
import { SequenceChar, SongAST } from './types.js';

const LEADSHEET_ENV_MAP = {
  [SequenceChar.VERSE]: 'verse',
  [SequenceChar.PRECHORUS]: 'prechorus',
  [SequenceChar.CHORUS]: 'chorus',
  [SequenceChar.BRIDGE]: 'bridge',
  [SequenceChar.ENDING]: 'outro',
  [SequenceChar.RECITAL]: 'solo',
};
const LEADSHEET_ENV_OPTS_MAP = {
  [SequenceChar.VERSE]: '',
  [SequenceChar.PRECHORUS]: '[template = framed]',
  [SequenceChar.CHORUS]: '[template = framed]',
  [SequenceChar.BRIDGE]: '[template = framed]',
  [SequenceChar.ENDING]: '[template = framed]',
  [SequenceChar.RECITAL]: '[template = framed]',
};

const getSongContentWithRequiredTrailingEntities = (content: string) =>
  content.replaceAll(/\n/g, `${SPACE_CHAR}\\\\${NEW_LINE}`);

const getSongContentWithRightPadding = (entireContent: string) =>
  entireContent.split(/\n/g).map(padForTex(4)).join(NEW_LINE);

const wrapAsStart = (songEnvironment: string, options = '') =>
  `\\begin{${songEnvironment}}${options ? `${options}` : ''}`;

const wrapAsEnd = (songEnvironment: string) => `\\end{${songEnvironment}}`;

const warnIfIsNotProperlyPrependedAndReplace = (singleWord: string): string => {
  const maybeRegExpMatchArrays = Array.from(
    singleWord.matchAll(/(?<!\^)\{/gim),
  );

  if (isEmpty(maybeRegExpMatchArrays)) {
    return singleWord;
  }
  if (!isTestEnv()) {
    console.warn(`The ${chalk.red(singleWord)} is not correct.`);
  }

  return singleWord.replaceAll(/(?<!\^)\{/gim, '^{');
};

const warnIfIsNotProperlyFormatted = (singleWord: string): string => {
  const maybeRegExpMatchArrays = Array.from(
    singleWord.matchAll(/\^\{\s*[^}]*\s+[^}]*\s*}/gim),
  );

  if (isEmpty(maybeRegExpMatchArrays)) {
    return singleWord;
  }

  throw new Error(`The ${chalk.red(singleWord)} is not correct.`);
};

const rewriteWordWithRightMusicalNotationSyntaxIfNeeded = (
  singleWord: string,
): string => {
  const maybeRegExpMatchArrays = Array.from(
    singleWord.matchAll(
      /((\^)({[A-Z]+\d*})([^\\^ ]*))(?=[^ ]*\^{[A-Z]+\d*}\b)(.*)/gim,
    ),
  );

  if (isEmpty(maybeRegExpMatchArrays)) {
    return singleWord;
  }

  const rewrittenWordWithSpaceBetween = trim(
    maybeRegExpMatchArrays
      .map((regExpMatch) => {
        const chordSyntaxPrefix = regExpMatch[2];
        const chordInformation = regExpMatch[3];
        const contentForChord = regExpMatch[4];
        const maybeTrailingContent = regExpMatch[5];

        return `${chordSyntaxPrefix}*${chordInformation}${contentForChord}${SPACE_CHAR}${maybeTrailingContent}`;
      })
      .join(EMPTY_STRING),
  );

  if (rewrittenWordWithSpaceBetween.includes(SPACE_CHAR)) {
    return rewrittenWordWithSpaceBetween
      .split(/ /gi)
      .map(rewriteWordWithRightMusicalNotationSyntaxIfNeeded)
      .join(SPACE_CHAR);
  }

  return rewrittenWordWithSpaceBetween;
};

const rewriteNotationsWithDashForChordsWithBass = (
  singleWord: string,
): string => {
  const maybeRegExpMatchArrays = Array.from(
    singleWord.matchAll(/\^\{.*\/.*}/gim),
  );

  if (isEmpty(maybeRegExpMatchArrays)) {
    return singleWord;
  }

  return singleWord.replaceAll(/\//gi, '-');
};

// const rewriteLeftRightRepeat = (singleWord: string): string => {
//   return singleWord
//     .replaceAll(/\/:/gi, '\\leftrepeat')
//     .replaceAll(/:\//gi, '\\rightrepeat');
// };

export const getNormalizedContent = (sectionAsContent: string) => {
  return sectionAsContent
    .split(/\n/g)
    .map((verseLineOfARow: string) =>
      warnIfIsNotProperlyFormatted(verseLineOfARow)
        .split(/ /gi)
        .map(warnIfIsNotProperlyPrependedAndReplace)
        .map(warnIfIsNotProperlyFormatted)
        .map(rewriteWordWithRightMusicalNotationSyntaxIfNeeded)
        .map(rewriteNotationsWithDashForChordsWithBass)
        // .map(rewriteLeftRightRepeat)
        .join(SPACE_CHAR),
    )
    .join(NEW_LINE);
};

const escapeRequiredChars = (songMetaContent: string) =>
  songMetaContent.replaceAll(/&/g, '\\&');

export const convertSongToLeadsheet = ({
  sectionOrder,
  sectionsMap,
  sequence,
  alternative,
  arranger,
  band,
  composer,
  contentHash,
  genre,
  id,
  interpreter,
  key,
  rcId,
  tags,
  tempo,
  title,
  version,
  writer,
}: SongAST) => {
  const maybeGetSongMetaContent = (key: string, songMetaContent?: string) => {
    const shouldRenderContent =
      songMetaContent && !isEqual(songMetaContent, UNSET_META);

    if (!shouldRenderContent) {
      return;
    }

    return `${key}={${escapeRequiredChars(songMetaContent)}}`;
  };

  const sectionMapper = (verseSongSectionIdentifier: string) => {
    const { content, sectionSequenceType } =
      sectionsMap[verseSongSectionIdentifier];

    const songEnvironment = LEADSHEET_ENV_MAP[sectionSequenceType];

    return [
      padForTex(2)(
        wrapAsStart(
          songEnvironment,
          LEADSHEET_ENV_OPTS_MAP[sectionSequenceType],
        ),
      ),
      getSongContentWithRightPadding(
        getSongContentWithRequiredTrailingEntities(
          getNormalizedContent(content),
        ),
      ),
      padForTex(2)(wrapAsEnd(songEnvironment)),
    ].join(NEW_LINE);
  };

  const songSectionsAsEnvironments = sectionOrder
    .map(sectionMapper)
    .join(DOUBLE_LINE_TUPLE);

  const metaData = [
    `title={${escapeRequiredChars(title)}}`,
    `subtitle={${escapeRequiredChars(sequence.join(COMMA))}}`,
    maybeGetSongMetaContent('composer', composer),
    maybeGetSongMetaContent('arr', arranger),
    maybeGetSongMetaContent('band', band),
    maybeGetSongMetaContent('tags', tags),
    maybeGetSongMetaContent('genre', genre),
    maybeGetSongMetaContent('tempo', tempo),
    maybeGetSongMetaContent('interpret', interpreter),
    maybeGetSongMetaContent('lyrics', writer),
    maybeGetSongMetaContent('key', key),
  ]
    .filter(Boolean)
    .map(padForTex(5))
    .join(`${COMMA}${NEW_LINE}`);

  return `% =====================================================================
% This file is auto-generated.
%
% Copyright (c) 2024 Ioan Lucuț (ioan.lucut88@gmail.com)
%
% Do not edit this file directly. Any changes made will be overwritten
% the next time the file is generated.
% =====================================================================

% This is the only preamble definition required
\\documentclass{leadsheet}
\\begin{document}

  %  https://tex.stackexchange.com/questions/9852/what-is-the-difference-between-page-break-and-new-page
  %  Every song should start in a new page.
  \\newpage

  \\begin{song}{
${metaData}
  }

${songSectionsAsEnvironments}

  \\end{song}
\\end{document}`;
};
