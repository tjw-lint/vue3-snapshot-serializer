import { stringManipulation } from '@/stringManipulation.js';

describe('String Manipulation', () => {
  test('Empty string', () => {
    expect(stringManipulation(''))
      .toEqual('');
  });

  test('Remove comments', () => {
    globalThis.vueSnapshots = {
      removeComments: true
    };

    const markup = [
      '<div>',
      '  <!---->',
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
      .toEqual('<div>\n        </div>');
  });
});
