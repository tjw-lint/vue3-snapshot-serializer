import { flushPromises, mount } from '@vue/test-utils';

import ObjectAfterVIfStubParent from '@@/mockComponents/ObjectAfterVIfStubParent.vue';

describe('ObjectAfterVIfStubParent', () => {
  test('Serializes object/array props correctly without a v-if toggle', () => {
    const wrapper = mount(ObjectAfterVIfStubParent, {
      global: {
        stubs: {
          ObjectAfterVIfStubChild: true
        }
      }
    });

    expect(wrapper)
      .toMatchSnapshot();
  });

  test('Props do not become [object Object] after a v-if toggle', async () => {
    const wrapper = mount(ObjectAfterVIfStubParent, {
      global: {
        stubs: {
          ObjectAfterVIfStubChild: true
        }
      }
    });
    wrapper.vm.hasHeader = false;
    await flushPromises();

    expect(wrapper)
      .toMatchSnapshot();
  });
});
