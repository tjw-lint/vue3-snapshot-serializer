import { mount } from '@vue/test-utils';

import { cheerioManipulation } from '@/cheerioManipulation.js';

import DataVId from '@@/mockComponents/DataVId.vue';
import InlineFunctions from '@@/mockComponents/InlineFunctions.vue';
import SeveralInputs from '@@/mockComponents/SeveralInputs.vue';
import SortAttributes from '@@/mockComponents/SortAttributes.vue';
import StringifyAttributes from '@@/mockComponents/StringifyAttributes.vue';

describe('Cheerio Manipulation', () => {
  beforeEach(() => {
    globalThis.vueSnapshots = {
      formatting: {}
    };
  });

  test('Empty string', () => {
    expect(cheerioManipulation(''))
      .toEqual('');
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
    });
  });

  describe('Server rendered text', () => {
    const markup = '<div data-server-rendered="true">Content</div>';
    const cleaned = '<div>Content</div>';

    test('Removes server rendered attribute if setting enabled', () => {
      globalThis.vueSnapshots = {
        removeServerRendered: true
      };

      expect(cheerioManipulation(markup))
        .toEqual(cleaned);
    });

    test('Retains server rendered attribute if setting disabled', () => {
      globalThis.vueSnapshots = {
        removeServerRendered: false
      };

      expect(cheerioManipulation(markup))
        .toEqual(markup);
    });
  });

  describe('data-v-ids', () => {
    const markup = '<div data-v-34cd6f4f class="hello"> Hello World </div>';
    const cleaned = '<div class="hello"> Hello World </div>';

    test('Removes data-v-ids from real component', async () => {
      globalThis.vueSnapshots = {
        removeDataVId: true
      };

      const wrapper = await mount(DataVId);

      expect(cheerioManipulation(wrapper.html()))
        .toEqual(cleaned);
    });

    test('Removes data-v-ids from string', () => {
      globalThis.vueSnapshots = {
        removeDataVId: true
      };

      expect(cheerioManipulation(markup))
        .toEqual(cleaned);
    });

    test('Keeps data-v-ids', () => {
      globalThis.vueSnapshots = {
        removeDataVId: false
      };

      expect(cheerioManipulation(markup))
        .toEqual(markup);
    });

    test('Remove empty attributes from data-v-id, but keep the v-id', () => {
      globalThis.vueSnapshots = {
        removeDataVId: false
      };

      const emptyAttribute = '<div data-v-34cd6f4f="" class="hello"> Hello World </div>';

      expect(cheerioManipulation(emptyAttribute))
        .toEqual(markup);
    });
  });

  describe('InlineFunctions.vue', () => {
    test('Functions kept', async () => {
      globalThis.vueSnapshots = {
        clearInlineFunctions: false
      };
      const wrapper = await mount(InlineFunctions);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });

    test('Functions removed', async () => {
      globalThis.vueSnapshots = {
        clearInlineFunctions: true
      };
      const wrapper = await mount(InlineFunctions);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
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
      globalThis.vueSnapshots = { sortAttributes: true };

      const wrapper = await mount(SortAttributes);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });

    test('Unsorted', async () => {
      globalThis.vueSnapshots = { sortAttributes: false };

      const wrapper = await mount(SortAttributes);
      const markup = wrapper.html();

      expect(cheerioManipulation(markup))
        .toMatchSnapshot();
    });
  });

  describe('Add input values', () => {
    test('Adds values into DOM', async () => {
      const wrapper = await mount(SeveralInputs);
      await wrapper.find('[data-test="button"]').trigger('click');

      globalThis.vueSnapshots.addInputValues = true;

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Does not add values into DOM', async () => {
      const wrapper = await mount(SeveralInputs);
      await wrapper.find('[data-test="button"]').trigger('click');

      globalThis.vueSnapshots.addInputValues = false;

      expect(wrapper)
        .toMatchSnapshot();
    });
  });

  describe('Stringify attributes', () => {
    test('Replaces attribute values including child components', async () => {
      globalThis.vueSnapshots.stringifyAttributes = true;

      const wrapper = await mount(StringifyAttributes);

      expect(wrapper)
        .toMatchSnapshot();
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
      globalThis.vueSnapshots.stringifyAttributes = false;

      const wrapper = await mount(StringifyAttributes);

      expect(wrapper)
        .toMatchSnapshot();
    });
  });
});
