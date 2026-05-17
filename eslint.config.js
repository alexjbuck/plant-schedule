import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

// ESLint here is scoped to *.svelte files via the lint script.
// TypeScript / JavaScript linting is owned by oxlint (faster, separate run).
export default ts.config(
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        projectService: true,
        extraFileExtensions: ['.svelte'],
        svelteConfig
      }
    }
  },
  {
    ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'coverage/**']
  }
);
