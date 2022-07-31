// src/lib/filesToEtlUnits/headerview-helpers.js

/**
 * @module lib/filesToEtlUnits/headerview-helpers
 *
 * @description
 * Collection of functions used to validate and process headerViews.
 *
 */
import { InvalidStateError, KeyValueError, ValueError } from '../LuciErrors';
import { AssertionWarning } from '../LuciWarnings';
import { SOURCE_TYPES, PURPOSE_TYPES } from '../sum-types';

import { colors } from '../../constants/variables';
// temporary re-export until move permanently
import { removeProp } from '../../utils/common';

export { getFilenameFromPath, removeProp } from '../../utils/common';

const { RAW, WIDE, IMPLIED } = SOURCE_TYPES;
const { MVALUE } = PURPOSE_TYPES;

/* eslint-disable no-console */

/**
 * 📌 Retrieve enabled fields from a headerView
 *
 *    👍 Unified comprehensive view
 *
 *    👍 Context sensitive
 *
 * Options to include fields using 'source-type':
 * RAW, WIDE, IMPLIED
 *
 * @function
 * @param {Object} hv headerView
 * @param {Object} hv.fields
 * @param {?Object} hv.wideToLongFields
 * @param {?Object} hv.impliedmvalue 'implied-mvalue'
 * @param {?Array.<string>} include Defaults to include all
 * @returns {Array.<string,Object>}
 */
export const getActiveHvFields = (hv, include = [RAW, WIDE, IMPLIED]) => {
  hasFieldsProp(hv);
  // When only want fields from RAW data...
  if (include.length === 1 && include[0] === RAW) {
    return hv.fields.filter((field) => field.enabled);
  }

  // validate the derived fields before proceeding;
  // will throw/catch an AssertionWarning when something looks wrong.
  validateDerivedFields(hv);

  // augment with dummy data to a standard format for searching
  const {
    wideToLongFields = { fields: {} },
    'implied-mvalue': impliedMvalue = { field: {} },
  } = hv;

  const hasWideFields = Object.keys(hv).includes('wideToLongFields');
  const hasImpliedMvalue = Object.keys(hv).includes('implied-mvalue');

  // goal: search RAW without mvalue when Wide is present
  // ... unless only wants RAW (above)
  const rawFieldPredicate = hasWideFields
    ? (field) => field.enabled && field.purpose !== MVALUE
    : (field) => field.enabled;

  // baseline collection of all fields
  const allFields = [
    ...hv.fields.filter(rawFieldPredicate),
    ...(Object.values(wideToLongFields.fields) || []),
    ...(hasImpliedMvalue ? [impliedMvalue.field] : []),
  ];

  // user-specified inclusion request
  return allFields.filter((field) => include.includes(field['source-type']));

  /* eslint-disable-next-line no-shadow */
  function hasFieldsProp(hv) {
    if (!('fields' in hv)) {
      throw new ValueError(
        `The headerView is missing the fields prop: ${hv.filename}`,
      );
    }
  }
};
/**
 * Returns array of string values.
 * :: headerView -> [fieldName]
 * @function
 * @param {Object} hv headerView
 * @returns {Array.<String>}
 */
export const fieldNamesFromHeaderView = (hv) =>
  getActiveHvFields(hv).map((field) => field['field-alias']);

/**
 * :: headerViews -> [fieldName]
 */
export const fieldNamesFromHeaderViews = (hvs) =>
  Object.values(hvs)
    .filter((hv) => hv.enabled)
    .reduce((acc, hv) => [...acc, ...fieldNamesFromHeaderView(hv)], []);

/**
 * [Object] -> map Object.<string.*>
 *
 * @param {Array} arrayOfValues
 * @param {String} property prop name to use as Map key
 * @returns {Object.<string,*>} with key value = prop
 */
export const mapFromArray = (arrayOfValues, property) =>
  arrayOfValues.reduce((acc, value) => {
    acc[value[property]] = value;
    return acc;
  }, {});

/**
 *
 *     Map headerViews -> Only enabled headerViews and Fields
 *     ref to all hv and fields -> ref to enabled
 *
 *     Note: v3 only has enabled hv
 *
 * @function
 * @param {Array.<Object>} hvs Array of headerViews
 * @returns {Array.<HeaderView>} Enabled fields (ex levels)
 */
export const enabledFieldsInHvs = (hvs) =>
  enabledHvInHvs(hvs).map((hv) => ({
    ...hv,
    fields: hv.fields.filter((field) => field.enabled),
  }));

/**
 * Collection of hvs -> Array of enabled hvs
 * v0.3.0 converts to Array because only host enabled
 *
 * Note: The callers that use getActiveHvFields should use this function
 * to avoid redundant computation.
 *
 * @function
 * @param {Any} hvs Array or Object of headerViews
 * @returns {Array.<HeaderView>}
 */
export function enabledHvInHvs(hvs) {
  if (Array.isArray(hvs)) return hvs;
  return Object.values(hvs);
}

/**
 * Return a copy of the array with the item removed from the location.
 * Optional capacity to replace the item.
 * @function
 *
 * @param {Array.<Object>} array the collection: Array
 * @param {integer} location position in the array
 * @param {Object?} item Optional replacement
 * @return {Array.<Object>}
 */
export const deleteReplace = (array, location, item = null) => {
  if (!Array.isArray(array)) {
    throw new Error(`deleteReplace: Invalid array input: ${typeof array}`);
  }
  return [
    ...array.slice(0, location),
    ...(item ? [item] : []),
    ...array.slice(location + 1),
  ];
};

/**
 *
 * Applies the supplied function to each of the headerViews.
 * A Functor that points the fn to the hv value.
 *
 * 👍 Does not mutate the readOnly headerViews
 *
 * @function
 * @param {object} headerViews
 * @param {function} fn function mapped over each hv
 * @returns {object} headerViews
 */
export const mapHeaderViews = (fn, headerViews) => {
  return Object.entries(headerViews).reduce((hvs, [filename, hv]) => {
    /* eslint-disable-next-line no-param-reassign */
    hvs[filename] = fn(hv); // fn must not mutate the readOnly hv
    return hvs;
  }, {});
};

/**
 * Utility function used to filter headerViews using the predicate provided.
 * Note: This approach generates the filtered object in one go.
 *
 * @function
 * @param {Function} predicate  fn :: hv -> bool
 * @param {Object.<string,Object>} headerViews
 * @return {Object.<string,Object>} headerViews
 */
export const filterHeaderViews = (pred, headerViews) => {
  /* eslint-disable no-param-reassign */
  const paths = Object.keys(headerViews);
  return Object.values(headerViews).reduce((hvs, hv, idx) => {
    if (pred(hv)) hvs[paths[idx]] = hv;
    return hvs;
  }, {});
};

/**
 * Applies the supplied function to each of the fields in a headerView.
 * A Functor that points the fn to the field value.
 *
 * 👍 Does not mutate the readOnly headerView (tested)
 *
 * @function
 * @param {Object} headerView
 * @param {Function} fn function mapped over each field
 * @returns {Object} headerView
 */
export const mapHeaderViewFields = (fn, headerView /* readOnly */) => {
  if (!('fields' in headerView)) {
    throw new ValueError(
      `Tried to map over a the headerView fields without a fields prop: ${
        headerView.filename || 'unknown'
      }`,
    );
  }
  return {
    ...headerView,
    fields: headerView.fields.map((field) => fn(field)), // fn to ensure copy
  };
};

/**
 * Intersecion of two Set objects.
 *
 * @function
 * @param {Set} setA
 * @param {Set} setB
 * @returns {Set}
 */
export const intersection = (setA, setB) => {
  /* eslint-disable no-underscore-dangle */
  const _intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
};

/**
 * Identify if a etl field is derived from "group-by-file"
 * information.
 *
 * ⚠️  This is an Etl-level concept (not file/header).
 *
 * @function
 * @param {Object.<string, (string|number|Object)>} field
 * @return bool
 */
export const isEtlFieldDerived = (field) => {
  if (typeof field === 'undefined') return undefined;
  if (typeof field === 'object') {
    const { 'map-files': mapFiles = { arrows: {} } } = field;
    if (mapFiles === null) return false;
    return Object.keys(mapFiles.arrows).length > 0;
  }
  throw new Error({
    message: `isEtlFieldDerived requires an object type: ${typeof field}`,
  });
};

/**
 * Create a version of a field for display purposes.
 * :: fields -> displayFields (Arrays)
 *
 * ⚠️  The display field will add missing props set with value null
 *
 * @function
 * @param {Array.<String>} displayProps
 * @param {Array.<Object>} fields
 * @return {Array.<Object>}
 */
export const mkViewFields = (displayProps, fields) =>
  fields.map((field) => selectPropsInObj(displayProps, field));

export function selectPropsInObj(props, source) {
  try {
    if (Array.isArray(source)) {
      // map this function over the array
      return source.map((entry) => selectPropsInObj(props, entry));
    }
    return props.reduce((newObj, prop) => {
      /* eslint-disable-next-line no-param-reassign */
      newObj[prop] = source?.[prop] ?? undefined; // ⚠️
      return newObj;
    }, {});
  } catch (error) {
    console.debug(`Object keys:`);
    console.dir(Object.keys(source));
    console.debug(`Requested keys:`);
    console.dir(props);
    throw new KeyValueError(`Tried to select a prop that does not exist`);
  }
}

/**
 * Returns the next field to display depending on the
 * action that is going to take place on the fields.
 *
 * Utilized by Etl Field view.
 *
 * @function
 * @param {!string} action 'remove' | 'add'
 * @param {!string} fieldName
 * @param {!Array.<string>} [listOfFieldNames]
 * @return {string} The next field to display
 */
export const getNextFieldToDisplay = (action, fieldName, listOfFieldNames) => {
  switch (action) {
    case 'deleting': {
      const cursor = listOfFieldNames.findIndex((name) => name === fieldName);
      if (cursor - 1 < 0)
        throw new Error({
          message: `Unreachable: tried to set index less than zero`,
        });
      return listOfFieldNames[cursor - 1];
    }
    case 'adding': {
      return fieldName;
    }
    default: {
      throw new Error({
        message: `Unreachable: unsuported field action; only use 'deleting' or 'adding': ${action}`,
      });
    }
  }
};

/**
 * Set operation to determine if each has the same elements.
 *
 * @function
 * @param {Set} a
 * @param {Set} b
 * @return {bool}
 */
export const areSetsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value));

/**
 * Simple memoizer that works for string and any other input type
 * that casts to a string (i.e. a valid key for the object literal).
 *
 * The key here :), is to return not just the same value, but the same ref
 * to that same value.
 *
 * Memo is triggered using the last parameter of the memoized function.
 *
 * Usage:
 *
 * ```js
 * function getHeader(state, filename) {
 *    return state.headerViews[filename].header;
 * }
 *
 * const withMemoGetHeader = memoizer(getHeader);
 * ```
 *
 * @function
 * @param {Function} fn
 * @return {Function}
 */
export function memoize(fn, DEBUG = false) {
  if (DEBUG) console.log(`%cinitializing memo: ${fn.name}`, colors.green);

  const cache = new Map();

  return {
    clear: () => cache.clear(),
    delete: (memoKey) => cache.delete(memoKey),
    memoFn: (...args) => {
      const [memoKey] = args.slice(-1);

      if (cache.has(memoKey) && typeof cache.get(memoKey) !== 'undefined') {
        if (DEBUG) console.log(`%cusing memoize! ${memoKey}.`, colors.green);
        return cache.get(memoKey);
      }

      if (DEBUG) console.log(`%cNOT memoized: ${memoKey}.`, colors.yellow);
      const result = fn(...args);
      cache.set(memoKey, result);

      return result;
    },
  };
}

/**
 * Definitive source of active files.
 *
 * Returns a list of filename and the subject field name from where the files
 * were sourced. Used when user-changes need to be re-applied following a
 * backtracking event from Etl to Header view (and back).
 *
 * Relies on a valid Subject field.
 *
 * @param {EtlField} subjectEtlField
 * @return {{fileNames: Array.<String>, subjectName: String}}
 * @throws new Error in the event a subject is not found.
 */
export const getFileNamesFromSubject = (subjectEtlField) => {
  if (typeof subjectEtlField === 'undefined') {
    throw new Error({
      message: 'create-etl-field: getFiles needs a valid subjectEtlField',
    });
  }
  return {
    fileNames: subjectEtlField.sources.map((s) => s.filename),
    subjectName: subjectEtlField.name,
  };
};

/**
 * Memoized version of etlUnitData
 * Return the same ref upon repeated use
 * Usage: Initialize the function with the useState hook.
 *
 * 🦀 Cannot yet to find a way to clear the key when a new derived field
 *    is added to the etlFields collection. Thus, remains an unused WIP.
 *
 * @function
 */
export const memoEtlFieldData = (meaRelatedEtlFields, meaEtlUnits) => {
  const cache = new Map();
  console.debug(`%cInstantiating memoEtlFieldData`, colors.orange);

  return {
    clear: () => cache.clear(),
    delete: (mvalueName) => cache.delete(mvalueName),
    memoFn: (mvalueName) => {
      if (cache.has(mvalueName)) {
        console.debug(`%cUsing the cache! ${mvalueName}`, colors.green);
        return cache.get(mvalueName);
      }
      const result = [
        meaEtlUnits[mvalueName].mspan,
        ...meaEtlUnits[mvalueName].mcomps,
      ].map((meaRelatedFieldName) =>
        meaRelatedEtlFields.find((field) => field.name === meaRelatedFieldName),
      );
      cache.set(mvalueName, result);
      console.debug(`%cNot using the cache :( ${mvalueName}`, colors.yellow);
      return result;
    },
  };
};

/**
 * This is a helper function used to transform levels based on
 * map-symbols.arrows object. This is a 3 step process which includes
 * creating an inverse object that groups values of arrows.
 *
 * ⬜ Review the logic when start using levels again.
 *
 * @function
 * @param {array} rawLevels in the form of [ [ key, value ] ]
 * @param {object} map in the form of { key: value }
 */
export const transformLevels = (rawLevels, arrows) => {
  // Handle not receiving a map
  if (typeof arrows === 'undefined' || arrows === null) return rawLevels;

  // Convert level array to object for easier indexing
  /* eslint-disable-next-line no-shadow */
  const pairs = rawLevels.reduce((pairs, level) => {
    pairs[level[0]] = level[1]; /* eslint-disable-line */
    return pairs;
  });

  const mapDomains = Object.keys(arrows);

  // First we flip the arrows so we have the codomains accessible
  // with the list of domains as values
  const inverse = Object.values(arrows).reduce((values, value, idx) => {
    /* eslint-disable no-param-reassign */
    // If the arrow does not exist we do not add it to our inverse object
    if (typeof pairs[mapDomains[idx]] === 'undefined') {
      return values;
    }
    // If the codomain already exists we append the domain to the list
    if (typeof values[value] === 'undefined') {
      values[value] = [mapDomains[idx]];
    } else {
      // If it already exists we append the domain to the list
      values[value] = [...values[value], mapDomains[idx]];
    }
    return values;
    /* eslint-enable no-param-reassign */
  }, {});

  /* eslint-disable-next-line no-shadow */
  const summedInverse = Object.keys(inverse).reduce((summedInverse, key) => {
    const sum = inverse[key].reduce(
      (total, param) => total + parseInt(pairs[param], 10),
      0,
    );
    /* eslint-disable-next-line no-param-reassign */
    summedInverse[key] = sum;
    return summedInverse;
  }, {});

  const summedLevels = Object.keys(pairs).reduce((levels, level) => {
    /* eslint-disable-next-line no-param-reassign */
    levels[level] =
      typeof summedInverse[level] !== 'undefined'
        ? pairs[level] + summedInverse[level]
        : pairs[level];

    return levels;
  }, {});

  // left bias merge: start with left object, for each key on the right not
  // already set in the left, record.
  const mergedLevels = Object.keys(summedInverse).reduce(
    /* eslint-disable no-param-reassign */
    /* eslint-disable-next-line no-shadow */
    (mergedLevels, key) => {
      mergedLevels[key] = summedLevels[key] || summedInverse[key]; // left bias
      return mergedLevels;
    },
    /* eslint-enable no-param-reassign */
    summedLevels,
  );

  // Remove old levels that have been migrated
  const cleanedLevels = removeProp(mapDomains, mergedLevels);

  // Convert cleanedLevels back to an array of tuples and sort it
  return cleanedLevels.entries().sort();
};

/**
 * Validate the derived fields in a headerview
 *
 * ⬜ Consider this in context of a run-time validation that throws an error
 *
 * @function
 * @throws AssertionWarning
 *
 */
function validateDerivedFields(hv) {
  const hasWideFields = Object.keys(hv).includes('wideToLongFields');
  const hasImpliedMvalue = Object.keys(hv).includes('implied-mvalue');
  let fieldCount;
  let mvalueField;
  let factorCount;

  if (hasWideFields && hasImpliedMvalue) {
    throw new ValueError(
      '🚧 The headerview should not have both implied and wide-field configurations',
    );
  }
  try {
    if (hasWideFields) {
      fieldCount = Object.keys(hv.wideToLongFields.fields).filter(
        (key) => key !== '',
      ).length;

      mvalueField = hv.wideToLongFields.config.mvalue !== '' ? 1 : 0;

      factorCount = hv.wideToLongFields.config.factors.filter(
        (f) => f.name.trim() !== '',
      ).length;

      if (fieldCount - mvalueField !== factorCount) {
        throw new AssertionWarning(
          `The wideToLongFields configuration has the wrong number of fields: ${
            hv.filename || 'wtlf'
          }`,
        );
      }
    }
  } catch (e) {
    console.error(`Warning: ${e.message}`);
    console.debug(
      `fields from factors: ${fieldCount} - ${mvalueField} factors: ${factorCount}`,
    );
    console.debug(`fields:`);
    console.dir(hv.wideToLongFields.fields);
    console.debug(`factors:`);
    console.dir(hv.wideToLongFields.config.factors);
    console.debug(`mvalue:`);
    console.dir(hv.wideToLongFields.config.mvalue);
  }
}

/**
 * Temporary fix to reduce the size of the headerView prior to performing
 * a scan of the headerViews.
 *
 *     hvs -> hvs without levels in the hv instances
 *
 * @function
 * @param {Array.<Object>} headerViews
 * @return {Array.<Object>}
 */
export const removeLevelsFromHvs = (headerViews) =>
  headerViews.map((hv) => {
    /* eslint-disable-next-line no-param-reassign */
    hv.fields = hv.fields.map((field) =>
      field.purpose === 'mspan' ? field : removeProp('levels', field),
    );
    return hv;
  });

/**
 * Predicate for the presence of a valid wideToLongFields prop
 *
 *     hv -> boolean
 *
 * @function
 * @param {Object} headerView
 * @return {boolean}
 */
export const hasWideToLongFields = (headerView) => {
  return Boolean(headerView?.wideToLongFields ?? false);
};

/**
 * Group fields using the purpose prop.
 *
 * Optional transform:: field -> any
 *
 * @function
 * @param {Array.<Field>} fields must have field.purpose
 * @param {?Function} mapFn function to apply to each field
 * @return {Object.<string,EtlField>}  purpose: [ EtlField, EtlField ], ...
 */
export const fieldsKeyedOnPurpose = (fields, mapFn = (x) => x) => {
  // re-apply in the event not an Array
  if (!Array.isArray(fields)) {
    return fieldsKeyedOnPurpose(Object.values(fields), mapFn);
  }
  /* eslint-disable no-param-reassign */
  return fields.reduce(
    (fieldsKeyedByPurpose, field) => {
      if (!field.purpose) {
        throw new InvalidStateError(
          `A field was found not to have an assigned purpose: ${field['field-alias']}`,
        );
      }
      fieldsKeyedByPurpose[field.purpose].push(mapFn(field));
      return fieldsKeyedByPurpose;
    },
    Object.values(PURPOSE_TYPES).reduce((seed, type) => {
      seed[type] = [];
      return seed;
    }, {}),
  );
  /* eslint-enable no-param-reassign */
};
/**
 * Returns a map of purpose: count
 *
 * @function
 * @param {Array.<Object>} fields
 * @return {Object}  purpose: count for each purpose
 */
export const fieldCountsByPurpose = (fields) => {
  const tmp = fieldsKeyedOnPurpose(fields);
  /* eslint-disable no-param-reassign */
  return Object.keys(tmp).reduce((counts, purpose) => {
    counts[purpose] = tmp[purpose].length;
    return counts;
  }, {});
  /* eslint-enable no-param-reassign */
};
