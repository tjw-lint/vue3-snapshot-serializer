// @ts-check

/**
 * @file After all other adjustments have been made to the markup,
 * just prior to returning it to be stored as a snapshot,
 * we apply custom formatting based on the global vueSnapshots.formatting settings.
 */

import { logger } from './helpers.js';
import { diffableFormatter } from './formatters/diffable.js';

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
