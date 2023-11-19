/** @type {import('prettier').Config} */
const config = {
  'singleQuote': true,
  'printWidth': 80,
  'semi': true,
  'trailingComma': 'all',
  'bracketSpacing': true,
  'bracketSameLine': false,
  'plugins': ['prettier-plugin-latex', 'prettier-plugin-organize-imports', 'prettier-plugin-packagejson', './src/prettier-bes-txt-plugin/index.ts'],
};

export default config;
