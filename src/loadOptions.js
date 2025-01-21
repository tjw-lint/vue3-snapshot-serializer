/**
 * @file Loads in the user's settings, validates them, and sets defaults.
 */

import { logger } from './helpers.js';

/** @typedef {import('../types.js').SETTINGS} SETTINGS */

export const booleanDefaults = {
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

  // Normalize Stubs
  const stubs = globalThis.vueSnapshots.stubs;
  const stubsToProcess = {};
  if (Array.isArray(stubs)) {
    for (const stub of stubs) {
      if (typeof(stub) === 'string') {
        stubsToProcess[stub] = {
          removeInnerHtml: true,
          removeAttributes: true,
          tagName: (stub + '-stub')
            .split('')
            .map((character) => {
              const allowed = 'abcdefghijklmnopqrstuvwxyz-_';
              if (allowed.split('').includes(character)) {
                return character;
              }
              const capitals = allowed.toUpperCase();
              if (capitals.split('').includes(character)) {
                return '-' + character.toLowerCase();
              }
              const cssSyntaxTokens = '.#*{}';
              if (cssSyntaxTokens.includes(character)) {
                return;
              }
              const attributeSelectorTokens = '[]';
              const space = ' ';
              if (
                character === space ||
                attributeSelectorTokens.includes(character)
              ) {
                return '_';
              }
              return '-';
            })
            .join('')
            .split('-')
            .filter(Boolean)
            .join('-')
        };
      } else {
        logger('If using "stubs" as an array, all values must be a string of a CSS selector.');
      }
    }
  } else if (typeof(stubs) === 'object') {
    for (const selector in stubs) {
      stubsToProcess[selector] = {};
      if (typeof(stubs[selector]) === 'string') {
        stubsToProcess[selector].removeInnerHtml = true;
        stubsToProcess[selector].removeAttributes = true;
        stubsToProcess[selector].tagName = stubs[selector];
      } else if (typeof(stubs[selector]) === 'object') {
        if (
          typeof(stubs[selector].removeInnerHtml) === 'boolean' ||
          stubs[selector].removeInnerHtml === undefined
        ) {
          stubsToProcess[selector].removeInnerHtml = !!stubs[selector].removeInnerHtml;
        } else if (stubs[selector].removeInnerHtml !== undefined) {
          logger('The \'removeInnerHtml\' property for a stub must be a boolean or undefined.');
        }
        if (Array.isArray(stubs[selector].removeAttributes)) {
          const attributesToRemove = stubs[selector].removeAttributes;
          const onlyStringAttributes = attributesToRemove.filter((attribute) => {
            return typeof(attribute) === 'string';
          });
          if (attributesToRemove.length !== onlyStringAttributes.length) {
            logger('If specifying HTML attributes to remove from a stub, they must be strings.');
          }
          stubsToProcess[selector].removeAttributes = onlyStringAttributes;
        } else if (typeof(stubs[selector].removeAttributes) === 'boolean') {
          stubsToProcess[selector].removeAttributes = stubs[selector].removeAttributes;
        } else {
          if (stubs[selector].removeAttributes !== undefined) {
            logger('The \'removeAttributes\' property for a stub must be an array of string HTML attribute names, a boolean, or undefined.');
          }
          stubsToProcess[selector].removeAttributes = false;
        }
        if (typeof(stubs[selector].tagName) === 'string') {
          stubsToProcess[selector].tagName = stubs[selector].tagName;
        } else if (stubs[selector].tagName !== undefined) {
          logger('The \'tagName\' property for a stub must be a string or undefined.');
          stubsToProcess[selector].tagName = undefined;
        }
      } else {
        logger('The value of the selector to stub must either be a string of the stubbed tag name, or an object.');
      }
    }
  } else if (stubs !== undefined) {
    logger('The stubs setting must be either an array, an object, or undefined.');
  }
  for (const stubToProcess in stubsToProcess) {
    if (!Object.keys(stubsToProcess[stubToProcess]).length) {
      logger('Stubs must have at least one setting applied. Skipping stub: ' + stubToProcess);
      delete stubsToProcess[stubToProcess];
    }
    if (
      !stubsToProcess[stubToProcess].removeAttributes &&
      !stubsToProcess[stubToProcess].removeInnerHtml &&
      !stubsToProcess[stubToProcess].tagName
    ) {
      logger('Stubs must either replace a tag name or remove either attributes or innerHTML. Skipping stub: ' + stubToProcess);
      delete stubsToProcess[stubToProcess];
    }
  }
  globalThis.vueSnapshots.stubs = stubsToProcess;

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
    'postProcessor',
    'stubs'
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
};
