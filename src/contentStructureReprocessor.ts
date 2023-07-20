import { parse } from './songParser.js';
import { print } from './songPrinter.js';

/**
 * Reprocess the content of a song to add the basic structure.
 * This is useful when the content of the song is correct, but we want to apply further changes.
 *
 * It's important to note that the song should be valid.
 *
 * @param content The content of the song
 * @param fileName The name of the file
 */
export const reprocess = (content: string) => print(parse(content));
