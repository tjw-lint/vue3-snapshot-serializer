# Vue 3 Snapshot Serializer

Vue 3 Snapshot Serialization for Vitest and Jest.

This is the successor to [jest-serializer-vue-tjw](https://github.com/tjw-lint/jest-serializer-vue-tjw) (Vue 2, Jest, CJS).


## Usage

1. Install the dependency
   * `npm install --save-dev vue3-snapshot-serializer`
1. Register the serializer:
   * **Vitest:** In your `vite.config.js` or `vitest.config.js`:
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
   * **Jest:** In your `package.json`, or Jest config file:
      ```json
      {
        "jest": {
          "snapshotSerializers": [
            "./node_modules/vue3-snapshot-serializer/index.js"
          ]
        }
      }
      ```
1. If you want to tweak any of the default settings for snapshots, put them in your `global.beforeEach()`
   ```js
   // /tests/unit/setup.js
   global.beforeEach(() => {
     global.vueSnapshots = {
       // Your settings
     };
   });
   ```
1. In tests, make sure to always pass in the Vue-Test-Utils wrapper containing the VNode so advanced features will work. If you pass in the HTML string instead, most features will still work, but not all.
   ```js
   test('My test', async () => {
     const wrapper = await mount(MyComponent);
     const button = wrapper.find('[data-test="myButton"]');

     // GOOD
     expect(wrapper)
       .toMatchSanpshot();

     // GOOD
     expect(button)
       .toMatchSanpshot();

     // BAD
     expect(wrapper.html())
       .toMatchSanpshot();

     // BAD
     expect(button.html())
       .toMatchSanpshot();
   });
   ```


## API/Features

Setting                | Default      | Description
:--                    | :--          | :--
`verbose`              | `true`       | Logs to the console errors or other messages if true.
`attributesToClear`    | []           | Takes an array of attribute strings, like `['title', 'id']`, to remove the values from these attributes. `<i title="9:04:55 AM" id="uuid_48a50d28cb453f94" class="current-time"></i>` becomes `<i title id class="current-time"></i>`.
`addInputValues`       | `true`       | Display current internal element value on `input`, `textarea`, and `select` fields. `<input>` becomes `<input value="'whatever'">`. **Requires passing in the VTU wrapper**, not `wrapper.html()`.
`sortAttributes`       | `true`       | Sorts the attributes inside HTML elements in the snapshot. This greatly reduces snapshot noise, making diffs easier to read.
`stringifyAttributes`  | `true`       | Injects the real values of dynamic attributes/props into the snapshot. `to="[object Object]"` becomes `to="{ name: 'home' }"`. **Requires passing in the VTU wrapper**, not `wrapper.html()`.
`removeServerRendered` | `true`       | Removes `data-server-rendered="true"` from your snapshots if true.
`removeDataVId`        | `true`       | Removes `data-v-1234abcd=""` from your snapshots if true. Useful if 3rd-party components use scoped styles to reduce snapshot noise when updating dependencies.
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
`formatter`            | `'diffable'` | Function to use for formatting the markup output. Accepts `'none'`, `'diffable'`, or a custom function that is given a string and must synchronously return a string.


The below settings are all the defaults, so if you like them, you don't need to pass them in.

```js 
global.vueSnapshots = {
  verbose: true,
  attributesToClear: [],
  addInputValues: true,
  sortAttributes: true,
  stringifyAttributes: true,
  removeServerRendered: true,
  removeDataVId: true,
  removeDataTest: true,
  removeDataTestid: true,
  removeDataTestId: true,
  removeDataQa: false,
  removeDataCy: false,
  removeDataPw: false,
  removeIdTest: false,
  removeClassTest: false,
  removeComments: false,
  clearInlineFunctions: false,
  formatter: 'diffable'
};
```

**Note:** You can set the global defaults for your entire project in your global `beforeEach`, so it aways resets to those defaults before each test. Then In a specific test you can override those defaults as needed if a test works better with a setting.


## Global Settings/Individual Test Example

```js
// /tests/setup.js
global.beforeEach(() => {
  global.vueSnapshots = {
    removeDataQa: true
  };
});
```

Then later in a specific test:

```js
test('H1 contains correct data-qa', async () => {
  const wrapper = await mount(MyComponent);

  global.vueSnapshots.removeDataQa = false;
  expect(wrapper)
    .toMatchSnapshot();
});
```


### Formatter examples:

There are 3 formatter options:

* **None** - Does not apply any additional formatting, just spits out the markup as-is after tranformations have been applied.
* **Diffable** - Applies formatting designed for more easily readble diffs. This formatter also has a few options you can set.
* **Custom function** - You can pass in your own function to format the markup however you like.


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
  formatter: 'none'
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
  formatter: 'diffable'
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
  formatter: function (markup) {
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
    // Your default settings for all snapshots
  };
});
```

With this in place, your snapshot settings will be reset before each test runs. This means you can freely override these settings in specific tests, like so:

```js
import { mount } from '@vue/test-utils';

import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  test('My test', async () => {
    const wrapper = await mount(MyComponent);

    // Test-specific settings
    global.vueSnapshots.attributesToClear = ['data-uuid'];

    expect(wrapper)
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
