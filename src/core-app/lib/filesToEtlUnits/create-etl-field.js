// src/lib/filesToEtlUnits/create-etl-field.js

/**
 * @module lib/filesToEtlUnits/create-etl-field
 *
 * @description
 * Used to create new etlField and eltUnit.  It is called by the new component
 * and new quality dialog created using "map-files" (i.e., information encoded
 * in the group by file).
 *
 * A version of the build is also called to 'remake' the field for when
 * returning from a backtracking event.
 *
 * Other etlField modules
 * - rename-etl-field
 * - remove-etl-field
 *
 *
 * ⬜ refactor this module; there is a hodge-podge of logic between
 *    a. etlField and etlUnit
 *    b. etlField for use in pivot and implied group-by-file
 *
 */
import { maxId } from '../../utils/common';
import * as H from './headerview-helpers';

import { createImpliedSource } from './transforms/headerview-field';
import { PURPOSE_TYPES as TYPES } from '../sum-types';
import { InvalidStateError } from '../LuciErrors';
import { colors } from '../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_ETL_FROM_PIVOT === 'true';
//------------------------------------------------------------------------------
/* eslint no-param-reassign: "off" */
/* eslint no-use-before-define: "off" */
/* eslint no-console: "off" */
/* eslint no-shadow: "off" */

/**
 * 📌
 *
 * GroupByfile implied field
 *
 * Note: mkDerivedEtlField => from form data
 *       remakeDerivedEtlField => from __derivedField config
 *
 * etlUnit is optional when purpose = quality. Otherwise,
 * is required to know which measurement to insert mcomp.
 *
 * @see isValidSeedData
 *
 * @function
 * @param {Object} validSeedData // form data
 * @param {Array} files // other data required
 * @return {EtlField}
 *
 */
export const mkDerivedEtlField = (validSeedData, files) => {
  const {
    etlUnit: etlUnitIn,
    name,
    purpose,
    groupByFileArrows,
    nullExp,
  } = validSeedData;

  if (DEBUG) {
    console.debug('%cnewDerivedEtlField files', colors.blue);
    console.dir(files);

    console.debug('%cgroupByFileArrows from the dialog', colors.blue);
    console.dir(groupByFileArrows);
  }

  // id for the etlUnit: quality name or etlUnit from mcomp
  const etlUnit = etlUnitIn || name;

  // 📖 files { filename: nrows }
  // note: levels = [[value, count]]
  return {
    name,
    purpose,
    'etl-unit': etlUnit, // string key
    levels: Object.entries(groupByFileArrows).map(([filename, levelFromArrow]) => [
      levelFromArrow,
      files[filename],
    ]),
    'null-value-expansion': nullExp,
    'map-files': {
      arrows: Object.entries(groupByFileArrows).reduce((acc, [filename, value]) => {
        acc[filename] = value;
        return acc;
      }, {}),
    },
    'map-weights': {
      // For now we assign a default value of 1 to weights
      arrows: Object.values(groupByFileArrows).reduce((acc, filename) => {
        acc[filename] = 1;
        return acc;
      }, {}),
    },
  };
};

/**
 * Group-by-file implied etlField
 * UI input: Validates non-empty name, purpose and levels.
 * @param formData  name, purpose, levels
 * @return bool
 */
export function isValidSeedData(formData) {
  const { name = '', purpose, groupByFileArrows = {} } = formData;
  return (
    name.trim() !== '' && purpose != null && Object.keys(groupByFileArrows).length > 0
  );
}
/**
 * Implied/Derived Etl field
 *
 * Optional return type that includes the subject name.
 *
 * ⬜ Update the return value in the docs.
 *
 * @function
 * @param {Object} etlFields of etlFields
 * @param {Object} etlFields.field
 * @return {Object}
 */
export const remakeDerivedEtlField = (
  newField, // : EtlFieldNoIdxT,
  etlFields, // :  [Name]: EtlFieldT ,
  returnSubjectName = false,
) => {
  if (etlFields === {}) {
    throw new Error({
      message: 'Cannot create a new etlField with an empty etlFields',
    });
  }

  const field = {
    // : EtlFieldT
    idx: maxId(etlFields, 'idx') + 1,
    ...newField,
  };

  // const subject: Name = Object.values(etlFields).find(
  const subjectName = Object.values(etlFields).find(
    (f) => f.purpose === TYPES.SUBJECT,
  ).name;

  return returnSubjectName
    ? { field: newDerivedEtlField({ field, subjectName }), subjectName }
    : newDerivedEtlField({ field, subjectName });
};

/**
 * Set groupByFileField prop ['map-files'].
 * Return null if the map is empty.
 * Curried.
 *
 * @function
 * @param {Object} etlFields
 * @param {Object} groupByFileField
 * @return {?Object} maybe groupByFileField
 */
export const maybeGroupByFileFilesProp = (etlFields) => {
  const { fileNames, subjectName } = H.getFileNamesFromSubject(
    Object.values(etlFields).find((field) => field.purpose === TYPES.SUBJECT),
  );

  // the current set of sources
  const activeFiles = new Set(fileNames);

  return (groupByFileField) => {
    // Nothing -> Nothing
    if (groupByFileField === null) return null;

    if (
      typeof groupByFileField['map-files'] === 'undefined' ||
      groupByFileField['map-files'] === null
    ) {
      throw new Error({
        message: `maybeGroupByFileField: missing arrows prop`,
      });
    }

    // the sources the field relies on
    const mappedFiles = new Set(Object.keys(groupByFileField['map-files'].arrows));
    // the sources that remain
    const remainingFiles = H.intersection(activeFiles, mappedFiles);

    // ... -> Nothing
    // in the event there are no remaining files...
    if (remainingFiles.size === 0) return null;

    // Update the arrows prop with files present in activeFiles
    const remainingArrows = [...remainingFiles].reduce((arrows, file) => {
      arrows[file] = groupByFileField['map-files'].arrows[file];
      return arrows;
    }, {});

    // complete the update/refresh of fields with valid sources
    groupByFileField['map-files'].arrows = remainingArrows;
    // groupByFileField.idx = maxId(etlFields, 'idx') + groupByFileCount;
    groupByFileField.sources = sources(
      {
        name: groupByFileField.name,
        purpose: groupByFileField.purpose,
        levels: groupByFileField.levels,
        'map-files': groupByFileField['map-files'],
        'map-weights': groupByFileField['map-weights'],
      },
      subjectName,
    );

    return groupByFileField;
  };
};

/**
 * mcomp etlField
 * Return null if the prop points to a stale etl-unit.
 * Curried.
 *
 * @function
 * @param {Object} etlUnits
 * @param {Object} groupByFileField
 * @return {?Object} maybe groupByFileField
 */
export const maybeGroupByFileEtlUnitProp = (etlUnits) => {
  const activeEtlUnits = new Set(Object.keys(etlUnits));

  return (groupByFileField) => {
    // Nothing -> Nothing
    if (groupByFileField === null) return null;
    // Just -> Just
    if (groupByFileField.purpose === TYPES.QUALITY) return groupByFileField;

    if (
      typeof groupByFileField['etl-unit'] === 'undefined' ||
      groupByFileField['etl-unit'] === null
    ) {
      throw new Error({
        message: `maybeGroupByFileField: missing etl-unit prop`,
      });
    }

    // Just -> Just | Nothing
    return activeEtlUnits.has(groupByFileField['etl-unit']) ? groupByFileField : null;
  };
};

/**
 * Set the idx prop
 * Curried.
 *
 * @function
 * @param {Object} etlFields
 * @param {Object} groupByFileField
 * @return {Object}
 */
export const setGroupByFileIdxProp = (etlFields) => {
  let groupByFileCount = 0;
  const maxIdx = maxId(etlFields, 'idx');

  return (groupByFileField) => {
    // Nothing -> Nothing
    if (groupByFileField === null) return null;
    groupByFileCount += 1;
    groupByFileField.idx = maxIdx + groupByFileCount;

    // Just -> Just
    return groupByFileField;
  };
};

//------------------------------------------------------------------------------
// Local helpers
//------------------------------------------------------------------------------
/**
 * Create a new or updated etlField (group-by-file implied field)
 * (see also headerview-field)
 *
 * ⬜ This definition should be coordinated with how we build
 *    headerView fields.
 *
 * ⬜ Some of the logic for combining multiple headerView fields into
 *    this one etlField is missing.
 *
 * Important: The source object is used by the backend to extract the
 * raw data from the files.
 *
 * @function
 * @param {Object} field
 * @param {string} subject
 * @return {Object}
 */
function newDerivedEtlField({ field, subjectName }) {
  if (!field) {
    throw new Error({ message: `newDerivedEtlField: wrong input type` });
  }

  const newField = {
    idx: field.idx,
    name: field.name,
    enabled: true,
    purpose: field.purpose,
    levels: field.levels,
    'map-symbols': field?.['map-symbols'] ?? { arrows: {} }, // user input
    'etl-unit': null, // computed
    format: null, // user input
    'null-value-expansion': null, // user input
    'map-files': field['map-files'], // user input
    sources: sources(field, subjectName),
    ...field,
  };
  return customPurposeField(newField);
}
/**
 * type-specific properties for etl-field
 *
 * Note: Changes logic/design should be coordinated with
 * with headerview-field
 *
 * @function
 * @param {EtlField} field
 * @return {EtlField}
 */
function customPurposeField(field) {
  if (DEBUG) {
    console.log('create-elt-field is customizing the field props');
    console.warn('⬜ coordinate with overlapping code logic in pivot');
  }
  switch (field.purpose) {
    case TYPES.QUALITY: {
      field['codomain-reducer'] = field['codomain-reducer'] || 'FIRST'; // user input
      field['map-weights'] = field['map-weights'] || {
        arrows: {},
      };
      field = H.removeProp('slicing-reducer', field);
      break;
    }
    case TYPES.MCOMP: {
      field['map-weights'] = field['map-weights'] || {
        arrows: {},
      };
      field = H.removeProp('codomain-reducer', field);
      field = H.removeProp('slicing-reducer', field);
      field = H.removeProp('time', field);
      break;
    }
    case TYPES.MSPAN: {
      field = H.removeProp('map-weights', field);
      field = H.removeProp('codomain-reducer', field);
      field = H.removeProp('slicing-reducer', field);
      break;
    }
    case TYPES.MVALUE: {
      field['codomain-reducer'] = field['codomain-reducer'] || 'SUM'; // user input
      field['slicing-reducer'] = field['slicing-reducer'] || 'SUM'; // user input
      field = H.removeProp('map-weights', field);
      field = H.removeProp('time', field);
      break;
    }
    case TYPES.SUBJECT: {
      field = H.removeProp('map-weights', field);
      field = H.removeProp('slicing-reducer', field);
      field = H.removeProp('time', field);
      break;
    }
    default:
      throw new InvalidStateError(`Unreachable`);
  }

  return field;
}

/**
 * Returns the sources prop for group-by-file derived field
 *
 * @param field name, purpose, levels, arrows
 * @param subject Name of the subject field
 * @return {sources} Array of sources
 * */
function sources(field, subject) {
  const {
    name,
    purpose,
    levels,
    'codomain-reducer': codomainReducer = null,
    'map-weights': mapWeights = null,
  } = field;
  const { arrows = null } = field['map-files'];

  // for each level in the etlField level map-files
  // ... create a new source
  const findLevel = (search, levels) => levels.find((level) => level[0] === search);

  // how go from nlevels in subject to [value, count]
  return Object.keys(arrows).map((filename) => {
    const level = findLevel(arrows[filename], levels);

    return createImpliedSource({
      filename,
      constant: arrows[filename], // constant
      alias: name,
      purpose,
      level,
      codomainReducer,
      mapWeights: {
        arrows: {
          [level[0]]: mapWeights.arrows[level[0]],
        },
      },
      subject,
    });
  });
}
