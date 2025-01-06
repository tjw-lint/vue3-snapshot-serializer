import _cloneDeep from 'lodash.clonedeep';

/**
 * @file Logic related to mutating the Abstract Syntax Tree used by the Diffable Formatter
 *       to correct the DOM hierarchy.
 */

const createPositionMap = function (ast, positionMap) {
  console.log(ast);
  if (ast && typeof(ast) === 'object') {
    if (ast?.sourceCodeLocation) {
      const {
        startOffset,
        endOffset
      } = ast.sourceCodeLocation;
      const distance = endOffset - startOffset;

      positionMap[distance] = positionMap[distance] || [];
      positionMap[distance].push({
        ...ast,
        childNodes: undefined
      });
    }
    if (ast?.childNodes?.length) {
      for (const node of ast.childNodes) {
        createPositionMap(node, positionMap);
      }
    }
  }
};

/**
 * CONTEXT:
 * The generated AST from parse5 moves DOM nodes out off their original hierarchy
 * to be more accurate to the W3C HTML spec. However, this model is a mismatch to
 * how we are using the AST for virtual-DOM snapshots. So it must be corrected.
 *
 * For more information, see:
 * https://github.com/tjw-lint/vue3-snapshot-serializer/issues/70
 *
 * APPROACH:
 * Since the AST includes the original location data, we can use this to reconstruct
 * the original DOM hierarchy.
 *
 * @param  {object} ast  The AST of the parsed fragment from parse5.
 * @return {object}      A mutated AST with corrected DOM heirarchy.
 */
export const correctASTHierarchy = function (ast) {
  console.log(ast);
  debugger;
  const positionMap = {};
  createPositionMap(ast, positionMap);
  console.log(positionMap);
  const newAst = {
    childNodes: []
  };
  for (const distaance of positionMap) {
    newAst.childNodes.push(positionMap[distance]);
  }
  // console.log(newAst);

  return newAst;
};
