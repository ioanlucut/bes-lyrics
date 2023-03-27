import _, { endsWith } from 'lodash';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './out';
const EMPTY_STRING = '';
const NEW_LINE = '\n';
const CARRIAGE_RETURN = '\r';

const trimContent = (fileContent: string) => _.trim(fileContent);

const reprocess = (strings: string[]) => {
  strings.forEach((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));
    const fileContent = fs.readFileSync(filePath).toString();

    const sections = fileContent
      .split(/(\[.*])/gim)
      .filter(Boolean)
      .map(_.trim);

    const fileNameFromTheTitle =
      !sections[1] || sections[1] === '[title]' ? sections[2] : sections[1];

    const computedTitle = _.trim(
      fileNameFromTheTitle
        .replaceAll(':/', EMPTY_STRING)
        .replaceAll('/:', EMPTY_STRING)
        .replaceAll('.', EMPTY_STRING)
        .replaceAll('!', EMPTY_STRING)
        .replaceAll('?', EMPTY_STRING)
        .replaceAll('„', EMPTY_STRING)
        .replaceAll('”', EMPTY_STRING)
        .replaceAll(':', EMPTY_STRING)
        .replaceAll('  ', EMPTY_STRING)
        .replaceAll(',', EMPTY_STRING)
        .replaceAll('1X', EMPTY_STRING)
        .replaceAll('1x', EMPTY_STRING)
        .replaceAll('2X', EMPTY_STRING)
        .replaceAll('2x', EMPTY_STRING)
        .replaceAll('3X', EMPTY_STRING)
        .replaceAll('3x', EMPTY_STRING)
        .replaceAll('4X', EMPTY_STRING)
        .replaceAll('4x', EMPTY_STRING),
    );

    const maybeNewFilePath = path.join(
      __dirname,
      OUTPUT_DIR,
      `${computedTitle}.txt`,
    );

    const normalizedContent = _.trim(
      _.flatten(
        sections.map((section) => {
          if (section.startsWith('[')) {
            return [CARRIAGE_RETURN, section];
          }
          return section;
        }),
      ).join(NEW_LINE),
    );

    fs.writeFileSync(maybeNewFilePath, normalizedContent);
  });
};

(async () => {
  reprocess(fs.readdirSync(OUTPUT_DIR));
})();
