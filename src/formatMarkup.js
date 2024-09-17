import { Parser } from 'htmlparser2';
import beautify from 'js-beautify';
import rehypeFormat from 'rehype-format';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

export const formatMarkup = function (html) {
  const options = global.vueSnapshots?.formatting || {};
  return beautify.html(html, options);
};

// Originally from https://github.com/rayrutjes/diffable-html
export const diffableHtml = function (html) {
  const elements = [];
  const indentSize = globalThis.vueSnapshots?.formatting?.indent_size || 2;
  const lineSeparator = globalThis.vueSnapshots?.formatting?.sep || '\n';
  // https://www.w3.org/TR/html/syntax.html#writing-html-documents-elements
  const voidElements = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
  ];

  let currentDepth = 0;

  const increaseCurrentDepth = () => {
    currentDepth++;
  };

  const decreaseCurrentDepth = () => {
    currentDepth--;
  };

  const getIndentation = (size) => {
    return ' '.repeat(size);
  };

  const getIndentationForDepth = (depth) => {
    return getIndentation(indentSize * depth);
  };

  const getCurrentIndentation = () => {
    return getIndentationForDepth(currentDepth);
  };

  const getAttributeIndentation = () => {
    return getIndentation(indentSize * currentDepth - 1);
  };

  const append = (content) => {
    elements.push(content);
  };

  const appendLineBreak = () => {
    append(lineSeparator);
  };

  const appendIndentation = (depth) => {
    append(getIndentationForDepth(depth));
  };

  const appendCurrentIndentation = () => {
    append(getCurrentIndentation());
  };

  const appendOpeningTag = (name) => {
    append('<' + name);
  };

  const appendClosingTagOnSameLine = (closeWith) => {
    append(closeWith || '>');
  };

  const appendClosingTagOnNewLine = (closeWith) => {
    appendLineBreak();
    appendIndentation(currentDepth - 1);
    append(closeWith || '>');
  };

  const appendAttribute = (name, value) => {
    let attribute = ' ' + name;

    if (value.length > 0) {
      attribute = attribute + '="' + value + '"';
    }

    append(attribute);
  };

  const appendAttributeOnNewLine = (name, value) => {
    appendLineBreak();
    append(getAttributeIndentation());
    appendAttribute(name, value);
  };

  const appendAttributes = (attributes) => {
    const names = Object.keys(attributes);

    if (names.length === 1) {
      appendAttribute(names[0], attributes[names[0]]);
    }

    if (names.length <= 1) {
      return;
    }

    for (let name of names) {
      appendAttributeOnNewLine(name, attributes[name]);
    }
  };

  const appendClosingTag = (attributes, closeWith) => {
    if (Object.keys(attributes).length <= 1) {
      appendClosingTagOnSameLine(closeWith);

      return;
    }
    appendClosingTagOnNewLine(closeWith);
  };

  const render = () => {
    return elements.join('');
  };

  const isXmlDirective = (name) => {
    return name === '?xml';
  };

  const isVoidTagName = (name) => {
    return voidElements.includes(name);
  };

  // https://www.w3.org/TR/html52/infrastructure.html#space-characters
  // defines "space characters" to include SPACE, TAB, LF, FF, and CR.
  const trimText = (text) => {
    return text.replace(/^[ \t\n\f\r]+|[ \t\n\f\r]+$/g, '');
  };

  const extractAttributesFromString = (content) => {
    const attributes = {};

    const pieces = content.split(/\s/);
    // Remove tag name.
    delete pieces[0];

    pieces.forEach((element) => {
      if (element.length === 0) {
        return;
      }
      if (element.indexOf('=') === -1) {
        attributes[element] = '';
      }
    });

    const attributesRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gim;

    let result;
    while ((result = attributesRegex.exec(content))) {
      attributes[result[1]] = result[2];
    }

    return attributes;
  };

  const domHandlerOptions = {
    onprocessinginstruction: function (name, data) {
      let closingTag = '>';
      if (isXmlDirective(name)) {
        closingTag = '?>';
      }

      appendLineBreak();
      appendCurrentIndentation();
      increaseCurrentDepth();
      appendOpeningTag(name);

      const attributes = extractAttributesFromString(data);
      appendAttributes(attributes);
      appendClosingTag(attributes, closingTag);
      decreaseCurrentDepth();
    },
    onopentag: function (name, attributes) {
      appendLineBreak();
      appendCurrentIndentation();
      increaseCurrentDepth();
      appendOpeningTag(name);

      appendAttributes(attributes);
      appendClosingTag(attributes, '>');
    },
    ontext: function (text) {
      const trimmed = trimText(text);
      if (trimmed.length === 0) {
        return;
      }

      appendLineBreak();
      appendCurrentIndentation();
      append(trimmed);
    },
    onclosetag: function (tagname) {
      const isVoidTag = isVoidTagName(tagname);
      if (!isVoidTagName(tagname)) {
        appendLineBreak();
      }
      decreaseCurrentDepth();
      if (isVoidTag) {
        return;
      }
      appendCurrentIndentation();
      append('</' + tagname + '>');
    },
    oncomment: function (data) {
      // Only display conditional comments.
      if (!data.startsWith('[')) {
        return;
      }
      appendLineBreak();
      appendCurrentIndentation();
      append('<!--');
      append(data);
      append('-->');
    }
  };
  const parserOptions = {
    lowerCaseTags: false,
    recognizeSelfClosing: true
  };

  const parser = new Parser(domHandlerOptions, parserOptions);
  parser.write(html);
  parser.end();

  appendLineBreak();

  return render();
};

export const rehype = function (html) {
  const processor = unified()
    .use(rehypeParse)
    .use(rehypeFormat)
    .use(rehypeStringify);

  let output;
  processor.process(html, (error, file) => {
    if (error) {
      console.error(error);
      return;
    }
    output = String(file);
  });
  return output
    .split('<body>')[1]
    .split('</body>')[0]
    .split('\n')
    .map((line) => {
      return line.replace('    ', '');
    })
    .join('\n')
    .trim();
};
