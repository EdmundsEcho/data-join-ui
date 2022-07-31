/**
 * @module lib/filesToEtlUnits/transforms/combinePurposes
 *
 *
 * @description
 * Combines values from sources using the FIRST or LAST non-null, enabled
 * choice. Utilized for the `purpose` property.
 *
 * ⚠️  Fields that share an alias should not exist; the following logic
 *    is thus nonesensical.
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
  const result = {
    FIRST: array.slice(-1)[0],
    LAST: array.slice(1)[0],
  };

  return result[firstOrLast];
}

export default combinePurposes;
