import {
  booleanDefaults,
  loadOptions
} from '@/loadOptions.js';

describe('Load options', () => {
  const info = console.info;

  beforeEach(() => {
    console.info = vi.fn();
    globalThis.vueSnapshots = {};
  });

  afterEach(() => {
    console.info = info;
  });

  const defaultSettings = Object.freeze({
    ...booleanDefaults,
    attributesToClear: [],
    formatting: 'diffable'
  });

  test('Returns defaults', () => {
    delete globalThis.vueSnapshots;

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual(defaultSettings);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Override defaults', () => {
    const invertedDefaults = {
      attributesToClear: [false]
    };
    for (const setting in booleanDefaults) {
      invertedDefaults[setting] = !booleanDefaults[setting];
    }
    globalThis.vueSnapshots = invertedDefaults;

    loadOptions();

    expect(globalThis.vueSnapshots)
      .toEqual({
        ...invertedDefaults,
        attributesToClear: []
      });

    expect(console.info)
      .not.toHaveBeenCalled();
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

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Removed invalid setting global.vueSnapshots.fake');

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Removed invalid setting global.vueSnapshots.notReal');
  });

  describe('Attributes to clear', () => {
    test('Sets attributesToClear', () => {
      globalThis.vueSnapshots = {
        attributesToClear: ['title', 'id', 'two words', 22]
      };

      loadOptions();

      expect(globalThis.vueSnapshots.attributesToClear)
        .toEqual(['title', 'id']);

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Attributes should not inlcude a space in global.vueSnapshots.attributesToClear. Received: two words');

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Attributes must be a type of string in global.vueSnapshots.attributesToClear. Received: 22');
    });
  });

  describe('Formatting', () => {
    test('Warns about bad input', () => {
      global.vueSnapshots = {
        formatting: 'invalid'
      };

      loadOptions();

      expect(globalThis.vueSnapshots.formatting)
        .toEqual('diffable');

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Allowed values for global.vueSnapshots.formatting are \'none\', \'diffable\', or a custom function');
    });

    test('None', () => {
      global.vueSnapshots = {
        formatting: 'none'
      };

      loadOptions();

      expect(globalThis.vueSnapshots.formatting)
        .toEqual('none');

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Diffable', () => {
      global.vueSnapshots = {};

      loadOptions();

      expect(globalThis.vueSnapshots.formatting)
        .toEqual('diffable');

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Custom function', () => {
      function formatting (markup) {
        return markup.toUpperCase();
      }
      global.vueSnapshots = { formatting };

      loadOptions();

      expect(globalThis.vueSnapshots.formatting)
        .toEqual(formatting);

      expect(console.info)
        .not.toHaveBeenCalled();
    });
  });

  describe('Log helpful messages about options', () => {
    test('Logs if verbose is non boolean', () => {
      globalThis.vueSnapshots = {
        verbose: 44
      };

      loadOptions();

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: global.vueSnapshots.verbose should be a boolean or undefined. Using default value (true).');
    });

    test('Logs if falsy boolean is non-boolean', () => {
      globalThis.vueSnapshots = {
        verbose: true,
        removeDataCy: 22
      };

      loadOptions();

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: global.vueSnapshots.removeDataCy should be a boolean or undefined. Using default value (false).');
    });

    test('Does not log if verbose if false', () => {
      globalThis.vueSnapshots = {
        verbose: false,
        removeDataPw: 44
      };

      loadOptions();

      expect(console.info)
        .not.toHaveBeenCalled();
    });
  });
});
