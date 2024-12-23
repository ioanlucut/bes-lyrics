import { parse } from '../songParser.js';
import { print } from '../songPrinter.js';
import { SongAST } from '../types.js';

const CUSTOM_AST_FORMAT = 'bes-txt-ast';
const BEX_PARSER = 'bes-txt';

const languages = [
  {
    extensions: ['.txt'],
    name: 'BES Songs custom prettier plugin',
    parsers: [BEX_PARSER],
  },
];

const parsers = {
  [BEX_PARSER]: {
    parse: (text: string) => parse(text),
    astFormat: CUSTOM_AST_FORMAT,
  },
};

const printers = {
  [CUSTOM_AST_FORMAT]: {
    print: (path: { getValue: () => SongAST }) => print(path.getValue()),
  },
};

export { languages, parsers, printers };
