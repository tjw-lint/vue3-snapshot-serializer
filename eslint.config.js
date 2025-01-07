/**
 * @file ESLint flat config file.
 */

import js from '@eslint/js';
import tjwBase from 'eslint-config-tjw-base';
import tjwJsdoc from 'eslint-config-tjw-jsdoc';

export default [
  js.configs.recommended,
  tjwBase,
  ...tjwJsdoc,

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
    },
    settings: {
      jsdoc: {
        mode: 'jsdoc'
      }
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
