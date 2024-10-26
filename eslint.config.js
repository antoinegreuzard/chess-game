const { Linter } = require('eslint');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');

const config = /** @type {Linter.FlatConfig[]} */ ([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json', // Assurez-vous que le chemin est correct
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]);

module.exports = config;
