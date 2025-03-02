/**
 * @file Entry point for the library. Exports test/print functions for Vitest/Jest.
 * Also exports `vueMarkupFormatter` function for any other uses.
 */

import {
  debugLogger,
  isHtmlString,
  isTestingLibraryVueContainer,
  isTestingLibraryVueWrapper,
  isVueTestUtilsWrapper,
  isVueWrapper
} from './src/helpers.js';
import { loadOptions } from './src/loadOptions.js';
import { stringManipulation } from './src/stringManipulation.js';
import { formatMarkup } from './src/formatMarkup.js';

/**
 * Test function for Vitest's serializer API.
 * Determines whether to pass the markup through the print function.
 *
 * @param  {string|object} received  The markup or Vue wrapper to be formatted
 * @return {boolean}                 true = Tells Vitest to run the print function
 */
export const test = function (received) {
  const isHtml = isHtmlString(received);

  // Because test is called so much, we want to skip instantiating
  // the debug object unless debugging is enabled.
  if (globalThis.vueSnapshots?.debug) {
    debugLogger({
      function: 'index.js:test',
      details: [
        'Vue 3 Snapshot Serializer will only run on a string of',
        'HTML (first character is \'<\'), a Vue-Test-Utils wrapper,',
        'or a @Testing-Library/Vue render wrapper or container.'
      ].join(' '),
      data: {
        isHtml,
        isVueTestUtilsWrapper: isVueTestUtilsWrapper(received),
        isTestingLibraryVueWrapper: isTestingLibraryVueWrapper(received),
        isTestingLibraryVueContainer: isTestingLibraryVueContainer(received),
        received
      }
    });
  }
  return isHtml || isVueWrapper(received);
};

/**
 * Print function for Vitest's serializer API.
 * Formats markup according to options.
 *
 * @param  {string|object} received  The markup or Vue wrapper to be formatted
 * @return {string}                  The formatted markup
 */
export const print = function (received) {
  debugLogger({
    function: 'index.js:print',
    data: { received }
  });
  loadOptions();
  let html = received || '';
  html = stringManipulation(html);

  return formatMarkup(html);
};

/**
 * For external use. Takes in a string of HTML, applies changes to
 * the markup (based on global vueSnapshots settings). Then
 * formats the markup.
 *
 * @param  {string} html  The markup to be formatted.
 * @return {string}       The formatted markup.
 */
export const vueMarkupFormatter = function (html) {
  debugLogger({
    function: 'index.js:vueMarkupFormatter',
    data: { html }
  });
  loadOptions();
  if (!isHtmlString(html)) {
    return html;
  }
  html = stringManipulation(html);
  return formatMarkup(html);
};

export default {
  test,
  print
};
