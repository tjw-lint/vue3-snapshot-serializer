# Vue 3 Snapshot Serializer

Vue 3 Snapshot Serialization for Vitest and Jest.

This is the future successor to `jest-serializer-vue-tjw`.


## Goal

Re-write [jest-serializer-vue-tjw](https://github.com/tjw-lint/jest-serializer-vue-tjw) from the ground up (copying some stuff over as needed).


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
removeIstanbulComments | Maybe           | Removes `/* istanbul ignore next */ cov_1lmjj6lxv1.f[3]++;` comments from snapshots. This may not be an issue in the new tech stack?
clearInlineFunctions   | Maybe           | `<div title="(x) => !x">` becomes `<div title="[function]">`
addInputValues         | No              | Display form field value. `<input>` becomes `<input value="whatever">`. Not sure how to do this in Vue 3
stringifyObjects       | No              | Replaces `title="[object Object]"` with `title="{a:'asdf'}"`. Not sure if this is possible in Vue 3


## New planned features

Not in `jest-serializer-vue`

* Remove Playwright tokens (`data-pw="whatever`)
* Diffable HTML (See [#85](https://github.com/tjw-lint/jest-serializer-vue-tjw/issues/85))
* Support for E2E tooling like Playwright (see [#70](https://github.com/tjw-lint/jest-serializer-vue-tjw/issues/70))
