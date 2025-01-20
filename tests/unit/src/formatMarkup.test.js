import { formatMarkup } from '@/formatMarkup.js';

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

  test('Uses classing formatting', () => {
    globalThis.vueSnapshots.formatter = 'classic';

    expect(unformattedMarkup)
      .toMatchInlineSnapshot(`
        <div id="header">
          <h1>Hello World!</h1>
          <ul class="list" id="main-list">
            <li>
              <a class="link" href="#">My HTML</a>
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
});
