// @ts-check

/**
 * @file After all other adjustments have been made to the markup,
 * just prior to returning it to be stored as a snapshot,
 * we apply custom formatting based on the global vueSnapshots.formatting settings.
 */

/** @import { DefaultTreeAdapterMap } from "parse5" */

import { parseFragment, defaultTreeAdapter } from 'parse5';

import {
  escapeHtml,
  logger
} from './helpers.js';

/** @typedef {import('../types.js').FORMATTING} FORMATTING */

const SELF_CLOSING_SVG_ELEMENTS = Object.freeze([
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use'
]);
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
 * Returns the last child node of an AST node if it exists or returns null.
 *
 * @param  {DefaultTreeAdapterMap["element"]}   node  Current AST DOM Node
 * @return {DefaultTreeAdapterMap["childNode"]}       Last child node or null
 */
const getNonTextChildNode = (node) => {
  for (let i = node.childNodes.length - 1; i >= 0; i--) {
    const childNode = node.childNodes[i];
    const isTextNode = defaultTreeAdapter.isTextNode(childNode);
    const isEmptyString = isTextNode && childNode.value.trim() === '';
    
    if(!isEmptyString) {
      return node.childNodes[i];
    }
  }
  return null;
};

/**
 * Detects if the DOM Node tag is on the same line as the child.
 *
 * @example
 * '<div><strong>X</strong></div>'
 *
 * @param  {object}  node  Current AST DOM Node being looped over in the formatting function
 * @return {boolean}       true = same line as child
 */
const isTagInSameLineAsChild = (node) => {
  if (node.childNodes.length) {
    const lastChild = getNonTextChildNode(node);
    return lastChild?.sourceCodeLocation.endLine === node.sourceCodeLocation.endTag.startLine;
  }
  return node.sourceCodeLocation.startTag.endLine === node?.sourceCodeLocation.endTag?.startLine; 
};

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
  const areAllTagsAreWhiteSpaceDependent = options.tagsWithWhitespacePreserved === true;

  let lastSeenTag = '';

  /**
   * Checks for various important properties on the AST DOM Node.
   *
   * @param  {string} lastSeenTag  The last HTML tag seen during the AST formatting loop.
   * @return {object}              Meta data about the tag, like if it is Void, SVG, white space dependent, etc.
   */
  const getTagProperties = (lastSeenTag) => {
    const tagIsWhitespaceDependent = (
      areAllTagsAreWhiteSpaceDependent ||
      (
        Array.isArray(options.tagsWithWhitespacePreserved) &&
        options.tagsWithWhitespacePreserved.includes(lastSeenTag)
      ));
    const tagIsVoidElement = VOID_ELEMENTS.includes(lastSeenTag);
    const tagIsSvgElement = SELF_CLOSING_SVG_ELEMENTS.includes(lastSeenTag);
    const tagIsEscapabelRawTextElement = ESCAPABLE_RAW_TEXT_ELEMENTS.includes(lastSeenTag);

    return {
      tagIsWhitespaceDependent,
      tagIsVoidElement,
      tagIsSvgElement,
      tagIsEscapabelRawTextElement
    };
  };

  /**
   * Applies formatting to each coment Node in the AST.
   *
   * @param  {DefaultTreeAdapterMap["commentNode"]} node    Parse5 AST of a DOM node
   * @param  {number}                               indent  The current indentation level for this DOM node in the AST loop
   * @return {string}                                       Formatted markup
   */
  const formatCommentNode = (node, indent) => {
    /* eslint-disable-next-line jsdoc/check-line-alignment */
    /**
     * The " Some Text " part in <!-- Some Text -->
     * Or the "\n  Some\n  Text\n" in
     * <!--
     *   Some
     *   Text
     * -->
     */
    let comment = node.data;
    if (!comment.trim()) {
      return '\n' + '  '.repeat(indent) + '<!---->';
    }
    comment = comment
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
    if (!comment.startsWith('\n')) {
      comment = ' ' + comment;
    }
    if (!comment.endsWith('\n')) {
      comment = comment + ' ';
    } else {
      comment = comment + '  '.repeat(indent);
    }
    return '\n' + '  '.repeat(indent) + '<!--' + comment + '-->';  
  };

  /**
   * Applies formatting to atttributes of DOM Node in the AST.
   *
   * @param  {DefaultTreeAdapterMap["element"]} node    Parse5 AST of a DOM node
   * @param  {number}                           indent  The current indentation level for this DOM node in the AST loop
   * @return {string}                                   Formatted markup
   */
  const processNodeAttributes = (node, indent) => {
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
      return formattedAttr;
    } else {
      return formattedAttr + '\n' + '  '.repeat(indent);
    }
  };

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

    const { 
      tagIsEscapabelRawTextElement,
      tagIsSvgElement,
      tagIsVoidElement,
      tagIsWhitespaceDependent
    } = getTagProperties(lastSeenTag);

    const hasChildren = node.childNodes && node.childNodes.length;
    const shouldSelfClose = (
      (
        tagIsSvgElement &&
        ['html', 'xhtml'].includes(options.voidElements)
      ) ||
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

    // InnerText
    if (defaultTreeAdapter.isTextNode(node)) {
      if (areAllTagsAreWhiteSpaceDependent) {
        return node.value;
      }
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
    if (defaultTreeAdapter.isCommentNode(node)) {
      return formatCommentNode(node, indent);
    }

    // <tags and="attributes" />
    // const sameLine = areAllTagsAreWhiteSpaceDependent ? (isTagInSameLineAsPrevious(node) || isTagInSameLineAsParent(node)) : false;
    let result = '\n' + '  '.repeat(indent) + '<' + node.nodeName;

    
    let endingAngleBracket = '>';
    if (shouldSelfClose) {
      endingAngleBracket = ' />';
    }

    // Add attributes
    if (node.attrs.length > 0) {
      result += processNodeAttributes(node, indent);
    }

    if (node.attrs.length <= options.attributesPerLine) {
      result += endingAngleBracket;
    } else {
      result += endingAngleBracket.trim();
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
    const endSameLine = areAllTagsAreWhiteSpaceDependent ? (isTagInSameLineAsChild(node)) : false;
    if (
      tagIsWhitespaceDependent && endSameLine ||
      (
        !tagIsVoidElement &&
        !hasChildren
      ) ||
      (
        options.voidElements === 'xml' &&
        (
          tagIsVoidElement ||
          tagIsSvgElement
        )
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

/**
 * Applies the usere's supplied formatting function, or uses the built-in
 * "diffable" option, or skips formatting.
 *
 * @param  {string} markup  Any valid HTML markup string
 * @return {string}         The same string, formatted based on user settings.
 */
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
