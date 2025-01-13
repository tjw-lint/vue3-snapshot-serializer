/**
 * @file Constants and large object generation/storage.
 */

const SVG_FILTER_TAGS = Object.freeze([
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence'
]);

export const lowerToUppercaseSvgTagNames = {
  'clippath': 'clipPath'
};
for (const svgTagName of SVG_FILTER_TAGS) {
  lowerToUppercaseSvgTagNames[svgTagName.toLowerCase()] = svgTagName;
}

export const SELF_CLOSING_SVG_ELEMENTS = Object.freeze([
  'circle',
  'ellipse',
  ...SVG_FILTER_TAGS,
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'stop',
  'use'
]);

// From https://developer.mozilla.org/en-US/docs/Glossary/Void_element
export const VOID_ELEMENTS = Object.freeze([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

export const ESCAPABLE_RAW_TEXT_ELEMENTS = Object.freeze([
  'textarea',
  'title'
]);
