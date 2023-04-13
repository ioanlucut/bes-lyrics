import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import * as process from 'process';
import { CARRIAGE_RETURN, NEW_LINE } from './constants';

dotenv.config();

const normalizeContent = (sections: string[]) => {
  const array = sections.map((section) => {
    if (section.startsWith('[')) {
      return [CARRIAGE_RETURN, section];
    }
    return section;
  });

  return _.trim(_.flatten(array).join(NEW_LINE));
};

const reprocess = (dir: string) => {
  console.log(`"Reprocessing file contents from ${dir} directory.."`);

  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(__dirname, dir, fileName);
    const fileContent = fs.readFileSync(filePath).toString();

    const sections = fileContent
      .split(/(\[.*])/gim)
      .filter(Boolean)
      .map(_.trim);

    fs.writeFileSync(filePath, normalizeContent(sections));
  });
};

(async () => {
  reprocess(process.env.CANDIDATES_DIR);
})();
