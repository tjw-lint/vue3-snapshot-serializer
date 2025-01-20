// @ts-check

/**
 * @file This formatter is the same used in jest-serializer-vue-tjw. It is meant
 * to help people migrate from that libary to this one.
 */

import beautify from 'js-beautify';

/** @typedef {import('../../types.js').CLASSICFORMATTING} CLASSICFORMATTING */

/**
 * The classic formatter which uses js-beautify.html, exactly matching
 * jest-serializer-vue-tjw.
 *
 * @param  {string} markup  The markup to format.
 * @return {string}         The formatted markup.
 */
export const classicFormatter = function (markup) {
  /** @type {CLASSICFORMATTING} */
  const formatting = globalThis.vueSnapshots.classicFormatting;

  return beautify.html(markup, formatting);
};
