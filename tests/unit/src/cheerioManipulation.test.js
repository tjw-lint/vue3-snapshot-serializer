import { userEvent } from '@testing-library/user-event';
import { render } from '@testing-library/vue';
import { mount } from '@vue/test-utils';

import { cheerioManipulation } from '@/cheerioManipulation.js';

import AttributesNotToStringify from '@@/mockComponents/AttributesNotToStringify.vue';
import DataVId from '@@/mockComponents/DataVId.vue';
import CheckboxesAndRadios from '@@/mockComponents/CheckboxesAndRadios.vue';
import EmbeddedStyles from '@@/mockComponents/EmbeddedStyles.vue';
import InlineFunctions from '@@/mockComponents/InlineFunctions.vue';
import SeveralInputs from '@@/mockComponents/SeveralInputs.vue';
import SortAttributes from '@@/mockComponents/SortAttributes.vue';
import SortClasses from '@@/mockComponents/SortClasses.vue';
import StringifyAttributes from '@@/mockComponents/StringifyAttributes.vue';

describe('Cheerio Manipulation', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {
      debug: true,
      formatting: {}
    };
  });

  test('Empty string', () => {
    expect(cheerioManipulation(''))
      .toEqual('');

    expect(console.info)
      .toHaveBeenCalledWith('V3SS Debug:', {
        function: 'cheerioManipulation.js:cheerioManipulation',
        details: 'Uses the Cheerio library to mutate the markup based on the global vueSnapshots settings.',
        data: { vueWrapper: '' }
      });
  });

  describe('Attributes to clear', () => {
    test('Clears attributes', () => {
      globalThis.vueSnapshots.attributesToClear = [
        'data-size',
        'title',
        'non-existent'
      ];

      const markup = [
        '<h1 class="small" data-size="sm" title="text">',
        'Some <strong class="bold" title="Words">text</strong>',
        '</h1>'
      ].join('');

      expect(cheerioManipulation(markup))
        .toEqual([
          '<h1 class="small" data-size title>',
          'Some <strong class="bold" title>text</strong>',
          '</h1>'
        ].join(''));

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:clearAttributes'
        });
    });
  });

  describe('Server rendered text', () => {
    const markup = '<div data-server-rendered="true">Content</div>';
    const cleaned = '<div>Content</div>';

    test('Removes server rendered attribute if setting enabled', () => {
      globalThis.vueSnapshots.removeServerRendered = true;

      expect(cheerioManipulation(markup))
        .toEqual(cleaned);

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:removeServerRenderedText'
        });
    });

    test('Retains server rendered attribute if setting disabled', () => {
      globalThis.vueSnapshots.removeServerRendered = false;

      expect(cheerioManipulation(markup))
        .toEqual(markup);
    });
  });

  describe('Remove attributes via regex', () => {
    const markup = `
      <div class data-p data-pc-name data-pc-section data-scrollselectors pc51>
        <div class data-p data-pc-section style>
          <table class data-pc-section role="table">
            <thead class data-p-scrollable="false" data-pc-section role="rowgroup" style>
              <tr data-pc-section role="row">
                <th class data-p-filter-column="false" data-p-reorderable-column="false" data-p-resizable-column="false" data-pc-name data-pc-section first="0" pc57 role="columnheader">
                  <div class data-pc-section>
                    <span class data-pc-section>
                      Component DC
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    `.trim();
    const cleaned = `
      <div class data-scrollselectors pc51>
        <div class style>
          <table class role="table">
            <thead class role="rowgroup" style>
              <tr role="row">
                <th class first="0" pc57 role="columnheader">
                  <div class>
                    <span class>
                      Component DC
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    `.trim();

    test('Removes data-p attributes', () => {
      globalThis.vueSnapshots.regexToRemoveAttributes = new RegExp(/data-p.*/);

      expect(cheerioManipulation(markup))
        .toEqual(cleaned);
    });
  });

  describe('data-v-ids', () => {
    const markup = '<div data-v-34cd6f4f class="hello"> Hello World </div>';
    const cleaned = '<div class="hello"> Hello World </div>';

    test('Removes data-v-ids from real component', async () => {
      globalThis.vueSnapshots.removeDataVId = true;

      const wrapper = await mount(DataVId);

      expect(cheerioManipulation(wrapper.html()))
        .toEqual(cleaned);

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:removeScopedStylesDataVIDAttributes'
        });
    });

    test('Removes data-v-ids from string', () => {
      globalThis.vueSnapshots.removeDataVId = true;

      expect(cheerioManipulation(markup))
        .toEqual(cleaned);
    });

    test('Keeps data-v-ids', () => {
      globalThis.vueSnapshots.removeDataVId = false;

      expect(cheerioManipulation(markup))
        .toEqual(markup);
    });

    test('Remove empty attributes from data-v-id, but keep the v-id', () => {
      globalThis.vueSnapshots.removeDataVId = false;

      const emptyAttribute = '<div data-v-34cd6f4f="" class="hello"> Hello World </div>';

      expect(cheerioManipulation(emptyAttribute))
        .toEqual(markup);
    });
  });

  describe('InlineFunctions.vue', () => {
    test('Functions kept', async () => {
      globalThis.vueSnapshots.formatting.escapeInnerText = false;
      globalThis.vueSnapshots.clearInlineFunctions = false;

      const wrapper = await mount(InlineFunctions);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });

    test('Functions removed', async () => {
      globalThis.vueSnapshots.clearInlineFunctions = true;
      const wrapper = await mount(InlineFunctions);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:clearInlineFunctions'
        });
    });

    test('Props', async () => {
      const wrapper = await mount(InlineFunctions);
      const propFn = wrapper.vm.propFn;
      const fn = propFn();

      expect(typeof(propFn))
        .toEqual('function');

      expect(typeof(fn))
        .toEqual('function');

      expect(fn())
        .toEqual({});
    });
  });

  describe('SortAttributes.vue', () => {
    test('Sorted', async () => {
      globalThis.vueSnapshots.sortAttributes = true;

      const wrapper = await mount(SortAttributes);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:sortAttributes'
        });
    });

    test('Unsorted', async () => {
      globalThis.vueSnapshots.sortAttributes = false;

      const wrapper = await mount(SortAttributes);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });
  });

  describe('SortClasses.vue', () => {
    test('Sorted', async () => {
      globalThis.vueSnapshots.sortClasses = true;

      const wrapper = await mount(SortClasses);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:sortClasses'
        });
    });

    test('Unsorted', async () => {
      globalThis.vueSnapshots.sortClasses = false;

      const wrapper = await mount(SortClasses);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });
  });

  describe('EmbeddedStyles.vue', () => {
    test('Embedded style tag', async () => {
      const wrapper = await mount(EmbeddedStyles);

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            <style>
              .example {
                border: 1px solid #F00;
              }
            </style>
          </div>
        `);
    });
  });

  describe('Add input values', () => {
    test('Adds values from VTU Wrapper into DOM', async () => {
      const wrapper = await mount(SeveralInputs);
      await wrapper.find('[data-test="button"]').trigger('click');

      globalThis.vueSnapshots.addInputValues = true;
      globalThis.vueSnapshots.stringifyAttributes = false;

      expect(wrapper)
        .toMatchSnapshot();

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:attributesCanBeStringified',
          data: {
            hasVTUfind: true,
            hasTLVcontainer: false,
            isTLVcontainer: false,
            canBeStringified: true
          }
        });

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:addSerializerKeys'
        });

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:addInputValues'
        });

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:removeSerializerKeys'
        });
    });

    test('Adds values from TLV Wrapper into DOM', async () => {
      const wrapper = render(SeveralInputs);
      const button = wrapper.container.querySelector('[data-test="button"]');
      await userEvent.click(button);

      globalThis.vueSnapshots.addInputValues = true;
      globalThis.vueSnapshots.stringifyAttributes = false;

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Adds values from TLV Container into DOM', async () => {
      const { container } = render(SeveralInputs);
      const button = container.querySelector('[data-test="button"]');
      await userEvent.click(button);

      globalThis.vueSnapshots.addInputValues = true;
      globalThis.vueSnapshots.stringifyAttributes = false;

      expect(container)
        .toMatchSnapshot();
    });

    test('Does not add values into DOM', async () => {
      const wrapper = await mount(SeveralInputs);
      await wrapper.find('[data-test="button"]').trigger('click');

      globalThis.vueSnapshots.addInputValues = false;

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Checkboxes and radios', async () => {
      const wrapper = await mount(CheckboxesAndRadios);
      globalThis.vueSnapshots.addInputValues = true;

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <div>
            <input
              checked="true"
              type="checkbox"
              value="'on'"
            />
            <input
              checked="false"
              type="checkbox"
              value="'on'"
            />
            <fieldset>
              <input
                checked="false"
                name="animal"
                type="radio"
                value="'cat'"
              />
              <input
                checked="true"
                name="animal"
                type="radio"
                value="'cow'"
              />
              <input
                checked="false"
                name="animal"
                type="radio"
                value="'dog'"
              />
            </fieldset>
          </div>
        `);
    });
  });

  describe('Stringify attributes', () => {
    test('Replaces attribute values including child components', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;

      const wrapper = await mount(StringifyAttributes);

      expect(wrapper)
        .toMatchSnapshot();

      expect(console.info)
        .toHaveBeenCalledWith('V3SS Debug:', {
          function: 'cheerioManipulation.js:stringifyAttributes'
        });
    });

    test('Replaces attribute values with stubbed child component', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;

      const wrapper = await mount(StringifyAttributes, {
        global: {
          stubs: {
            StringifyProps: {
              template: '<span />'
            }
          }
        }
      });

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Replaces prop values on children in shallow mounts', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;

      const wrapper = await mount(StringifyAttributes, { shallow: true });

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Does not stringify attributes', async () => {
      globalThis.vueSnapshots.formatting.escapeInnerText = false;
      globalThis.vueSnapshots.stringifyAttributes = false;

      const wrapper = await mount(StringifyAttributes);

      expect(wrapper)
        .toMatchSnapshot();
    });
  });

  describe('Attributes not to stringify', () => {
    test('Skips style by default', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;
      globalThis.vueSnapshots.attributesNotToStringify = undefined;

      const wrapper = await mount(AttributesNotToStringify);

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <h1
            class="active"
            style="
              background: #F00;
              width: 0px;
            "
            title="{ a: 2 }"
          >
            Text
          </h1>
        `);
    });

    test('Has no effect if stringifyAttributes is disabled', async () => {
      globalThis.vueSnapshots.stringifyAttributes = false;
      globalThis.vueSnapshots.attributesNotToStringify = ['style'];

      const wrapper = await mount(AttributesNotToStringify);

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <h1
            class="active"
            style="
              background: #F00;
              width: 0px;
            "
            title="[object Object]"
          >
            Text
          </h1>
        `);
    });

    test('Stringifies everything', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;
      globalThis.vueSnapshots.attributesNotToStringify = [];

      const wrapper = await mount(AttributesNotToStringify);

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <h1
            class="active"
            style="{ background: '#F00', width: 0 }"
            title="{ a: 2 }"
          >
            Text
          </h1>
        `);
    });

    test('Inverted settings', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;
      globalThis.vueSnapshots.attributesNotToStringify = ['title'];

      const wrapper = await mount(AttributesNotToStringify);

      expect(wrapper)
        .toMatchInlineSnapshot(`
          <h1
            class="active"
            style="{ background: '#F00', width: 0 }"
            title="[object Object]"
          >
            Text
          </h1>
        `);
    });
  });

  describe('Stubs', () => {
    let input;

    beforeEach(() => {
      input = [
        '<div class="artichoke" title="value">',
        '  <span class="food">Vegetables</span>',
        '</div>'
      ].join('\n');
    });

    test('Remove inner HTML', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': {
          removeInnerHtml: true
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <div
            class="artichoke"
            title="value"
          ></div>
        `);
    });

    test('Remove all attributes', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': {
          removeAttributes: true
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <div>
            <span class="food">
              Vegetables
            </span>
          </div>
        `);
    });

    test('Remove specific attributes', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': {
          removeAttributes: ['class']
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <div title="value">
            <span class="food">
              Vegetables
            </span>
          </div>
        `);
    });

    test('Set tag name', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': {
          tagName: 'artichoke-stub'
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <artichoke-stub
            class="artichoke"
            title="value"
          >
            <span class="food">
              Vegetables
            </span>
          </artichoke-stub>
        `);
    });

    test('Long form', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': {
          removeInnerHtml: true,
          removeAttributes: true,
          tagName: 'artichoke-stub'
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <artichoke-stub></artichoke-stub>
        `);
    });

    test('Short form', () => {
      globalThis.vueSnapshots.stubs = {
        '.artichoke': 'artichoke-stub'
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <artichoke-stub></artichoke-stub>
        `);
    });

    test('Very short form', () => {
      globalThis.vueSnapshots.stubs = [
        '.artichoke'
      ];

      expect(input)
        .toMatchInlineSnapshot(`
          <artichoke-stub></artichoke-stub>
        `);
    });

    test('Stubs multiple DOM nodes', () => {
      input = [
        '<ul>',
        '  <li title="a">A</li>',
        '  <li title="b">B</li>',
        '  <li title="c">C</li>',
        '</ul>'
      ].join('\n');

      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = ['li'];
      globalThis.vueSnapshots.stubs = {
        'li:nth-of-type(odd)': {
          removeAttributes: true
        }
      };

      expect(input)
        .toMatchInlineSnapshot(`
          <ul>
            <li>A</li>
            <li title="b">B</li>
            <li>C</li>
          </ul>
        `);
    });

    test('Complex tag name', () => {
      input = [
        '<ul id="A">',
        '  <li title="a">A</li>',
        '  <li title="b">B</li>',
        '  <li title="c">C</li>',
        '</ul>'
      ].join('\n');

      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = ['li'];
      globalThis.vueSnapshots.stubs = ['#A li:nth-of-type(odd)'];

      expect(input)
        .toMatchInlineSnapshot(`
          <ul id="A">
            <a_li-nth-of-type-odd-stub></a_li-nth-of-type-odd-stub>
            <li title="b">B</li>
            <a_li-nth-of-type-odd-stub></a_li-nth-of-type-odd-stub>
          </ul>
        `);
    });

    test('Stub using test token', () => {
      input = '<div data-test="b"><div data-test="a"><span>b</span></div></div>';

      globalThis.vueSnapshots.stubs = ['[data-test="a"]'];

      expect(input)
        .toMatchInlineSnapshot(`
          <div>
            <data-test-a-stub></data-test-a-stub>
          </div>
        `);
    });
  });
});
