import * as cheerio from 'cheerio';
import * as htmlparser2 from 'htmlparser2';

import { removeTestTokens } from '@/removeTestTokens.js';

/**
 * Creates a cheerio ($) object from the html for DOM manipulation.
 *
 * @param  {string} html  The markup to use for the cheerio object
 * @return {object} $     The cheerio object
 */
export const cheerioize = function (html) {
  // https://github.com/fb55/DomHandler
  // https://github.com/fb55/htmlparser2/wiki/Parser-options
  const xmlOptions = {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
    normalizeWhitespace: false,
    recognizeSelfClosing: false,
    xmlMode: false
  };
  const dom = htmlparser2.parseDOM(html, xmlOptions);
  const $ = cheerio.load(dom, { xml: xmlOptions });
  return $;
};

/**
 * This removes data-v-1234abcd="" from your snapshots.
 *
 * @param  {object} $        The markup as a cheerio object
 * @param  {object} options  Options object for this serializer
 */
const removeScopedStylesDataVIDAttributes = function ($) {
  if (globalThis.vueSnapshots?.removeDataVId) {
    // [-\w]+ will catch 1 or more instaces of a-z, A-Z, 0-9, hyphen (-), or underscore (_)
    const regex = / data-v-[-\w]+/g;

    // [' data-v-asdf=""', ' data-v-qwer', ' data-v-asdf']
    let dataVIds = $.html().match(regex) || [];
    // ['data-v-asdf', 'data-v-qwer', 'data-v-asdf']
    dataVIds = dataVIds.map(function (match) {
      return match.trim().replace('=""', '');
    });
    // ['data-v-asdf', 'data-v-qwer']
    dataVIds = Array.from(new Set(dataVIds));

    dataVIds.forEach(function (attribute) {
      $('[' + attribute + ']').removeAttr(attribute);
    });
  }
};


export const cheerioManipulation = function (html) {
  const $ = cheerioize(html);

  // removeServerRenderedText($);
  removeTestTokens($);
  removeScopedStylesDataVIDAttributes($);
  // clearAttributes($);

  // clearInlineFunctions should always be ran before removeIstanbulComments for speed
  // clearInlineFunctions($);
  // removeIstanbulComments($);
  // sortAttributes($);

  return $.html();
};
