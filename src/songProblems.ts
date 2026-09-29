import { assemblyCharsStats } from './charsStatsCollector.js';
import { verifyStructure } from './contentStructureValidator.js';

const formatChars = (chars: string[]) =>
  chars.map((char) => JSON.stringify(char)).join(', ');

/**
 * Everything `verify` rejects in one song: characters outside the allowed set
 * in its file name or content, and any structure error, reported together so
 * one run shows all that needs fixing.
 */
export const getSongProblems = (fileName: string, content: string) => {
  const { differenceInContent, differenceInFileName } = assemblyCharsStats(
    fileName,
    content,
  );
  const problems: string[] = [];

  if (differenceInFileName.length) {
    problems.push(
      `The file name contains characters that are not allowed: ${formatChars(differenceInFileName)}.`,
    );
  }

  if (differenceInContent.length) {
    problems.push(
      `The song contains characters that are not allowed: ${formatChars(differenceInContent)}.`,
    );
  }

  try {
    verifyStructure(content);
  } catch (error: unknown) {
    problems.push((error as Error).message);
  }

  return problems;
};
