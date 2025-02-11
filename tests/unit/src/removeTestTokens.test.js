import { cheerioManipulation as removeTestTokens } from '@/cheerioManipulation.js';

describe('Remove test tokens', () => {
  const dataTest = '<div data-test="token">Test</div>';
  const dataTestid = '<div data-test-id="token">Test</div>';
  const dataTestId = '<div data-testid="token">Test</div>';
  const dataQa = '<div data-qa="token">Test</div>';
  const dataCy = '<div data-cy="token">Test</div>';
  const dataPw = '<div data-pw="token">Test</div>';
  const idTest = '<div id="testtoken">Test</div>';
  const classTest = '<div class="testtoken">Test</div>';
  const classCow = '<div class="cow">Test</div>';
  const div = '<div>Test</div>';

  beforeEach(() => {
    globalThis.vueSnapshots = {};
  });

  test('Remove all tokens', () => {
    globalThis.vueSnapshots = {
      debug: true,
      removeDataTest: true,
      removeDataTestid: true,
      removeDataTestId: true,
      removeDataQa: true,
      removeDataCy: true,
      removeDataPw: true,
      removeIdTest: true,
      removeClassTest: true
    };

    expect(removeTestTokens(dataTest))
      .toEqual(div);

    expect(removeTestTokens(dataTestid))
      .toEqual(div);

    expect(removeTestTokens(dataTestId))
      .toEqual(div);

    expect(removeTestTokens(dataQa))
      .toEqual(div);

    expect(removeTestTokens(dataCy))
      .toEqual(div);

    expect(removeTestTokens(dataPw))
      .toEqual(div);

    expect(removeTestTokens(idTest))
      .toEqual(div);

    expect(removeTestTokens(classTest))
      .toEqual(div);

    expect(removeTestTokens(classCow))
      .toEqual(classCow);

    expect(removeTestTokens(div))
      .toEqual(div);

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', { function: 'removeTestTokens.js:removeTestTokens' });

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', { function: 'removeTestTokens.js:removeDataAttribute' });

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', { function: 'removeTestTokens.js:removeIdTest' });

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', { function: 'removeTestTokens.js:removeClassTest' });
  });

  test('Retain test tokens', () => {
    globalThis.vueSnapshots = {
      removeDataTest: false,
      removeDataTestid: false,
      removeDataTestId: false,
      removeDataQa: false,
      removeDataCy: false,
      removeDataPw: false,
      removeIdTest: false,
      removeClassTest: false
    };

    expect(removeTestTokens(dataTest))
      .toEqual(dataTest);

    expect(removeTestTokens(dataTestid))
      .toEqual(dataTestid);

    expect(removeTestTokens(dataTestId))
      .toEqual(dataTestId);

    expect(removeTestTokens(dataQa))
      .toEqual(dataQa);

    expect(removeTestTokens(dataCy))
      .toEqual(dataCy);

    expect(removeTestTokens(dataPw))
      .toEqual(dataPw);

    expect(removeTestTokens(idTest))
      .toEqual(idTest);

    expect(removeTestTokens(classTest))
      .toEqual(classTest);

    expect(removeTestTokens(classCow))
      .toEqual(classCow);

    expect(removeTestTokens(div))
      .toEqual(div);
  });
});
