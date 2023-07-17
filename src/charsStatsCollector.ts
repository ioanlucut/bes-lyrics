import { difference } from 'lodash-es';
import { ALLOWED_CHARS } from './constants.js';
import { getUniqueCharsAndRelevantChars } from './core.js';

export const assemblyCharsStats = (fileName: string, fileContent: string) => {
  const uniqueCharsFromContent = getUniqueCharsAndRelevantChars(fileContent);
  const uniqueCharsFromFileName = getUniqueCharsAndRelevantChars(fileName);

  return {
    fileName,
    uniqueCharsFromContent,
    differenceInContent: difference(uniqueCharsFromContent, ALLOWED_CHARS),
    uniqueCharsFromFileName,
    differenceInFileName: difference(uniqueCharsFromFileName, ALLOWED_CHARS),
  };
};
