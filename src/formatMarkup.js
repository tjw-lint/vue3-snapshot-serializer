// @ts-check

/**
 * @file After all other adjustments have been made to the markup,
 * just prior to returning it to be stored as a snapshot,
 * we apply custom formatting based on the global vueSnapshots.formatting settings.
 */

import { classicFormatter } from './formatters/classic.js';
import { diffableFormatter } from './formatters/diffable.js';
import { debugLogger, logger } from './helpers.js';

/**
 * Applies the usere's supplied formatting function, or uses the built-in
 * "diffable" option, or skips formatting.
 *
 * @param  {string} markup  Any valid HTML markup string
 * @return {string}         The same string, formatted based on user settings.
 */
export const formatMarkup = function (markup) {
  debugLogger({
    function: 'formatMarkup.js:formatMarkup',
    data: { markup }
  });
  if (globalThis.vueSnapshots) {
    if (globalThis.vueSnapshots.formatter === 'diffable') {
      markup = diffableFormatter(markup);
    }
    if (globalThis.vueSnapshots.formatter === 'classic') {
      markup = classicFormatter(markup);
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
