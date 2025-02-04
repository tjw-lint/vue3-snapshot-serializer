import { mount } from '@vue/test-utils';

import { classicFormatter } from '@/formatters/classic.js';

describe('classicFormatter', () => {
  let MyComponent;

  beforeEach(() => {
    MyComponent = { template: '' };
    globalThis.vueSnapshots = {
      formatter: 'classic',
      classicFormatting: {}
    };
  });

  test('No arguments', () => {
    expect(classicFormatter())
      .toEqual('');
  });

  test('Debug mode', () => {
    globalThis.vueSnapshots.debug = true;

    const markup = '<div></div><span></span>';
    const formatted = '<div></div>\n<span></span>';

    expect(markup)
      .toMatchInlineSnapshot(formatted);

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', {
        function: 'classic.js:classicFormatter',
        data: { markup, formatted }
      });
  });

  test('Empty attributes', () => {
    MyComponent.template = '<div class="x y" id title="">Text</div><p class></p>';

    expect(mount(MyComponent))
      .toMatchInlineSnapshot(`
        <div class="x y" id title>Text</div>
        <p class></p>
      `);
  });

  test('Self Closing Tags', () => {
    MyComponent.template = '<div></div><span class="orange"></span><svg><path d=""></path></svg> <input></input> <input type="range"> <textarea></textarea>';
    const wrapper = mount(MyComponent);

    expect(wrapper)
      .toMatchInlineSnapshot(`
        <div></div>
        <span class="orange"></span>
        <svg>
          <path d="" />
        </svg>

        <input value="''">

        <input type="range" value="''">

        <textarea value="''"></textarea>
      `);
  });

  test('Void elements', () => {
    const INPUT = '<input><input type="range"><input type="range" max="50">';

    expect(INPUT)
      .toMatchInlineSnapshot(`
        <input>
        <input type="range">
        <input max="50" type="range">
      `);
  });

  describe('Stubbed components', () => {
    test('Fake TR in TBODY fragment', () => {
      const markup = `
        <tbody>
          <tr><td>Text</td></tr>
          <fake-tr></fake-tr>
        </tbody>
      `.trim();

      expect(markup)
        .toMatchInlineSnapshot(`
          <tbody>
            <tr>
              <td>Text</td>
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
            <fake-tr></fake-tr>
          </tbody>
        </table>
      `.trim();

      expect(markup)
        .toMatchInlineSnapshot(`
          <table>
            <tbody>
              <tr>
                <td>Text</td>
              </tr>
              <fake-tr></fake-tr>
            </tbody>
          </table>
        `);
    });
  });

  test('Tags with whitespace preserved', () => {
    MyComponent.template = `<div>Hello World</div>
      <a>Hello World</a>
      <pre>Hello World</pre>`;

    const wrapper = mount(MyComponent);

    expect(wrapper)
      .toMatchInlineSnapshot(`
        <div>Hello World</div>
        <a>Hello World</a>
        <pre>Hello World</pre>
      `);
  });
});
