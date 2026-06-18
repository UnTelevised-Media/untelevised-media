// eslint.config.mjs
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';

export default [
  // Global ignores
  {
    ignores: [
      '**/*.woff2',
      '**/dist',
      '**/out',
      '**/node_modules',
      '**/.next/',
      '**/coverage',
      '**/public',
      '**/__tests__',
      '**/tailwind.config.ts',
      'src/components/ui/**',
      'src/hooks/use-toast.ts',
      'src/models/types/react-syntax-highlighter.d.ts',
      'supabase/**',
      '.supabase/**',
      '.claude/**',
    ],
  },
  // Main configuration
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: 'readonly',
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: importPlugin,
      react: reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-duplicate-imports': 'warn',
      'no-empty-function': 'off',
      'no-explicit-any': 'off',
      'no-extra-parens': 'off',
      'no-lone-blocks': 'warn',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'warn',
      'prefer-template': 'error',
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-unused-expressions': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'import/no-named-as-default': 'off',
      'import/prefer-default-export': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
    },
  },
  // Test files configuration
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/jest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
