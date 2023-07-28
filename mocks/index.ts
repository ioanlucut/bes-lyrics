import fs from 'fs';
import path from 'path';

export const SIMPLE_SONG_MOCK_FILE_NAME = 'simpleSong.mock.txt';
export const SIMPLE_SONG_MOCK_FILE_CONTENT = fs
  .readFileSync(path.resolve(__dirname, SIMPLE_SONG_MOCK_FILE_NAME))
  .toString();

export const SONG_WITH_SUBSECTIONS_MOCK_FILE_NAME =
  'songWithSubsections.mock.txt';
export const SONG_WITH_SUBSECTIONS_MOCK_FILE_CONTENT = fs
  .readFileSync(path.resolve(__dirname, SONG_WITH_SUBSECTIONS_MOCK_FILE_NAME))
  .toString();

export const SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_NAME =
  'songWithMismatchingContent.mock.txt';
export const SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_CONTENT = fs
  .readFileSync(
    path.resolve(__dirname, SONG_WITH_MISMATCHING_CONTENT_MOCK_FILE_NAME),
  )
  .toString();

export const SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_NAME =
  'songWithMismatchingSequence.mock.txt';
export const SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_CONTENT = fs
  .readFileSync(
    path.resolve(__dirname, SONG_WITH_MISMATCHING_SEQUENCE_MOCK_FILE_NAME),
  )
  .toString();

export const SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_SPLIT_MOCK_FILE_NAME =
  'songWithSubSectionsThatRequiresSplit.mock.txt';
export const SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_SPLIT_MOCK_FILE_CONTENT = fs
  .readFileSync(
    path.resolve(
      __dirname,
      SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_SPLIT_MOCK_FILE_NAME,
    ),
  )
  .toString();

export const SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_UN_SPLIT_MOCK_FILE_NAME =
  'songWithSubSectionsThatRequiresUnSplit.mock.txt';
export const SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_UN_SPLIT_MOCK_FILE_CONTENT =
  fs
    .readFileSync(
      path.resolve(
        __dirname,
        SONG_WITH_SUB_SECTIONS_THAT_REQUIRES_UN_SPLIT_MOCK_FILE_NAME,
      ),
    )
    .toString();
