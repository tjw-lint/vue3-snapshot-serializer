# Vue 3 Snapshot Serializer

Vue 3 Snapshot Serialization for Vitest and Jest.

This is the successor to [jest-serializer-vue-tjw](https://github.com/tjw-lint/jest-serializer-vue-tjw) (Vue 2, Jest, CJS).


## Plan

1. New repo tech stack:
   * ESM `import`
   * Vite + Vitest + Vitest snapshots
   * Vue 3
   * GHA - Linting/Unit tests
1. Settings will now be stored differently:
   * Settings no longer stored in files (`package.json`, `vue.config.js`, `vite.config.js`, etc.)
   * Instead `globalThis.vueSnapshots = {};` will be used for settings.
   * This allows users to define settings in their `global.beforeEach()` in their settings file.
   * Also makes it much easier to override these global settings when you have test-specific settings.
   * Would be be nice to abstract the settings gathering from the serialization, so the serialization can be externalized.
      * `serializeVue(htmlOrVueWrapper, settings);`
      * Would allow E2E tooling to import and use this directly (See #70) 
   * The library would need to clear this global setting after every run to prevent global object-mutation based test-bleed.
1. Migration guide
1. Once feature support reaches an acceptable point, update the old repo to point people to this one.
	* Place deprecation warning
	* Point to migration guide, maybe migration guide should just live in the old repo and be linked to from the new one?


## Planned API Support:

This is mostly take from `jest-serializer-vue-tjw`:

Setting                | In new version? | Description
:--                    | :--             | :--
formatting             | Yes, may change | Formmating options object, including new "diffable html" options
removeDataVId          | Yes             | Removes `data-v-1234abcd=""` from your snapshots
removeComments         | Yes             | Removes all HTML comments
removeDataTest         | Yes             | Removes `data-test="whatever"` from your snapshots
removeDataTestid       | Yes             | Removes `data-testid="whatever"` from your snapshots
removeDataTestId       | Yes             | Removes `data-test-id="whatever"` from your snapshots
removeDataQa           | Yes             | Removes `data-qa="whatever"` from your snapshots
removeDataCy           | Yes             | Removes `data-cy="whatever"` from your snapshots (Cypress)
removeDataPw           | Yes - **New**   | Removes `data-pw="whatever"` from your snapshots (Playwright)
removeServerRendered   | Yes             | Removes `data-server-rendered="true"` from your snapshots
sortAttributes         | Eventually      | Sorts the attributes inside HTML elements in the snapshot. May not be in first release of v4
attributesToClear      | Probably        | Array of attribute strings to remove the values from. `['title', 'id']` produces `<input title id class="stuff">`
verbose                | Probably        | Logs to the console errors or other messages if true
removeClassTest        | Maybe           | Removes all CSS classes that start with "test", `class="test-whatever"`
removeIdTest           | Maybe           | Removes `id="test-whatever"` or `id="testWhatever"`from snapshots
clearInlineFunctions   | Maybe           | `<div title="(x) => !x">` becomes `<div title="[function]">`
removeIstanbulComments | No              | I cannot reproduce this issue anymore. Will add it back in if people run into it again.
addInputValues         | No              | Display form field value. `<input>` becomes `<input value="whatever">`. Not sure how to do this in Vue 3
stringifyObjects       | No              | Replaces `title="[object Object]"` with `title="{a:'asdf'}"`. Not sure if this is possible in Vue 3


## New planned features

Not in `jest-serializer-vue`

* Remove Playwright tokens (`data-pw="whatever`)
* Diffable HTML (See [#85](https://github.com/tjw-lint/jest-serializer-vue-tjw/issues/85))
* Support for E2E tooling like Playwright (see [#70](https://github.com/tjw-lint/jest-serializer-vue-tjw/issues/70))


* * *


## Implemented

The following features are implemented in this library:

Setting                | Default           | Description
:--                    | :--               | :--
attributesToClear      | []                | Takes an array of attribute strings, like `['title', 'id']`, to remove the values from these attributes. `<input title id class="stuff">`.
sortAttributes         | `true`            | Sorts the attributes inside HTML elements in the snapshot. This helps make snapshot diffs easier to read.
removeServerRendered   | `true`            | Removes `data-server-rendered="true"` from your snapshots if true.
removeDataVId          | `true`            | Removes `data-v-1234abcd=""` from your snapshots.
removeDataTest         | `true`            | Removes `data-test="whatever"` from your snapshots if true. To also remove these from your production builds, [see here](https://github.com/cogor/vite-plugin-vue-remove-attributes).
removeDataTestid       | `true`            | Removes `data-testid="whatever"` from your snapshots if true.
removeDataTestId       | `true`            | Removes `data-test-id="whatever"` from your snapshots if true.
removeDataQa           | `false`           | Removes `data-qa="whatever"` from your snapshots if true. `data-qa` is usually used by non-dev QA members. If they change in your snapshot, that indicates it may break someone else's E2E tests. So most using `data-qa` prefer they be left in by default.
removeDataCy           | `false`           | Removes `data-cy="whatever"` from your snapshots if true. `data-cy` is used by Cypress end-to-end tests. If they change in your snapshot, that indicates it may break an E2E tests. So most using `data-cy` prefer they be left in by default.
removeDataPw           | `false`           | Removes `data-pw="whatever"` from your snapshots if true. `data-pw` is used by Playwright end-to-end tests. If they change in your snapshot, that indicates it may break an E2E tests. So most using `data-pw` prefer they be left in by default.
removeIdTest           | `false`           | Removes `id="test-whatever"` or `id="testWhatever"`from snapshots. **Warning:** You should never use ID's for test tokens, as they can also be used by JS and CSS, making them more brittle. Use `data-test-id` instead.
removeClassTest        | `false`           | Removes all CSS classes that start with "test", `class="test-whatever"`. **Warning:** Don't use this approach. Use `data-test` instead. It is better suited for this because it doesn't conflate CSS and test tokens.
removeComments         | `false`           | Removes all HTML comments from your snapshots. This is false by default, as sometimes these comments can infer important information about how your DOM was rendered. However, this is mostly just personal preference.
clearInlineFunctions   | `false`           | Replaces `<div title="function () { return true; }">` or this `<div title="(x) => !x">` with this placeholder `<div title="[function]">`.



<!--
formatting             | See above example | These options format the snapshot. [See all available options here](https://github.com/beautify-web/js-beautify/blob/master/js/src/html/options.js).
verbose                | `true`            | Logs to the console errors or other messages if true. **Strongly recommended** if using experimental features.
addInputValues         | `false`           | **EXPERIMENTAL** Displays the value of form fields. `<input>` becomes `<input value="whatever">` in your snapshots. Requires you pass in `wrapper`, not `wrapper.html()`. On deeply nested components, it may exceed callstack.
stringifyObjects       | `false`           | **EXPERIMENTAL** Replaces `title="[object Object]"` with `title="{a:'asdf'}"` in your snapshots, allowing you to see the data in the snapshot. Requires you to pass in `wrapper`, not `wrapper.html()`. This is still a work in progress. On deeply nested components, it may exceed callstack.
-->
