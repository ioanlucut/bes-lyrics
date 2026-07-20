import fs from 'fs';
import { execFileSync } from 'node:child_process';
import path from 'path';
import type { SongAST } from '../src/index.js';
import {
  LEADSHEETS_DIR,
  UNSET_META,
  hasChordMarkup,
  parse,
  print,
  readTxtFilesRecursively,
  transferChordMarkup,
} from '../src/index.js';

const BACKUP_REF = 'origin/leadsheets-backup';
const VERIFIED_ROOT = './verified';
const DRY_RUN = process.argv.includes('--dry-run');
const TEMP_HASH = 'recover';

const LEGACY_CHORD_CORRECTIONS = new Map([
  ['-Am', 'Am'],
  ['-E', 'E'],
  ['7A', 'A7'],
  ['A/F#7m', 'A/F#m7'],
  ['A2-A/AG#F#-E', 'A2-A/A-G#-F#-E'],
  ['A4A', 'A4-A'],
  ['Am&', 'Am'],
  ['AsusA', 'Asus-A'],
  ['B/S#', 'B/D#'],
  ['Bb-/A', 'Bbm/A'],
  ['Cm#', 'C#m'],
  ['E7-9', 'E7/9'],
  ['F#4F#', 'F#4-F#'],
  ['F#7m', 'F#m7'],
  ['Fm#', 'F#m'],
  ['Fm#7', 'F#m7'],
  ['G4G', 'G4-G'],
  ['e-e-b-De', 'e-e-b-D-e'],
]);

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
  updatedSongs: number;
  updatedSections: number;
  skippedExistingSongs: number;
  skippedSongsWithoutBackup: number;
  skippedSongsWithoutChordedSections: number;
  skippedSectionMismatches: number;
};

const stats: Stats = {
  currentSongs: 0,
  backupSongs: 0,
  backupSongsWithChords: 0,
  matchedSongs: 0,
  updatedSongs: 0,
  updatedSections: 0,
  skippedExistingSongs: 0,
  skippedSongsWithoutBackup: 0,
  skippedSongsWithoutChordedSections: 0,
  skippedSectionMismatches: 0,
};

const normalizeMeta = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const getSongKeys = ({ id, rcId, title, composer }: SongAST) =>
  [
    id && id !== UNSET_META ? `id:${id}` : null,
    rcId && rcId !== UNSET_META ? `rcId:${rcId}` : null,
    `title:${normalizeMeta(title)}|composer:${normalizeMeta(composer)}`,
  ].filter(Boolean) as string[];

const normalizeLegacyChordMarkup = (content: string) =>
  content
    .replace(/\^\{\^\{([^}]+)\}\}/g, '^{$1}')
    .replace(/\^(\*?)\{([^}]+)\}/g, (_match, emphasis, chord) => {
      const normalizedChord = chord
        .replaceAll('£', '#')
        .replaceAll('|', '/')
        .replaceAll('\\', '/')
        .replace(/\/[mM]$/u, 'm')
        .replace(/^([A-Ga-g][#b]?)\(([A-Ga-g][^)]*)\)$/, '$1-$2')
        .replaceAll(/[()]/g, '');
      const correctedChord =
        LEGACY_CHORD_CORRECTIONS.get(normalizedChord) || normalizedChord;

      return `^${emphasis}{${correctedChord}}`;
    });

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
  for (const key of getSongKeys(currentSong.ast)) {
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

const createLeadsheet = (currentSong: SongFile, backupSong: SongFile) => {
  const leadsheetAst = structuredClone(currentSong.ast);
  let hasSectionMismatch = false;
  let updatedSections = 0;

  for (const sectionIdentifier of leadsheetAst.sectionOrder) {
    const canonicalSection = currentSong.ast.sectionsMap[sectionIdentifier];
    const backupSection = backupSong.ast.sectionsMap[sectionIdentifier];

    if (!canonicalSection || !backupSection) {
      continue;
    }

    const normalizedBackupContent = normalizeLegacyChordMarkup(
      backupSection.content,
    );

    if (!hasChordMarkup(normalizedBackupContent)) {
      continue;
    }

    const chordedCanonicalContent = transferChordMarkup(
      canonicalSection.content,
      normalizedBackupContent,
    );

    if (!chordedCanonicalContent) {
      stats.skippedSectionMismatches += 1;
      hasSectionMismatch = true;
      continue;
    }

    leadsheetAst.sectionsMap[sectionIdentifier].content =
      chordedCanonicalContent;
    updatedSections += 1;
  }

  if (hasSectionMismatch) {
    return null;
  }

  stats.updatedSections += updatedSections;

  return updatedSections ? leadsheetAst : null;
};

const getLeadsheetFilePath = (currentSong: SongFile) =>
  path.join(LEADSHEETS_DIR, path.relative(VERIFIED_ROOT, currentSong.filePath));

const writeLeadsheet = (leadsheetFilePath: string, leadsheetAst: SongAST) => {
  fs.mkdirSync(path.dirname(leadsheetFilePath), { recursive: true });
  fs.writeFileSync(leadsheetFilePath, getReprintedContent(leadsheetAst));
};

const run = async () => {
  const currentSongs = (await readTxtFilesRecursively(VERIFIED_ROOT)).map(
    (filePath) => {
      const rawContent = fs.readFileSync(filePath, 'utf8');

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

  const existingLeadsheetIds = new Set(
    fs.existsSync(LEADSHEETS_DIR)
      ? (await readTxtFilesRecursively(LEADSHEETS_DIR)).map(
          (filePath) => parse(fs.readFileSync(filePath, 'utf8')).id,
        )
      : [],
  );

  currentSongs.forEach((currentSong) => {
    const leadsheetFilePath = getLeadsheetFilePath(currentSong);

    if (
      fs.existsSync(leadsheetFilePath) ||
      existingLeadsheetIds.has(currentSong.ast.id)
    ) {
      stats.skippedExistingSongs += 1;
      return;
    }

    const backupSong = getMatchedBackupSong(currentSong, backupIndex);

    if (!backupSong) {
      stats.skippedSongsWithoutBackup += 1;
      return;
    }

    stats.matchedSongs += 1;

    const leadsheetAst = createLeadsheet(currentSong, backupSong);

    if (!leadsheetAst) {
      stats.skippedSongsWithoutChordedSections += 1;
      return;
    }

    stats.updatedSongs += 1;

    if (!DRY_RUN) {
      writeLeadsheet(leadsheetFilePath, leadsheetAst);
    }
  });

  console.log(JSON.stringify({ dryRun: DRY_RUN, ...stats }, null, 2));
};

await run();
