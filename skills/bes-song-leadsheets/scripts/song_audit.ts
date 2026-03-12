#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { verifyStructure } from '../../../src/contentStructureValidator.js';
import { parse } from '../../../src/songParser.js';
import { print } from '../../../src/songPrinter.js';
import { convertSongToLeadsheet } from '../../../src/songToLeadsheetConverter.js';

type AuditFlags = {
  rewrite: boolean;
  texOutput?: string;
};

const usage = () => {
  console.log(`Usage:
  node --no-warnings=ExperimentalWarning --loader ts-node/esm \\
    ./skills/bes-song-leadsheets/scripts/song_audit.ts <song-file> [--rewrite] [--tex-output <out.tex>]
`);
};

const parseArgs = (argv: string[]) => {
  const [songFile, ...rest] = argv;

  if (!songFile) {
    throw new Error('Missing <song-file> argument.');
  }

  const flags: AuditFlags = { rewrite: false };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === '--rewrite') {
      flags.rewrite = true;
      continue;
    }

    if (token === '--tex-output') {
      const output = rest[index + 1];

      if (!output) {
        throw new Error('Missing value for --tex-output.');
      }

      flags.texOutput = output;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option "${token}".`);
  }

  return {
    flags,
    songFilePath: path.resolve(songFile),
  };
};

const main = () => {
  try {
    const { songFilePath, flags } = parseArgs(process.argv.slice(2));

    if (!fs.existsSync(songFilePath)) {
      throw new Error(`Song file does not exist: ${songFilePath}`);
    }

    const raw = fs.readFileSync(songFilePath, 'utf8');
    verifyStructure(raw);

    const canonical = print(parse(raw));
    const parsedCanonical = parse(canonical, { rejoinSubsections: true });
    const texOutput = convertSongToLeadsheet(parsedCanonical);

    if (flags.rewrite && canonical !== raw) {
      fs.writeFileSync(songFilePath, canonical);
    }

    if (flags.texOutput) {
      const texOutputPath = path.resolve(flags.texOutput);
      fs.mkdirSync(path.dirname(texOutputPath), { recursive: true });
      fs.writeFileSync(texOutputPath, texOutput);
    }

    const sectionsWithoutChordMarkup = parsedCanonical.sectionOrder.filter(
      (sectionIdentifier) =>
        !parsedCanonical.sectionsMap[sectionIdentifier].content.includes('^'),
    );

    const report = {
      filePath: songFilePath,
      rewritten: flags.rewrite && canonical !== raw,
      canonicalChanged: canonical !== raw,
      texFileWritten: flags.texOutput ? path.resolve(flags.texOutput) : null,
      title: parsedCanonical.title,
      sequence: parsedCanonical.sequence,
      sectionOrder: parsedCanonical.sectionOrder,
      hasAnyChordMarkup: canonical.includes('^'),
      sectionsWithoutChordMarkup,
      meta: {
        alternative: parsedCanonical.alternative,
        composer: parsedCanonical.composer,
        writer: parsedCanonical.writer,
        arranger: parsedCanonical.arranger,
        interpreter: parsedCanonical.interpreter,
        band: parsedCanonical.band,
        genre: parsedCanonical.genre,
        key: parsedCanonical.key,
        tempo: parsedCanonical.tempo,
        tags: parsedCanonical.tags,
        version: parsedCanonical.version,
        rcId: parsedCanonical.rcId,
        id: parsedCanonical.id,
        contentHash: parsedCanonical.contentHash,
      },
    };

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error((error as Error).message);
    usage();
    process.exit(1);
  }
};

main();
