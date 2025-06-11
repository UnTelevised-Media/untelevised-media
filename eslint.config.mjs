import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '**/*.woff2',
    '**/dist',
    '**/out',
    '**/node_modules',
    '**/.next/',
    '**/coverage',
    '**/public',
    '**/*.woff2',
    '**/dist',
    '**/out',
    '**/node_modules',
    '**/.next/',
    '**/__tests__',
    '**/tailwind.config',
    'src/components/ui',
    'src/hooks/use-toast.ts',
  ]),
  {
    extends: compat.extends(
      'next',
      'next/core-web-vitals',
      'prettier',
      'plugin:@typescript-eslint/recommended'
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2023,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      'import/extensions': 'off',
      'import/no-cycle': 'warn',

      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],

      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-unresolved': 'off',
      'import/no-useless-path-segments': 'warn',
      'import/order': 'off',
      'import/prefer-default-export': 'warn',
      'import/no-duplicates': 'error',
      'no-duplicate-imports': 'warn',
      'no-empty-function': 'off',
      'no-explicit-any': 'off',
      'no-extra-parens': 'off',
      'no-lone-blocks': 'warn',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'warn',
      'prefer-template': 'error',
      'react/destructuring-assignment': 'warn',

      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
        },
      ],

      'react/jsx-curly-brace-presence': 'warn',
      'react/jsx-filename-extension': 'off',
      'react/jsx-indent': 'off',
      'react/jsx-indent-props': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-props-no-spreading': 'off',

      'react/jsx-sort-props': [
        'warn',
        {
          ignoreCase: true,
          reservedFirst: false,
          noSortAlphabetically: true,
        },
      ],

      'react/no-access-state-in-setstate': 'warn',
      'react/no-array-index-key': 'off',
      'react/no-did-update-set-state': 'off',
      'react/no-find-dom-node': 'warn',
      'react/no-unused-state': 'off',

      'react/prefer-stateless-function': [
        'warn',
        {
          ignorePureComponents: true,
        },
      ],

      'react/prop-types': 'off',
      'react/require-default-prop': 'off',
      'react/require-default-props': 'off',
      'react/self-closing-comp': 'warn',
      'react/sort-comp': 'warn',
      'react/static-property-placement': ['warn', 'static public field'],
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

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-unused-expressions': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/next.config.ts', '**/tailwind.config.ts', '**/jest.config.ts'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]);
