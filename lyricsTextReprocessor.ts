import _ from 'lodash';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './out';
const EMPTY_STRING = '';

(async () => {
  const normalizeContent = (fileContent: string) =>
    _.trim(fileContent)
      .replaceAll(' si ', ' și ')
      .replaceAll(' isus ', ' Isus ')
      .replaceAll('dumnezeu', 'Dumnezeu')
      .replaceAll('doamne', 'doamne')
      .replaceAll(' fara ', ' fără ')
      .replaceAll(' tara ', ' țară ');

  const filenames = fs.readdirSync(OUTPUT_DIR);

  filenames.forEach((fileName) => {
    const filePath = path.join(path.join(__dirname, OUTPUT_DIR, fileName));
    const fileContent = fs.readFileSync(filePath).toString();

    const maybeNewFilePath = normalizeContent(
      filePath.replace('.md', '.txt').replace('BES 2023 ', EMPTY_STRING),
    );
    fs.renameSync(filePath, maybeNewFilePath);

    fs.writeFileSync(maybeNewFilePath, normalizeContent(fileContent));
  });
})();
