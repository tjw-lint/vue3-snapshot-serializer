import {
  configDefaults,
  defineConfig
} from 'vitest/dist/config.js';

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...(configDefaults?.coverage?.exclude || [])
        // '.eslintrc.cjs',
        // '**/app/'
      ],
      reportsDirectory: './tests/unit/coverage'
    },
    environment: 'happy-dom',
    globals: true,
    root: '.',
    setupFiles: [
      './tests/unit/setup.js'
    ]
  }
});
