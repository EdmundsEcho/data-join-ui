// src/lib/filesToEtlUnits/transforms/combineSymbols

/**
 * @module lib/filesToEtlUnits/transforms/combineSymbols
 *
 */
import { propFromSources } from '../etl-field-helper';

/**
 * Arrows { domain: codomain }
 *
 * @function
 *
 * @todo The computation needs to consider arrow as a prop.
 *       The output as is likely fails.
 *
 */
const combineSymbols = (sources) => {
  try {
    return combine(propFromSources('map-symbols')(sources));
  } catch (e) {
    return {
      arrows: {},
    };
  }
};

function combine(arrayMaps) {
  if (arrayMaps) {
    return arrayMaps.reduce((accObj, arrows) => {
      if (arrows) {
        return Object.keys(arrows).reduce((acc, key) => {
          acc[key] = arrows[key];
          return acc;
        }, accObj);
      }
      return {};
    }, {});
  }
  return {};
}

export default combineSymbols;

/**
 * [
 *   {
 *    domain:codomain,
 *    domain:codomain
 *   },
 *   {
 *    domain:codomain,
 *    domain:codomain
 *   }
 * ]
 */
