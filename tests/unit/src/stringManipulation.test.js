import { stringManipulation } from '@/stringManipulation.js';

describe('String Manipulation', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {};
  });

  test('Empty string', () => {
    expect(stringManipulation(''))
      .toEqual('');
  });

  test('Remove comments', () => {
    globalThis.vueSnapshots.removeComments = true;

    const markup = [
      '<div>',
      '  <!---->',
      '  <!--v-if-->',
      '  <!--',
      '    line 1',
      '    line 2',
      '  -->',
      '  <!-- <div class="example">Text</div> -->',
      '  <!--',
      '    <h1 title="Some example text">',
      '      Some <strong>example</strong> text',
      '    </h1>',
      '    <p>Lorem ipsum</p>',
      '  -->',
      '</div>'
    ].join('\n');

    expect(stringManipulation(markup))
      .toEqual('<div>\n          </div>');
  });

  describe('Debug mode', () => {
    test('Main function', () => {
      globalThis.vueSnapshots.debug = true;
      stringManipulation('');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'stringManipulation.js:stringManipulation'
        });
    });

    test('Remove comments', () => {
      globalThis.vueSnapshots.removeComments = true;
      globalThis.vueSnapshots.debug = true;
      stringManipulation('<!-- -->');

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'stringManipulation.js:removeAllComments'
        });
    });
  });
});
