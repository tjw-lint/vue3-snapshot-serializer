/**
 * @file Utility functions imported by other files.
 */

import * as cheerio from 'cheerio';
import * as htmlparser2 from 'htmlparser2';

/**
 * Determines if the passed in value is markup.
 *
 * @param  {string}  received  The markup to be serialized
 * @return {boolean}           true = value is HTML
 */
export const isHtmlString = function (received) {
  return (
    received &&
    typeof(received) === 'string' &&
    received.startsWith('<')
  );
};

/**
 * Determines if the passed value is a VTU wrapper.
 *
 * @param  {object}  wrapper  A Vue-Test-Utils wrapper
 * @return {boolean}          true = VTU wrapper
 */
export const isVueTestUtilsWrapper = function (wrapper) {
  return !!(
    wrapper &&
    typeof(wrapper) === 'object' &&
    typeof(wrapper.html) === 'function' &&
    typeof(wrapper.find) === 'function'
  );
};

/**
 * Determines if the passed value is a TLV render container.
 *
 * @param  {object}  container  A @Testing-Library/Vue render container
 * @return {boolean}            true = TLV container
 */
export const isTestingLibraryVueContainer = function (container) {
  return !!(
    container &&
    typeof(container) === 'object' &&
    typeof(container.querySelector) === 'function' &&
    typeof(container.querySelectorAll) === 'function' &&
    typeof(container.toString) === 'function'
  );
};

/**
 * Determines if the passed value is a TLV wrapper.
 *
 * @param  {object}  wrapper  A @Testing-Library/Vue render wrapper
 * @return {boolean}          true = TLV wrapper
 */
export const isTestingLibraryVueWrapper = function (wrapper) {
  return !!(
    wrapper &&
    typeof(wrapper) === 'object' &&
    typeof(wrapper.html) === 'function' &&
    isTestingLibraryVueContainer(wrapper.container)
  );
};

/**
 * Determines if the passed value is a Vue-Test-Utils
 * or @Testing-Library/Vue wrapper.
 *
 * @param  {object}  received  A VTU or TLV component wrapper
 * @return {boolean}           true = VTU wrapper or TLV wrapper
 */
export const isVueWrapper = function (received) {
  return !!(
    isVueTestUtilsWrapper(received) ||
    isTestingLibraryVueWrapper(received) ||
    isTestingLibraryVueContainer(received)
  );
};

/**
 * Logs to the console helpful information when trying to
 * run this library, like invalid settings (if verbose = true).
 *
 * @param {string} message  Any information to log to the console
 */
export const logger = function (message) {
  if (globalThis.vueSnapshots?.verbose) {
    console.info('Vue 3 Snapshot Serializer: ' + message);
  }
};

/**
 * @typedef  {object} DEBUGSTATEMENT
 * @property {string} function        Name of the function being called
 * @property {any}    [any]           Any additional properties related to the function
 */

/**
 * Logs out information to help in debugging why snapshots aren't working.
 *
 * @param {DEBUGSTATEMENT} data  Object of relevant data to the current debug statment
 */
export const debugLogger = function (data) {
  if (globalThis.vueSnapshots?.debug) {
    console.info('V3SS Debug:', data);
  }
};

/**
 * Swaps single and double quotes.
 *
 * @example
 * 'Text' => "Text"
 * "Text" => 'Text'
 *
 * @param  {string} string  Input
 * @return {string}         Swapped output
 */
export const swapQuotes = function (string) {
  return string.replace(/['"]/g, function (match) {
    return match === '"' ? '\'' : '"';
  });
};

/**
 * Same as JSON.stringify, but without quotes around object properties.
 *
 * @param  {object} obj  data to stringify
 * @return {string}      stringified string
 */
export const stringify = function (obj) {
  if (obj === null) {
    return 'null';
  }
  if (obj === undefined) {
    return 'undefined';
  }
  if (Number.isNaN(obj)) {
    return 'NaN';
  }
  if (obj === Infinity) {
    return 'Infinity';
  }
  if (obj === -Infinity) {
    return '-Infinity';
  }
  if (typeof(obj) === 'number') {
    return String(obj);
  }
  if (obj instanceof Error) {
    return 'Error: ' + obj.message;
  }
  if (obj instanceof Set) {
    return JSON.stringify([...obj]);
  }
  if (typeof(obj) === 'object' && typeof(obj.getTime) === 'function') {
    if (Number.isNaN(obj.getTime())) {
      return obj.toString(); // 'Invalid Date'
    } else {
      return obj.getTime() + ''; // '1583463154386'
    }
  }
  if (typeof(obj) === 'function') {
    return 'Function';
  }
  if (typeof(obj) !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj) || '';
  }

  let props = Object
    .keys(obj)
    .map((key) => {
      if (obj[key] === undefined) {
        return undefined;
      }
      return key + ': ' + stringify(obj[key]);
    })
    .filter(Boolean)
    .join(', ');

  return '{ ' + props + ' }';
};

/**
 * Escapes special HTML characters.
 *
 * @example
 * '<div title="text">1 & 2</div>'
 * becomes
 * '&lt;div title=&quot;text&quot;&gt;1 &amp; 2&lt;/div&gt;'
 *
 * @param  {string} value  Any input string.
 * @return {string}        The same string, but with encoded HTML entities.
 */
export const escapeHtml = function (value) {
  // https://html.spec.whatwg.org/multipage/named-characters.html
  return value
    .replaceAll('\xa0', '&nbsp;');
};

/**
 * Unescapes special HTML characters.
 *
 * @example
 * '&lt;div title=&quot;text&quot;&gt;1 &amp; 2&lt;/div&gt;'
 * becomes
 * '<div title="text">1 & 2</div>'
 *
 * @param  {string} value  Any input string.
 * @return {string}        The same string, but with decoded HTML entities.
 */
export const unescapeHtml = function (value) {
  return value
    .replaceAll('&#xA;', '\n')
    .replaceAll('&nbsp;', '\xa0')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
};

/**
 * https://github.com/fb55/DomHandler
 * https://github.com/fb55/htmlparser2/wiki/Parser-options
 *
 * @type {object}
 */
const xmlOptions = {
  decodeEntities: false,
  lowerCaseAttributeNames: false,
  normalizeWhitespace: false,
  recognizeSelfClosing: false,
  xmlMode: false
};

/**
 * Takes in a string of HTML markup and returns an
 * Abstract Syntax Tree.
 *
 * @param  {string} markup  Any arbitrary XML/HTML
 * @return {object}         An htmlparser2 AST
 */
export const parseMarkup = function (markup) {
  debugLogger({ function: 'helpers.js:parseMarkup' });
  const ast = htmlparser2.parseDOM(markup, xmlOptions);
  return ast;
};

/**
 * Takes in the value from an HTML style attribute.
 * Splits on the semi-colon, handling edge cases.
 *
 * @param  {string}   styles  Any string of inline styles
 * @return {string[]}         Array of separated inline styles
 */
export const parseInlineStyle = function (styles) {
  debugLogger({ function: 'helpers.js:parseInlineStyle' });
  if (!styles) {
    return [];
  }

  const pairs = [];
  let current = '';
  let insideSingleQuote = false;
  let insideDoubleQuote = false;
  let parenthesisCount = 0;

  for (let i = 0; i < styles.length; i++) {
    const character = styles[i];
    const previousCharacter = styles[i - 1];
    const isEscaped = previousCharacter === '\\';

    if (character === '\'' && !insideDoubleQuote && !isEscaped) {
      insideSingleQuote = !insideSingleQuote;
    } else if (character === '"' && !insideSingleQuote && !isEscaped) {
      insideDoubleQuote = !insideDoubleQuote;
    } else if (character === '(' && !insideSingleQuote && !insideDoubleQuote) {
      parenthesisCount = parenthesisCount + 1;
    } else if (character === ')' && !insideSingleQuote && !insideDoubleQuote && parenthesisCount) {
      parenthesisCount = parenthesisCount - 1;
    }

    if (character === ';' && !insideSingleQuote && !insideDoubleQuote && !parenthesisCount) {
      pairs.push(current);
      current = '';
    } else {
      current = current + character;
    }
  }

  // Add the last pair
  pairs.push(current);

  return pairs
    .map((pair) => {
      return pair.trim();
    })
    .filter(Boolean);
};

/**
 * Creates a cheerio ($) object from the html for DOM manipulation.
 *
 * @param  {string} markup  The html markup to use for the cheerio object
 * @return {object}         The cheerio object
 */
export const cheerioize = function (markup) {
  debugLogger({ function: 'helpers.js:cheerioize' });
  const ast = parseMarkup(markup);
  const cheerioOptions = {
    xml: xmlOptions
  };
  const $ = cheerio.load(ast, cheerioOptions);
  return $;
};
