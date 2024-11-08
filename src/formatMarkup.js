// @ts-check
/** @import { DefaultTreeAdapterMap } from "parse5" */

import { parseFragment } from 'parse5';

import {
  escapeHtml,
  logger
} from './helpers.js';

/** @typedef {import('../types.js').FORMATTING} FORMATTING */

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

const ESCAPABLE_RAW_TEXT_ELEMENTS = Object.freeze([
  'textarea',
  'title'
]);

/**
 * Uses Parse5 to create an AST from the markup. Loops over the AST to create a formatted HTML string.
 *
 * @param  {string} markup  Any valid HTML
 * @return {string}         HTML formatted to be more easily diffable
 */
export const diffableFormatter = function (markup) {
  markup = markup || '';
  const options = globalThis.vueSnapshots.formatting;

  const astOptions = {
    sourceCodeLocationInfo: true
  };
  const ast = parseFragment(markup, astOptions);

  let lastSeenTag = '';

  /**
   * Applies formatting to each DOM Node in the AST.
   *
   * @param  {DefaultTreeAdapterMap["childNode"]} node    Parse5 AST of a DOM node
   * @param  {number}                             indent  The current indentation level for this DOM node in the AST loop
   * @return {string}                                     Formatted markup
   */
  const formatNode = (node, indent) => {
    indent = indent || 0;
    if (node.tagName) {
      lastSeenTag = node.tagName;
    }

    const tagIsWhitespaceDependent = (
      options.tagsWithWhitespacePreserved === true ||
      (
        Array.isArray(options.tagsWithWhitespacePreserved) && 
        options.tagsWithWhitespacePreserved.includes(lastSeenTag)
      ));
    const tagIsVoidElement = VOID_ELEMENTS.includes(lastSeenTag);
    const tagIsEscapabelRawTextElement = ESCAPABLE_RAW_TEXT_ELEMENTS.includes(lastSeenTag);
    const hasChildren = node.childNodes && node.childNodes.length;

    // InnerText
    if (node.nodeName === '#text') {
      if (node.value.trim()) {
        let nodeValue = node.value;
        if (options.escapeInnerText) {
          nodeValue = escapeHtml(nodeValue);
        }
        if (tagIsWhitespaceDependent) {
          return nodeValue;
        } else {
          return '\n' + '  '.repeat(indent) + nodeValue.trim();
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

    // <tags and="attributes" />
    let result = '\n' + '  '.repeat(indent) + '<' + node.nodeName;

    const shouldSelfClose = (
      (
        tagIsVoidElement &&
        options.voidElements === 'xhtml'
      ) ||
      (
        !tagIsVoidElement &&
        options.selfClosingTag &&
        !hasChildren &&
        !tagIsEscapabelRawTextElement
      )
    );
    let endingAngleBracket = '>';
    if (shouldSelfClose) {
      endingAngleBracket = ' />';
    }

    // Add attributes
    if (!node.attrs.length) {
      result += endingAngleBracket;
    } else {
      const isNewLine = node.attrs.length > options.attributesPerLine;
      const formattedAttr = node.attrs.map((attr) => {
        const hasValue = attr.value || options.emptyAttributes;
        let attrVal;
        if (hasValue) {
          attrVal = attr.name + '="' + (attr.value || '') + '"';
        } else {
          attrVal = attr.name;
        }
        if (isNewLine) {
          return '\n' + '  '.repeat(indent + 1) + attrVal;
        } else {
          return ' ' + attrVal;
        }
      }).join('');
  
      if (node.attrs.length <= options.attributesPerLine) {
        result += formattedAttr + endingAngleBracket;
      } else {
        result += formattedAttr + '\n' + '  '.repeat(indent) + endingAngleBracket.trim();
      }
    }

    // Process child nodes
    if (hasChildren) {
      node.childNodes.forEach((child) => {
        result = result + formatNode(child, indent + 1);
      });
    }
  
    // Return without closing tag
    if (shouldSelfClose) {
      return result;
    }

    // Add closing tag
    if (
      tagIsWhitespaceDependent ||
      (
        !tagIsVoidElement &&
        !hasChildren
      ) ||
      (
        tagIsVoidElement &&
        options.voidElements === 'xml'
      )
    ) {
      result = result + '</' + node.nodeName + '>';
    } else if (!tagIsVoidElement) {
      result = result + '\n' + '  '.repeat(indent) + '</' + node.nodeName + '>';
    }

    return result;
  };

  let formattedOutput = '';
  ast.childNodes.forEach((node) => {
    formattedOutput = formattedOutput + formatNode(node, 0);
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
