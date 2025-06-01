/**
 * @file Reusable, flattened, JSDoc comment blocks and types that can be imported by other files.
 */

/**
 * Optional custom function to apply any adjustments to the markup prior to being used in the snapshot.
 * Must return a string (not a promise). Is ran after the formatter.
 *
 * @typedef {Function} POSTPROCESSOR
 * @param   {string}   markup         A string of formatted HTML markup.
 * @return  {string}                  Mutated version of the markup string to store in a snapshot.
 */

/** @typedef {'normal'|'keep'|'separate'} INDENTSCRIPTS */

/** @typedef {'auto'|'force'|'force-aligned'|'force-expand-multiline'|'aligned-multiple'|'preserve'|'preserve-aligned'} WRAPATTRIBUTES */

/**
 * @typedef  {object}         CLASSICFORMATTING
 * @property {string[]}       [content_unformatted=['pre','textarea']]  Tags where their inner content should skip formatting.
 * @property {string[]}       [extra_liners=['head','body','/html']]    Array of tags that get extra lines.
 * @property {string}         [indent_char=' ']                         The character to use for indentation, like a space or tab.
 * @property {boolean}        [indent_body_inner_html=true]             Breaks up inner HTML to multiple lines with indentation for the body tag.
 * @property {boolean}        [indent_handlebars=true]                  Applies indentation to handlebars syntax.
 * @property {boolean}        [indent_head_inner_html=true]             Breaks up inner HTML to multiple lines with indentation for the head tag.
 * @property {boolean}        [indent_inner_html=true]                  Breaks up inner HTML to multiple lines with indentation.
 * @property {INDENTSCRIPTS}  [indent_scripts='normal']                 How to handle script indentation.
 * @property {number}         [indent_size=2]                           How many indentation characters to use.
 * @property {string[]}       [inline=[]]                               Array of string tag names to represent inline (vs block) elements.
 * @property {boolean}        [inline_custom_elements=true]             Whether custom elements should be counted as inline.
 * @property {string}         [sep='\n']                                The characters to use for new line separators.
 * @property {string[]}       [templating=['auto']]                     What templating languages to support ('django', 'erb', 'handlebars', 'php') defaults to all.
 * @property {string[]}       [unformatted=['code','pre']]              Array of string tag names to skip formatting for.
 * @property {string}         [unformatted_content_delimiter]           String for delimiting unformatted content.
 * @property {string[]}       [void_elements]                           Defaults to ['area','base','br','col','embed','hr','img','input','keygen','link','menuitem','meta','param','source','track','wbr','!doctype','?xml','basefont','isindex'].
 * @property {WRAPATTRIBUTES} [wrap_attributes='auto']                  Settings for attribute alignment.
 * @property {number}         [wrap_attributes_min_attrs=2]             When to wrap attributes.
 * @property {number}         [wrap_attributes_indent_size]             Uses the indent_size if not specified.
 */

/** @typedef {'diffable'|'classic'|'none'} FORMATTER */

/** @typedef {'html'|'xhtml'|'xml'} VOIDELEMENTS */

/**
 * @typedef  {object}       FORMATTING
 * @property {number}       [attributesPerLine=1]                      How many attributes are allowed on the same line as the starting tag.
 * @property {number}       [classesPerLine=1]                         How many classes are allowed on the same line as the class attribute.
 * @property {boolean}      [emptyAttributes=true]                     Determines whether empty attributes will include `=""`. If false then `<span class="" id=""></span>`` becomes `<span class id></span>`.
 * @property {boolean}      [escapeAttributes=false]                   Retains (if `true`) or discards (if `false`) named HTML entity encodings, like `&lt;` instead of `<` in HTML attributes.
 * @property {boolean}      [escapeInnerText=true]                     Retains (if `true`) or discards (if `false`) named HTML entity encodings, like `&lt;` instead of `<` in HTML text nodes.
 * @property {number}       [inlineStylesPerLine=1]                    How many inline styles are allowed on the same line as the style attribute.
 * @property {boolean}      [selfClosingTag=false]                     Converts `<div></div>` to `<div />` or `<p class="x"></p>` to `<p class="x" />`. Does not affect void elements (like `<input>`), use the `voidElements` setting for them.
 * @property {string[]}     [tagsWithWhitespacePreserved=['a','pre']]  Does not add returns and indentation to the inner content of these tags when formatting. Accepts an array of tags name strings.
 * @property {VOIDELEMENTS} [voidElements='xhtml']                     Determines how void elements are closed. Accepts 'html' for `<input>`, 'xhtml' for `<input />`, and 'xml' for `<input></input>`.
 */

/** @typedef {string} SELECTOR  Any valid CSS Selector. */
/** @typedef {string} ATTRIBUTE  Any HTML attribute. */
/**
 * @typedef  {object}              STUBDEFINITION
 * @property {boolean}             [removeInnerHtml]   True to remove the innerHTML of the targeted DOM node being stubbed.
 * @property {ATTRIBUTE[]|boolean} [removeAttributes]  True to remove all, false to remove none, or an array of HTML attribute names to remove from the stub root.
 * @property {string}              [tagName]           Used to replace the tag name on the targeted DOM node being stubbed.
 */
/* eslint-disable-next-line jsdoc/check-types */
/** @typedef {Object<SELECTOR, STUBDEFINITION>} STUBOBJECT */
/** @typedef {SELECTOR[]} STUBARRAY */
/** @typedef {STUBOBJECT|STUBARRAY} STUBS */

/**
 * @typedef  {object}            SETTINGS
 * @property {boolean}           [verbose=true]                        Logs to the console errors or other messages if true.
 * @property {boolean}           [debug=false]                         Logs to the console as internal functions are called, including relevant data to help in troubleshooting.
 * @property {string[]}          [attributesToClear=[]]                Takes an array of attribute strings, like `['title', 'id']`, to remove the values from these attributes. `<i title="9:04:55 AM" id="uuid_48a50d2" class="current-time"></i>` becomes `<i title id class="current-time"></i>`.
 * @property {boolean}           [addInputValues=true]                 Display current internal element value on `input`, `textarea`, and `select` fields. `<input>` becomes `<input value="'whatever'">`. Requires passing in the VTU `wrapper` or TLV `wrapper`, not `wrapper.html()`.
 * @property {boolean}           [sortAttributes=true]                 Sorts the attributes inside HTML elements in the snapshot. This greatly reduces snapshot noise, making diffs easier to read.
 * @property {boolean}           [sortClasses=true]                    Sorts the classes inside the `class` attribute on all HTML elements in the snapshot. This greatly reduces snapshot noise, making diffs easier to read.
 * @property {boolean}           [stringifyAttributes=true]            Injects the real values of dynamic attributes/props into the snapshot. `to="[object Object]"` becomes `to="{ name: 'home' }"`. Requires passing in the VTU `wrapper` or TLV `wrapper`, not `wrapper.html()`.
 * @property {string[]}          [attributesNotToStringify=['style']]  If stringifyAttributes is enabled, the attributes defined here will be skipped, preserving the value set by Vue. Defaults to 'style', because Vue can usually accurately convert it to a string in the DOM without help.
 * @property {boolean}           [removeServerRendered=true]           Removes `data-server-rendered="true"` from your snapshots if true.
 * @property {boolean}           [removeDataVId=true]                  Removes `data-v-1234abcd=""` from your snapshots if true. Useful if 3rd-party components use scoped styles to reduce snapshot noise when updating dependencies.
 * @property {boolean}           [removeDataTest=true]                 Removes `data-test="whatever"` from your snapshots if true.
 * @property {boolean}           [removeDataTestid=true]               Removes `data-testid="whatever"` from your snapshots if true.
 * @property {boolean}           [removeDataTestId=true]               Removes `data-test-id="whatever"` from your snapshots if true.
 * @property {boolean}           [removeDataQa=false]                  Removes `data-qa="whatever"` from your snapshots if true. `data-qa` is usually used by non-dev QA members. If they change in your snapshot, that indicates it may break someone else's E2E tests. So most using `data-qa` prefer they be left in by default.
 * @property {boolean}           [removeDataCy=false]                  Removes `data-cy="whatever"` from your snapshots if true. `data-cy` is used by Cypress end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using data-cy prefer they be left in by default.
 * @property {boolean}           [removeDataPw=false]                  Removes `data-pw="whatever"` from your snapshots if true. `data-pw` is used by Playwright end-to-end tests. If they change in your snapshot, that indicates it may break an E2E test. So most using data-pw prefer they be left in by default.
 * @property {boolean}           [removeIdTest=false]                  Removes `id="test-whatever"` or `id="testWhatever"` from snapshots. **Warning:** You should never use ID's for test tokens, as they can also be used by JS and CSS, making them more brittle and their intent less clear. Use `data-test-id` instead.
 * @property {boolean}           [removeClassTest=false]               Removes all CSS classes that start with "test", like `class="test-whatever"`. **Warning:** Don't use this approach. Use `data-test` instead. It is better suited for this because it doesn't conflate CSS and test tokens.
 * @property {boolean}           [removeComments=false]                Removes all HTML comments from your snapshots. This is false by default, as sometimes these comments can infer important information about how your DOM was rendered. However, this is mostly just personal preference.
 * @property {boolean}           [clearInlineFunctions=false]          Replaces `<div title="function () { return true; }"></div>` or `<div title="(x) => !x"></div>` with this placeholder `<div title="[function]"></div>`.
 * @property {STUBS}             [stubs={}]                            Allows targeting specific DOM nodes in the snapshot to optionally replace their tag name or remove attributes and innerHTML.
 * @property {POSTPROCESSOR}     [postProcessor]                       This is a custom function you can pass in. It will be handed a string of formatted markup and must return a string (not a promise). It runs right after the formatter.
 * @property {RegExp}            [regexToRemoveAttributes]             You can provide a regex pattern to match HTML attributes against to have them removed from the snapshot. Example: `global.vueSnapshots.regexToRemoveAttributes = new RegExp(/data-+/);`
 * @property {FORMATTER}         [formatter='diffable']                Function to use for formatting the markup output. Accepts 'none', 'diffable', or 'classic'.
 * @property {FORMATTING}        [formatting]                          An object containing settings specific to the "diffable" formatter.
 * @property {CLASSICFORMATTING} [classicFormatting]                   An object containing settings specific to the "classic" formatter.
 */

/** @typedef {'root'|'tag'|'text'|'comment'|'doctype'|'cdata'|'script'|'style'|'directive'} ASTNODETYPE */

/**
 * @typedef  {object}      ASTNODE
 * @property {ASTNODETYPE} type       The node type
 * @property {string}      [name]     Any tag name ('h1', 'div', 'svg', 'my-component-stub')
 * @property {ASTNODE[]}   children   Array of nested AST nodes
 * @property {string}      data       The value of the node, if it is a comment or text
 * @property {object}      [attribs]  The attributes if the node is a tag, ex: { class: 'a b', title: 'c' }
 */

export const types = {};
