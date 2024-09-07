import { stringManipulation } from '@/stringManipulation.js';

describe('String Manipulation', () => {
  test('Empty string', () => {
    expect(stringManipulation(''))
      .toEqual('');
  });
});
