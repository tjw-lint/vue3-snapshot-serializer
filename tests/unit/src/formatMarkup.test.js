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
    globalThis.vueSnapshots.formatter = function () {
      return 'test';
    };

    expect(formatMarkup(unformattedMarkup))
      .toEqual('test');

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Logs warning if custom function does not return a string', () => {
    globalThis.vueSnapshots.formatter = function () {
      return 5;
    };

    expect(unformattedMarkup)
      .toMatchInlineSnapshot(`
        <div id="header">
          <h1>Hello World!</h1>
          <ul class="list" id="main-list"><li><a class="link" href="#">My HTML</a></li></ul>
        </div>
      `);

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Your custom markup formatter must return a string.');
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

      expect(formatMarkup(input))
        .toMatchInlineSnapshot(`
          <pre>
            <code>
              &lt;div title="text"&gt;1 &amp; 2&nbsp;+&nbsp;3&lt;/div&gt;
            </code></pre>
        `);
    });

    test('Discard', () => {
      globalThis.vueSnapshots.formatting.escapeInnerText = false;

      expect(formatMarkup(input))
        .toMatchInlineSnapshot(`
          <pre>
            <code>
              <div title="text">1 & 2 + 3</div>
            </code></pre>
        `);
    });
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
            <path d=""></path>
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

    test('Formats void elements using in HTML style', () => {
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

    test('Formats void elements using in XHTML style', () => {
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

    test('Formats void elements using in XML style', () => {
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

  describe('Tags with White Space Preserved', () => {
    let MyComponent;
    beforeEach(() => {
      MyComponent = {
        template: `<div>Hello World</div>
          <a>Hello World</a>
          <pre>Hello World</pre>`
      };
      globalThis.vueSnapshots.formatter = 'diffable';
    });

    test('Default WhiteSpace Preserved Tags', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = ['a', 'pre'];

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            Hello World
          </div>
          <a>Hello World</a>
          <pre>Hello World</pre>
        `);
    });

    test('Provided Tags are WhiteSpace Preserved Tags', async () => {
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

    test('No Tags are WhiteSpace Preserved Tags', async () => {
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

    test('No Tags are WhiteSpace Preserved Tags using boolean', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = false;

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

    test('All tags are WhiteSpace Preserved Tags', async () => {
      const wrapper = mount(MyComponent);
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = true;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>Hello World</div>
          <a>Hello World</a>
          <pre>Hello World</pre>
        `);
    });
  });
});
