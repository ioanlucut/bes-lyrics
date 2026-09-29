import fs from 'fs';
import path from 'path';
import { ALLOWED_CHARS, NEW_LINE, SPACE_CHAR } from './constants.js';
import { isKnownSongSequence } from './core.js';
import { parse } from './songParser.js';
import { print } from './songPrinter.js';
import { SequenceChar } from './types.js';

const DOCS_DIR = 'docs';
const SONG_FORMAT_DOC = path.join(DOCS_DIR, 'song-format.md');

const readDoc = (docPath: string) => fs.readFileSync(docPath).toString();

const getMarkdownFiles = () => [
  'README.md',
  ...fs
    .readdirSync(DOCS_DIR, { recursive: true })
    .map(String)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => path.join(DOCS_DIR, fileName)),
];

const getSection = (markdown: string, heading: string) => {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  const end = markdown.indexOf('\n## ', start + 1);

  return markdown.slice(start, end === -1 ? undefined : end);
};

const getFirstCodeBlock = (markdown: string) =>
  markdown.match(/```\w*\n([\s\S]*?)\n```/)?.[1] ?? '';

// GitHub's heading anchors: lowercase, punctuation dropped, spaces to dashes.
const toAnchor = (heading: string) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\- ]/gu, '')
    .replaceAll(' ', '-');

const getAnchors = (markdown: string) =>
  Array.from(markdown.matchAll(/^#{1,6} (.+)$/gm), ([, heading]) =>
    toAnchor(heading),
  );

describe('docs', () => {
  describe('song-format.md', () => {
    const songFormat = readDoc(SONG_FORMAT_DOC);

    it('shows an example song that the printer leaves unchanged', () => {
      const example = `${getFirstCodeBlock(songFormat)}${NEW_LINE}`;

      expect(print(parse(example))).toEqual(example);
    });

    it('lists exactly the allowed characters besides whitespace', () => {
      const documentedChars = getFirstCodeBlock(
        getSection(songFormat, 'Allowed characters'),
      );

      expect(new Set(documentedChars)).toEqual(
        new Set(
          ALLOWED_CHARS.filter(
            (char) => ![SPACE_CHAR, NEW_LINE].includes(char),
          ),
        ),
      );
    });

    it('documents only section markers that the validator accepts', () => {
      const markersTable = getSection(songFormat, 'Section markers');
      const documentedMarkers = Array.from(
        markersTable.matchAll(/`\[([a-z]\d*)\]`/g),
        ([, marker]) => marker,
      );

      expect(
        documentedMarkers.filter((marker) => !isKnownSongSequence(marker)),
      ).toEqual([]);
      expect(new Set(documentedMarkers.map((marker) => marker[0]))).toEqual(
        new Set(Object.values(SequenceChar)),
      );
    });

    it('matches the documented rejection of a numbered first chorus', () => {
      expect(getSection(songFormat, 'Section markers')).toContain(
        '`c1` is rejected',
      );
      expect(isKnownSongSequence('c1')).toBeFalsy();
    });
  });

  describe.each(getMarkdownFiles())('%s', (markdownFile) => {
    const markdown = readDoc(markdownFile);
    const relativeLinks = Array.from(
      markdown.matchAll(/\]\(([^)\s]+)\)/g),
      ([, link]) => link,
    ).filter((link) => !/^[a-z]+:/i.test(link));

    it('has relative links and anchors that resolve', () => {
      const brokenLinks = relativeLinks.filter((link) => {
        const [linkPath, anchor] = link.split('#');
        const target = linkPath
          ? path.join(path.dirname(markdownFile), linkPath)
          : markdownFile;

        if (!fs.existsSync(target)) {
          return true;
        }

        return Boolean(
          anchor &&
            target.endsWith('.md') &&
            !getAnchors(readDoc(target)).includes(anchor),
        );
      });

      expect(brokenLinks).toEqual([]);
    });
  });
});
