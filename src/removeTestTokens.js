/**
 * @file Removes specific attributes related to testing tokens from the supplied Cheerio object.
 */

/**
 * Removes any data-* attribute passed in.
 *
 * @param {object} $          The markup as a Cheerio DOM node.
 * @param {string} attribute  The attribute suffix.
 */
const removeDataAttribute = function ($, attribute) {
  $('[data-' + attribute + ']').removeAttr('data-' + attribute);
};

/**
 * Removes ID attributes from elements where the id starts with `test`.
 *
 * @param {object} $  The markup as a Cheerio DOM node.
 */
const removeIdTest = function ($) {
  $('[id]').each(function (index, element) {
    if ($(element).attr('id').toLowerCase().startsWith('test')) {
      $(element).removeAttr('id');
    }
  });
};

/**
 * Removes classes from elements where the class starts with `test`.
 *
 * @param {object} $  The markup as a Cheerio DOM node.
 */
const removeClassTest = function ($) {
  $('[class]').each(function (index, element) {
    let classesWereRemoved = false;
    $(element).removeClass(function (index, css) {
      return css
        .split(' ')
        .filter(function (className) {
          if (className.toLowerCase().startsWith('test')) {
            classesWereRemoved = true;
            return true;
          }
          return false;
        })
        .join(' ');
    });

    // Only remove the empty class attributes on elements that had test-classes.
    // There is a test case for this.
    if (!$(element).attr('class') && classesWereRemoved) {
      $(element).removeAttr('class');
    }
  });
};

/**
 * This removes the following from your snapshots:
 * data-test="whatever"
 * data-testid="whatever"
 * data-test-id="whatever"
 * data-qa="whatever"
 * data-cy="whatever"
 * data-pw="whatever"
 * id="testWhatever"
 * class="test-whatever"
 *
 * https://forum.vuejs.org/t/how-to-remove-attributes-from-tags-inside-vue-components/24138
 * See above to remove them from your production builds too.
 *
 * @param {object} $  The markup as a cheerio object
 */
export const removeTestTokens = function ($) {
  if (globalThis.vueSnapshots?.removeDataTest) {
    removeDataAttribute($, 'test');
  }
  if (globalThis.vueSnapshots?.removeDataTestid) {
    removeDataAttribute($, 'testid');
  }
  if (globalThis.vueSnapshots?.removeDataTestId) {
    removeDataAttribute($, 'test-id');
  }
  if (globalThis.vueSnapshots?.removeDataQa) {
    removeDataAttribute($, 'qa');
  }
  if (globalThis.vueSnapshots?.removeDataCy) {
    removeDataAttribute($, 'cy');
  }
  if (globalThis.vueSnapshots?.removeDataPw) {
    removeDataAttribute($, 'pw');
  }
  if (globalThis.vueSnapshots?.removeIdTest) {
    removeIdTest($);
  }
  if (globalThis.vueSnapshots?.removeClassTest) {
    removeClassTest($);
  }
};
