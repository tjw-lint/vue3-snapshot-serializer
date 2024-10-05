import { parseFragment } from 'parse5';

import { logger } from '@/helpers.js';

/**
 * Uses Parse5 to create an AST from the markup. Loops over the AST to create a formatted HTML string.
 *
 * @param  {string} markup  Any valid HTML
 * @return {string}         HTML formatted to be more easily diffable
 */
export const diffableFormatter = function (markup) {
  const options = {
    sourceCodeLocationInfo: true
  };
  const ast = parseFragment(markup, options);

  const whiteSpaceDependentTags = [
    'a',
    'pre'
  ];
  let lastSeenTag = '';
  const formatNode = (node, indent) => {
    indent = indent || 0;
    if (node.tagName) {
      lastSeenTag = node.tagName;
    }
    const tagIsWhitespaceDependent = whiteSpaceDependentTags.includes(lastSeenTag);
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

    let result = '\n' + '  '.repeat(indent) + '<' + node.nodeName;

    // Add attributes
    if (node?.attrs?.length === 1) {
      let attr = node?.attrs[0];
      result = result + ' ' + attr.name + '="' + attr.value + '">';
    } else if (node?.attrs?.length) {
      node.attrs.forEach((attr) => {
        result = result + '\n' + '  '.repeat(indent + 1) + attr.name + '="' + attr.value + '"';
      });
      result = result + '\n' + '  '.repeat(indent) + '>';
    } else {
      result = result + '>';
    }

    // Process child nodes
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach((child) => {
        result = result + formatNode(child, indent + 1);
      });
    }

    if (tagIsWhitespaceDependent) {
      result = result + '</' + node.nodeName + '>';
    } else {
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
