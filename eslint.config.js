// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // ✅ Prettier integration (formatting issues = lint errors)
      'prettier/prettier': 'error',

      // ✅ Recommended ESLint rules
      ...js.configs.recommended.rules,

      // ✅ Custom rules
      indent: ['error', 'tab'],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]);
