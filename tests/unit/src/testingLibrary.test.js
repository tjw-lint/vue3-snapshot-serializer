import { userEvent } from '@testing-library/user-event';
import { render } from '@testing-library/vue';

import TestingLibrary from '@@/mockComponents/TestingLibrary.vue';

describe('TestingLibrary', () => {
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