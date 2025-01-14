/**
 * @file Uses the Cheerio library to mutate the markup based on the global vueSnapshots settings.
 */

import {
  cheerioize,
  stringify,
  swapQuotes
} from './helpers.js';
import { removeTestTokens } from './removeTestTokens.js';

const KEY_NAME = 'data-vue-snapshot-serializer-key';
let key = 0;
let alreadyRemovedKey = true;

/**
 * Safety check to ensure the vueWrapper contains the needed
 * methods for attribute stringification.
 *
 * @param  {object}  vueWrapper  The VTU Wrapper object
 * @return {boolean}             If criteria is met
 */
const attributesCanBeStringified = function (vueWrapper) {
  return (
    (
      globalThis.vueSnapshots?.addInputValues ||
      globalThis.vueSnapshots?.stringifyAttributes
    ) &&
    typeof(vueWrapper?.find) === 'function' &&
    typeof(vueWrapper?.findAll) === 'function'
  );
};

/**
 * Adds a unique key to every DOM element as a data- attribute.
 *
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper
 */
const addSerializerKeys = function (vueWrapper) {
  if (attributesCanBeStringified(vueWrapper)) {
    const vnodes = vueWrapper.findAll('*');
    for (let vnode of vnodes) {
      vnode.element.setAttribute(KEY_NAME, 'v-' + key);
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
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper
 */
const removeSerializerKeys = function ($, vueWrapper) {
  if (!alreadyRemovedKey) {
    $('[' + KEY_NAME + ']').each((index, element) => {
      const currentKey = $(element).attr(KEY_NAME);
      const vnode = vueWrapper.find('[' + KEY_NAME + '="' + currentKey + '"]');
      $(element).removeAttr(KEY_NAME);
      vnode.element.removeAttribute(KEY_NAME);
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
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper
 */
const addInputValues = function ($, vueWrapper) {
  if (
    globalThis.vueSnapshots?.addInputValues &&
    attributesCanBeStringified(vueWrapper)
  ) {
    $('input, textarea, select').each(function (index, element) {
      const currentKey = $(element).attr(KEY_NAME);
      const vnode = vueWrapper.find('[' + KEY_NAME + '="' + currentKey + '"]');
      const value = vnode.element.value;
      element.attribs.value = swapQuotes(stringify(value));
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
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper
 */
const stringifyAttributes = function ($, vueWrapper) {
  if (
    globalThis.vueSnapshots?.stringifyAttributes &&
    attributesCanBeStringified(vueWrapper)
  ) {
    $('[' + KEY_NAME + ']').each((index, element) => {
      const currentKey = $(element).attr(KEY_NAME);
      const vnode = vueWrapper.find('[' + KEY_NAME + '="' + currentKey + '"]');
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

      // Clean up, remove the serializer data-key
      $(element).removeAttr(KEY_NAME);
      vnode.element.removeAttribute(KEY_NAME);
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
 * @param  {object | string} vueWrapper  Either the Vue-Test-Utils mounted component object, or a string of html.
 * @return {string}                      String of manipulated HTML, ready for formatting.
 */
export const cheerioManipulation = function (vueWrapper) {
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
  // Removes data-key, so has be last of vueWrapper calls
  stringifyAttributes($, vueWrapper);
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
