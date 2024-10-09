# Vue 3 Snapshot Serializer

Vue 3 Snapshot Serialization for Vitest and Jest.

This is the successor to [jest-serializer-vue-tjw](https://github.com/tjw-lint/jest-serializer-vue-tjw) (Vue 2, Jest, CJS).


## Usage

1. `npm install --save-dev vue3-snapshot-serializer`
1. **Vitest:**
   * In your `vite.config.js` or `vitest.config.js`:
   ```js
   import { defineConfig } from 'vite'; // or 'vitest'

   export default defineConfig({
     test: {
       snapshotSerializers: [
         './node_modules/vue3-snapshot-serializer/index.js'
       ]
     }
   });
   ```
1. **Jest:**
   * In your `package.json`, or Jest config file:
   ```json
   {
     "jest": {
       "snapshotSerializers": [
         "./node_modules/vue3-snapshot-serializer/index.js"
       ]
     }
   }
   ```


## Features

The following features are implemented in this library:

Setting                | Default      | Description
:--                    | :--          | :--
`verbose`              | `true`       | Logs to the console errors or other messages if true.
`attributesToClear`    | []           | Takes an array of attribute strings, like `['title', 'id']`, to remove the values from these attributes. `<input title id class="stuff">`.
`addInputValues`       | `true`       | Display internal element value on `input`, `textarea`, and `select` fields. `<input>` becomes `<input value="'whatever'">`.
`sortAttributes`       | `true`       | Sorts the attributes inside HTML elements in the snapshot. This helps make snapshot diffs easier to read.
`removeServerRendered` | `true`       | Removes `data-server-rendered="true"` from your snapshots if true.
`removeDataVId`        | `true`       | Removes `data-v-1234abcd=""` from your snapshots if true.
`removeDataTest`       | `true`       | Removes `data-test="whatever"` from your snapshots if true. To also remove these from your production builds, [see here](https://github.com/cogor/vite-plugin-vue-remove-attributes).
`removeDataTestid`     | `true`       | Removes `data-testid="whatever"` from your snapshots if true.
`removeDataTestId`     | `true`       | Removes `data-test-id="whatever"` from your snapshots if true.
`removeDataQa`         | `false`      | Removes `data-qa="whatever"` from your snapshots if true. `data-qa` is usually used by non-dev QA members. If they change in your snapshot, that indicates it may break someone else's E2E tests. So most using `data-qa` prefer they be left in by default.
`removeDataCy`         | `false`      | Removes `data-cy="whatever"` from your snapshots if true. `data-cy` is used by Cypress end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using `data-cy` prefer they be left in by default.
`removeDataPw`         | `false`      | Removes `data-pw="whatever"` from your snapshots if true. `data-pw` is used by Playwright end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using `data-pw` prefer they be left in by default.
`removeIdTest`         | `false`      | Removes `id="test-whatever"` or `id="testWhatever"`from snapshots. **Warning:** You should never use ID's for test tokens, as they can also be used by JS and CSS, making them more brittle and their intent less clear. Use `data-test-id` instead.
`removeClassTest`      | `false`      | Removes all CSS classes that start with "test", like `class="test-whatever"`. **Warning:** Don't use this approach. Use `data-test` instead. It is better suited for this because it doesn't conflate CSS and test tokens.
`removeComments`       | `false`      | Removes all HTML comments from your snapshots. This is false by default, as sometimes these comments can infer important information about how your DOM was rendered. However, this is mostly just personal preference.
`clearInlineFunctions` | `false`      | Replaces `<div title="function () { return true; }">` or this `<div title="(x) => !x">` with this placeholder `<div title="[function]">`.
`formatting`           | `'diffable'` | Function to use for formatting the markup output. See examples below. Accepts `'none'`, `'diffable'`, or a function.


### Formatting examples:

There are 3 formatting options:

* None - does not apply any additional formatting
* Diffable - Applies formatting designed for more easily readble diffs
* Custom function - You can pass in your own function to format the markup.


#### **Input Example:**

```html
<div id="header">
  <h1>Hello World!</h1>
  <ul id="main-list" class="list"><li><a class="link" href="#">My HTML</a></li></ul>
</div>
```


#### **"None" Output:** (no formatting applied)

```js
global.vueSnapshots = {
  formatting: 'none'
};
```

```html
<div id="header">
  <h1>Hello World!</h1>
  <ul id="main-list" class="list"><li><a class="link" href="#">My HTML</a></li></ul>
</div>
```


#### **"Diffable" Output:**

```js
global.vueSnapshots = {
  formatting: 'diffable'
};
```

```html
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
```

**Note:** `<a>` and `<pre>` do not mutate the white space in their inner text in the "diffable" setting. This is for correctness.


#### **Custom Function Output:**

```js
global.vueSnapshots = {
  /**
   * Your custom formatting function.
   * Must return a string.
   * Must not return a promise.
   *
   * @param  {string} markup  Valid HTML markup
   * @return {string}         Your formatted version
   */
  formatting: function (markup) {
    return markup.toUpperCase();
  }
}
```

Custom function example output:

```html
<DIV ID="HEADER">
  <H1>HELLO WORLD!</H1>
  <UL ID="MAIN-LIST" CLASS="LIST"><LI><A CLASS="LINK" HREF="#">MY HTML</A></LI></UL>
</DIV>
```


## Adjusting settings

In your `setup.js` file, I would recommend creating

```js
global.beforeEach(() => {
  global.vueSnapshots = {
    // Your custom settings, such as:
    verbose: true
  };
});
```

With this in place, your snapshot settings will be reset before each test runs. This means you can freely override these settings in specific tests, like so:

```js
import { mount } from '@vue/test-utils';

import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  test('My test', () => {
    // Test-specific settings
    global.vueSnapshots.attributesToClear = ['data-uuid'];

    expect(MyComponent)
      .toMatchSnapshot();
  });
});
```


## Using this library outside of Vitest/Jest

This library has many great features for formatting and cleaning up markup. For example, you may want to create your own function to validate expected markup in an End-to-End (E2E) testing tool, like Playwright or Cypress.

```js
import { vueMarkupFormatter } from 'vue3-snapshot-serializer';

globalThis.vueSnapshots = {
  // Your settings
};

const formatted = vueMarkupFormatter('<div data-test="example">Text</div>');
console.log(formatted);
//`<div>
//  Text
//</div>`
```

The `vueMarkupFormatter` function expects a string starting with `<`, and will return a formatted string based on your `globalThis.vueSnapshots` settings. You can use `global`, `globalThis`, or `window` to set the `vueSnapshots` settings object depending on your JavaScript environment.
