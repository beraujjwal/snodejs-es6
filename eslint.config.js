import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import stylistic from '@stylistic/eslint-plugin'; // For formatting rules

export default [
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: {
      prettier,
      '@stylistic': stylistic,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Match Prettier formatting
      '@stylistic/indent': ['error', 2], // ✅ 2 spaces, not tabs
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],

      // Let Prettier handle final formatting
      'prettier/prettier': 'error',
    },
  },
];
