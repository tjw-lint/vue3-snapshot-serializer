import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions:{
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
      'no-unused-vars': 'error',
      'no-undef': 'error'
    }
  }
];
