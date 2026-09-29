// Every script imports this before it runs: it moves to the repository root,
// so `.env` and the relative song directories resolve from any directory.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
dotenv.config({ quiet: true });
