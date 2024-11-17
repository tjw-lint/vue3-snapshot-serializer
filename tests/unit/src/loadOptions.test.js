import {
  booleanDefaults,
  formattingBooleanDefaults,
  loadOptions
} from '@/loadOptions.js';

describe('Load options', () => {
  const info = console.info;

  beforeEach(() => {
    console.info = vi.fn();
    globalThis.vueSnapshots = {
      formatting: {}
    };
  });

  afterEach(() => {
    console.info = info;
  });

  const defaultSettings = Object.freeze({
    ...booleanDefaults,
    attributesToClear: [],
    formatter: 'diffable',
    formatting: {
      ...formattingBooleanDefaults,
      attributesPerLine: 1,
      tagsWithWhitespacePreserved: ['a', 'pre'],
      voidElements: 'xhtml'
    }
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

  test('Removes formatting non-settings', () => {
    globalThis.vueSnapshots = {
      formatter: 'diffable',
      formatting: {
        attributesPerLine: 3,
        fake: true,
        notReal: false
      }
    };

    loadOptions();

    expect(globalThis.vueSnapshots.formatting.fake)
      .toEqual(undefined);

    expect(globalThis.vueSnapshots.formatting.notReal)
      .toEqual(undefined);

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Removed invalid setting global.vueSnapshots.formatting.fake');

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Removed invalid setting global.vueSnapshots.formatting.notReal');
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
        formatter: 'invalid'
      };

      loadOptions();

      expect(globalThis.vueSnapshots.formatter)
        .toEqual('diffable');

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Allowed values for global.vueSnapshots.formatter are \'none\', \'diffable\', or a custom function');
    });

    test('None', () => {
      global.vueSnapshots = {
        formatter: 'none'
      };

      loadOptions();

      expect(globalThis.vueSnapshots.formatter)
        .toEqual('none');

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Diffable', () => {
      global.vueSnapshots = {};

      loadOptions();

      expect(globalThis.vueSnapshots.formatter)
        .toEqual('diffable');

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Custom function', () => {
      function formatter (markup) {
        return markup.toUpperCase();
      }
      global.vueSnapshots = { formatter };

      loadOptions();

      expect(globalThis.vueSnapshots.formatter)
        .toEqual(formatter);

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Warns and deletes formatting options if not using diffable formatter', () => {
      global.vueSnapshots.formatter = 'none';
      global.vueSnapshots.formatting = { emptyAttributes: true };

      loadOptions();

      expect(globalThis.vueSnapshots.formatting)
        .toEqual(undefined);

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: When setting the formatter to "none" or a custom function, all formatting options will be removed.');
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

    test('Logs if invalid voidElements input', () => {
      globalThis.vueSnapshots.formatting.voidElements = 'fake value';

      loadOptions();

      expect(console.info)
        .toHaveBeenCalledWith([
          'Vue 3 Snapshot Serializer:',
          'global.vueSnapshots.formatting.voidElements',
          'must be either \'xhtml\', \'html\', \'xml\', or undefined.'
        ].join(' '));
    });
  });

  describe('Diffable formatter booleans', () => {
    test('Logs if falsy boolean is non-boolean', () => {
      globalThis.vueSnapshots = {
        formatting: {
          escapeInnerText: 22
        }
      };

      loadOptions();

      expect(console.info)
        .toHaveBeenCalledWith([
          'Vue 3 Snapshot Serializer:',
          'global.vueSnapshots.formatting.escapeInnerText',
          'should be a boolean or undefined.',
          'Using default value (true).'
        ].join(' '));
    });
  });

  describe('Diffable Formatter attributesPerLine Options', () => {
    beforeEach(() => {
      globalThis.vueSnapshots.formatter = 'diffable';
      globalThis.vueSnapshots.formatting = {};
    });

    const testCases = [
      [-1, 1],
      [0, 0],
      ['', 1],
      [true, 1],
      [100, 100],
      [7.5, 1],
      [null, 1]
    ];

    test.each(testCases)('Attributes per line when value is "%s"', (value, expected) => {
      globalThis.vueSnapshots.formatting.attributesPerLine = value;
      loadOptions();

      expect(global.vueSnapshots.formatting.attributesPerLine)
        .toEqual(expected);
    });

    test('Logger message', () => {
      globalThis.vueSnapshots.formatting.attributesPerLine = 3.5;
      loadOptions();

      expect(globalThis.vueSnapshots.formatting.attributesPerLine)
        .toEqual(1);

      expect(console.info)
        .toHaveBeenCalledWith([
          'Vue 3 Snapshot Serializer:',
          'global.vueSnapshots.formatting.attributesPerLine',
          'must be a whole number.'
        ].join(' '));
    });
  });

  describe('Diffable Formatter Preserve WhiteSpace in Tags Options', () => {
    beforeEach(() => {
      globalThis.vueSnapshots.formatter = 'diffable';
      globalThis.vueSnapshots.formatting = {};
    });

    const validInputScenarios = [
      [true, true],
      [false, []],
      [[], []],
      [['div'], ['div']]
    ];

    const invalidInputScenarios = [
      [-1, ['a', 'pre']],
      ['', ['a', 'pre']],
      [null, ['a', 'pre']],
      ['orange jucie', ['a', 'pre']],
      [['div', 'a', 'input', 1, null], ['div', 'a', 'input']]
    ];

    const testCases = [...validInputScenarios, ...invalidInputScenarios];

    test.each(invalidInputScenarios)('Logs if value passed is %s', (value) => {
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = value;
      loadOptions();

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: vueSnapshots.formatting.tagsWithWhitespacePreserved must an be Array of tag names, like [\'a\' ,\'pre\'], or a boolean for all tags, or no tags.');
    });

    test.each(validInputScenarios)('Logs if value passed is %s', (value) => {
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = value;
      loadOptions();

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test.each(testCases)('White Space Preserved Tags when value is %s', (value, expected) => {
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = value;
      loadOptions();

      expect(global.vueSnapshots.formatting.tagsWithWhitespacePreserved)
        .toEqual(expected);
    });
  });
});
