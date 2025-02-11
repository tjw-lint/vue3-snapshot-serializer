import { mount } from '@vue/test-utils';

import {
  cheerioize,
  isHtmlString,
  isVueWrapper,
  logger,
  parseMarkup,
  stringify,
  swapQuotes
} from '@/helpers.js';

describe('Helpers', () => {
  const info = console.info;

  beforeEach(() => {
    globalThis.vueSnapshots = {};
    console.info = vi.fn();
  });

  afterEach(() => {
    console.info = info;
  });

  describe('IsHtmlString', () => {
    test('Value is HTML', () => {
      expect(isHtmlString('<div></div>'))
        .toEqual(true);
    });

    test('Value is not HTML', () => {
      expect(isHtmlString('console.log(2);'))
        .toEqual(false);
    });

    test('Value is not a string', () => {
      expect(isHtmlString({ html: vi.fn() }))
        .toEqual(false);
    });
  });

  describe('IsVueWrapper', () => {
    test('Is a Vue component wrapper', () => {
      const wrapper = mount({ template: '<div></div>' });

      expect(isVueWrapper(wrapper))
        .toEqual(true);
    });

    test('Is an object, but not a Vue wrapper', () => {
      expect(isVueWrapper({}))
        .toEqual(false);
    });

    test('Is not a Vue wrapper', () => {
      expect(isVueWrapper('<div></div>'))
        .toEqual(false);
    });
  });

  describe('Logger', () => {
    test('Skips logging if verbose false', () => {
      globalThis.vueSnapshots.verbose = false;
      logger('Text');

      expect(console.info)
        .not.toHaveBeenCalled();
    });

    test('Logs when verbose true', () => {
      globalThis.vueSnapshots.verbose = true;
      logger('Text');

      expect(console.info)
        .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Text');
    });

    test('Does not log when verbose false even if debug true', () => {
      globalThis.vueSnapshots.verbose = false;
      globalThis.vueSnapshots.debug = true;
      logger('Text');

      expect(console.info)
        .not.toHaveBeenCalled();
    });
  });

  describe('Stringify', () => {
    test('Null', () => {
      expect(stringify(null))
        .toEqual('null');
    });

    test('Undefined', () => {
      expect(stringify(undefined))
        .toEqual('undefined');
    });

    test('Not a number', () => {
      expect(stringify(NaN))
        .toEqual('NaN');
    });

    test('Infinity', () => {
      expect(stringify(Infinity))
        .toEqual('Infinity');
    });

    test('Negative Infinity', () => {
      expect(stringify(-Infinity))
        .toEqual('-Infinity');
    });

    test('Number', () => {
      expect(stringify(7))
        .toEqual('7');
    });

    test('Error', () => {
      expect(stringify(new Error('Text')))
        .toEqual('Error: Text');
    });

    test('Set', () => {
      expect(stringify(new Set(['a', 'b', 'c'])))
        .toEqual('["a","b","c"]');
    });

    test('Invalid Date', () => {
      expect(stringify(new Date({})))
        .toEqual('Invalid Date');
    });

    test('Date', () => {
      expect(stringify(new Date('2024-01-01')))
        .toEqual('1704067200000');
    });

    test('Function', () => {
      const fn = () => {
        return 2;
      };

      expect(stringify(fn))
        .toEqual('Function');
    });

    test('Empty Array', () => {
      expect(stringify(new Array()))
        .toEqual('[]');
    });

    test('Array', () => {
      expect(stringify(['a', 'b']))
        .toEqual('["a","b"]');
    });

    test('Boolean', () => {
      expect(stringify(true))
        .toEqual('true');
    });

    test('Symbol', () => {
      expect(stringify(Symbol()))
        .toEqual('');
    });

    test('Object', () => {
      const obj = {
        subValue: {
          key: '2'
        }
      };

      expect(stringify(obj))
        .toEqual('{subValue:{key:"2"}}');
    });
  });

  describe('SwapQuotes', () => {
    test('Swaps quotes', () => {
      expect(swapQuotes('That\'s some "Text".'))
        .toEqual('That"s some \'Text\'.');

      expect(swapQuotes('{ "key": "value" }'))
        .toEqual('{ \'key\': \'value\' }');
    });
  });

  describe('ParseMarkup', () => {
    test('Debug mode', () => {
      globalThis.vueSnapshots.debug = true;
      parseMarkup('');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', { function: 'helpers.js:parseMarkup' });
    });
  });

  describe('Cheerioize', () => {
    test('Debug mode', () => {
      globalThis.vueSnapshots.debug = true;
      cheerioize('');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', { function: 'helpers.js:cheerioize' });
    });
  });
});
