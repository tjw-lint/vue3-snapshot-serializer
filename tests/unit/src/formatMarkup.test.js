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

const formattedMarkup = `
<div id="header">
  <h1>
    Hello World!
  </h1>
  <ul
    id="main-list"
    class="list"
  >
    <li>
      <a
        class="link"
        href="#"
      >My HTML</a>
    </li>
  </ul>
</div>
`.trim();

const unformattedMarkupVoidElements = `
<input>
<input type="range"><input type="range" max="50">
`.trim();

const formattedMarkupVoidElementsWithHTML = `
<input>
<input type="range">
<input
  type="range"
  max="50"
>
`.trim();

const formattedMarkupVoidElementsWithXHTML = `
<input />
<input type="range" />
<input
  type="range"
  max="50"
/>
`.trim();

const formattedMarkupVoidElementsWithClosingTag = `
<input></input>
<input type="range"></input>
<input
  type="range"
  max="50"
></input>
`.trim();

describe('Format markup', () => {
  const info = console.info;

  beforeEach(() => {
    globalThis.vueSnapshots = {
      verbose: true,
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

    expect(formatMarkup(unformattedMarkup))
      .toEqual(formattedMarkup);

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

    expect(formatMarkup(unformattedMarkup))
      .toEqual(unformattedMarkup);

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Your custom markup formatter must return a string.');
  });

  describe('diffableFormatter', () => {
    test('No arguments', () => {
      expect(diffableFormatter())
        .toEqual('');
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

    const voidElementTests = [
      ['html', formattedMarkupVoidElementsWithHTML],
      ['xhtml', formattedMarkupVoidElementsWithXHTML],
      ['closingTag', formattedMarkupVoidElementsWithClosingTag]
    ];

    test.each(voidElementTests)('Formats void elements using mode "%s"', (mode, expected) => {
      globalThis.vueSnapshots.formatting.voidElements = mode;

      expect(formatMarkup(unformattedMarkupVoidElements))
        .toEqual(expected);
    });
  });
});
