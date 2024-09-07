import { loadOptions } from '@/loadOptions.js';

describe('Load options', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {};
  });

  test('Returns defaults', () => {
    delete globalThis.vueSnapshots;

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual({
        removeDataVId: true
      });
  });

  test('Override defaults', () => {
    globalThis.vueSnapshots = {
      removeDataVId: false
    };

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual({
        removeDataVId: false
      });
  });
});
