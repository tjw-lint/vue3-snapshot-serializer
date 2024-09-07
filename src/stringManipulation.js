import { cheerioManipulation } from '@/cheerioManipulation.js';

/**
 * This removes all HTML comments from your snapshots.
 * Normal <!---->
 * Multi-line <!-- \n asdf \n asdf \n -->
 * Containing HTML <!-- <div></div> -->
 *
 * @param  {string} html     The markup being serialized
 * @return {string}          Modified HTML string
 */
function removeAllComments (html) {
  if (globalThis.vueSnapshots?.removeComments) {
    // The best Stackoverflow has to offer.
    // Also removes a trailing newline if it exists.
    return html.replace(/(?=<!--)([\s\S]*?)-->(\n)?/g, '');
  }
  return html;
}

export const stringManipulation = function (html) {
  html = cheerioManipulation(html);
  html = removeAllComments(html);
  return html;
};
