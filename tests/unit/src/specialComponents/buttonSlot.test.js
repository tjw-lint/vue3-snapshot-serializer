import { mount } from '@vue/test-utils';

import ButtonSlot from '@@/mockComponents/ButtonSlot.vue';

describe('ButtonSlot', () => {
  test('No slot value', () => {
    const wrapper = mount(ButtonSlot);

    expect(wrapper.html())
      .toEqual('<button></button>');

    expect(wrapper)
      .toMatchInlineSnapshot(`
        <button></button>
      `);
  });

  test('Slot with default text', () => {
    const wrapper = mount(ButtonSlot, {
      slots: {
        default: 'test'
      }
    });

    expect(wrapper.text())
      .toContain('test');

    expect(wrapper.html())
      .toEqual('<button>test</button>');

    expect(wrapper)
      .toMatchInlineSnapshot(`
        <button>
          test
        </button>
      `);
  });

  test('Slot with markup', () => {
    const wrapper = mount(ButtonSlot, {
      slots: {
        default: '<p>test</p>'
      }
    });

    expect(wrapper.html())
      .toEqual('<button>\n  <p>test</p>\n</button>');

    expect(wrapper)
      .toMatchInlineSnapshot(`
        <button>
          <p>
            test
          </p>
        </button>
      `);
  });
});
