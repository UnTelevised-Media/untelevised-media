// eslint.config.mjs
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import boundariesPlugin from 'eslint-plugin-boundaries';

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
  // Global settings for boundaries plugin
  {
    settings: {
      'boundaries/include': ['src/**/*.ts', 'src/**/*.tsx'],
      'boundaries/elements': [
        {
          type: 'app',
          pattern: 'src/app/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'util',
          pattern: 'src/util/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'models',
          pattern: 'src/models/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'lib',
          pattern: 'src/lib/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'services',
          pattern: 'src/services/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'server',
          pattern: 'src/server/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'hooks',
          pattern: 'src/hooks/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'components',
          pattern: 'src/components/**',
          mode: 'full',
          capture: ['segment'],
        },
      ],
    },
  },
  // Main configuration
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
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
    settings: {
      'boundaries/include': ['src/**/*.ts', 'src/**/*.tsx'],
      'boundaries/ignore': ['node_modules', '.next'],
      'boundaries/elements': [
        {
          type: 'util',
          pattern: 'src/util/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'models',
          pattern: 'src/models/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'lib',
          pattern: 'src/lib/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'services',
          pattern: 'src/services/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'server',
          pattern: 'src/server/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'hooks',
          pattern: 'src/hooks/**',
          mode: 'full',
          capture: ['segment'],
        },
        {
          type: 'components',
          pattern: 'src/components/**',
          mode: 'full',
          capture: ['segment'],
        },
      ],
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
      boundaries: boundariesPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off', // Disabled in favor of @typescript-eslint/no-unused-vars

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
          varsIgnorePattern: '^_',
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
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'warn',
      'boundaries/no-unknown': ['warn'],
      'boundaries/no-unknown-files': ['warn'],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            // util can only import models
            {
              from: ['util'],
              allow: ['models'],
            },
            // models is self-contained
            {
              from: ['models'],
              allow: [],
            },
            // lib can import util and models
            {
              from: ['lib'],
              allow: ['util', 'models'],
            },
            // services can import util, lib, models
            {
              from: ['services'],
              allow: ['util', 'lib', 'models'],
            },
            // server can import util, lib, services, models
            {
              from: ['server'],
              allow: ['util', 'lib', 'services', 'models'],
            },
            // hooks can import util, lib, services, models
            {
              from: ['hooks'],
              allow: ['util', 'lib', 'services', 'models'],
            },
            // components can import everything (top layer)
            {
              from: ['components'],
              allow: ['util', 'lib', 'services', 'server', 'hooks', 'models', 'components'],
            },
          ],
        },
      ],
    },
  },
  // Type declaration files configuration
  {
    files: ['src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Type augmentations are intentionally unused in their declaring file
    },
  },
  // Test files configuration
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/jest.setup.ts'],
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
