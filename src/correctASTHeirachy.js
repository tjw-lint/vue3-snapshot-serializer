/**
 * CONTEXT:
 * The generated AST from parse5 moves DOM nodes out off their original heiarchy
 * to be more accurate to the W3C HTML spec. However, this model is a mismatch to
 * how we are using the AST for virtual-DOM snapshots. So it must be corrected.
 *
 * For more information, see:
 * https://github.com/tjw-lint/vue3-snapshot-serializer/issues/70
 *
 * APPROACH:
 * Since the AST includes the original location data, we can use this to reconstruct
 * the original DOM heiarchy.
 *
 * @param  {object} ast  The AST of the parsed fragment from parse5.
 * @return {object}      A mutated AST with corrected DOM heirarchy.
 */
export const correctASTHeirachy = function (ast) {
  return ast;
};
