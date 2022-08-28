// src/utils/common.js

import { InputError } from '../lib/LuciErrors';

/**
 * Range generator
 *
 * @function
 * @param {Number} start
 * @param {Number} stop
 * @param {Number?} step
 * @return {Array<Number>}
 *
 */
export const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

/**
 * Returns a copy of the object without the prop.
 * Returns id when possible.
 *
 *     (prop, obj) -> obj
 *
 * ⚠️  Not a deep copy
 *
 * @function
 * @param {(String | Array.<String>)} prop
 * @param {Object} obj
 * @return {Object} without the prop/props
 */
export const removeProp = (remove, obj) => {
  try {
    switch (true) {
      case typeof obj === 'undefined': {
        throw new InputError(`removeProp: called with an undefined obj`);
      }

      case typeof obj !== 'object': {
        throw new InputError(
          `removeProp: called with the wrong type: ${typeof obj}`,
        );
      }

      case obj === null: {
        throw new InputError(`removeProp: called with a null value`);
      }

      // several props to remove
      /* eslint-disable no-param-reassign */
      case Array.isArray(remove): {
        return Object.keys(obj)
          .filter((k) => !remove.includes(k))
          .reduce((newObj, k) => {
            newObj[k] = obj[k];
            return newObj;
          }, {});
      }
      /* eslint-enable no-param-reassign */

      // nothing todo if prop does not exist in obj
      case !(remove in obj):
        return obj;

      default: {
        const { [remove]: _, ...rest } = obj;
        return rest;
      }
    }
  } catch (e) {
    if (e instanceof InputError) {
      /* eslint-disable-next-line */
      console.warn(e);
      return obj;
    }
    throw e;
  }
};

/**
 * camelCase -> snake
 *
 * @function
 * @param {String} str
 * @return {String}
 */
export const camelToSnakeCase = (text) => {
  return text
    .replace(/(.)([A-Z][a-z]+)/, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/, '$1_$2')
    .toLowerCase();
};
/**
 * StringValue -> stringValue
 *
 * @function
 * @param {String} str
 * @return {String}
 */
export const lowerFirstChar = (str) => {
  if (str === '') {
    return '';
  }
  return str[0].toLowerCase() + str.slice(1);
};

/**
 * Change the position of an item in an array.  Returns a new copy
 * of array of references.
 *
 * @function
 * @param {Array.<*>}
 * @param {integer} fromIndex
 * @param {integer} toIndex
 * @return {Array.<*>}
 *
 */
export const moveItemInArray = (array, fromIndex, toIndex) => {
  try {
    if (toIndex < 0 || toIndex > array.length) {
      throw new InputError(
        `Tried to move an item outside of the index bounds: ${toIndex}`,
      );
    }
  } catch (e) {
    if (e instanceof InputError) {
      /* eslint-disable-next-line */
      console.error(e.message);
      return array;
    }
    throw e;
  }
  const newArray = [...array];
  const [item] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, item);

  return newArray;
};

// -----------------------------------------------------------------------------
// likely move to headerview-helpers.js
/* eslint-disable no-console */

/**
 *
 * Takes a full path and returns the last segment as filename.
 * Handles both Windows and Unix-type paths
 *
 * @function
 * @param {string} path Path string
 * @returns {string} filename
 */
export const getFilenameFromPath = (path) => {
  if (typeof path !== 'string' || path.length === 0) {
    console.warn(
      `getFilenameFromPath call with invalid input: ${path || 'empty'}`,
    );
    return 'Filename';
  }
  // If we're on a Windows machine we handle the backslash path delimiter
  const delimiter = path.indexOf('\\') === -1 ? '/' : '\\';
  return path.split(delimiter).slice(-1)[0];
};

export const getRouteFromPath = (path) => getFilenameFromPath(path);

/**
 *
 * @param {string} path string path
 * @returns {string} parent path
 */
export const getParentPath = (path) => {
  if (typeof path !== 'string' || path.length === 0) {
    console.warn(`getParentPath call with invalid input: ${path || 'empty'}`);
    return 'Filename';
  }
  // If we're on a Windows machine we handle the backslash path delimiter
  const delimiter = path.indexOf('\\') === -1 ? '/' : '\\';
  const parts = path.split(delimiter);

  if (parts.length === 2 && parts[0] === '') {
    return delimiter;
  }
  return parts.slice(0, -1).join(delimiter);
};

/**
 * returns a max id from a given collection
 * @param collection Array or Map of object literals
 * @param idProp Id prop with type ~ Ord
 * @returns idProp That is the max
 */
export const maxId = (collection, idProp) => {
  // create a idx
  const isMax = (a, b) => (a > b ? a : b);

  return Array.isArray(collection)
    ? collection.map((f) => f[idProp]).reduce(isMax, 0)
    : Object.values(collection)
        .map((f) => f[idProp])
        .reduce(isMax, 0);
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Applies each function sequentially, from right to left; to output of
 * one becomes the input of the next.
 *
 *     [f, g] (arg) = f (g (arg))
 *
 * @function
 */
export const compose =
  (...fns) =>
  (firstArg) =>
    fns.reduceRight(
      (prevReturnValue, fn) => (fn ? fn(prevReturnValue) : prevReturnValue),
      firstArg,
    );

/**
 *
 * Applies an array of side-effect-producing functions
 * to the one instance of args.
 *
 * Useful for callbacks that are all expected to respond to
 * a user event.
 *
 * @function
 */
export function runSideEffects(...fns) {
  return (...args) => fns.forEach((fn) => fn && fn(...args));
}

/**
 *
 * Performs a deep merge of objects and returns new object. Does not modify
 * objects (immutable) and merges arrays via concatenation.
 *
 * Right-bias.
 *
 *     const obj1 = {
 *       a: 1,
 *       b: 1,
 *       c: { x: 1, y: 1 },
 *       d: [ 1, 1 ]
 *     }
 *     const obj2 = {
 *       b: 2,
 *       c: { y: 2, z: 2 },
 *       d: [ 2, 2 ],
 *       e: 2
 *     }
 *
 *     deepRightMerge (obj1, obj2) =>
 *
 *     {
 *      "a": 1,
 *      "b": 2,
 *      "c": {
 *        "x": 1,
 *        "y": 2,
 *        "z": 2
 *      },
 *      "d": [ 1, 1, 2, 2 ],
 *      "e": 2
 *      }
 *
 * @function
 * @param {...object} objects - Objects to merge
 * @returns {object} New object with merged key/values
 */
export function deepRightMerge(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    /* eslint-disable no-param-reassign */
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = deepRightMerge(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
  /* eslint-enable no-param-reassign */
}

// prettyPrice :: String -> String
export const prettyPrice = (price) =>
  /* eslint-disable no-nested-ternary */
  isNaN(price)
    ? '?'
    : price.toString().indexOf('.') >= 0
    ? price.toString().split('.')[1].length === 2
      ? price
      : `${parseFloat(price)}0`
    : `${parseInt(price, 10)}.00`;
/* eslint-enable no-nested-ternary */

export const prettyNumber = (number) => {
  if (number === undefined || number === null) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// dualNum :: Int -> String
export const dualNum = (x) => {
  return `0${x}`.slice(-2);
};
export const pathSep = (path) => (/\\/.test(path) ? '\\' : '/');
export const formatFileSize = (bytes) => {
  if (typeof bytes === 'undefined' || bytes === null) return '';

  if (bytes > 1000 * 1000 * 1000) {
    return `${(bytes / 1000000000).toFixed(2)} GB`;
  }
  if (bytes > 1000 * 1000) {
    return `${(bytes / 1000000).toFixed(2)} MB`;
  }
  if (bytes < 1000) {
    return `${bytes} Bytes`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
};

/**
 * @param {string} color hex code with or without # sign
 * @param {number} amt lighter relative to input color
 * @returns {string} hex color code with a # sign
 */
export const lightenColor = (color, amt) => {
  let usePound = false;
  /* eslint-disable no-param-reassign */
  if (color[0] === '#') {
    color = color.slice(1);
    usePound = true;
  }
  const num = parseInt(color, 16);
  /* eslint-disable no-bitwise */
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (
    (usePound ? '#' : '') +
    String(`000000${(g | (b << 8) | (r << 16)).toString(16)}`).slice(-6)
  );
  /* eslint-enable no-bitwise */
};

/**
 * @param {string} color hex code with or without # sign
 * @param {number} amt darker relative to input color
 * @returns {string} hex color code with a # sign
 */
export const darkenColor = (color, amt) => lightenColor(color, -amt);

/**
 * @description
 * Takes a max and list param and returns a string of comma separated
 * items. If the length of items in the list exceeds the max number
 * the list is truncated and an ellipsis is appended to the end.
 * @param {number} max Maximum number of list items to show
 * @param {string[]} list String items
 * @returns {string}
 */
export const listWithEllipsis = (max, list) => {
  const stringList = list.slice(0, max);

  if (typeof list === 'string')
    return stringList + (list.length > max ? '...' : '');
  return stringList.join(', ') + (list.length > max ? ', ...' : '');
};

/**
 * @function
 * @param {object} etlFields
 */
export const indexObject = (object) => {
  return Object.entries(object).reduce((indexedObjects, [key, value], idx) => {
    return { ...indexedObjects, [key]: { ...value, idx } };
  }, {});
};

/**
 * Dedup an array
 *
 * @function
 * @param {Array<any>} arrayInput
 * @return {Array<any>}
 */
export const dedupArray = (arrayInput, preProcess = (x) => x) => {
  return [...new Set(arrayInput.map(preProcess))];
};

/**
 *
 * Appends an index to duplicate values despite differences in capitalization.
 *
 * @function
 * @param {array} header Array of strings
 *
 */
export const dedupArrayWithIndex = (stringArray) => {
  if (stringArray === undefined || stringArray.length === 0) return [];

  // Transform array to lowercase
  const lowercaseStrings = stringArray.map((str) => str.toLowerCase());

  // If we're dealing with header with non-unique columns
  if (new Set(lowercaseStrings).size === stringArray.length) {
    return stringArray;
  }

  // Create object where { string1: [ idx, idx ], ... }
  const stringIndices = stringArray.reduce((strings, string, idx) => {
    if (strings[string.toLowerCase()]) {
      return {
        ...strings,
        [string.toLowerCase()]: [...strings[string.toLowerCase()], idx],
      };
    }
    return { ...strings, [string.toLowerCase()]: [idx] };
  }, {});

  // Return new array with duplicates appended with an appropriate index
  return stringArray.map((string, idx) => {
    if (stringIndices[string.toLowerCase()].length === 1) return string;

    // If this is the first instance
    if (stringIndices[string.toLowerCase()].indexOf(idx) === 0) return string;

    // Any subsequent columns will be concatenated with the index of
    // the corresponding columnIndex
    return string + dualNum(stringIndices[string.toLowerCase()].indexOf(idx));
  });
};

export const sanitizeString = (string) => {
  if (typeof string === 'undefined' || string === null) return '';
  return string.trim();
};

const whitelist = new RegExp(/([a-z]+)|_/);

export const sanitizeTableName = (name) =>
  name
    .trim()
    .toLowerCase()
    .split('')
    .filter((char) => whitelist.test(char))
    .join('');

/**
 *
 *      Object -> Object with deduped array values
 *
 * use the unique invariant of the object key
 * to dedup the array of objects using the dedup key.
 *
 * @function
 * @param {Object} obj
 * @param {string} dedupKey
 * @return {Object}
 */
export const dedupObject = (obj, dedupKey = 'key') => {
  const dedup = (array) =>
    Object.values(
      array.reduce((acc, err) => {
        acc[err[dedupKey]] = err;
        return acc;
      }, {}),
    );

  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = dedup(value, dedupKey);
    return acc;
  }, {});
};
