// src/lib/filesToEtlUnits/etl-field-helper.js

/**
 * @module etl-field-helper
 *
 * @description
 * Exports support functions for the `file-fields -> etl-field` transformation.
 *
 */

/**
 * Returns an array where each item has a unique name. Duplicate values are
 * appended with an index value.
 *
 * @function
 * @param {Array} array
 * @return {Array}
 */
export const uniqueArray = (array) => {
  // If there are no duplicates, return
  if (new Set(array).size === array.length) {
    return array;
  }

  // Create object where { column1: [ idx, idx ], ... }
  const itemIndices = array.reduce((acc, item, idx) => {
    if (acc[item]) {
      return { ...acc, [item]: [...acc[item], idx] };
    }
    return { ...acc, [item]: [idx] };
  }, {});

  return array.map((item, idx) => {
    if (itemIndices[item].length === 1) return item; // no dups

    // Any subsequent items will be concatenated with the index of
    // the corresponding itemIndex
    const count = itemIndices[item].indexOf(idx) + 1;
    if (count < 10) {
      return `${item}_0${count}`;
    }
    return `${item}_${count}`;
  });
};

/**
 * Higher-order function to extract a property from sources.
 * @function
 *
 * @return {Array} of values in the provided source::ObjectLiteral
 * @throws ValueError
 *
 */
export const propFromSources = (prop) => (sources) => {
  // re-apply if sources is not an Array
  if (!Array.isArray(sources)) {
    return propFromSources(prop)(Object.values(sources));
  }
  try {
    return sources.reduce((acc, source) => {
      return source[prop] ? [...acc, source[prop]] : acc;
    }, []);
  } catch (e) {
    throw new Error(`propFromSources: ${e.message}`);
  }
};

/**
 * Support function that pipes together a sequence of functions.
 * @deprecated use chain or compose in headerview-helper
 *
 * @function
 *
 */
export const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((param, fn) => fn(param), x);
