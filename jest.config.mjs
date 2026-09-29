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
  // Jest would format inline snapshots with the project's Prettier config,
  // whose TypeScript song plugin it cannot load, so snapshots stay unformatted.
  prettierPath: null,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/index.ts'],
  coverageReporters: ['text-summary', 'text'],
  // A floor, not a target: raise it whenever coverage rises.
  coverageThreshold: {
    global: {
      branches: 98,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
export default jestConfig;
