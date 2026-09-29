import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

// Relative imports need their `.js` extension; `npm run typecheck` enforces
// that (TS2835), so no ESLint plugin is needed for it.
export default defineConfig(
  {
    ignores: ['LaTeX/songbook/target-tex/'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
);
