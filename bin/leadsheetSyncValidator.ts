import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import process from 'process';
import recursive from 'recursive-readdir';
import {
  DS_STORE_FILE,
  ERROR_CODE,
  GIT_KEEP_FILE,
  LEADSHEETS_DIR,
  TXT_EXTENSION,
  getLeadsheetSyncErrors,
  hasChordMarkup,
  parse,
  readTxtFilesRecursively,
  verifyStructure,
} from '../src/index.js';

dotenv.config();

const verifiedDir = process.env.VERIFIED_DIR;
const errors: string[] = [];

const addError = (filePath: string, message: string) => {
  errors.push(`${filePath}: ${message}`);
};

const verifyFileExtensions = async () => {
  const invalidFilePaths = (
    await recursive(LEADSHEETS_DIR, [DS_STORE_FILE, GIT_KEEP_FILE])
  ).filter((filePath) => path.extname(filePath) !== TXT_EXTENSION);

  invalidFilePaths.forEach((filePath) =>
    addError(filePath, `Expected a "${TXT_EXTENSION}" file.`),
  );
};

const run = async () => {
  await verifyFileExtensions();

  const canonicalSongsById = new Map<string, string>();
  const canonicalFilePaths = await readTxtFilesRecursively(verifiedDir);

  canonicalFilePaths.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');

    if (hasChordMarkup(content)) {
      addError(filePath, 'Canonical song contains chord markup.');
    }

    try {
      verifyStructure(content);
      const { id } = parse(content);
      canonicalSongsById.set(id, content);
    } catch (error) {
      addError(filePath, (error as Error).message);
    }
  });

  const leadsheetIds = new Set<string>();
  const leadsheetFilePaths = await readTxtFilesRecursively(LEADSHEETS_DIR);

  leadsheetFilePaths.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      verifyStructure(content);
      const { id } = parse(content);

      if (leadsheetIds.has(id)) {
        addError(filePath, `Duplicate lead-sheet song ID "${id}".`);
        return;
      }

      leadsheetIds.add(id);

      const canonicalContent = canonicalSongsById.get(id);

      if (!canonicalContent) {
        addError(filePath, `No canonical song has ID "${id}".`);
        return;
      }

      getLeadsheetSyncErrors(canonicalContent, content).forEach((message) =>
        addError(filePath, message),
      );
    } catch (error) {
      addError(filePath, (error as Error).message);
    }
  });

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(ERROR_CODE);
  }

  console.log(
    `Validated ${leadsheetFilePaths.length} lead sheets against ${canonicalFilePaths.length} canonical songs.`,
  );
};

await run();
