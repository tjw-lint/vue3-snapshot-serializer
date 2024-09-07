import { cheerioManipulation } from '@/cheerioManipulation.js';

export const stringManipulation = function (html, options) {
  html = cheerioManipulation(html, options);
  return html;
};
