import { parseFragment } from 'parse5';

import { logger } from './helpers.js';

/**
 * @typedef  {object}  OPTIONS
 * @property {boolean} [showEmptyAttributes=true]  Determines whether empty attributes will include `=""`. <div class> or <div class="">
 */

/**
 * @type {OPTIONS}
 */
export let DIFFABLE_OPTIONS_TYPE;

/**
 * Uses Parse5 to create an AST from the markup. Loops over the AST to create a formatted HTML string.
 *
 * @param  {string}  markup   Any valid HTML
 * @param  {OPTIONS} options  Diffable formatting options
 * @return {string}           HTML formatted to be more easily diffable
 */
export const diffableFormatter = function (markup, options) {
  markup = markup || '';
  options = options || {};
  if (typeof(options.showEmptyAttributes) !== 'boolean') {
    options.showEmptyAttributes = true;
  }

  const astOptions = {
    sourceCodeLocationInfo: true
  };
  const ast = parseFragment(markup, astOptions);

  // From https://developer.mozilla.org/en-US/docs/Glossary/Void_element
  const VOID_ELEMENTS = Object.freeze([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ]);
  const WHITESPACE_DEPENDENT_TAGS = Object.freeze([
    'a',
    'pre'
  ]);

  const ESCAPABLE_RAW_TEXT_ELEMENTS = Object.freeze([
    'textarea',
    'title'
  ]);

  let lastSeenTag = '';
  const formatNode = (node, indent) => {
    indent = indent || 0;
    if (node.tagName) {
      lastSeenTag = node.tagName;
    }
    const tagIsWhitespaceDependent = WHITESPACE_DEPENDENT_TAGS.includes(lastSeenTag);
    const tagIsVoidElement = VOID_ELEMENTS.includes(lastSeenTag);
    const tagIsEscapabelRawTextElement = ESCAPABLE_RAW_TEXT_ELEMENTS.includes(lastSeenTag);
    const hasChildren = node.childNodes && node.childNodes.length;

    // InnerText
    if (node.nodeName === '#text') {
      if (node.value.trim()) {
        if (tagIsWhitespaceDependent) {
          return node.value;
        } else {
          return '\n' + '  '.repeat(indent) + node.value.trim();
        }
      }
      return '';
    }

    // <!-- Comments -->
    if (node.nodeName === '#comment') {
      /**
       * The " Some Text " part in <!-- Some Text -->
       * Or the "\n  Some\n  Text\n" in
       * <!--
       *   Some
       *   Text
       * -->
       */
      let data = node.data
        .split('\n')
        .map((line, index, lines) => {
          if (!line) {
            return line;
          }
          // Is last item in loop
          if (index + 1 === lines.length) {
            return line.trim();
          }
          return '  '.repeat(indent + 1) + line.trimStart();
        })
        .join('\n');
      if (!data.startsWith('\n')) {
        data = ' ' + data;
      }
      if (!data.endsWith('\n')) {
        data = data + ' ';
      } else {
        data = data + '  '.repeat(indent);
      }
      return '\n' + '  '.repeat(indent) + '<!--' + data + '-->';
    }

    let result = '\n' + '  '.repeat(indent) + '<' + node.nodeName;

    let endingAngleBracket = '>';
    if (tagIsVoidElement || (!hasChildren && !tagIsEscapabelRawTextElement)) {
      endingAngleBracket = ' />';
    }

    // Add attributes
    if (node?.attrs?.length === 1) {
      let attr = node?.attrs[0];
      if (
        !attr.value &&
        !options.showEmptyAttributes
      ) {
        result = result + ' ' + attr.name + endingAngleBracket;
      } else {
        result = result + ' ' + attr.name + '="' + attr.value + '"' + endingAngleBracket;
      }
    } else if (node?.attrs?.length) {
      node.attrs.forEach((attr) => {
        if (
          !attr.value &&
          !options.showEmptyAttributes
        ) {
          result = result + '\n' + '  '.repeat(indent + 1) + attr.name;
        } else {
          result = result + '\n' + '  '.repeat(indent + 1) + attr.name + '="' + attr.value + '"';
        }
      });
      result = result + '\n' + '  '.repeat(indent) + endingAngleBracket.trim();
    } else {
      result = result + endingAngleBracket;
    }

    // Process child nodes
    if (hasChildren) {
      node.childNodes.forEach((child) => {
        result = result + formatNode(child, indent + 1);
      });
    }

    if (!tagIsVoidElement && (tagIsEscapabelRawTextElement || hasChildren)) {
      if (tagIsWhitespaceDependent || !hasChildren) {
        result = result + '</' + node.nodeName + '>';
      } else {
        result = result + '\n' + '  '.repeat(indent) + '</' + node.nodeName + '>';
      }
    }

    return result;
  };

  let formattedOutput = '';
  ast.childNodes.forEach((node) => {
    formattedOutput = formattedOutput + formatNode(node);
  });

  return formattedOutput.trim();
};

export const formatMarkup = function (markup) {
  if (globalThis.vueSnapshots?.formatter) {
    if (typeof(globalThis.vueSnapshots.formatter) === 'function') {
      const result = globalThis.vueSnapshots.formatter(markup);
      if (typeof(result) === 'string') {
        return result;
      } else {
        logger('Your custom markup formatter must return a string.');
      }
    } else if (globalThis.vueSnapshots.formatter === 'diffable') {
      return diffableFormatter(markup, globalThis.vueSnapshots.formatting);
    }
  }
  return markup;
};
