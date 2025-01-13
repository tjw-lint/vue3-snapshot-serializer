// @ts-check

/**
 * @file After all other adjustments have been made to the markup,
 * just prior to returning it to be stored as a snapshot,
 * we apply custom formatting based on the global vueSnapshots.formatting settings.
 */

import {
  ESCAPABLE_RAW_TEXT_ELEMENTS,
  lowerToUppercaseSvgTagNames,
  SELF_CLOSING_SVG_ELEMENTS,
  VOID_ELEMENTS
} from './constants.js';
import {
  escapeHtml,
  logger,
  parseMarkup,
  unescapeHtml
} from './helpers.js';

/** @typedef {import('../types.js').ASTNODE} ASTNODE */
/** @typedef {import('../types.js').FORMATTING} FORMATTING */

/**
 * Uses htmlparser2 to create an AST from the markup.
 * Loops over the AST to create a formatted HTML string.
 *
 * @param  {string} markup  Any valid HTML
 * @return {string}         HTML formatted to be more easily diffable
 */
export const diffableFormatter = function (markup) {
  markup = markup || '';
  /** @type {FORMATTING} */
  const options = globalThis.vueSnapshots.formatting;
  /** @type {ASTNODE} */
  const ast = parseMarkup(markup);
  /** @type {string[]} */
  const domPath = [];

  /**
   * Applies formatting to each DOM Node in the AST.
   *
   * @param  {ASTNODE} node    htmlparser2 AST of a DOM node
   * @param  {number}  indent  The current indentation level for this DOM node in the AST loop
   * @return {string}          Formatted markup
   */
  const formatNode = (node, indent) => {
    indent = indent || 0;
    const tagTypes = [
      'cdata',
      'doctype',
      'script',
      'style',
      'tag'
    ];
    const isTag = !!(tagTypes.includes(node.type) && node.name);
    let tagName;
    if (isTag) {
      tagName = node.name;
      const matchingSvgName = lowerToUppercaseSvgTagNames[tagName.toLowerCase()];
      if (matchingSvgName) {
        // AST lowercases all tag names, but some SVG tags are multi-word,
        // like "<feColorMatrix>" rather than "<fecolormatrix>".
        tagName = matchingSvgName;
      }
      // ['table', 'tbody', 'tr', 'td']
      domPath.push(tagName);
    }

    const lastSeenTag = domPath[domPath.length - 1];
    const tagIsWhitespaceDependent = isTag && options.tagsWithWhitespacePreserved.includes(lastSeenTag);
    const ancestorTagIsWhitespaceDependent = domPath.some((tag) => {
      return options.tagsWithWhitespacePreserved.includes(tag);
    });
    const tagIsVoidElement = isTag && VOID_ELEMENTS.includes(lastSeenTag);
    const tagIsSvgElement = isTag && SELF_CLOSING_SVG_ELEMENTS.includes(lastSeenTag);
    const tagIsEscapabelRawTextElement = isTag && ESCAPABLE_RAW_TEXT_ELEMENTS.includes(lastSeenTag);
    const hasChildren = node.children && node.children.length;

    // InnerText
    if (node.type === 'text') {
      let nodeValue = node.data;
      if (options.escapeInnerText) {
        nodeValue = escapeHtml(nodeValue);
      } else {
        nodeValue = unescapeHtml(nodeValue);
      }
      if (ancestorTagIsWhitespaceDependent) {
        return nodeValue;
      }
      if (nodeValue.trim()) {
        return '\n' + '  '.repeat(indent) + nodeValue.trim();
      }
      return '';
    }

    // <!-- Comments -->
    if (node.type === 'comment') {
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
    }

    // <tags and="attributes" />
    let result = '';

    if (ancestorTagIsWhitespaceDependent && !tagIsWhitespaceDependent) {
      result = result + '<' + tagName;
    } else {
      result = result + '\n' + '  '.repeat(indent) + '<' + tagName;
    }

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
    let endingAngleBracket = '>';
    if (shouldSelfClose) {
      endingAngleBracket = ' />';
    }

    // Add attributes
    if (!Object.keys(node.attribs).length) {
      result += endingAngleBracket;
    } else {
      const attributes = Object
        .entries(node.attribs)
        .map(([name, value]) => {
          return { name, value };
        });
      const isNewLine = attributes.length > options.attributesPerLine;
      const formattedAttribute = attributes.map((attribute) => {
        const hasValue = attribute.value || options.emptyAttributes;
        let fullAttribute;
        if (hasValue) {
          let attributeValue = (attribute.value || '');
          if (options.escapeAttributes) {
            attributeValue = escapeHtml(attributeValue);
          } else {
            attributeValue = unescapeHtml(attributeValue);
          }
          fullAttribute = attribute.name + '="' + attributeValue + '"';
        } else {
          fullAttribute = attribute.name;
        }
        if (isNewLine) {
          return '\n' + '  '.repeat(indent + 1) + fullAttribute;
        } else {
          return ' ' + fullAttribute;
        }
      }).join('');

      if (attributes.length <= options.attributesPerLine) {
        result += formattedAttribute + endingAngleBracket;
      } else {
        result += formattedAttribute + '\n' + '  '.repeat(indent) + endingAngleBracket.trim();
      }
    }

    // Process child nodes
    if (hasChildren) {
      node.children.forEach((child) => {
        if (ancestorTagIsWhitespaceDependent) {
          result = result + formatNode(child, indent);
        } else {
          result = result + formatNode(child, indent + 1);
        }
      });
    }

    // Return without closing tag
    if (shouldSelfClose) {
      domPath.pop();
      return result;
    }

    // Add closing tag
    if (
      ancestorTagIsWhitespaceDependent ||
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
      result = result + '</' + tagName + '>';
    } else if (!tagIsVoidElement) {
      result = result + '\n' + '  '.repeat(indent) + '</' + tagName + '>';
    }

    domPath.pop();
    return result;
  };

  let formattedOutput = '';
  ast.forEach((node) => {
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
  if (globalThis.vueSnapshots) {
    if (globalThis.vueSnapshots.formatter === 'diffable') {
      markup = diffableFormatter(markup);
    }
    if (typeof(globalThis.vueSnapshots.postProcessor) === 'function') {
      markup = globalThis.vueSnapshots.postProcessor(markup);
      if (typeof(markup) !== 'string') {
        logger('Your custom markup post processor must return a string.');
        return '';
      }
    }
  }
  return markup;
};
