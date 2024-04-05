/**
 * @module lib/filesToEtlUnits/transforms/combinePurposes
 *
 * @deprecated
 * use an inline function
 *
 *
 * @description
 * Combines values from sources using the FIRST or LAST non-null, enabled
 * choice. Utilized for the `purpose` property.
 *
 * @function
 * @param sources
 * @return {('subject'| 'quality'| 'mvalue'| 'mcomp'| 'mspan')}
 *
 */
import { propFromSources } from '../etl-field-helper';

/**
 * Top-level export.
 * :: sources -> purpose
 * Returns String for the purpose.
 * Throws an exception if a purpose cannot be found.
 */
export const combinePurposes = (sources, firstOrLast = 'FIRST') => {
  return combine(propFromSources('purpose')(sources), firstOrLast);
};

/**
 * Returns String, throws error if nothing is found.
 */
function combine(array, firstOrLast) {
  return {
    FIRST: array.slice(-1)[0],
    LAST: array.slice(1)[0],
  }[firstOrLast];
}

export default combinePurposes;
