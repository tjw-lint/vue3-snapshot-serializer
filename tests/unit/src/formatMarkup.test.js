import { formatMarkup } from '@/formatMarkup.js';
import { describe, expect, test } from 'vitest';

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
      verbose: true
    };
    console.info = vi.fn();
  });

  afterEach(() => {
    console.info = info;
  });

  test('Does no formatting', () => {
    globalThis.vueSnapshots.formatting = 'none';

    expect(formatMarkup(unformattedMarkup))
      .toEqual(unformattedMarkup);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Formats HTML to be diffable', () => {
    globalThis.vueSnapshots.formatting = 'diffable';

    expect(formatMarkup(unformattedMarkup))
      .toEqual(formattedMarkup);

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Applies custom formatting', () => {
    globalThis.vueSnapshots.formatting = function () {
      return 'test';
    };

    expect(formatMarkup(unformattedMarkup))
      .toEqual('test');

    expect(console.info)
      .not.toHaveBeenCalled();
  });

  test('Logs warning if custom function does not return a string', () => {
    globalThis.vueSnapshots.formatting = function () {
      return 5;
    };

    expect(formatMarkup(unformattedMarkup))
      .toEqual(unformattedMarkup);

    expect(console.info)
      .toHaveBeenCalledWith('Vue 3 Snapshot Serializer: Your custom markup formatter must return a string.');
  });
});

describe('Format markup options', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {
      formatting: 'diffable',
      verbose: true
    };
  });

  test.each([
    ['html', formattedMarkupVoidElementsWithHTML],
    ['xhtml', formattedMarkupVoidElementsWithXHTML],
    ['closingTag', formattedMarkupVoidElementsWithClosingTag]
  ])('Formats void elements using mode "%s"', (mode, expected) => {
    globalThis.vueSnapshots.voidElements = mode;

    expect(formatMarkup(unformattedMarkupVoidElements))
      .toEqual(expected);
  });
});
