import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions:{
      globals: {
        describe: true,
        expect: true,
        global: true,
        test: true
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error'
    }
  }
];
