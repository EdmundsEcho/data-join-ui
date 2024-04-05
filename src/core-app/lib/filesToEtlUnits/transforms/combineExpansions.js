/**
 * @module lib/filesToEtlUnits/transforms/combineExpansions
 *
 *
 * @description
 * Relevant when an impliedMvalue exists
 *
 */

/**
 * Only useful to the degree there is a single source in the impliedMvalue
 * stack.
 *
 * :: sources -> null-value-expansion
 *
 */
export const combineExpansions = (sources, firstOrLast = 'FIRST') => {
  const prop = 'null-value-expansion';
  const filteredSources = sources.filter(
    (source) => source[prop] !== undefined && source[prop] !== null,
  );
  return combine(
    filteredSources.map((source) => source[prop]),
    firstOrLast,
  );
};

/**
 * Returns String, throws error if nothing is found.
 */
function combine(array, firstOrLast) {
  return array[0];
}

export default combineExpansions;
