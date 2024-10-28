import { logger } from './helpers.js';

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

export const loadOptions = function () {
  globalThis.vueSnapshots = globalThis.vueSnapshots || {};

  /**
   * Set boolean settings
   */

  for (const booleanSetting in booleanDefaults) {
    const value = globalThis.vueSnapshots[booleanSetting];
    if (typeof(value) !== 'boolean') {
      globalThis.vueSnapshots[booleanSetting] = booleanDefaults[booleanSetting];
      if (value !== undefined) {
        logger([
          'global.vueSnapshots.' + booleanSetting,
          ' should be a boolean or undefined. Using default value ',
          '(' + booleanDefaults[booleanSetting] + ').'
        ].join(''));
      }
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
  if (
    typeof(globalThis.vueSnapshots.formatter) !== 'function' &&
    !['none', 'diffable'].includes(globalThis.vueSnapshots.formatter)
  ) {
    if (globalThis.vueSnapshots.formatter) {
      logger('Allowed values for global.vueSnapshots.formatter are \'none\', \'diffable\', or a custom function');
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
    logger('When setting the formatter to "none" or a custom function, all formatting options will be removed.');
  }

  // Formatting
  if (globalThis.vueSnapshots.formatter === 'diffable') {
    if (!globalThis.vueSnapshots.formatting) {
      globalThis.vueSnapshots.formatting = {};
    }
    if (typeof(globalThis.vueSnapshots.formatting.showEmptyAttributes) !== 'boolean') {
      globalThis.vueSnapshots.formatting.showEmptyAttributes = true;
    }
  } else {
    delete globalThis.vueSnapshots.formatting;
  }

  /**
   * Clean up settings
   */

  const permittedKeys = [
    ...Object.keys(booleanDefaults),
    'attributesToClear',
    'formatter',
    'formatting'
  ];
  const allKeys = Object.keys(globalThis.vueSnapshots);

  for (const key of allKeys) {
    if (!permittedKeys.includes(key)) {
      delete globalThis.vueSnapshots[key];
      logger('Removed invalid setting global.vueSnapshots.' + key);
    }
  }
};
