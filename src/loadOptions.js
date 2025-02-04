/**
 * @file Loads in the user's settings, validates them, and sets defaults.
 */

import {
  debugLogger,
  logger
} from './helpers.js';

/** @typedef {import('../types.js').SETTINGS} SETTINGS */

export const booleanDefaults = {
  debug: false,
  verbose: true,
  addInputValues: true,
  sortAttributes: true,
  sortClasses: true,
  stringifyAttributes: true,
  removeServerRendered: true,
  removeDataVId: true,
  removeDataTest: true,
  removeDataTestid: true,
  removeDataTestId: true,
  removeDataQa: false,
  removeDataCy: false,
  removeDataPw: false,
  removeIdTest: false,
  removeClassTest: false,
  removeComments: false,
  clearInlineFunctions: false
};
export const formattingBooleanDefaults = {
  emptyAttributes: true,
  escapeAttributes: false,
  escapeInnerText: true,
  selfClosingTag: false
};
const ALLOWED_FORMATTERS = [
  'classic',
  'diffable',
  'none'
];
const TAGS_WITH_WHITESPACE_PRESERVED_DEFAULTS = ['a', 'pre'];
const VOID_ELEMENTS_DEFAULT = 'xhtml';
const ALLOWED_VOID_ELEMENTS = Object.freeze([
  'html',
  'xhtml',
  'xml'
]);
const CLASSIC_FORMATTING_INDENT_CHAR_DEFAULT = ' ';
const CLASSIC_FORMATTING_INDENT_INNER_HTML_DEFAULT = true;
const CLASSIC_FORMATTING_INDENT_SIZE_DEFAULT = 2;
const CLASSIC_FORMATTING_INLINE_DEFAULT = [];
const CLASSIC_FORMATTING_SEP_DEFAULT = '\n';
const CLASSIC_FORMATTING_UNFORMATTED_DEFAULT = ['code', 'pre'];


/**
 * Loads the default settings if valid settings are not supplied.
 * Warns the user if passing in invalid settings (if verbose = true).
 */
export const loadOptions = function () {
  debugLogger({
    function: 'loadOptions.js:loadOptions',
    details: 'Validating and defaulting options on the globalThis.vueSnapshots object.',
    data: {
      settings: globalThis.vueSnapshots
    }
  });

  /** @type {SETTINGS} globalThis.vueSnapshots */
  globalThis.vueSnapshots = globalThis.vueSnapshots || {};

  /**
   * Set boolean settings
   */

  for (const booleanSetting in booleanDefaults) {
    const value = globalThis.vueSnapshots[booleanSetting];
    if (typeof(value) !== 'boolean') {
      if (value !== undefined) {
        logger([
          'global.vueSnapshots.' + booleanSetting,
          'should be a boolean or undefined. Using default value',
          '(' + booleanDefaults[booleanSetting] + ').'
        ].join(' '));
      }
      globalThis.vueSnapshots[booleanSetting] = booleanDefaults[booleanSetting];
    }
  }

  /**
   * Set non-booleans
   */

  const attributesToClear = [];
  if (Array.isArray(globalThis.vueSnapshots.attributesToClear)) {
    for (const attribute of globalThis.vueSnapshots.attributesToClear) {
      if (
        typeof(attribute) === 'string' &&
        !attribute.trim().includes(' ')
      ) {
        attributesToClear.push(attribute.trim());
      } else if (typeof(attribute) === 'string' && attribute.includes(' ')) {
        logger('Attributes should not inlcude a space in global.vueSnapshots.attributesToClear. Received: ' + attribute);
      } else {
        logger('Attributes must be a type of string in global.vueSnapshots.attributesToClear. Received: ' + attribute);
      }
    }
  }
  globalThis.vueSnapshots.attributesToClear = attributesToClear;

  // Formatter
  if (!ALLOWED_FORMATTERS.includes(globalThis.vueSnapshots.formatter)) {
    if (globalThis.vueSnapshots.formatter) {
      logger('Allowed values for global.vueSnapshots.formatter are \'none\' and \'diffable\'.');
    }
    globalThis.vueSnapshots.formatter = undefined;
  }
  if (!globalThis.vueSnapshots.formatter) {
    globalThis.vueSnapshots.formatter = 'diffable';
  }

  if (
    globalThis.vueSnapshots.formatter !== 'diffable' &&
    typeof(globalThis.vueSnapshots.formatting) === 'object' &&
    Object.keys(globalThis.vueSnapshots.formatting).length
  ) {
    logger('When setting the formatter to anything other than \'diffable\', all formatting options are ignored.');
  }

  if (
    globalThis.vueSnapshots.formatter !== 'classic' &&
    typeof(globalThis.vueSnapshots.classicFormatting) === 'object' &&
    Object.keys(globalThis.vueSnapshots.classicFormatting).length
  ) {
    logger('When setting the formatter to anything other than \'classic\', all classicFormatting options are ignored.');
  }

  // Formatting
  if (globalThis.vueSnapshots.formatter === 'diffable') {
    if (!globalThis.vueSnapshots.formatting) {
      globalThis.vueSnapshots.formatting = {};
    }

    // Formatting - Booleans
    for (const booleanSetting in formattingBooleanDefaults) {
      const value = globalThis.vueSnapshots.formatting[booleanSetting];
      if (typeof(value) !== 'boolean') {
        if (value !== undefined) {
          logger([
            'global.vueSnapshots.formatting.' + booleanSetting,
            'should be a boolean or undefined. Using default value',
            '(' + formattingBooleanDefaults[booleanSetting] + ').'
          ].join(' '));
        }
        globalThis.vueSnapshots.formatting[booleanSetting] = formattingBooleanDefaults[booleanSetting];
      }
    }

    // Formatting - Whitespace Preserved
    const whiteSpacePreservedOption = globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved;
    const preserveWhitespaceMessage = [
      'vueSnapshots.formatting.tagsWithWhitespacePreserved',
      'must an be Array of tag names, like [\'a\' ,\'pre\'].'
    ].join(' ');
    if (Array.isArray(whiteSpacePreservedOption)) {
      const justStrings = whiteSpacePreservedOption.filter(function (tag) {
        return typeof(tag) === 'string';
      });
      if (whiteSpacePreservedOption.length !== justStrings.length) {
        logger(preserveWhitespaceMessage);
      }
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = justStrings;
    } else {
      if (whiteSpacePreservedOption !== undefined) {
        logger(preserveWhitespaceMessage);
      }
      globalThis.vueSnapshots.formatting.tagsWithWhitespacePreserved = TAGS_WITH_WHITESPACE_PRESERVED_DEFAULTS;
    }

    // Formatting - Attributes Per Line
    if (
      typeof(globalThis.vueSnapshots.formatting.attributesPerLine) !== 'number' || 
      globalThis.vueSnapshots.formatting.attributesPerLine < 0 ||
      globalThis.vueSnapshots.formatting.attributesPerLine % 1 !== 0
    ) {
      if (globalThis.vueSnapshots.formatting.attributesPerLine !== undefined) {
        logger([
          'global.vueSnapshots.formatting.attributesPerLine',
          'must be a whole number.'
        ].join(' '));
      }
      globalThis.vueSnapshots.formatting.attributesPerLine = 1;
    }

    // Formatting - Classes Per Line
    if (
      typeof(globalThis.vueSnapshots.formatting.classesPerLine) !== 'number' ||
      globalThis.vueSnapshots.formatting.classesPerLine < 0 ||
      globalThis.vueSnapshots.formatting.classesPerLine % 1 !== 0
    ) {
      if (globalThis.vueSnapshots.formatting.classesPerLine !== undefined) {
        logger([
          'global.vueSnapshots.formatting.classesPerLine',
          'must be a whole number.'
        ].join(' '));
      }
      globalThis.vueSnapshots.formatting.classesPerLine = 1;
    }

    // Formatting - Void Elements
    if (!ALLOWED_VOID_ELEMENTS.includes(globalThis.vueSnapshots.formatting.voidElements)) {
      if (globalThis.vueSnapshots.formatting.voidElements !== undefined) {
        logger([
          'global.vueSnapshots.formatting.voidElements',
          'must be either \'xhtml\', \'html\', \'xml\', or undefined.'
        ].join(' '));
      }
      globalThis.vueSnapshots.formatting.voidElements = VOID_ELEMENTS_DEFAULT;
    }
  } else {
    delete globalThis.vueSnapshots.formatting;
  }

  // Classic Formatting
  if (globalThis.vueSnapshots.formatter === 'classic') {
    if (!globalThis.vueSnapshots.classicFormatting) {
      globalThis.vueSnapshots.classicFormatting = {};
    }
    if (!globalThis.vueSnapshots.classicFormatting.indent_char) {
      globalThis.vueSnapshots.classicFormatting.indent_char = CLASSIC_FORMATTING_INDENT_CHAR_DEFAULT;
    }
    if (typeof(globalThis.vueSnapshots.classicFormatting.indent_inner_html) !== 'boolean') {
      globalThis.vueSnapshots.classicFormatting.indent_inner_html = CLASSIC_FORMATTING_INDENT_INNER_HTML_DEFAULT;
    }
    if (typeof(globalThis.vueSnapshots.classicFormatting.indent_size) !== 'number') {
      globalThis.vueSnapshots.classicFormatting.indent_size = CLASSIC_FORMATTING_INDENT_SIZE_DEFAULT;
    }
    if (!Array.isArray(globalThis.vueSnapshots.classicFormatting.inline)) {
      globalThis.vueSnapshots.classicFormatting.inline = CLASSIC_FORMATTING_INLINE_DEFAULT;
    }
    if (typeof(globalThis.vueSnapshots.classicFormatting.sep) !== 'string') {
      globalThis.vueSnapshots.classicFormatting.sep = CLASSIC_FORMATTING_SEP_DEFAULT;
    }
    if (!Array.isArray(globalThis.vueSnapshots.classicFormatting.unformatted)) {
      globalThis.vueSnapshots.classicFormatting.unformatted = CLASSIC_FORMATTING_UNFORMATTED_DEFAULT;
    }
  } else {
    delete globalThis.vueSnapshots.classicFormatting;
  }

  if (typeof(globalThis.vueSnapshots.postProcessor) !== 'function') {
    if (globalThis.vueSnapshots.postProcessor) {
      logger('The postProcessor option must be a function that returns a string, or undefined.');
    }
    delete globalThis.vueSnapshots.postProcessor;
  }


  /**
   * Clean up settings
   */

  const permittedRootKeys = [
    ...Object.keys(booleanDefaults),
    'attributesToClear',
    'classicFormatting',
    'formatter',
    'formatting',
    'postProcessor'
  ];
  const permittedFormattingKeys = [
    ...Object.keys(formattingBooleanDefaults),
    'attributesPerLine',
    'classesPerLine',
    'tagsWithWhitespacePreserved',
    'voidElements',
    'whiteSpacePreservedOption'
  ];
  const allRootKeys = Object.keys(globalThis.vueSnapshots);

  for (const key of allRootKeys) {
    if (!permittedRootKeys.includes(key)) {
      logger('Removed invalid setting global.vueSnapshots.' + key);
      delete globalThis.vueSnapshots[key];
    }
  }

  if (globalThis.vueSnapshots.formatting) {
    const allFormattingKeys = Object.keys(globalThis.vueSnapshots.formatting);
    for (const key of allFormattingKeys) {
      if (!permittedFormattingKeys.includes(key)) {
        logger('Removed invalid setting global.vueSnapshots.formatting.' + key);
        delete globalThis.vueSnapshots.formatting[key];
      }
    }
  }

  debugLogger({
    function: 'loadOptions.js:loadOptions',
    details: 'globalThis.vueSnapshots options validated/defaulted.',
    data: {
      settings: globalThis.vueSnapshots
    }
  });
};
