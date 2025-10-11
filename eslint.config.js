import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';

export default [
  js.configs.recommended, // base ESLint rules
  // {
  //   ignores: ['node_modules/**', 'dist/**', 'src/system/**'], // ✅ move here
  // },
  {
    // files: ['src/**/*.js'], // ✅ applies only to src js files (excluding ignores)
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      // 🚫 Disable ESLint stylistic rules (Prettier handles this)
      semi: 'off',
      quotes: 'off',
      indent: 'off',
      'comma-dangle': 'off',

      // ✅ Prettier runs formatting
      'prettier/prettier': 'error',

      // ✅ Keep logic rules
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
];
