import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['src/app/api/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      'camelcase': ['error', { 
        'properties': 'never',
        'ignoreImports': true,
        'allow': ['^GET$', '^POST$', '^PUT$', '^DELETE$', '^PATCH$', '^HEAD$', '^OPTIONS$']
       }],
      'id-match': [
        'error',
        '^[a-z][a-zA-Z0-9]*$|^[A-Z][a-zA-Z0-9]*$|^[A-Z][A-Z0-9_]*$',
        {
          'onlyDeclarations': true,
          'ignoreDestructuring': true,
        }
      ],
      'no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      'no-console': 'off'
    }
  }
];