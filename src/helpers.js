/**
 * Determines if the passed in value is markup.
 *
 * @param  {string}  received  The markup to be serialized
 * @return {boolean}           true = value is HTML
 */
export const isHtmlString = function (received) {
  return (
    received &&
    typeof(received) === 'string' &&
    received.startsWith('<')
  );
};

export const isVueWrapper = function (received) {
  return (
    typeof(received) === 'object' &&
    typeof(received.html) === 'function'
  );
};

export const logger = function (message) {
  if (globalThis.vueSnapshots?.verbose) {
    console.info('Vue 3 Snapshot Serializer: ' + message);
  }
};

/**
 * Swaps single and double quotes.
 *
 * 'Text' => "Text"
 * "Text" => 'Text'
 *
 * @param  {string} string  Input
 * @return {string}         Swapped output
 */
export const swapQuotes = function (string) {
  return string.replace(/['"]/g, function (match) {
    return match === '"' ? '\'' : '"';
  });
};

/**
 * Same as JSON.stringify, but without quotes around object properties.
 *
 * @param  {object} obj  data to stringify
 * @return {string}      stringified string
 */
export const stringify = function (obj) {
  if (obj === null) {
    return 'null';
  }
  if (obj === undefined) {
    return 'undefined';
  }
  if (Number.isNaN(obj)) {
    return 'NaN';
  }
  if (obj === Infinity) {
    return 'Infinity';
  }
  if (obj === -Infinity) {
    return '-Infinity';
  }
  if (typeof(obj) === 'number') {
    return String(obj);
  }
  if (obj instanceof Error) {
    return 'Error: ' + obj.message;
  }
  if (obj instanceof Set) {
    return JSON.stringify([...obj]);
  }
  if (typeof(obj) === 'object' && typeof(obj.getTime) === 'function') {
    if (Number.isNaN(obj.getTime())) {
      return obj.toString(); // 'Invalid Date'
    } else {
      return obj.getTime() + ''; // '1583463154386'
    }
  }
  if (typeof(obj) === 'function') {
    return 'Function';
  }
  if (typeof(obj) !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj) || '';
  }

  let props = Object
    .keys(obj)
    .map((key) => {
      return key + ':' + stringify(obj[key]);
    })
    .join(',');

  return '{' + props + '}';
};

/**
 * Escapes special HTML characters.
 *
 * @example
 * '<div title="text">1 & 2</div>'
 * becomes
 * '&lt;div title=&quot;text&quot;&gt;1 &amp; 2&lt;/div&gt;'
 *
 * @param  {string} value  Any input string.
 * @return {string}        The same string, but with encoded HTML entities.
 */
export const escapeHtml = function (value) {
  // https://html.spec.whatwg.org/multipage/named-characters.html
  const namedHtmlEntityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  const charactersToEncode = Object.keys(namedHtmlEntityMap);
  const regexp = new RegExp('[' + charactersToEncode.join('') + ']', 'g');
  const encode = function (character) {
    return namedHtmlEntityMap[character];
  };

  return value.replace(regexp, encode);
};
