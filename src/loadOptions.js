import { logger } from '@/helpers.js';

export const booleanDefaults = {
  verbose: true,
  sortAttributes: true,
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

export const formattingDefaults = {
  indent_char: ' ',
  indent_inner_html: true,
  indent_size: 2,
  inline: [],
  sep: '\n',
  unformatted: ['code', 'pre']
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

  if (
    !globalThis.vueSnapshots.formatting ||
    typeof(globalThis.vueSnapshots.formatting) !== 'object' ||
    Array.isArray(globalThis.vueSnapshots.formatting)
  ) {
    if (globalThis.vueSnapshots.formatting) {
      logger('The global.vueSnapshots.formatting value must be an object or undefined.');
    }
    globalThis.vueSnapshots.formatting = formattingDefaults;
  }

  /**
   * Clean up settings
   */

  const permittedKeys = [
    ...Object.keys(booleanDefaults),
    'attributesToClear',
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
