import { trim } from 'lodash';

export const logFileWithLinkInConsole = (filePath: string) =>
  console.log(`at ${filePath}:1:1`);

export const getTitleContent = (titleContent: string) =>
  titleContent
    .split(/\{((?:[^{}]*\{[^{}]*})*[^{}]*?)}/gim)
    .map(trim)
    .filter(Boolean);
