import { parse } from './songParser.js';
import { print } from './songPrinter.js';
import { flow } from 'lodash-es';
import { verifyStructure } from './contentStructureValidator.js';
import assert from 'node:assert';

/**
 * Reprocess the content of a song to add the basic structure.
 * This is useful when the content of the song is correct, but we want to apply further changes.
 *
 * It's important to note that the song should be valid.
 *
 * @param songAsString The content of the song
 */
export const reprocess = flow([
  (songAsString) => {
    assert.ok(
      verifyStructure(songAsString),
      'The structure of the song is invalid',
    );

    return songAsString;
  },
  parse,
  print,
]);
