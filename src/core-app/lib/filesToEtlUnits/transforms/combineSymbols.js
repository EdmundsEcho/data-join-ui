// src/lib/filesToEtlUnits/transforms/combineSymbols

/**
 * @module lib/filesToEtlUnits/transforms/combineSymbols
 *
 */
import { propFromSources } from '../etl-field-helper';

/**
 * 'map-symbols' { arrows: { domain: codomain } }
 *
 * 'OBJECT' | 'ARRAY'
 *  OBJECT: a combination of key value pairs. Ovewrites duplicate key values.
 *  ARRAY: returns an array of map-symbols that maintains the array sequence.
 *
 * @function
 * @param {Array} sources - array of objects
 * @param {String} propName - property name to combine
 * @param {String} firstOrLast - 'FIRST' | 'LAST'
 * @param {String} returnType - 'OBJECT' | 'ARRAY'
 * @returns {Object} { arrows: { domain: codomain } }}
 *
 */
export const combineSymbols = (sources, propName, returnType = 'OBJECT') => {
  return returnType === 'OBJECT' ? { arrows: {} } : returnArray(propName, sources);
};

function returnArray(prop, sources) {
  return sources.map((source) => source?.[prop] ?? { arrows: {} });
}

/*
function returnObject(prop, sources, firstOrLast) {
  try {
    const values = sources
      .filter((source) => source[prop] !== undefined && source[prop] !== null)
      .map((source) => source[prop]);
    const arrows = combine(values, firstOrLast);
    return { arrows };
  } catch (e) {
    return { arrows: {} };
  }
} */

/**
 * [{ arrows: { domain: codomain } }]
 */
/*
function combine(arrayMaps, firstOrLast) {
  // have the first be the version that over-writes by processing it last.
  if (firstOrLast === 'FIRST') {
    arrayMaps.reverse();
  }
  return arrayMaps.reduce((accObj, currentMap) => {
    const arrows = currentMap?.arrows;
    if (arrows) {
      Object.keys(arrows).forEach((key) => {
        accObj[key] = arrows[key];
      });
    }
    return accObj;
  }, {});
} */
/* eslint-disable no-param-reassign */

export default combineSymbols;
