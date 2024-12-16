/**
 * @file Loads in the user's settings, validates them, and sets defaults.
 */

import { logger } from './helpers.js';

/** @typedef {import('../types.js').SETTINGS} SETTINGS */

export const booleanDefaults = {
  verbose: true,
  addInputValues: true,
  sortAttributes: true,
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
  escapeInnerText: true,
  selfClosingTag: false
};
const TAGS_WITH_WHITESPACE_PRESERVED_DEFAULTS = ['a', 'pre'];
const VOID_ELEMENTS_DEFAULT = 'xhtml';
const ALLOWED_VOID_ELEMENTS = Object.freeze([
  'html',
  'xhtml',
  'xml'
]);

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

  // Formatter
  if (!['none', 'diffable'].includes(globalThis.vueSnapshots.formatter)) {
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
    'formatter',
    'formatting',
    'postProcessor'
  ];
  const permittedFormattingKeys = [
    ...Object.keys(formattingBooleanDefaults),
    'attributesPerLine',
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
