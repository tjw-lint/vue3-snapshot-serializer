/**
 * @file Applies regex-based string manipulations to the supplied markup, after Cheerio manipulation is complete.
 */

import { cheerioManipulation } from './cheerioManipulation.js';

import { debugLogger } from './helpers.js';

/**
 * This removes all HTML comments from your snapshots.
 *
 * @example
 * Normal <!---->
 * Multi-line <!-- \n asdf \n asdf \n -->
 * Containing HTML <!-- <div></div> -->
 *
 * @param  {string} html  The markup being serialized
 * @return {string}       Modified HTML string
 */
function removeAllComments (html) {
  if (globalThis.vueSnapshots?.removeComments) {
    debugLogger({ function: 'stringManipulation.js:removeAllComments' });
    // The best Stackoverflow has to offer.
    // Also removes a trailing newline if it exists.
    return html.replace(/(?=<!--)([\s\S]*?)-->(\n)?/g, '');
  }
  return html;
}

/**
 * Composes the order of all string manipulation to run on the supplied markup.
 *
 * @param  {object | string} html  A VTU wrapper or string of markup
 * @return {string}                A manipulated string of markup, ready for formatting
 */
export const stringManipulation = function (html) {
  debugLogger({ function: 'stringManipulation.js:stringManipulation' });
  html = cheerioManipulation(html);
  html = removeAllComments(html);
  return html;
};
