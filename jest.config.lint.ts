export default {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  watchPlugins: ['jest-runner-eslint/watch-fix'],
};
