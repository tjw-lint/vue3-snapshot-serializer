import {
  diffableHtml,
  formatMarkup,
  rehype
} from '@/formatMarkup.js';
import { formattingDefaults } from '@/loadOptions.js';

describe('Formt markup', () => {
  const unformattedMarkup = `
<div id="header">
  <h1>Hello World!</h1>
  <ul id="main-list" class="list"><li><a href="#">My HTML</a></li></ul>
</div>
`.trim();

  test('No settings', () => {
    globalThis.vueSnapshots = {};

    expect(formatMarkup(unformattedMarkup))
      .toMatchInlineSnapshot(`
        "<div id="header">
            <h1>Hello World!</h1>
            <ul id="main-list" class="list">
                <li><a href="#">My HTML</a></li>
            </ul>
        </div>"
      `);
  });

  test('Default settings', () => {
    globalThis.vueSnapshots = {
      formatting: formattingDefaults
    };

    expect(formatMarkup(unformattedMarkup))
      .toMatchInlineSnapshot(`
        "<div id="header">
          <h1>Hello World!</h1>
          <ul id="main-list" class="list">
            <li>
              <a href="#">My HTML</a>
            </li>
          </ul>
        </div>"
      `);
  });

  test('Diffable HTML settings', () => {
    expect(diffableHtml(unformattedMarkup))
      .toMatchInlineSnapshot(`
        "
        <div id="header">
          <h1>
            Hello World!
          </h1>
          <ul
            id="main-list"
            class="list"
          >
            <li>
              <a href="#">
                My HTML
              </a>
            </li>
          </ul>
        </div>
        "
      `);
  });

  test('Rehype', () => {
    expect(rehype(unformattedMarkup))
      .toMatchInlineSnapshot(`
        "<div id="header">
          <h1>Hello World!</h1>
          <ul id="main-list" class="list">
            <li><a href="#">My HTML</a></li>
          </ul>
        </div>"
      `);
  });
});
