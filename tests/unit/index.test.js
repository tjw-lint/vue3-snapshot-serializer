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

    test('Object resembling Vue wrapper is valid', () => {
      expect(vue3SnapshotSerializer.test({ html: vi.fn() }))
        .toEqual(true);
    });

    test('Empty object is invalid', () => {
      expect(vue3SnapshotSerializer.test({}))
        .toEqual(false);
    });
  });

  describe('Serialization printer', () => {
    test('Empty string', () => {
      expect(vue3SnapshotSerializer.print(''))
        .toEqual('');
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
  });
});
