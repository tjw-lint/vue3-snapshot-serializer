import js from '@eslint/js';
import tjwBase from 'eslint-config-tjw-base';

export default [
  js.configs.recommended,
  tjwBase,
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
    }
  }
];
