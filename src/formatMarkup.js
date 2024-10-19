// @ts-check

/** @import { DefaultTreeAdapterMap } from "parse5" */
/** @typedef {DefaultTreeAdapterMap["childNode"]} ChildNode */

import { parseFragment } from 'parse5';

import { logger } from './helpers.js';

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

/**
 * Uses Parse5 to create an AST from the markup. Loops over the AST to create a formatted HTML string.
 *
 * @param  {string} markup Any valid HTML
 * @param  {object} [options] Settings to tweak the formatting
 * @param  {'html' | 'xhtml' | 'closingTag'} [options.voidElements='xhtml'] How to handle void elements
 * @return {string} HTML formatted to be more easily diffable
 */
export const diffableFormatter = function (markup, options) {
  const voidElementMode = options?.voidElements || 'xhtml';

  const ast = parseFragment(markup, {
    sourceCodeLocationInfo: true
  });

  let lastSeenTag = '';
  /** @param {ChildNode} node */
  const formatNode = (node, indent = 0) => {
    if ('tagName' in node) {
      lastSeenTag = node.tagName;
    }

    const tagIsWhitespaceDependent = WHITESPACE_DEPENDENT_TAGS.includes(lastSeenTag);
    const tagIsVoidElement = VOID_ELEMENTS.includes(lastSeenTag);

    if ('value' in node) {
      if (node.value.trim()) {
        if (tagIsWhitespaceDependent) {
          return node.value;
        } else {
          return '\n' + '  '.repeat(indent) + node.value.trim();
        }
      }
      return '';
    }

    let result = '\n' + '  '.repeat(indent) + '<' + node.nodeName;

    // Add attributes
    const bracket = tagIsVoidElement && voidElementMode === 'xhtml' ? ' />' : '>';
    if ('attrs' in node && node.attrs.length === 1) {
      let [attr] = node.attrs;
      result = result + ' ' + attr.name + '="' + attr.value + '"' + bracket;
    } else if ('attrs' in node && node.attrs.length) {
      node.attrs.forEach((attr) => {
        result = result + '\n' + '  '.repeat(indent + 1) + attr.name + '="' + attr.value + '"';
      });
      result = result + '\n' + '  '.repeat(indent) + bracket.trim();
    } else {
      result = result + bracket;
    }

    // Process child nodes
    if ('childNodes' in node && node.childNodes.length) {
      node.childNodes.forEach((child) => {
        result = result + formatNode(child, indent + 1);
      });
    }

    // Add closing tag
    if (tagIsWhitespaceDependent || (tagIsVoidElement && voidElementMode === 'closingTag')) {
      result = result + '</' + node.nodeName + '>';
    } else if (!tagIsVoidElement) {
      result = result + '\n' + '  '.repeat(indent) + '</' + node.nodeName + '>';
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
  if (globalThis.vueSnapshots?.formatting) {
    if (typeof(globalThis.vueSnapshots.formatting) === 'function') {
      const result = globalThis.vueSnapshots.formatting(markup);
      if (typeof(result) === 'string') {
        return result;
      } else {
        logger('Your custom markup formatter must return a string.');
      }
    }
    if (globalThis.vueSnapshots.formatting === 'diffable') {
      return diffableFormatter(markup);
    }
  }
  return markup;
};
