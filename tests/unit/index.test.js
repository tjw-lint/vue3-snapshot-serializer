import vue3SnapshotSerializer, { vueMarkupFormatter } from '../../index.js';

describe('index.js', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {};
  });

  describe('Serialization tester', () => {
    test('HTML is valid', () => {
      expect(vue3SnapshotSerializer.test('<div>Text</div>'))
        .toEqual(true);
    });

    test('Non-HTML is invalid', () => {
      expect(vue3SnapshotSerializer.test('Text'))
        .toEqual(false);
    });

    test('Non-string is invalid', () => {
      expect(vue3SnapshotSerializer.test(22))
        .toEqual(false);
    });

    test('Null is invalid', () => {
      expect(vue3SnapshotSerializer.test(null))
        .toEqual(false);
    });

    test('Object resembling VTU wrapper is valid', () => {
      const wrapper = {
        find: vi.fn(),
        html: vi.fn()
      };

      expect(vue3SnapshotSerializer.test(wrapper))
        .toEqual(true);
    });

    test('Object resembling TLV wrapper is valid', () => {
      const wrapper = {
        container: {
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(),
          toString: vi.fn()
        },
        html: vi.fn()
      };

      expect(vue3SnapshotSerializer.test(wrapper))
        .toEqual(true);
    });

    test('Object resembling TLV container is valid', () => {
      const container = {
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(),
        toString: vi.fn()
      };

      expect(vue3SnapshotSerializer.test(container))
        .toEqual(true);
    });

    test('Empty object is invalid', () => {
      expect(vue3SnapshotSerializer.test({}))
        .toEqual(false);
    });

    test('Debug mode', () => {
      globalThis.vueSnapshots.debug = true;
      vue3SnapshotSerializer.test('<div>Text</div>');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'index.js:test',
          details: [
            'Vue 3 Snapshot Serializer will only run on a string of',
            'HTML (first character is \'<\'), a Vue-Test-Utils wrapper,',
            'or a @Testing-Library/Vue render wrapper or container.'
          ].join(' '),
          data: {
            isHtml: true,
            isVueTestUtilsWrapper: false,
            isTestingLibraryVueWrapper: false,
            isTestingLibraryVueContainer: false,
            received: '<div>Text</div>'
          }
        });
    });
  });

  describe('Serialization printer', () => {
    test('Empty string', () => {
      expect(vue3SnapshotSerializer.print(''))
        .toEqual('');
    });

    test('Debug mode', () => {
      globalThis.vueSnapshots.debug = true;
      vue3SnapshotSerializer.print('');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'index.js:print',
          data: { received: '' }
        });
    });
  });

  describe('Markup formatter', () => {
    test('Empty string', () => {
      expect(vueMarkupFormatter(''))
        .toEqual('');
    });

    test('Simple markup', () => {
      globalThis.vueSnapshots = { formatter: 'none' };
      const markup = '<div>Hello</div>';

      expect(vueMarkupFormatter(markup))
        .toEqual('<div>Hello</div>');
    });

    test('Diffable markup', () => {
      const markup = '<div>Hello</div>';

      expect(vueMarkupFormatter(markup))
        .toEqual('<div>\n  Hello\n</div>');
    });

    test('Debug mode', () => {
      globalThis.vueSnapshots.debug = true;
      const html = '<div>Hello</div>';
      vueMarkupFormatter(html);

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'index.js:vueMarkupFormatter',
          data: { html }
        });
    });
  });
});
