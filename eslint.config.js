/**
 * @file ESLint flat config file.
 */

import js from '@eslint/js';
import tjwBase from 'eslint-config-tjw-base';
import tjwJsdoc from 'eslint-config-tjw-jsdoc';
import pluginJest from 'eslint-plugin-jest';
import pluginTjwJest from 'eslint-config-tjw-jest';

export default [
  js.configs.recommended,
  tjwBase,
  ...tjwJsdoc,
  pluginJest.configs['flat/recommended'],
  pluginTjwJest.configs.recommended,

  // Project specific rules
  {
    languageOptions: {
      globals: {
        afterEach: true,
        beforeEach: true,
        describe: true,
        expect: true,
        global: true,
        test: true,
        vi: true
      }
    },
    rules: {
      // If this is not turned off, linting throws because it can't find 'jest' install
      'jest/no-deprecated-functions': 'off'
    }
  },

  // Override rules in the tests folder
  {
    files: ['tests/**/*'],
    rules: {
      'jsdoc/require-file-overview': 'off'
    }
  }
];
