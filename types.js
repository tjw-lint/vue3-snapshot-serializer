/**
 * Optional custom function to format the output of the markup prior to being used in the snapshot.
 * Must return a string (not a promise).
 *
 * @typedef {function} FORMATTERCB
 * @param   {string}   markup       A string of HTML markup to format.
 * @return  {string}                Your formatted string to use as the snapshot.
 */

/** @typedef {'none'|'diffable'|FORMATTERCB} FORMATTER */

/** @typedef {'html'|'xhtml'|'xml'} VOIDELEMENTS */

/**
 * @typedef  {object}       FORMATTING
 * @property {number}       [attributesPerLine=1]   How many attributes are allowed on the same line as the starting tag.
 * @property {boolean}      [emptyAttributes=true]  Determines whether empty attributes will include `=""`. If false then `<span class="" id=""></span>`` becomes `<span class id></span>`.
 * @property {boolean}      [selfClosingTag=false]  Converts `<div></div>` to `<div />` or `<p class="x"></p>` to `<p class="x" />`. Does not affect void elements (like `<input>`), use the `voidElements` setting for them.
 * @property {VOIDELEMENTS} [voidElements='xhtml']  Determines how void elements are closed. Accepts 'html' for `<input>`, 'xhtml' for `<input />`, and 'xml' for `<input></input>`.
 */

/**
 * @typedef  {object}     SETTINGS
 * @property {boolean}    [verbose=true]                Logs to the console errors or other messages if true.
 * @property {string[]}   [attributesToClear=[]]        Takes an array of attribute strings, like `['title', 'id']`, to remove the values from these attributes. `<i title="9:04:55 AM" id="uuid_48a50d2" class="current-time"></i>` becomes `<i title id class="current-time"></i>`.
 * @property {boolean}    [addInputValues=true]         Display current internal element value on `input`, `textarea`, and `select` fields. `<input>` becomes `<input value="'whatever'">`. Requires passing in the VTU `wrapper`, not `wrapper.html()`.
 * @property {boolean}    [sortAttributes=true]         Sorts the attributes inside HTML elements in the snapshot. This greatly reduces snapshot noise, making diffs easier to read.
 * @property {boolean}    [stringifyAttributes=true]    Injects the real values of dynamic attributes/props into the snapshot. `to="[object Object]"` becomes `to="{ name: 'home' }"`. Requires passing in the VTU `wrapper`, not `wrapper.html()`.
 * @property {boolean}    [removeServerRendered=true]   Removes `data-server-rendered="true"` from your snapshots if true.
 * @property {boolean}    [removeDataVId=true]          Removes `data-v-1234abcd=""` from your snapshots if true. Useful if 3rd-party components use scoped styles to reduce snapshot noise when updating dependencies.
 * @property {boolean}    [removeDataTest=true]         Removes `data-test="whatever"` from your snapshots if true.
 * @property {boolean}    [removeDataTestid=true]       Removes `data-testid="whatever"` from your snapshots if true.
 * @property {boolean}    [removeDataTestId=true]       Removes `data-test-id="whatever"` from your snapshots if true.
 * @property {boolean}    [removeDataQa=false]          Removes `data-qa="whatever"` from your snapshots if true. `data-qa` is usually used by non-dev QA members. If they change in your snapshot, that indicates it may break someone else's E2E tests. So most using `data-qa` prefer they be left in by default.
 * @property {boolean}    [removeDataCy=false]          Removes `data-cy="whatever"` from your snapshots if true. `data-cy` is used by Cypress end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using data-cy prefer they be left in by default.
 * @property {boolean}    [removeDataPw=false]          Removes `data-pw="whatever"` from your snapshots if true. `data-pw` is used by Playwright end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using data-pw prefer they be left in by default.
 * @property {boolean}    [removeIdTest=false]          Removes `id="test-whatever"` or `id="testWhatever"` from snapshots. **Warning:** You should never use ID's for test tokens, as they can also be used by JS and CSS, making them more brittle and their intent less clear. Use `data-test-id` instead.
 * @property {boolean}    [removeClassTest=false]       Removes all CSS classes that start with "test", like `class="test-whatever"`. **Warning:** Don't use this approach. Use `data-test` instead. It is better suited for this because it doesn't conflate CSS and test tokens.
 * @property {boolean}    [removeComments=false]        Removes all HTML comments from your snapshots. This is false by default, as sometimes these comments can infer important information about how your DOM was rendered. However, this is mostly just personal preference.
 * @property {boolean}    [clearInlineFunctions=false]  Replaces `<div title="function () { return true; }"></div>` or `<div title="(x) => !x"></div>` with this placeholder `<div title="[function]"></div>`.
 * @property {FORMATTER}  [formatter='diffable']        Function to use for formatting the markup output. Accepts 'none', 'diffable', or a function. If using a custom function it will be handed a string of markup and must return a string (not a promise).
 * @property {FORMATTING} [formatting]                  An object containing settings specific to the "diffable" formatter.
 */
