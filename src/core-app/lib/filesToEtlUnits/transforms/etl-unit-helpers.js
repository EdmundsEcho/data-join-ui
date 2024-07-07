// src/lib/filesToEtlUnits/transforms/etl-unit-helpers.js

import {
  PURPOSE_TYPES as TYPES,
  ETL_UNIT_TYPES as ETL_UNIT,
  ETL_UNIT_FIELDS,
} from '../../sum-types';
import { InputError } from '../../LuciErrors';
import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
// const GLOBAL_DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
//------------------------------------------------------------------------------
// const COLOR = colors.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
/**
 *
 * search routine that returns the name(s) of the etlUnits that utilizes
 * the field name. The etlUnits are all etlUnits in the etlObj.
 *
 * 0.5.1
 * Returns null when subject, otherwise an Array
 * WIP: Consider using an empty list for subject
 *
 *      name, etlUnits -> null | [ codomain ]
 *
 * @function
 * @param {string} fieldName
 * @param {Object<string,EtlUnit>} etlUnits
 * @return {?Array<string>}
 *
 */
export function selectEtlUnitsWithFieldName(fieldName, etlUnits = {}) {
  const result = Object.keys(etlUnits).filter((codomainKey) =>
    isNameInEtlUnit(fieldName, etlUnits[codomainKey]),
  );

  if (result.length === 0) {
    return [];
  }

  const firstEtlUnit = etlUnits[result[0]];
  const fieldPurpose = getPurpose(fieldName, firstEtlUnit);

  if (fieldPurpose === TYPES.SUBJECT) {
    return [];
  }

  return result;
}

/**
 * Predicate:
 * Returns true when the name is that of the subject field
 * in the etlUnit or etlUnits
 *
 * @function
 * @param {string} name
 * @param {Object} collection etlUnit or etlUnits
 * @return {boolean}
 */
export function isEtlUnitSubject(name, collection) {
  if (Array.isArray(collection)) {
    throw new InputError(`isEtlUnitSubject expects an object (etlUnit or etlUnits)`);
  }
  // ...mark for etlUnit vs etlUnits
  return 'type' in collection && 'codomain' in collection
    ? collection.subject === name
    : Object.values(collection)[0].subject === name;
}
/**
 * Predicate:
 * Returns true when name is present in the etlUnit
 *
 *    name, etlUnit -> boolean
 *
 * @function
 * @param {string} etlFieldName
 * @param {EtlUnit} etlUnit
 * @return {boolean}
 */
export function isNameInEtlUnit(name, etlUnit) {
  /* eslint-disable no-shadow */
  // etlUnit keys = subject, codomain, mspan, mcomps
  const fieldNames = Object.keys(etlUnit).reduce((fieldNames, key) => {
    return ETL_UNIT_FIELDS.includes(key)
      ? [
          ...fieldNames,
          // mcomps is an Array
          ...(Array.isArray(etlUnit[key]) ? etlUnit[key] : [etlUnit[key]]),
        ]
      : fieldNames;
  });
  /* eslint-enable no-shadow */

  return fieldNames.includes(name);
}

/**
 *
 * Returns the purpose of a field from the etlUnit to which
 * it belongs.
 *
 * @function
 * @param {string} fieldName
 * @param {EtlUnit} etlUnit
 * @return {string}
 *
 * @throws InputError In the event the field is not part of the etlUnit.
 *
 */
export function getPurpose(fieldName, etlUnit) {
  if (!etlUnit) {
    throw new InputError(
      `Missing etlUnit when searching purpose for field name (${fieldName})`,
    );
  }
  if (!isNameInEtlUnit(fieldName, etlUnit)) {
    throw new InputError(
      `The field name (${fieldName}) does not exist in the etlUnit (${
        etlUnit?.codomain ?? 'undefined'
      })`,
    );
  }
  // retrieve the key, when fieldName === value
  return Object.entries(etlUnit)
    .filter(([key, _]) => ETL_UNIT_FIELDS.includes(key))
    .reduce((answer, [purposeKey, value]) => {
      // value : singleton | Array
      switch (purposeKey) {
        case 'mcomps':
          return value.includes(fieldName) ? TYPES.MCOMP : answer;

        case 'codomain':
          return value === fieldName ? etlUnit.type : answer;

        default:
          return value === fieldName ? purposeKey : answer;
      }
    }, '');
}

/**
 * Select related fields
 *
 *     fieldName, etlUnit -> relatedFieldNames
 *
 * Context, removeName -> [impacted field names]
 *
 * @function
 * @param {string} removeName
 * @param {EtlUnit} etlUnit
 * @param {?boolean} DEBUG
 * @return {Array<string>}
 * @throws InputError
 *
 */
export function selectRelatedRemovableFields(removeName, etlUnit, DEBUG) {
  const purpose = getPurpose(removeName, etlUnit);

  if (DEBUG) {
    console.log(
      `%cgetRelatedRemovableFields: ${removeName}\npurpose: ${purpose} type: ${etlUnit.type}`,
      colors.blue,
    );
  }
  if (!purpose === TYPES.SUBJECT) {
    throw new InputError(
      `The field name (${removeName}) is not removable (purpose: ${purpose})`,
    );
  }
  if (!isNameInEtlUnit(removeName, etlUnit)) {
    throw new InputError(
      `The field name (${removeName}) does not exist in the etlUnit (${
        etlUnit?.codomain ?? 'undefined'
      })`,
    );
  }

  // sub-routine
  const etlUnitRemovableFields = (/* etlUnit */) =>
    etlUnit.type === ETL_UNIT.QUALITY
      ? [etlUnit.codomain]
      : [etlUnit.codomain, etlUnit.mspan, ...(etlUnit?.mcomps ?? [])];

  const switchObj = {
    [TYPES.QUALITY]: () => {
      console.assert(etlUnit.codomain === removeName);
      return [removeName];
    },
    [TYPES.MCOMP]: () => {
      console.assert(etlUnit.mcomps.includes(removeName));
      return [removeName];
    },
    [TYPES.MVALUE]: () => {
      console.assert(etlUnit.codomain === removeName);
      return etlUnitRemovableFields(etlUnit);
    },
    // 🔖 Removing mspan, a required field for the etlUnit,
    //    is the equivalent of removing mvalue.
    //
    // 🚧 This is a design choice;
    //    👎 user does not expect 👍 communicates invariants in design
    //
    [TYPES.MSPAN]: () => {
      console.assert(etlUnit.mspan === removeName);
      return etlUnitRemovableFields(etlUnit);
    },
  };
  return switchObj[purpose]();
}
/**
 * only valid for non-subject purpose fields
 *
 * returns undefined if the fieldName does not exist
 *
 * @function
 * @param {string} fieldName
 * @param {Object<string,Object>} etlUnits
 * @return {EtlUnit}
 */
export function selectEtlUnitWithName(fieldName, etlUnits) {
  return Object.values(etlUnits).find((etlUnit) => {
    if (fieldName === etlUnit.subject) {
      throw new InputError(`Cannot retrieve a single etlUnit using a ${TYPES.SUBJECT}`);
    }
    if (etlUnit.type === 'quality') {
      return etlUnit.codomain === fieldName;
    }
    return [etlUnit.codomain, etlUnit.mspan, ...etlUnit.mcomps].includes(fieldName);
  });
}
/**
 * Predicate
 * Return true when the etlUnit to which the field belongs,
 * is the last remaining.
 *
 * @function
 * @param {string} removeName
 * @param {Object} etlUnits
 * @return {boolean}
 */
export function isTheOnlyEtlUnit(removeName, etlUnits) {
  return removeName in etlUnits && Object.keys(etlUnits).length === 1;
}
/**
 * Predicate
 * Return true when the field:mspan
 *
 * @function
 * @param {string} removeName
 * @param {Object} etlUnits
 * @return {boolean}
 */
export function isMspan(removeName, etlUnits) {
  return Object.values(etlUnits).find((etlUnit) => etlUnit?.mspan === removeName);
}

/**
 *
 * Return next field name to display when the current one is marked
 * for removal.
 *
 * 🔖 About the list of field names
 *
 *    👉 organized by purpose, not etlUnit
 *
 *    👉 Subject, qualities, mvalues, mcomps, mspans
 *
 * 🧮 Computation
 *
 *    👉 Determine the move using the current list; use the name not
 *       the cursor value (index will change with new list)
 *
 *    👉 Prefer selecting a field of the same type
 *
 *    👉 Prefer moving down the list
 *
 *    👉 Normalize the cursor: mvalue or mspan -> land on mvalue
 *
 * 🦀 As of now, the user can delete every etlUnit.  This is not consistent
 *    with the fixes/errors provided in the headerView phase.
 *
 * @function
 * @param {string} fieldName
 * @param {Array<string>} listOfFieldNames list used by EtlFiedView
 * @param {Object<string,EtlUnit>} etlUnits keyed by the name of the codomain
 * @return number cursor/index in the listOfFieldNames
 */
export const getNextDisplayField = (fieldName, listOfFieldNames, etlUnits, DEBUG) => {
  // object literal keyed with fieldName, value purpose
  const namePurposeMap = mapUnitsToPurpose(etlUnits);
  // subroutine
  // 🔑 cursor for etlUnitKey | fieldName
  //    depends on field purpose (-> the related fieds to be removed)
  const getCursor = (name) => {
    // subroutine
    const cursor = (nameSearch) =>
      listOfFieldNames.findIndex((name_) => nameSearch === name_);

    const [etlUnitName] = selectEtlUnitsWithFieldName(name, etlUnits);
    return [TYPES.MSPAN, TYPES.MVALUE].includes(namePurposeMap[name])
      ? cursor(etlUnitName)
      : cursor(name);
  };

  const cursor = getCursor(fieldName);
  // with the 'adjusted' cursor value
  // ⚠️  Feature of the list:
  //    Only a quality can be last on the list
  const nextPurpose =
    cursor + 1 < listOfFieldNames.length
      ? namePurposeMap[listOfFieldNames[cursor + 1]]
      : `__no_match__`;

  const matchNext = namePurposeMap[listOfFieldNames[cursor]] === nextPurpose;

  // 🔖 logic
  // const moveUp = matchPrevious || !matchNext;
  const moveDown = matchNext;

  const result = moveDown ? listOfFieldNames[cursor + 1] : listOfFieldNames[cursor - 1];

  if (DEBUG) {
    console.group(`%cPlanning to remove field: ${fieldName}`, colors.red);
    console.log(`%cCursor: ${cursor}`, colors.red);
    console.log(`%cNextCursor: ${result}`, colors.red);
    console.dir(listOfFieldNames);
    console.groupEnd();
  }

  return result;
};

/**
 * Key the object by its values
 *
 *    etlUnits -> { fieldName: purpose }
 *
 *    ⚠️  Duplicate values are reduced to single values.
 *       This assumes that field names are *effectively*
 *       unique i.e., all copies map to a single purpose.
 *
 * @function
 * @param {Object}
 * @return {Object}
 */
export function mapUnitsToPurpose(etlUnits) {
  return Object.values(etlUnits)
    .map(mapFieldToPurpose)
    .reduce((newObj, etlUnit) => ({ ...etlUnit, ...newObj }), {});
}

/**
 * Transform
 *
 *     etlUnit -> { fieldName: purpose }
 *
 * @function
 * @param {Object} etlUnit
 * @return {Object} key fieldName, value purpose
 *
 */
export function mapFieldToPurpose(etlUnit) {
  const obj = {
    [etlUnit.codomain]: etlUnit.type,
    [etlUnit.subject]: TYPES.SUBJECT,
  };
  if (etlUnit.type === TYPES.MVALUE) {
    obj[etlUnit.mspan] = TYPES.MSPAN;
    etlUnit.mcomps?.forEach((mcomp) => {
      obj[mcomp] = TYPES.MCOMP;
    });
  }
  return obj;
}

//------------------------------------------------------------------------------
