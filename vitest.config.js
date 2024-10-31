import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import {
  configDefaults,
  defineConfig
} from 'vitest/dist/config.js';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@@': fileURLToPath(new URL('./tests', import.meta.url))
    }
  },
  test: {
    coverage: {
      exclude: [
        ...(configDefaults?.coverage?.exclude || []),
        'types.js'
        // '**/dist/'
      ],
      reportsDirectory: './tests/unit/coverage',
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100
      }
    },
    environment: 'happy-dom',
    globals: true,
    root: '.',
    setupFiles: [
      './tests/unit/setup.js'
    ],
    snapshotSerializers: [
      './index.js'
    ]
  }
});
