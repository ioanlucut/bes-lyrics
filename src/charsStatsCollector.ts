import { difference, flattenDeep, uniq } from 'lodash-es';
import { ALLOWED_CHARS, EMPTY_STRING } from './constants.js';

const getUniqueCharsAndRelevantChars = (content: string) =>
  flattenDeep(uniq(content.replaceAll(/\(\),-\.:;\?!/gimu, EMPTY_STRING)))
    .filter(Boolean)
    .sort();

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
