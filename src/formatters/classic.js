// @ts-check

/**
 * @file This formatter is the same used in jest-serializer-vue-tjw. It is meant
 * to help people migrate from that libary to this one.
 */

import beautify from 'js-beautify';

/** @typedef {import('../../types.js').CLASSICFORMATTING} CLASSICFORMATTING */

export const classicFormatter = function (markup) {
  /** @type {CLASSICFORMATTING} */
  const formatting = globalThis.vueSnapshots.classicFormatting;

  return beautify.html(markup, formatting);
};
