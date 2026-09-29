import { createDefaultEsmPreset } from 'ts-jest';

const defaultEsmPreset = createDefaultEsmPreset();

const jestConfig = {
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
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/index.ts'],
  coverageReporters: ['text-summary', 'text'],
  // A floor, not a target: raise it whenever coverage rises.
  coverageThreshold: {
    global: {
      branches: 81,
      functions: 91,
      lines: 96,
      statements: 96,
    },
  },
};
export default jestConfig;
