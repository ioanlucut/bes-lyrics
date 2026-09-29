import fs from 'fs';
import path from 'path';
import { LEADSHEETS_DIR, TXT_EXTENSION } from './constants.js';
import { parse } from './songParser.js';
import { print } from './songPrinter.js';
import { convertSongToLeadsheet } from './songToLeadsheetConverter.js';

// Pull requests may add songs the metadata bot has not formatted yet, so these
// checks hold for any valid input rather than asserting the committed text.
const SONG_DIRS = ['verified', 'candidates', LEADSHEETS_DIR];

const readSongs = (dir: string) =>
  fs
    .readdirSync(dir, { recursive: true })
    .map(String)
    .filter((fileName) => path.extname(fileName) === TXT_EXTENSION)
    .map((fileName) => {
      const filePath = path.join(dir, fileName);

      return { filePath, content: fs.readFileSync(filePath, 'utf8') };
    });

const format = (content: string) => print(parse(content));

const getEnvironmentNames = (tex: string, command: 'begin' | 'end') =>
  Array.from(tex.matchAll(new RegExp(`\\\\${command}\\{(\\w+)\\}`, 'g')))
    .map(([, name]) => name)
    .sort();

describe('song library', () => {
  const songs = SONG_DIRS.flatMap(readSongs);
  const leadsheets = readSongs(LEADSHEETS_DIR);

  it('finds songs in every library directory', () => {
    SONG_DIRS.forEach((dir) => {
      expect(readSongs(dir).length).toBeGreaterThan(0);
    });
  });

  it('formats every song to text that formatting leaves unchanged', () => {
    const unstableFilePaths = songs
      .filter(({ content }) => {
        const formatted = format(content);

        return format(formatted) !== formatted;
      })
      .map(({ filePath }) => filePath);

    expect(unstableFilePaths).toEqual([]);
  });

  it('converts every lead sheet to TeX whose environments are balanced', () => {
    const unbalancedFilePaths = leadsheets
      .filter(({ content }) => {
        const tex = convertSongToLeadsheet(
          parse(content, { rejoinSubsections: true }),
        );

        return (
          getEnvironmentNames(tex, 'begin').join() !==
          getEnvironmentNames(tex, 'end').join()
        );
      })
      .map(({ filePath }) => filePath);

    expect(unbalancedFilePaths).toEqual([]);
  });
});
