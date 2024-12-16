import { mount } from '@vue/test-utils';

import {
  diffableFormatter,
  formatMarkup
} from '@/formatMarkup.js';

const unformattedMarkup = `
<div id="header">
  <h1>Hello World!</h1>
  <ul id="main-list" class="list"><li><a class="link" href="#">My HTML</a></li></ul>
</div>
`.trim();

describe('Format markup', () => {
  const info = console.info;

  beforeEach(() => {
    globalThis.vueSnapshots = {
      formatting: {}
    };
    console.info = vi.fn();
  });

  afterEach(() => {
    console.info = info;
  });

  test('Does no formatting', () => {
    globalThis.vueSnapshots.formatter = 'none';

    expect(formatMarkup(unformattedMarkup))
      .toEqual(unformattedMarkup);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Formats HTML to be diffable', () => {
    globalThis.vueSnapshots.formatter = 'diffable';

    expect(unformattedMarkup)
      .toMatchInlineSnapshot(`
        <div id="header">
          <h1>
            Hello World!
          </h1>
          <ul
            class="list"
            id="main-list"
          >
            <li>
              <a
                class="link"
                href="#"
              >My HTML</a>
            </li>
          </ul>
        </div>
      `);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Applies custom formatting', () => {
    globalThis.vueSnapshots.postProcessor = function (input) {
      return input.toUpperCase();
    };

    expect(unformattedMarkup)
      .toMatchInlineSnapshot(`
        <DIV ID="HEADER">
          <H1>
            HELLO WORLD!
          </H1>
          <UL
            CLASS="LIST"
            ID="MAIN-LIST"
          >
            <LI>
              <A
                CLASS="LINK"
                HREF="#"
              >MY HTML</A>
            </LI>
          </UL>
        </DIV>
      `);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Logs warning if custom function does not return a string', () => {
    globalThis.vueSnapshots.postProcessor = function () {
      return 5;
    };

    expect(unformattedMarkup)
      .toMatchInlineSnapshot('');

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Your custom markup post processor must return a string.');
  });

  describe('diffableFormatter', () => {
    test('No arguments', () => {
      expect(diffableFormatter())
        .toEqual('');
    });
  });

  describe('HTML entity encoding', () => {
    // non-breaking-space character code
    const nbsp = '\xa0';
    const input = [
      '<pre><code>',
      '&lt;div title="text"&gt;1 &amp; 2&nbsp;+' + nbsp + '3&lt;/div&gt;',
      '</code></pre>'
    ].join('');

    test('Retain', () => {
      globalThis.vueSnapshots.formatting.escapeInnerText = true;

      expect(input)
        .toMatchInlineSnapshot(`
          <pre><code>&lt;div title="text"&gt;1 &amp; 2&nbsp;+&nbsp;3&lt;/div&gt;</code></pre>
        `);
    });

    /* eslint-disable no-irregular-whitespace */
    test('Discard', () => {
      globalThis.vueSnapshots.formatting.escapeInnerText = false;

      expect(input)
        .toMatchInlineSnapshot(`
          <pre><code><div title="text">1 & 2 + 3</div></code></pre>
        `);
    });
    /* eslint-enable no-irregular-whitespace */
  });

  describe('Comments', () => {
    let MyComponent;

    beforeEach(() => {
      MyComponent = {
        template: `
          <div>
            <!-- Single Line -->
            <p>1</p>
            <!--
              Multi
              Line
            -->
            <p>2</p>
            <p v-if="false">3</p>
            <!--         Weird    Spacing

                 Weird   Spacing
                 -->
          </div>
        `
      };
    });

    test('Formats comments accurately', () => {
      const wrapper = mount(MyComponent);

      globalThis.vueSnapshots.formatter = 'diffable';
      globalThis.vueSnapshots.removeComments = false;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            <!-- Single Line -->
            <p>
              1
            </p>
            <!--
              Multi
              Line
            -->
            <p>
              2
            </p>
            <!-- v-if -->
            <!--     Weird    Spacing

              Weird   Spacing
            -->
          </div>
        `);
    });

    test('Removes comments', () => {
      const wrapper = mount(MyComponent);

      globalThis.vueSnapshots.formatter = 'diffable';
      globalThis.vueSnapshots.removeComments = true;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            <p>
              1
            </p>
            <p>
              2
            </p>
          </div>
        `);
    });

    test('Minifies empty comment', () => {
      expect('<!--  -->')
        .toMatchInlineSnapshot('<!---->');
    });
  });

  describe('Show empty attributes', () => {
    let MyComponent;

    beforeEach(() => {
      MyComponent = {
        template: '<div class="x y" id title="">Text</div><p class></p>'
      };
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    test('Enabled', async () => {
      const wrapper = mount(MyComponent);

      globalThis.vueSnapshots.formatting.emptyAttributes = true;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div
            class="x y"
            id=""
            title=""
          >
            Text
          </div>
          <p class=""></p>
        `);
    });

    test('Disabled', async () => {
      const wrapper = mount(MyComponent);

      globalThis.vueSnapshots.formatting.emptyAttributes = false;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div
            class="x y"
            id
            title
          >
            Text
          </div>
          <p class></p>
        `);
    });
  });

  describe('Self Closing Tags', () => {
    let MyComponent;

    beforeEach(() => {
      MyComponent = {
        template: '<div></div><span class="orange"></span><svg><path d=""></path></svg> <input></input> <input type="range"> <textarea></textarea>'
      };
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    test('Enabled', () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.selfClosingTag = true;
      globalThis.vueSnapshots.formatting.voidElements = 'html';

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div />
          <span class="orange" />
          <svg>
            <path d="" />
          </svg>
          <input value="''">
          <input
            type="range"
            value="''"
          >
          <textarea value="''"></textarea>
        `);
    });

    test('Disabled', () => {
      const wrapper = mount(MyComponent);

      globalThis.vueSnapshots.formatting.selfClosingTag = false;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div></div>
          <span class="orange"></span>
          <svg>
            <path d="" />
          </svg>
          <input value="''" />
          <input
            type="range"
            value="''"
          />
          <textarea value="''"></textarea>
        `);
    });
  });

  describe('Void elements', () => {
    beforeEach(() => {
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    const INPUT = '<input><input type="range"><input type="range" max="50">';

    test('Formats void elements using HTML style', () => {
      globalThis.vueSnapshots.formatting.voidElements = 'html';

      expect(INPUT)
        .toMatchInlineSnapshot(`
          <input>
          <input type="range">
          <input
            max="50"
            type="range"
          >
        `);
    });

    test('Formats void elements using XHTML style', () => {
      globalThis.vueSnapshots.formatting.voidElements = 'xhtml';

      expect(INPUT)
        .toMatchInlineSnapshot(`
          <input />
          <input type="range" />
          <input
            max="50"
            type="range"
          />
        `);
    });

    test('Formats void elements using XML style', () => {
      globalThis.vueSnapshots.formatting.voidElements = 'xml';

      expect(INPUT)
        .toMatchInlineSnapshot(`
          <input></input>
          <input type="range"></input>
          <input
            max="50"
            type="range"
          ></input>
        `);
    });

    describe('SVG elements', () => {
      const svg = [
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<g filter="url(#test-id)">',
        '<path fill="none" stroke="red" d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"></path>',
        '</g>',
        '<defs>',
        '<filter color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="26" id="test-id" width="24" x="-2" y="-2">',
        '<feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>',
        '<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>',
        '<feOffset dy="2"></feOffset>',
        '<feGaussianBlur stdDeviation="1"></feGaussianBlur>',
        '<feColorMatrix values="0 0 0 0 0.0784314 0 0 0 0 0.12549 0 0 0 0 0.160784 0 0 0 0.12 0"></feColorMatrix>',
        '<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_123"></feBlend>',
        '<feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>',
        '<feOffset></feOffset>',
        '<feGaussianBlur stdDeviation="1"></feGaussianBlur>',
        '<feColorMatrix values="0 0 0 0 0.08 0 0 0 0 0.124 0 0 0 0 0.16 0 0 0 0.12 0"></feColorMatrix>',
        '<feBlend in2="effect1_dropShadow_123" result="effect2_dropShadow_123"></feBlend>',
        '<feBlend in="SourceGraphic" in2="effect2_dropShadow_123" result="shape"></feBlend>',
        '</filter>',
        '</defs>',
        '</svg>'
      ].join('');

      beforeEach(() => {
        globalThis.vueSnapshots.formatting.attributesPerLine = 0;
      });

      test('Formats SVG elements using HTML style', () => {
        globalThis.vueSnapshots.formatting.voidElements = 'html';

        expect(svg)
          .toMatchInlineSnapshot(`
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                filter="url(#test-id)"
              >
                <path
                  d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
                  fill="none"
                  stroke="red"
                />
              </g>
              <defs>
                <filter
                  color-interpolation-filters="sRGB"
                  filterUnits="userSpaceOnUse"
                  height="26"
                  id="test-id"
                  width="24"
                  x="-2"
                  y="-2"
                >
                  <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  />
                  <feOffset
                    dy="2"
                  />
                  <feGaussianBlur
                    stdDeviation="1"
                  />
                  <feColorMatrix
                    values="0 0 0 0 0.0784314 0 0 0 0 0.12549 0 0 0 0 0.160784 0 0 0 0.12 0"
                  />
                  <feBlend
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_123"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  />
                  <feOffset />
                  <feGaussianBlur
                    stdDeviation="1"
                  />
                  <feColorMatrix
                    values="0 0 0 0 0.08 0 0 0 0 0.124 0 0 0 0 0.16 0 0 0 0.12 0"
                  />
                  <feBlend
                    in2="effect1_dropShadow_123"
                    result="effect2_dropShadow_123"
                  />
                  <feBlend
                    in="SourceGraphic"
                    in2="effect2_dropShadow_123"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          `);
      });

      test('Formats SVG elements using XHTML style', () => {
        globalThis.vueSnapshots.formatting.voidElements = 'xhtml';

        expect(svg)
          .toMatchInlineSnapshot(`
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                filter="url(#test-id)"
              >
                <path
                  d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
                  fill="none"
                  stroke="red"
                />
              </g>
              <defs>
                <filter
                  color-interpolation-filters="sRGB"
                  filterUnits="userSpaceOnUse"
                  height="26"
                  id="test-id"
                  width="24"
                  x="-2"
                  y="-2"
                >
                  <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  />
                  <feOffset
                    dy="2"
                  />
                  <feGaussianBlur
                    stdDeviation="1"
                  />
                  <feColorMatrix
                    values="0 0 0 0 0.0784314 0 0 0 0 0.12549 0 0 0 0 0.160784 0 0 0 0.12 0"
                  />
                  <feBlend
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_123"
                  />
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  />
                  <feOffset />
                  <feGaussianBlur
                    stdDeviation="1"
                  />
                  <feColorMatrix
                    values="0 0 0 0 0.08 0 0 0 0 0.124 0 0 0 0 0.16 0 0 0 0.12 0"
                  />
                  <feBlend
                    in2="effect1_dropShadow_123"
                    result="effect2_dropShadow_123"
                  />
                  <feBlend
                    in="SourceGraphic"
                    in2="effect2_dropShadow_123"
                    result="shape"
                  />
                </filter>
              </defs>
            </svg>
          `);
      });

      test('Formats SVG elements using XML style', () => {
        globalThis.vueSnapshots.formatting.voidElements = 'xml';

        expect(svg)
          .toMatchInlineSnapshot(`
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                filter="url(#test-id)"
              >
                <path
                  d="M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
                  fill="none"
                  stroke="red"
                ></path>
              </g>
              <defs>
                <filter
                  color-interpolation-filters="sRGB"
                  filterUnits="userSpaceOnUse"
                  height="26"
                  id="test-id"
                  width="24"
                  x="-2"
                  y="-2"
                >
                  <feFlood
                    flood-opacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset
                    dy="2"
                  ></feOffset>
                  <feGaussianBlur
                    stdDeviation="1"
                  ></feGaussianBlur>
                  <feColorMatrix
                    values="0 0 0 0 0.0784314 0 0 0 0 0.12549 0 0 0 0 0.160784 0 0 0 0.12 0"
                  ></feColorMatrix>
                  <feBlend
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_123"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset></feOffset>
                  <feGaussianBlur
                    stdDeviation="1"
                  ></feGaussianBlur>
                  <feColorMatrix
                    values="0 0 0 0 0.08 0 0 0 0 0.124 0 0 0 0 0.16 0 0 0 0.12 0"
                  ></feColorMatrix>
                  <feBlend
                    in2="effect1_dropShadow_123"
                    result="effect2_dropShadow_123"
                  ></feBlend>
                  <feBlend
                    in="SourceGraphic"
                    in2="effect2_dropShadow_123"
                    result="shape"
                  ></feBlend>
                </filter>
              </defs>
            </svg>
          `);
      });
    });
  });

  describe('Stubbed components', () => {
    test('Fake TR In TBODY fragment', () => {
      const markup = `
        <tbody>
          <tr><td>Text</td></tr>
          <fake-tr />
        </tbody>
      `.trim();

      expect(markup)
        .toMatchInlineSnapshot(`
          <tbody>
            <tr>
              <td>
                Text
              </td>
            </tr>
            <fake-tr></fake-tr>
          </tbody>
        `);
    });

    test('Fake TR in normal table', () => {
      const markup = `
        <table>
          <tbody>
            <tr><td>Text</td></tr>
            <fake-tr />
          </tbody>
        </table>
      `.trim();

      expect(markup)
        .toMatchInlineSnapshot(`
          <table>
            <tbody>
              <tr>
                <td>
                  Text
                </td>
              </tr>
              <fake-tr></fake-tr>
            </tbody>
          </table>
        `);
    });
  });

  describe('Attributes Per Line', () => {
    let MyComponent;

    beforeEach(() => {
      MyComponent = {
        template: `<span></span>
        <span class="cow dog"></span>
        <span class="cow dog" id="animals"></span>
        <span class="cow dog" id="animals" title="Moo"></span>`
      };
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    test('Attributes Per Line set to 0', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.attributesPerLine = 0;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <span></span>
          <span
            class="cow dog"
          ></span>
          <span
            class="cow dog"
            id="animals"
          ></span>
          <span
            class="cow dog"
            id="animals"
            title="Moo"
          ></span>
        `);
    });

    test('Attributes Per Line set to Default', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.attributesPerLine = 1;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <span></span>
          <span class="cow dog"></span>
          <span
            class="cow dog"
            id="animals"
          ></span>
          <span
            class="cow dog"
            id="animals"
            title="Moo"
          ></span>
        `);
    });

    test('Attributes Per Line set to 2', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.attributesPerLine = 2;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <span></span>
          <span class="cow dog"></span>
          <span class="cow dog" id="animals"></span>
          <span
            class="cow dog"
            id="animals"
            title="Moo"
          ></span>
        `);
    });

    test('Attributes Per Line set to 3', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.attributesPerLine = 3;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <span></span>
          <span class="cow dog"></span>
          <span class="cow dog" id="animals"></span>
          <span class="cow dog" id="animals" title="Moo"></span>
        `);
    });
  });

  describe('Tags with whitespace preserved', () => {
    let MyComponent;

    beforeEach(() => {
      MyComponent = {
        template: `<div>Hello World</div>
          <a>Hello World</a>
          <pre>Hello World</pre>`
      };
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    test('Default whitespace preserved tags', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = undefined;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            Hello World
          </div>
          <a>Hello World</a>
          <pre>Hello World</pre>
        `);
    });

    test('Provided tags are whitespace preserved tags', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = ['div'];

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>Hello World</div>
          <a>
            Hello World
          </a>
          <pre>
            Hello World
          </pre>
        `);
    });

    test('No tags have whitespace preserved', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = [];

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            Hello World
          </div>
          <a>
            Hello World
          </a>
          <pre>
            Hello World
          </pre>
        `);
    });

    test('Returns occur after whitespace preserved tag', () => {
      const markup = [
        '<h3>This boilerplate uses <a href="#" title="vitejs.dev">Vite</a> +',
        '<a href="#" title="vuejs.org">Vue 3</a> + and the astounding',
        '<a href="#" title="pinia.vuejs.org">Pinia</a>.</h3>'
      ].join(' ');

      expect(markup)
        .toMatchInlineSnapshot(`
          <h3>
            This boilerplate uses
            <a
              href="#"
              title="vitejs.dev"
            >Vite</a>
            +
            <a
              href="#"
              title="vuejs.org"
            >Vue 3</a>
            + and the astounding
            <a
              href="#"
              title="pinia.vuejs.org"
            >Pinia</a>
            .
          </h3>
        `);
    });

    test('Pre tag returns match browser parsing', () => {
      const markup = [
        '<pre>',
        '  Hello World <div>Hello World <p>Hello World</p></div>',
        '</pre>'
      ].join('\n');

      // Browsers and parse5 ignore the first return in a <pre> tag.
      // So although the snapshot looks weird, it's "accurate".

      expect(markup)
        .toMatchInlineSnapshot(`
          <pre>  Hello World <div>Hello World <p>Hello World</p></div>
          </pre>
        `);
    });

    test('Proper attribute indentation on nested child', () => {
      const markup = [
        '<div>',
        '<pre>',
        '<code>',
        '<span>',
        '<strong title="a" class="b">',
        'text',
        '</strong>',
        '</span>',
        '</code>',
        '</pre>',
        '</div>'
      ].join('');

      expect(markup)
        .toMatchInlineSnapshot(`
          <div>
            <pre><code><span><strong
              class="b"
              title="a"
            >text</strong></span></code></pre>
          </div>
        `);
    });

    test('Proper attribute indentation on nested children', () => {
      const markup = [
        '<div>',
        '<pre>',
        '<code>',
        '<span title="c" class="d">',
        '<strong title="a" class="b">',
        'text',
        '</strong>',
        '</span>',
        '</code>',
        '</pre>',
        '</div>'
      ].join('');

      expect(markup)
        .toMatchInlineSnapshot(`
          <div>
            <pre><code><span
              class="d"
              title="c"
            ><strong
              class="b"
              title="a"
            >text</strong></span></code></pre>
          </div>
        `);
    });
  });
});
