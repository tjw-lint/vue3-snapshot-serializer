import { userEvent } from '@testing-library/user-event';
import { render } from '@testing-library/vue';

import TestingLibrary from '@@/mockComponents/TestingLibrary.vue';

describe('TestingLibrary', () => {
  describe('Wrapper', () => {
    test('Renders default contents', () => {
      const wrapper = render(TestingLibrary);

      expect(wrapper)
        .toMatchSnapshot();
    });

    test('Contents change after toggle button clicked', async () => {
      const wrapper = render(TestingLibrary);

      const user = userEvent.setup();
      const button = wrapper.container.querySelector('[data-test="toggle"]');
      await user.click(button);

      expect(wrapper)
        .toMatchSnapshot();
    });
  });

  /**
   * On Containers, TLV always wraps the component in an extra div. Nothing we
   * can do about that:
   * https://testing-library.com/docs/vue-testing-library/api#container-htmlelement
   */

  describe('Container', () => {
    test('Renders default contents', () => {
      const { container } = render(TestingLibrary);

      expect(container)
        .toMatchSnapshot();
    });

    test('Contents change after toggle button clicked', async () => {
      const { container } = render(TestingLibrary);

      const user = userEvent.setup();
      const button = container.querySelector('[data-test="toggle"]');
      await user.click(button);
      const checkbox = container.querySelector('[data-test="checkbox"]');

      expect(container)
        .toMatchSnapshot('container');

      expect(checkbox)
        .toMatchSnapshot('checkbox');
    });
  });
});
