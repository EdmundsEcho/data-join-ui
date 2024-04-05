// src/lib/filesToEtlUnits/pivot.js

/**
 * @module lib/filesToEtlUnits/pivot
 *
 * @description
 * Part of file-fields -> field-files ~ etl-field ~ etl-units
 *
 * This is the first step in this two-step process:
 *  1️⃣ pivot: hvs -> computedEtlObject
 *  2️⃣ computedEtlObject -> etlObject
 *
 * Specifically,
 *   headerViews -> { etlFields, etlUnits } ~ etlUnitViews
 *
 * 🔑 Uses "field-alias" in the file object to pivot and stack
 *    related fields from different sources.
 *
 * 🔖 This first step combines/stacks file-fields *without* a
 *    global context (i.e., knowledge of values across etlFields).
 *    That perspective occurs in the second step.
 *
 * Included in the scope:
 * ✅ add etl-field when `implied-mvalue` exists in the headerView
 *    using appendImpliedFields
 * ✅ add etl-field when `wideToLongFields` exists in the headerView
 *    using appendWideToLongFields(hv, 'pivot'))
 * ❌ add etl-field when `map-fieldname` exists
 * ❌ adjusted levels-mspan
 *
 */

import { combineTimeObjs } from './transforms/combineTimeObjs';
import { combineLevels } from './transforms/combineLevels';
import { combineSpans } from './transforms/combineSpans';
import combineSymbols from './transforms/combineSymbols';
import { combineExpansions } from './transforms/combineExpansions';
import { maybeEtlUnitFromName, etlUnitsFromPrePivot } from './transforms/etl-units';
import { appendWideToLongFields } from './transforms/wide-to-long-fields';
import { appendImpliedFields } from './transforms/implied-mvalue';
import { mapFromArray } from './headerview-helpers';
import { propFromSources } from './etl-field-helper';
import { InvalidStateError } from '../LuciErrors';
import { PURPOSE_TYPES as TYPES } from '../sum-types';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_ETL_FROM_PIVOT === 'true';
// const DEBUG = true;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * 📌 top-level export
 * Input: hvs:headerViews
 *
 * @function
 * @param {Object} hvs
 * @param {?config}
 * @return {Object}
 */
export const pivot = (hvs, config = defaultConfig) =>
  main(hvs)
    .pivotFromFilesToEtlFieldSources()
    .augmentEtlFields()
    .appendEtlUnits()
    .return();

/* eslint-disable no-console */
function main(hvs, config = defaultConfig) {
  // memo
  let ppHvs = preProcess(hvs);
  let cache;

  const closure = {
    pivotFromFilesToEtlFieldSources: () => {
      cache = pivotFromFilesToEtlFieldSources(ppHvs);
      return closure;
    },
    augmentEtlFields: () => {
      cache = augmentEtlFields(ppHvs, config)(cache);
      return closure;
    },
    appendEtlUnits: () => {
      cache = appendEtlUnits(ppHvs)(cache);
      return closure;
    },
    return: () => {
      ppHvs = {};
      return cache;
    },
  };
  return closure;
}

/**
 * The workhouse
 *
 * Pivot each file/header and fields therein,
 * to a collection of sources organized by etlUnit.
 *
 *     [headerView] -> [partial-field-files]
 *
 *     fields -> etlUnits
 *     file   -> sources
 *
 *
 * Operates on a collection of files.
 *
 * Utilizes the header view pre-processing functions.
 *
 * input:
 *
 *     "filename key": {
 *       enabled: Bool,
 *       filename: String,   // copy top-level into each field
 *       ...
 *       fields: [{
 *         enabled: Bool,
 *         "field-alias": String,
 *         "header-idx": Integer,
 *         ...
 *       }],
 *       wideToLongFields: {..},
 *       "implied-mvalue": {..}
 *     }
 *
 * output:
 *
 *   1. copy top-level filename into each field
 *   2. group-by fields with the same "field-alias"
 *   3. merge sources during the group-by reduction
 *
 *     {
 *       etlFieldName: { // previously "field-alias"
 *         sources: [{   // previously top-level
 *           enabled: Bool,
 *           "field-alias": String,
 *           purpose: String,
 *           "null-value": String | Number,
 *           format: String,
 *           "map-symbols": { arrows: {domain:codomain }},
 *           "map-implied": { domain:codomain },
 *           levels: [[String, Integer]],
 *           nrows: Integer,
 *           filename: String,
 *           "header-idx": Integer,
 *         }]
 *       }
 *     }
 *
 */
function pivotFromFilesToEtlFieldSources(hvs) {
  // re-apply if hvs is not an Array
  if (!Array.isArray(hvs)) {
    return pivotFromFilesToEtlFieldSources(Object.values(hvs));
  }

  try {
    if (hvs.length === 0) {
      throw new InvalidStateError(
        `pivotFromFilesToEtlFieldSources called with an empty Array`,
      );
    }
  } catch (e) {
    if (e instanceof InvalidStateError) {
      console.error(e.message);
    }
    throw e;
  }

  // -> hvs [ field-alias {...} ]
  const fromFiles = hvs.map(makeKeyedObjectFromAlias);

  /* eslint-disable no-shadow */
  /* eslint-disable no-param-reassign */
  const { sourcesAcc } = fromFiles.reduce(
    ({ sourcesAcc, fromFiles }, _) => {
      const [fields, ...tailFromFiles] = fromFiles;
      // ...for every field in all of the files
      const nextSourcesAcc = Object.keys(fields).reduce(
        (fieldSources, fieldName) => {
          // get the sources once for each field
          if (!fieldSources[fieldName]) {
            // get all of the sources for the field
            fieldSources[fieldName] = selectSources(fieldName, fromFiles);
            // 💰 we can retrieve all sources with a smaller and smaller fromFiles
          }
          return fieldSources;
        },
        sourcesAcc, // <<< starting point
      );
      return { sourcesAcc: nextSourcesAcc, fromFiles: tailFromFiles };
    },
    { sourcesAcc: {}, fromFiles },
  );

  return sourcesAcc;
}

/**
 * Pre-pivot processing
 *
 * @function
 *
 */
function preProcess(hvs) {
  return Object.values(hvs)
    .filter((hv) => hv.enabled)
    .map(selectFieldsForPivot) // include enabled fields
    .map(appendImpliedFields) // append ... to hv (aka fields in this context)
    .map((hv) => appendWideToLongFields(hv, 'pivot')); // append ... to fields
}

/**
 *
 *      :: { etlFieldName:  [{..}] }
 *      -> { etlFieldName: { augmented, sources }}
 *
 * @function
 *
 */
function augmentEtlFields(ppHvs, config) {
  return (etlFieldSources) => {
    try {
      if (!Object.keys(etlFieldSources).length) {
        throw new InvalidStateError(
          'augmentEtlFields curried function: called with an empty object',
        );
      }
    } catch (e) {
      if (e instanceof InvalidStateError) {
        console.error(e.message);
      }
      throw e;
    }

    return Object.keys(etlFieldSources).reduce((etlFields, fieldName, idx) => {
      const sources = etlFieldSources[fieldName];
      etlFields[fieldName] = {
        ...config(ppHvs, fieldName, sources, idx),
        sources,
      };
      return etlFields;
    }, {});
  };
}

/**
 * Configuration
 * Use to define how to augment the output of `pivot`.
 *
 * (see also implied-mvalue, headerview-field impliedMvalueField)
 *
 */
function defaultConfig(hvs, etlFieldName, sources, idx) {
  const purpose = propFromSources('purpose')(sources)[0];

  const etlField = {
    idx,
    name: etlFieldName,
    purpose,
    levels: purpose === 'mspan' ? combineLevels(sources) : [],
    'map-symbols': combineSymbols(sources, 'map-symbols', 'OBJECT'), // symbols applied last
    'map-symbols-array': combineSymbols(sources, 'map-symbols', 'ARRAY'), // source-specific symbols
    'etl-unit': maybeEtlUnitFromName(etlFieldName, hvs),
    format: propFromSources('format')(sources)[0] ?? null, // grab the first as a starting point
    'null-value-expansion': combineExpansions(sources) ?? null, // user input with maybe default
    'map-files': null, // group-by-file user input
    sources,
  };

  return customPurposeField(etlField, purpose, sources);
}

/**
 * Purpose specific props
 *
 * Note: Unlike header/file-fields the purpose is fixed.
 *       This means, generally no need to remove props
 *       (only if default config has extra fields).
 *
 * @function
 *
 * @todo coordinate with create-elt-fields and sources
 *
 */
function customPurposeField(field, purpose, sources) {
  if (DEBUG) console.log('pivot is customizing etlField');

  /* eslint-disable no-param-reassign */
  switch (purpose) {
    case TYPES.MSPAN: {
      // 🔖 Limited to this single etlField perspective
      //    i.e., cannot set the proper rangeStart until etl-from-pivot that takes all etlFields
      field.time = combineTimeObjs(sources);
      field['levels-mspan'] = combineSpans(sources);
      break;
    }
    case TYPES.QUALITY: {
      field['codomain-reducer'] = 'FIRST';
      field['map-weights'] = {
        arrows: {},
      };
      break;
    }
    case TYPES.MCOMP: {
      field['map-weights'] = {
        arrows: {},
      };
      break;
    }
    case TYPES.MVALUE: {
      field['codomain-reducer'] = 'SUM';
      field['slicing-reducer'] = 'SUM';
      break;
    }
    default:
      return field;
  }

  return field;
}

/**
 * Return obj with the etlUnits and etlField props
 * @function
 *
 */
function appendEtlUnits(ppHvs) {
  return (etlFields) => {
    try {
      if (!Object.keys(etlFields).length) {
        throw new InvalidStateError('appendEtlUnits called with an empty object');
      }
    } catch (e) {
      if (e instanceof InvalidStateError) {
        console.error(e.message);
      }
      throw e;
    }
    return {
      etlUnits: etlUnitsFromPrePivot(ppHvs),
      etlFields,
    };
  };
}

/**
 * Support function for pivot
 *
 *     fieldName -> [file] -> [source]
 *
 * 🔑  The transformation:
 *
 *     header/file field instance -> source instance
 *
 *     for each inTheseFiles = [fields]
 *
 * @function
 *
 */
function selectSources(matchFieldName, inTheseFiles) {
  return inTheseFiles.reduce((sourcesAcc, fields) => {
    // file ~ fields
    if (fields[matchFieldName]) {
      sourcesAcc.push(fields[matchFieldName]);
    }
    return sourcesAcc;
  }, []);
}

/**
 * Pre-pivot processing subroutine
 * Select enabled and those not part of a series (wideToLongView).
 * :: hv -> hv
 */
function selectFieldsForPivot(hv) {
  return {
    ...hv,
    fields: hv.fields.filter((field) => field.enabled),
  };
}

/**
 * Pre-pivot processing subroutine
 * :: hv -> { alias:field }
 */
function makeKeyedObjectFromAlias(hv) {
  return mapFromArray(hv.fields, 'field-alias');
}

export default pivot;
