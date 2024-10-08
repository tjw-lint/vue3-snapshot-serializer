import * as cheerio from 'cheerio';
import * as htmlparser2 from 'htmlparser2';

import {
  stringify,
  swapQuotes
} from '@/helpers.js';
import { removeTestTokens } from '@/removeTestTokens.js';

/**
 * Creates a cheerio ($) object from the html for DOM manipulation.
 *
 * @param  {string} html  The markup to use for the cheerio object
 * @return {object} $     The cheerio object
 */
const cheerioize = function (html) {
  // https://github.com/fb55/DomHandler
  // https://github.com/fb55/htmlparser2/wiki/Parser-options
  const xmlOptions = {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
    normalizeWhitespace: false,
    recognizeSelfClosing: false,
    xmlMode: false
  };
  const dom = htmlparser2.parseDOM(html, xmlOptions);
  const $ = cheerio.load(dom, { xml: xmlOptions });
  return $;
};

/**
 * Sets appends a data-value attribute to input, select, and textareas
 * to show the current value of the element in the snapshot.
 *
 * <input>
 * <input value="Hello World">
 *
 * @param {object} $           The markup as a cheerio object
 * @param {object} vueWrapper  The Vue-Test Utils mounted component wrapper
 */
const addInputValues = function ($, vueWrapper) {
  if (
    globalThis.vueSnapshots?.addInputValues &&
    typeof(vueWrapper?.html) === 'function'
  ) {
    const inputSelectors = 'input, textarea, select';

    $(inputSelectors).each(function (index, element) {
      const input = vueWrapper.findAll(inputSelectors).at(index);
      const value = input.element.value;
      element.attribs.value = swapQuotes(stringify(value));
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
     * @return {Boolean}      true = matches function pattern
     */
    const isFunctionDeclaration = function (str) {
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
 * Applies desired DOM manipulations based on
 * global.vueSnapshots settings for improved snapshots.
 *
 * @param  {Object|string} vueWrapper  Either the Vue-Test-Utils mounted component object, or a string of html.
 * @return {string}                    String of manipulated HTML, ready for formatting.
 */
export const cheerioManipulation = function (vueWrapper) {
  let html = vueWrapper;
  if (typeof(vueWrapper?.html) === 'function') {
    html = vueWrapper.html();
  }

  const $ = cheerioize(html);

  addInputValues($, vueWrapper);
  removeServerRenderedText($);
  removeTestTokens($);
  removeScopedStylesDataVIDAttributes($);
  clearAttributes($);
  clearInlineFunctions($);
  sortAttributes($);

  return $.html();
};
