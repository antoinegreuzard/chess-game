import { Linter } from 'eslint';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

const config = /** @type {Linter.FlatConfig[]} */ ([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.eslint.json', // Utilise le nouveau fichier de configuration
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

export default config;
