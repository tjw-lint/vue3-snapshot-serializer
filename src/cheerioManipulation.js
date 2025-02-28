/**
 * @file Uses the Cheerio library to mutate the markup based on the global vueSnapshots settings.
 */

import {
  cheerioize,
  debugLogger,
  stringify,
  swapQuotes,
  isVueTestUtilsWrapper
} from './helpers.js';
import { removeTestTokens } from './removeTestTokens.js';

const KEY_NAME = 'data-vue-snapshot-serializer-key';
let key = 0;
let alreadyRemovedKey = true;

/**
 * Safety check to ensure the vueWrapper contains the needed
 * methods for attribute stringification.
 *
 * @param  {object}  vueWrapper  The VTU Wrapper object or Testing Library Vue rendered wrapper
 * @return {boolean}             If criteria is met
 */
const attributesCanBeStringified = function (vueWrapper) {
  const canBeStringified = (
    (
      globalThis.vueSnapshots?.addInputValues ||
      globalThis.vueSnapshots?.stringifyAttributes
    ) &&
    (
      // Check for Vue Test Utils wrapper methods
      (typeof(vueWrapper?.find) === 'function' && typeof(vueWrapper?.findAll) === 'function') ||
      // Check for Testing Library Vue wrapper property
      typeof(vueWrapper?.container) === 'object'
    )
  );
  debugLogger({
    function: 'cheerioManipulation.js:attributesCanBeStringified',
    data: { canBeStringified }
  });
  return canBeStringified;
};

/**
 * Adds a unique key to every DOM element as a data- attribute.
 *
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper or Testing Library Vue rendered wrapper
 */
const addSerializerKeys = function (vueWrapper) {
  if (attributesCanBeStringified(vueWrapper)) {
    debugLogger({ function: 'cheerioManipulation.js:addSerializerKeys' });
    let vnodes;
    if (isVueTestUtilsWrapper(vueWrapper)) {
      vnodes = vueWrapper.findAll('*');
    } else {
      vnodes = Array.from(vueWrapper.container.querySelectorAll('*'));
    }
    for (let vnode of vnodes) {
      if (vnode.element?.setAttribute) {
        vnode.element.setAttribute(KEY_NAME, 'v-' + key);
      } else if (vnode.setAttribute) {
        vnode.setAttribute(KEY_NAME, 'v-' + key);
      }
      key++;
    }
    alreadyRemovedKey = false;
  }
};

/**
 * Removes all data-keys from the vueWrapper and Cheerio object.
 *
 * @example
 * <h1 data-vue-snapshot-serializer-key="6">Hello World</h1>
 * <h1>Hello World</h1>
 *
 * @param {object} $           The markup as a cheerio object
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper or Testing Library Vue rendered wrapper
 */
const removeSerializerKeys = function ($, vueWrapper) {
  if (!alreadyRemovedKey) {
    debugLogger({ function: 'cheerioManipulation.js:removeSerializerKeys' });

    $('[' + KEY_NAME + ']').each((index, element) => {
      const currentKey = $(element).attr(KEY_NAME);
      let vnode;
      if (isVueTestUtilsWrapper(vueWrapper)) {
        vnode = vueWrapper.find('[' + KEY_NAME + '="' + currentKey + '"]');
        vnode.element.removeAttribute(KEY_NAME);
      } else {
        vnode = vueWrapper.container.querySelector('[' + KEY_NAME + '="' + currentKey + '"]');
        vnode.removeAttribute(KEY_NAME);
      }
      $(element).removeAttr(KEY_NAME);
      alreadyRemovedKey = true;
    });
  }
};

/**
 * Appends a value attribute to input, select, and textareas
 * to show the current value of the element in the snapshot.
 *
 * @example
 * <input>
 * <input value="Hello World">
 *
 * @param {object} $           The markup as a cheerio object
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper or Testing Library Vue rendered wrapper
 */
const addInputValues = function ($, vueWrapper) {
  if (
    globalThis.vueSnapshots?.addInputValues &&
    attributesCanBeStringified(vueWrapper)
  ) {
    debugLogger({ function: 'cheerioManipulation.js:addInputValues' });
    $('input, textarea, select').each(function (index, element) {
      const currentKey = $(element).attr(KEY_NAME);
      const keySelector = '[' + KEY_NAME + '="' + currentKey + '"]';

      let vnode;
      let value;
      let checked;

      if (isVueTestUtilsWrapper(vueWrapper)) {
        vnode = vueWrapper.find(keySelector);
        value = vnode.element.value;
        checked = vnode.element.checked;
      } else {
        vnode = vueWrapper.container.querySelector(keySelector);
        value = vnode.value;
        checked = vnode.checked;
      }

      element.attribs.value = swapQuotes(stringify(value));
      if (['checkbox', 'radio'].includes(element.attribs.type)) {
        element.attribs.checked = String(checked);
      }
    });
  }
};

/**
 * Replaces dynamic attribute values with a stringified version.
 *
 * @example
 * <h1 title="[object Object]"></h1>
 * <h1 title="{x:'asdf'}"></h1>
 *
 * @param {object} $           The markup as a cheerio object
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper or Testing Library Vue rendered wrapper
 */
const stringifyAttributes = function ($, vueWrapper) {
  if (
    globalThis.vueSnapshots?.stringifyAttributes &&
    attributesCanBeStringified(vueWrapper)
  ) {
    debugLogger({ function: 'cheerioManipulation.js:stringifyAttributes' });
    $('[' + KEY_NAME + ']').each((index, element) => {
      const currentKey = $(element).attr(KEY_NAME);
      let vnode;
      if (isVueTestUtilsWrapper(vueWrapper)) {
        vnode = vueWrapper.find('[' + KEY_NAME + '="' + currentKey + '"]');
        if (vnode) {
          const attributes = vnode.attributes();
          delete attributes[KEY_NAME];
          const attributeNames = Object.keys(attributes);
          for (let attributeName of attributeNames) {
            let value = vnode?.wrapperElement?.__vnode?.props?.[attributeName];
            if (value !== undefined && typeof(value) !== 'string') {
              value = swapQuotes(stringify(value));
              $(element).attr(attributeName, value);
            }
          }
          vnode.element.removeAttribute(KEY_NAME);
        }
      } else {
        vnode = vueWrapper.container.querySelector('[' + KEY_NAME + '="' + currentKey + '"]');
        if (vnode) {
          const attributes = Array.from(vnode.attributes);
          for (let attribute of attributes) {
            const attributeName = attribute.name;
            let value;
            if (vnode.__vnode?.props?.[attributeName] !== undefined) {
              value = vnode.__vnode.props[attributeName];
            } else {
              value = attribute.value;
            }
            if (value !== undefined && typeof(value) !== 'string') {
              value = swapQuotes(stringify(value));
            }
            $(element).attr(attributeName, value);
          }
          // Add serializer cleanup
          vnode.removeAttribute(KEY_NAME);
        }
      }

      // Clean up, remove the serializer data-key
      $(element).removeAttr(KEY_NAME);
      alreadyRemovedKey = true;
    });
  }
};

/**
 * This removes data-v-1234abcd="" from your snapshots.
 *
 * @param {object} $  The markup as a cheerio object
 */
const removeScopedStylesDataVIDAttributes = function ($) {
  if (globalThis.vueSnapshots?.removeDataVId) {
    debugLogger({ function: 'cheerioManipulation.js:removeScopedStylesDataVIDAttributes' });

    // [-\w]+ will catch 1 or more instaces of a-z, A-Z, 0-9, hyphen (-), or underscore (_)
    const regex = / data-v-[-\w]+/g;

    // [' data-v-asdf=""', ' data-v-qwer', ' data-v-asdf']
    let dataVIds = $.html().match(regex) || [];
    // ['data-v-asdf', 'data-v-qwer', 'data-v-asdf']
    dataVIds = dataVIds.map(function (match) {
      return match.trim().replace('=""', '');
    });
    // ['data-v-asdf', 'data-v-qwer']
    dataVIds = Array.from(new Set(dataVIds));

    dataVIds.forEach(function (attribute) {
      $('[' + attribute + ']').removeAttr(attribute);
    });
  }
};

/**
 * This removes the data-server-rendered="true" from your snapshots.
 *
 * @param {object} $  The markup as a cheerio object
 */
const removeServerRenderedText = function ($) {
  if (globalThis.vueSnapshots?.removeServerRendered) {
    debugLogger({ function: 'cheerioManipulation.js:removeServerRenderedText' });
    $('[data-server-rendered]').removeAttr('data-server-rendered');
  }
};

/**
 * Loops over the attributesToClear array to set the attribute
 * value to empty string on all matching elements.
 *
 * @param {object} $  The markup as a cheerio object
 */
const clearAttributes = function ($) {
  if (globalThis.vueSnapshots?.attributesToClear?.length) {
    debugLogger({ function: 'cheerioManipulation.js:clearAttributes' });
    globalThis.vueSnapshots.attributesToClear.forEach(function (attribute) {
      $('[' + attribute + ']').attr(attribute, '');
    });
  }
};

/**
 * Replaces inline functions with the '[function]' placeholder.
 *
 * @param {object} $  The markup as a cheerio object
 */
const clearInlineFunctions = function ($) {
  if (globalThis.vueSnapshots?.clearInlineFunctions) {
    debugLogger({ function: 'cheerioManipulation.js:clearInlineFunctions' });

    /**
     * Takes a string and tells you if it is a function.
     *
     * @param  {string}  str  Any string
     * @return {boolean}      true = matches function pattern
     */
    const isFunctionDeclaration = function (str) {
      // as of Happy-DOM 16+ > becomes &gt;
      str = str.replaceAll('=&gt;', '=>');

      /* eslint-disable-next-line jsdoc/check-line-alignment */
      /**
       * Matches strings that look like functions
       * START:
       *   function
       *   0 or more spaces
       * FUNCTION NAME:
       *   anything 0 or more times
       *   0 or more spaces
       * ARGUMENTS:
       *   (
       *   ARGUMENT:
       *     anything followed by a comma, 0 or more times
       *     0 or more spaces
       *     0 or more times
       *   )
       *   0 or more spaces
       * DECLARATION:
       *   {
       *     maybe anything
       *     maybe return(s)
       *     0 or more times
       *   }
       */
      const functionRegex = /function( )*(.)*( )*\((.,* *){0,}\) *{(.*\n*)*}/;

      if (str.startsWith('function ') || str.startsWith('function(')) {
        return str.endsWith('}') && functionRegex.test(str);
      }

      // Good enough to match most arrow functions
      return /^\s*\w+\s*=>/.test(str) || /^\s*\([^)]*\)\s*=>/.test(str);
    };

    $('*').each(function (index, element) {
      Object.keys(element.attribs).forEach(function (attributeName) {
        let value = element.attribs[attributeName];
        if (isFunctionDeclaration(value)) {
          element.attribs[attributeName] = '[function]';
        }
      });
    });
  }
};

/**
 * Finds DOM nodes based on provided selectors and optionally
 * replaces the tag name, removes attributes, and/or removes
 * innerHTML.
 *
 * @param {object} $  The markup as a cheerio object
 */
const stubOutDom = function ($) {
  for (const selector in globalThis.vueSnapshots?.stubs) {
    const stub = globalThis.vueSnapshots.stubs[selector];
    $(selector).each(function (index, element) {
      if (stub.removeAttributes === true) {
        element.attribs = {};
      }
      if (Array.isArray(stub.removeAttributes)) {
        Object.keys(element.attribs).forEach(function (key) {
          if (stub.removeAttributes.includes(key)) {
            delete element.attribs[key];
          }
        });
      }
      if (stub.removeInnerHtml) {
        element.children = [];
      }
      if (
        stub.tagName &&
        element.type === 'tag' &&
        element.name
      ) {
        element.name = stub.tagName;
      }
    });
  }
};

/**
 * Sorts the attributes of all HTML elements to make diffs easier to read.
 *
 * @example
 * <div id="dog" class="cat bat"><h1 title="a" class="b">Text</h1></div>
 * <div class="cat bat" id="dog"><h1 class="b" title="a">Text</h1></div>
 *
 * @param {object} $  The markup as a cheerio object
 */
const sortAttributes = function ($) {
  if (globalThis.vueSnapshots?.sortAttributes) {
    debugLogger({ function: 'cheerioManipulation.js:sortAttributes' });
    $('*').each(function (index, element) {
      Object.keys(element.attribs).sort().forEach(function (key) {
        let value = element.attribs[key];
        delete element.attribs[key];
        element.attribs[key] = value;
      });
    });
  }
};

/**
 * Sorts the classes in the class attribute of every HTML element to make diffs easier to read.
 *
 * @example
 * <div class="cat bat"><h1 class="frog zebra dog cow">Text</h1></div>
 * <div class="bat cat"><h1 class="cow dog frog zebra">Text</h1></div>
 *
 * @param {object} $  The markup as a cheerio object
 */
const sortClasses = function ($) {
  if (globalThis.vueSnapshots?.sortClasses) {
    debugLogger({ function: 'cheerioManipulation.js:sortClasses' });
    $('*').each(function (index, element) {
      const classes = element?.attribs?.class?.trim();
      if (classes) {
        element.attribs.class = classes
          .split(' ')
          .sort()
          .join(' ');
      }
    });
  }
};

/**
 * Applies desired DOM manipulations based on
 * global.vueSnapshots settings for improved snapshots.
 *
 * @param  {object | string} vueWrapper  Either the Vue-Test-Utils mounted component object, Testing Library Vue rendered wrapper, or a string of html.
 * @return {string}                      String of manipulated HTML, ready for formatting.
 */
export const cheerioManipulation = function (vueWrapper) {
  debugLogger({
    function: 'cheerioManipulation.js:cheerioManipulation',
    details: 'Uses the Cheerio library to mutate the markup based on the global vueSnapshots settings.',
    data: { vueWrapper }
  });

  addSerializerKeys(vueWrapper);
  let html = vueWrapper;
  if (typeof(vueWrapper?.html) === 'function') {
    html = vueWrapper.html();
  }

  /**
   * NOTE: Although we could check the settings and potentially skip
   * the cheerioze step completely, that would result in inconsistent
   * snapshots, as Cheerio removes empty attribute assignments.
   *
   * `<div class=""></div>` becomes `<div class></div>`
   *
   * Because of this, we should always pass the markup through Cheerio
   * to keep all snapshots consistent, even if we are not doing any
   * DOM manipulation.
   */
  const $ = cheerioize(html);

  addInputValues($, vueWrapper);
  // Removes data-key, so has to be last of vueWrapper calls
  stringifyAttributes($, vueWrapper);
  // Uses CSS Selectors, so must run before test tokens are removed
  stubOutDom($);
  removeServerRenderedText($);
  removeTestTokens($);
  removeScopedStylesDataVIDAttributes($);
  clearAttributes($);
  clearInlineFunctions($);
  sortAttributes($);
  sortClasses($);

  removeSerializerKeys($, vueWrapper);
  return $.html();
};
