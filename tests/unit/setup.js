/**
 * @file The main setup file for Vitest, ran before every test
 */

const info = console.info;

global.beforeEach(() => {
  console.info = vi.fn();
});

global.afterEach(() => {
  console.info = info;
});
