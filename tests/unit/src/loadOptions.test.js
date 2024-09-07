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
        removeDataVId: true,
        removeDataTest: true,
        removeDataTestid: true,
        removeDataTestId: true,
        removeDataQa: false,
        removeDataCy: false,
        removeDataPw: false,
        removeIdTest: false,
        removeClassTest: false
      });
  });

  test('Override defaults', () => {
    globalThis.vueSnapshots = {
      removeDataVId: false,
      removeDataTest: false,
      removeDataTestid: false,
      removeDataTestId: false,
      removeDataQa: true,
      removeDataCy: true,
      removeDataPw: true,
      removeIdTest: true,
      removeClassTest: true
    };

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual({
        removeDataVId: false,
        removeDataTest: false,
        removeDataTestid: false,
        removeDataTestId: false,
        removeDataQa: true,
        removeDataCy: true,
        removeDataPw: true,
        removeIdTest: true,
        removeClassTest: true
      });
  });
});
