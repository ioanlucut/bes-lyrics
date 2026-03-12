import fs from 'fs';
import { execFileSync } from 'node:child_process';
import {
  SongAST,
  UNSET_META,
  parse,
  print,
  readTxtFilesRecursively,
} from '../src/index.js';

const BACKUP_REF = 'origin/leadsheets-backup';
const VERIFIED_ROOT = './verified';
const DRY_RUN = process.argv.includes('--dry-run');
const TEMP_HASH = 'recover';

type SongFile = {
  ast: SongAST;
  filePath: string;
  rawContent: string;
};

type Stats = {
  currentSongs: number;
  backupSongs: number;
  backupSongsWithChords: number;
  matchedSongs: number;
  normalizedSongs: number;
  normalizedSections: number;
  updatedSongs: number;
  updatedSections: number;
  skippedSongsWithoutBackup: number;
  skippedSongsWithoutChordedSections: number;
  skippedSectionMismatches: number;
  alreadyChordedSongs: number;
};

const stats: Stats = {
  currentSongs: 0,
  backupSongs: 0,
  backupSongsWithChords: 0,
  matchedSongs: 0,
  normalizedSongs: 0,
  normalizedSections: 0,
  updatedSongs: 0,
  updatedSections: 0,
  skippedSongsWithoutBackup: 0,
  skippedSongsWithoutChordedSections: 0,
  skippedSectionMismatches: 0,
  alreadyChordedSongs: 0,
};

const normalizeMeta = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const getSongKeys = ({ id, rcId, title, composer }: SongAST) =>
  [
    id && id !== UNSET_META ? `id:${id}` : null,
    rcId && rcId !== UNSET_META ? `rcId:${rcId}` : null,
    `title:${normalizeMeta(title)}|composer:${normalizeMeta(composer)}`,
  ].filter(Boolean) as string[];

const hasChordMarkup = (content: string) => /\^\*?\{[^}]+\}/.test(content);

const stripChordMarkup = (content: string) =>
  content.replace(/\^\*?\{[^}]+\}/g, '');

const normalizeLegacyChordMarkup = (content: string) =>
  content.replace(/\^(\*?)\{([^}]+)\}/g, (_match, emphasis, chord) => {
    const normalizedChord = chord
      .replaceAll('£', '#')
      .replaceAll('|', '/')
      .replaceAll('\\', '/')
      .replace(/\/[mM]$/u, 'm');

    return `^${emphasis}{${normalizedChord}}`;
  });

const normalizeComparableText = (content: string) =>
  stripChordMarkup(content).normalize('NFC').replace(/\s+/g, ' ').trim();

const normalizeComparableTextAggressive = (content: string) =>
  stripChordMarkup(content)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');

const areEquivalentSections = (currentContent: string, backupContent: string) =>
  normalizeComparableText(currentContent) ===
    normalizeComparableText(backupContent) ||
  normalizeComparableTextAggressive(currentContent) ===
    normalizeComparableTextAggressive(backupContent);

const getGitOutput = (...args: string[]) =>
  execFileSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  }).toString();

const getBackupTxtFiles = () =>
  getGitOutput('ls-tree', '-rz', '--name-only', BACKUP_REF, 'verified')
    .split('\0')
    .filter((entry) => entry.trimEnd().endsWith('.txt'));

const getBackupSongFiles = (): SongFile[] =>
  getBackupTxtFiles()
    .map((filePath) => {
      const rawContent = getGitOutput('show', `${BACKUP_REF}:${filePath}`);

      return {
        filePath,
        rawContent,
        ast: parse(rawContent),
      };
    })
    .filter(({ rawContent }) => hasChordMarkup(rawContent));

const buildBackupIndex = (backupSongs: SongFile[]) => {
  const index = new Map<string, SongFile[]>();

  backupSongs.forEach((songFile) => {
    getSongKeys(songFile.ast).forEach((key) => {
      const currentEntries = index.get(key) || [];
      currentEntries.push(songFile);
      index.set(key, currentEntries);
    });
  });

  return index;
};

const getMatchedBackupSong = (
  currentSong: SongFile,
  backupIndex: Map<string, SongFile[]>,
) => {
  const keys = getSongKeys(currentSong.ast);

  for (const key of keys) {
    const matches = backupIndex.get(key) || [];

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length > 1) {
      const exactTitleComposerMatch = matches.find(
        ({ ast }) =>
          normalizeMeta(ast.title) === normalizeMeta(currentSong.ast.title) &&
          normalizeMeta(ast.composer) ===
            normalizeMeta(currentSong.ast.composer),
      );

      if (exactTitleComposerMatch) {
        return exactTitleComposerMatch;
      }
    }
  }

  return null;
};

const getReprintedContent = (ast: SongAST) => {
  const printedWithTemporaryHash = print({ ...ast, contentHash: TEMP_HASH });

  return print(parse(printedWithTemporaryHash));
};

const normalizeChordMarkupInSong = (song: SongFile) => {
  let didNormalizeSong = false;

  for (const sectionIdentifier of song.ast.sectionOrder) {
    const currentSection = song.ast.sectionsMap[sectionIdentifier];

    if (!currentSection || !hasChordMarkup(currentSection.content)) {
      continue;
    }

    const normalizedContent = normalizeLegacyChordMarkup(
      currentSection.content,
    );

    if (normalizedContent === currentSection.content) {
      continue;
    }

    currentSection.content = normalizedContent;
    stats.normalizedSections += 1;
    didNormalizeSong = true;
  }

  if (didNormalizeSong) {
    stats.normalizedSongs += 1;
  }

  return didNormalizeSong;
};

const recoverChordsForSong = (currentSong: SongFile, backupSong: SongFile) => {
  let didUpdateSong = false;

  for (const sectionIdentifier of currentSong.ast.sectionOrder) {
    const currentSection = currentSong.ast.sectionsMap[sectionIdentifier];
    const backupSection = backupSong.ast.sectionsMap[sectionIdentifier];

    if (!currentSection || !backupSection) {
      continue;
    }

    if (hasChordMarkup(currentSection.content)) {
      continue;
    }

    if (!hasChordMarkup(backupSection.content)) {
      continue;
    }

    if (!areEquivalentSections(currentSection.content, backupSection.content)) {
      stats.skippedSectionMismatches += 1;
      continue;
    }

    currentSection.content = normalizeLegacyChordMarkup(backupSection.content);
    stats.updatedSections += 1;
    didUpdateSong = true;
  }

  return didUpdateSong;
};

const run = async () => {
  const currentSongs = (await readTxtFilesRecursively(VERIFIED_ROOT)).map(
    (filePath) => {
      const rawContent = fs.readFileSync(filePath).toString();

      return {
        filePath,
        rawContent,
        ast: parse(rawContent),
      };
    },
  );
  const backupSongs = getBackupSongFiles();
  const backupIndex = buildBackupIndex(backupSongs);

  stats.currentSongs = currentSongs.length;
  stats.backupSongs = getBackupTxtFiles().length;
  stats.backupSongsWithChords = backupSongs.length;

  currentSongs.forEach((currentSong) => {
    if (hasChordMarkup(currentSong.rawContent)) {
      stats.alreadyChordedSongs += 1;

      if (!DRY_RUN && normalizeChordMarkupInSong(currentSong)) {
        fs.writeFileSync(
          currentSong.filePath,
          getReprintedContent(currentSong.ast),
        );
      }

      return;
    }

    const backupSong = getMatchedBackupSong(currentSong, backupIndex);

    if (!backupSong) {
      stats.skippedSongsWithoutBackup += 1;
      return;
    }

    stats.matchedSongs += 1;

    if (!recoverChordsForSong(currentSong, backupSong)) {
      stats.skippedSongsWithoutChordedSections += 1;
      return;
    }

    stats.updatedSongs += 1;

    if (!DRY_RUN) {
      normalizeChordMarkupInSong(currentSong);
      fs.writeFileSync(
        currentSong.filePath,
        getReprintedContent(currentSong.ast),
      );
    }
  });

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        ...stats,
      },
      null,
      2,
    ),
  );
};

await run();
