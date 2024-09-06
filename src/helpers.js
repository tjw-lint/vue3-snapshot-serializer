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

export const isVueWrapper = function (value) {
	return value;
};
