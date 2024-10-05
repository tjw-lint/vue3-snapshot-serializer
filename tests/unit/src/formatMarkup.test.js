import { formatMarkup } from '@/formatMarkup.js';

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

describe('Formt markup', () => {
  test('Formats HTML to be diffable', () => {
    globalThis.vueSnapshots = {};

    expect(formatMarkup(unformattedMarkup))
      .toEqual(formattedMarkup);
  });
});
