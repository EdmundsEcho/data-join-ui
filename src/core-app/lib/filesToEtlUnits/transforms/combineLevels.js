/**
 * @module /lib/combineLevels
 *
 * @description
 * Exports:
 * * combineLevels
 *
 * When building the `Etl-field` configuration, the [File-fields] ->
 * [Field-files] pivot requires that we combine the `levels` property from each
 * of the files in the `sources` property.
 *
 *     combine :: [[level]] -> [level]
 *     where level :: [value, count]
 *
 * Notes:
 * In the event the input [level] has duplicates, it will be mutated to a
 * collection where there are no duplicate values.  The counts will be combined
 * using addition.
 *
 * The module is not designed to work with `levels::span` where the individual
 * dates have been converted to `span`.
 *
 */
import { pipe, propFromSources } from '../etl-field-helper';

/* eslint-disable no-console */

/**
 * 📌
 * The top-level function for the module
 */
export const combineLevels = (sources) => {
  try {
    return combine(propFromSources('levels')(sources));
  } catch (e) {
    console.warn(e.message);
    return [];
  }
};

/** objMap -> [value,count] */
const objToArr = (mapValueCounts) => {
  return Object.keys(mapValueCounts).reduce((acc, key) => {
    return [...acc, [key, mapValueCounts[key]]];
  }, []);
};

const sort = (levels) => levels.sort((l1, l2) => l1[0] - l2[0]);

/**
 * :: [[level]] -> levelsMap
 * Merge does two things:
 * 1. creates a Set from [[level]]
 * 2. computes the counts for each level in the Set
 *
 */
const merge = (levelss) => {
  if (levelss === undefined) {
    throw new Error({
      message:
        'Error: tried to combine levels without providing a valid array of levels',
    });
  }

  if (levelss.length === 0) {
    // this should not happen
    throw new Error({
      message: 'Error: tried to combine levels of length zero',
    });
  }

  // :: [[level]] -> levelsMap -> levelsMap
  /* eslint-disable-next-line no-shadow */
  const go = (levelss, levelsMap) => {
    if (levelss.length === 0) {
      // done
      return levelsMap;
    }

    // local helpers
    const key = (level) => level[0];
    const value = (level) => level[1];

    const reducer = (accMap, level) => {
      /* eslint-disable no-param-reassign */
      if (accMap[key(level)]) {
        accMap[key(level)] += value(level);
        return accMap;
      }
      accMap[key(level)] = value(level);
      return accMap;
      /* eslint-enable no-param-reassign */
    };

    const [levels, ...rest] = levelss;

    if (levelsMap === undefined) {
      return go(rest, levels.reduce(reducer, {}));
    }

    return go(rest, levels.reduce(reducer, levelsMap));
  };

  return go(levelss, undefined);
};

// export for testing only
export function combine(levelss) {
  return pipe(
    merge, // [[[value,count]]] -> [{value,count}]
    objToArr, // [{value,count}] -> [[value,count]]
    sort, // [[value,count]] -> [[value,count]]
  )(levelss);
}
