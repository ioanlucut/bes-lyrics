import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest';

const defaultEsmPreset = createDefaultEsmPreset();

const jestConfig: JestConfigWithTsJest = {
  ...defaultEsmPreset,
  moduleDirectories: ['<rootDir>', 'node_modules'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^lodash-es$': 'lodash',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  transformIgnorePatterns: ['/node_modules/(?!(prettier)/)'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+.tsx?$': ['ts-jest', {}],
  },
  // https://github.com/jestjs/jest/issues/14305#issuecomment-1627346697
  prettierPath: null,
};
export default jestConfig;
