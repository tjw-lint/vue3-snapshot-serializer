import {
  booleanDefaults,
  loadOptions
} from '@/loadOptions.js';

describe('Load options', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {};
  });

  const defaultSettings = Object.freeze(booleanDefaults);

  test('Returns defaults', () => {
    delete globalThis.vueSnapshots;

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual(defaultSettings);
  });

  test('Override defaults', () => {
    const invertedDefaults = {};
    for (const setting in defaultSettings) {
      invertedDefaults[setting] = !defaultSettings[setting];
    }
    globalThis.vueSnapshots = invertedDefaults;

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual(invertedDefaults);
  });

  test('Removes non-settings', () => {
    globalThis.vueSnapshots = {
      fake: true,
      notReal: false
    };

    loadOptions();

    expect(globalThis.vueSnapshots.fake)
      .toEqual(undefined);

    expect(globalThis.vueSnapshots.notReal)
      .toEqual(undefined);
  });
});
