import _ from 'lodash';
import { ALLOWED_CHARS } from '../constants';

const getUniqueChars = (content: string) =>
  _.flattenDeep(_.uniq(content)).filter(Boolean).sort();

export const assemblyCharsStats = (fileName: string, fileContent: string) => {
  const uniqueCharsFromContent = getUniqueChars(fileContent);
  const uniqueCharsFromFileName = getUniqueChars(fileName);

  return {
    fileName,
    uniqueCharsFromContent,
    differenceInContent: _.difference(uniqueCharsFromContent, ALLOWED_CHARS),
    uniqueCharsFromFileName,
    differenceInFileName: _.difference(uniqueCharsFromFileName, ALLOWED_CHARS),
  };
};
