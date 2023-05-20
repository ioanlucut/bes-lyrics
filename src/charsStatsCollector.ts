import _ from 'lodash';
import { ALLOWED_CHARS, EMPTY_STRING } from '../constants';

const getUniqueCharsAndRelevantChars = (content: string) =>
  _.flattenDeep(_.uniq(content.replaceAll(/\(\),-\.:;\?!/gimu, EMPTY_STRING)))
    .filter(Boolean)
    .sort();

export const assemblyCharsStats = (fileName: string, fileContent: string) => {
  const uniqueCharsFromContent = getUniqueCharsAndRelevantChars(fileContent);
  const uniqueCharsFromFileName = getUniqueCharsAndRelevantChars(fileName);

  return {
    fileName,
    uniqueCharsFromContent,
    differenceInContent: _.difference(uniqueCharsFromContent, ALLOWED_CHARS),
    uniqueCharsFromFileName,
    differenceInFileName: _.difference(uniqueCharsFromFileName, ALLOWED_CHARS),
  };
};
