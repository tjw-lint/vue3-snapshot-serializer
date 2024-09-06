import vue3SnapshotSerializer, { vueMarkupFormatter } from '../../index.js';

describe('index.js', () => {
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
  });
});
