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

// `contentHash` is taken from the text before formatting, so it only settles
// on the second pass; every other part of the song must settle on the first.
const withoutContentHash = (content: string) =>
  content.replace(/contentHash: \{\w*\}/, 'contentHash: {}');

const isStableUnderFormatting = (content: string) => {
  const formatted = format(content);

  return (
    withoutContentHash(format(formatted)) === withoutContentHash(formatted)
  );
};

const getEnvironmentNames = (tex: string, command: 'begin' | 'end') =>
  Array.from(tex.matchAll(new RegExp(`\\\\${command}\\{(\\w+)\\}`, 'g')))
    .map(([, name]) => name)
    .sort();

describe('song library', () => {
  const songsByDir = new Map(SONG_DIRS.map((dir) => [dir, readSongs(dir)]));
  const songs = Array.from(songsByDir.values()).flat();
  const leadsheets = songsByDir.get(LEADSHEETS_DIR) ?? [];

  it('finds songs in every library directory', () => {
    songsByDir.forEach((dirSongs) => {
      expect(dirSongs.length).toBeGreaterThan(0);
    });
  });

  it('formats every song to text that formatting leaves unchanged', () => {
    const unstableFilePaths = songs
      .filter(({ content }) => !isStableUnderFormatting(content))
      .map(({ filePath }) => filePath);

    expect(unstableFilePaths).toEqual([]);
  });

  it.each([
    [
      'extra blank lines',
      '[title]\nTitlu {id: {abc}}\n\n\n[sequence]\nv1\n\n[v1]\nText\n\n\n',
    ],
    [
      'trailing spaces',
      '[title]\nTitlu {id: {abc}}\n\n[sequence]\nv1\n\n[v1]\nText   \nText  \n',
    ],
    [
      'CRLF line endings',
      '[title]\r\nTitlu {id: {abc}}\r\n\r\n[sequence]\r\nv1\r\n\r\n[v1]\r\nText\r\n',
    ],
    [
      'indented lines',
      '[title]\n  Titlu {id: {abc}}\n\n[sequence]\n v1 \n\n[v1]\n  Text\n',
    ],
  ])('formats an unformatted song with %s to stable text', (_, content) => {
    expect(isStableUnderFormatting(content)).toBe(true);
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
