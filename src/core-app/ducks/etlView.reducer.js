// src/ducks/etlView.reducer.js

/**
 * @module ducks/etlView-reducer
 *
 * @description
 * Hosts the etl-view state; the output of the `pivot` function.
 *
 * This computation is updated with updates from the UI. The user updates made
 * in the etl-view are recorded in such a way they can be "replayed" following
 * a user-directed backtracking in the process.
 *
 * @category Reducers
 *
 */

import createReducer from '../utils/createReducer';
import {
  SET_ETL_VIEW,
  SET_ETL_FIELD_CHANGES,
  SET_ETL_VIEW_ERROR,
  RESET_ETL_VIEW_ERROR,
  ADD_GROUP_BY_FILE_FIELD,
  DELETE_GROUP_BY_FILE_FIELD,
  UPDATE_ETL_FIELD,
} from './actions/etlView.actions';
import { RESET } from './actions/project-meta.actions';

import { setTimeProp } from '../lib/filesToEtlUnits/transforms/span/span-helper';
import { removeGroupByFileField } from '../lib/filesToEtlUnits/remove-etl-field';

import {
  fieldsKeyedOnPurpose,
  isEtlFieldGroupByFile as isEtlFieldGroupByFileH,
} from '../lib/filesToEtlUnits/headerview-helpers';
import { selectEtlUnitsWithFieldName as selectEtlUnits } from '../lib/filesToEtlUnits/transforms/etl-unit-helpers';
import { PURPOSE_TYPES, SOURCE_TYPES } from '../lib/sum-types';

import { InvalidStateError } from '../lib/LuciErrors';
// import { colors } from '../constants/variables';

/* eslint-disable no-console */

const initialState = {
  etlObject: {
    etlUnits: {},
    etlFields: {},
  },
  // 👍 Store user-specified changes to augment the
  //    transformatino with previously provided user input (backtracking).
  etlFieldChanges: {
    __derivedFields: {}, // fields derived from group-by-file information
  },
  etlViewErrors: [],
};

/**
 * Selector for this state fragment
 */
export const getEtlObject = (stateFragment) => stateFragment.etlObject;

export const getEtlFieldCount = (stateFragment) =>
  Object.keys(stateFragment.etlObject.etlFields).length;

export const getEtlFields = (stateFragment) => stateFragment.etlObject.etlFields;

/**
 * Predicate that tests the existence of a field
 * @function
 * @return {bool}
 */
export const etlFieldExists = (stateFragment, fieldName) =>
  Object.keys(getEtlFields(stateFragment)).includes(fieldName);

/**
 * ⚠️  EtlUnit name uses the user versions of the name (displayName);
 */
export const getEtlUnitTimeProp = (stateFragment, etlUnitName) => {
  const etlField = Object.values(getEtlFields(stateFragment)).find(
    (field) =>
      field.purpose === PURPOSE_TYPES.MSPAN && field['etl-unit'] === etlUnitName,
  );
  return { time: etlField?.time, formatOut: etlField?.format };
};

export const getEtlUnits = (stateFragment) => stateFragment.etlObject.etlUnits;

export const selectEtlUnit = (stateFragment, qualOrMeaName) =>
  stateFragment.etlObject.etlUnits?.[qualOrMeaName];

export const selectEtlUnitsWithFieldName = (stateFragment, fieldName) =>
  selectEtlUnits(fieldName, stateFragment.etlObject.etlUnits);

export const getEtlFieldChanges = (stateFragment) => {
  return stateFragment.etlFieldChanges || initialState.etlFieldChanges;
};

export const selectEtlField = (stateFragment, fieldName) =>
  stateFragment.etlObject.etlFields[fieldName];

export const selectEtlFieldChanges = (stateFragment, fieldName) => {
  const etlFieldChanges = getEtlFieldChanges(stateFragment);
  return fieldName in etlFieldChanges ? etlFieldChanges[fieldName] : undefined;
};

export const getIsEtlProcessing = (stateFragment) => stateFragment.isEtlProcessing;

/**
 * v0.3.11
 * Predicate that return true when the data is derived
 * - sources are type WIDE, or IMPLIED
 * - has a group-by-file prop
 * @function
 * @param {Object} state
 * @param {string} fieldName
 * @return {bool}
 *
 * 🦀 assumes if one source has type WIDE, the field is derived.
 *    ... strictly speaking this may not be the case.  This is a broader
 *    design upgrade. For now, assume all sources are of the same type for
 *    any single field.
 *
 *    Scenario where breaks: stack wide engagement data with matching long
 *    engagement data (matching etlUnit structure).
 */
export const isEtlFieldDerived = (stateFragment, fieldName) => {
  const field = selectEtlField(stateFragment, fieldName);
  return (
    field.sources[0]['source-type'] === SOURCE_TYPES.WIDE ||
    field.sources[0]['source-type'] === SOURCE_TYPES.IMPLIED ||
    isEtlFieldGroupByFileH(field)
  );
};
export const isEtlFieldGroupByFile = (stateFragment, fieldName) =>
  isEtlFieldGroupByFileH(selectEtlField(stateFragment, fieldName));
/**
 * v0.3.11
 * Object: arrows: Object
 * @return {Object}
 */
export const selectSymbolMap = (stateFragment, fieldName) =>
  selectEtlField(stateFragment, fieldName)?.['map-symbols'] ?? { arrows: {} };

// ----------------------------------------------------------------------------
/**
 * Derived state selectors
 */
export const getEtlFieldViewData = (stateFragment) => {
  return fieldsKeyedOnPurpose(
    Object.values(getEtlFields(stateFragment)),
    (field) => field.name,
  );
};

/**
 * Selector(state): etlFields -> [[name, purpose]]
 * Utilized by EtlFieldView
 *
 * Optional filter using purpose.
 *
 * @function
 * @param {Object} etlView
 * @return {Array}
 */
export const listOfFieldNameAndPurposeValues = (
  { etlObject } /* stateFragment */,
  purpose = undefined /* optional */,
) => {
  const predicate = purpose ? ([, tryPurpose]) => tryPurpose === purpose : () => true;

  return Object.entries(etlObject.etlFields)
    .map(([name, field]) => [name, field.purpose])
    .filter(predicate);
};

// ----------------------------------------------------------------------------
// combine the subject, quality... requests into one
// 🚧 Concluding which is better, whether to use a single select that makes
//    it more difficult to manage rendering, vs a split but repeated
//    scan of the data remains in flux.
//
//    🔖 useLean is *less* relevant now that we use a separate process for
//       viewing levels. Remains useful b/c we can still load when mspan.
//
export const getFieldsKeyedOnPurpose = (stateFragment) =>
  fieldsKeyedOnPurpose(Object.values(getEtlFields(stateFragment)));

// ----------------------------------------------------------------------------
// subject fields
export const getSubEtlField = (stateFragment) => {
  const subject = Object.values(getEtlFields(stateFragment)).find(
    (field) => field.purpose === 'subject',
  );
  if (!subject) {
    throw new InvalidStateError(`The EtlFields did not return a subject field!`);
  }
  return subject;
};

// ----------------------------------------------------------------------------
// quality fields
export const getQualEtlFields = (stateFragment) =>
  Object.values(getEtlFields(stateFragment)).filter(
    (field) => field.purpose === PURPOSE_TYPES.QUALITY,
  );

// ----------------------------------------------------------------------------
// measurement units & fields (ex subject)
export const getMeaRelatedEtlFields = (stateFragment) =>
  Object.values(getEtlFields(stateFragment)).filter((field) =>
    [PURPOSE_TYPES.MSPAN, PURPOSE_TYPES.MCOMP, PURPOSE_TYPES.MVALUE].includes(
      field.purpose,
    ),
  );

export const getMeaEtlUnits = (stateFragment) =>
  /* eslint-disable no-param-reassign */
  Object.values(getEtlUnits(stateFragment))
    .filter((unit) => unit.type === PURPOSE_TYPES.MVALUE)
    .reduce((units, unit) => {
      units[unit.codomain] = unit;
      return units;
    }, {});
/* eslint-enable no-param-reassign */

export const getEtlViewErrors = (stateFragment) => stateFragment.etlViewErrors;
export const getHasEtlViewErrors = (stateFragment) =>
  stateFragment?.etlViewErrors?.length > 0 ?? false;

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// The Reducer
// ----------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  // Utility to reset all state fragments
  [RESET]: () => initialState,

  /* Testing utility */
  PING: (state) => {
    console.log('PING from redux etlView.reducer');
    return state;
  },

  /* Testing utility */
  RESET_DERIVED: (state) => ({
    ...state,
    etlFieldChanges: {
      ...state.etlFieldChanges,
      __derivedFields: {},
    },
  }),
  /* Testing utility */
  RESET_ETL_VIEW_ERRORS: (state) => {
    return {
      ...state,
      etlViewErrors: [],
    };
  },
  /* Testing utility */
  RESET_ETL_CHANGES: (state) => ({
    ...state,
    etlFieldChanges: {
      __derivedFields: {},
    },
  }),

  /* Utility that prints the first hv with levels removed */
  PRINT: (state) => {
    console.log('PRINT: etl store');
    return state;
  },

  /**
   * The new information in the action/message: key value.
   *
   * Scope: Sync updates to a field prop. The primary sending is
   *        Delegate component that displays purpose-specific combinations
   *        of inputs. e.g, Format, null-value-extension (unlike add/remove derived).
   */
  [UPDATE_ETL_FIELD]: (state, { fieldName, key, value: rawValue }) => {
    // process "one-offs"
    let value = rawValue;
    try {
      if (rawValue === 'null') {
        throw new InvalidStateError(`Please fix me: remove the 'null'`);
      }
    } catch (e) {
      console.error(e.message);
      value = null;
    }

    let updatedFieldChanges = {};
    const field = selectEtlField(state, fieldName);

    // Source of truth
    // 1. etlField << computed value
    // 2. etlFieldChanges << prev user configuration
    // 3. newUpdate << latest user configuration
    // First combine the newUpdate with the previous updates

    // 🦀 The backend does not support "resampling" measurements.
    if (/^time\.+./.test(key)) {
      updatedFieldChanges = {
        ...selectEtlFieldChanges(state, fieldName),
        time: setTimeProp(key, value, field.time),
      };
    } else {
      // ⬜ update format-out might change mspans
      updatedFieldChanges = {
        ...selectEtlFieldChanges(state, fieldName),
        [key]: value,
      };
    }

    return {
      ...state,
      etlFieldChanges: {
        ...state.etlFieldChanges,
        [fieldName]: updatedFieldChanges,
      },
      etlObject: {
        etlUnits: state.etlObject.etlUnits, // read-only
        etlFields: {
          ...state.etlObject.etlFields,
          [fieldName]: {
            ...field,
            ...updatedFieldChanges,
          },
        },
      },
    };
  },

  // document
  // 👍 The middleware maker: raw field data -> integrated into state
  [ADD_GROUP_BY_FILE_FIELD]: (state, { payload: { etlObject, etlFieldChanges } }) => ({
    ...state,
    etlObject,
    etlFieldChanges,
  }),

  // the derived-field document path for remove_field
  [DELETE_GROUP_BY_FILE_FIELD]: (state, { fieldName }) => ({
    ...state,
    ...removeGroupByFileField(fieldName, state),
  }),

  // document the derived state
  // sent by etlView.middleware
  [SET_ETL_VIEW]: (state, { etlObject, etlFieldChanges }) => {
    return {
      ...state,
      etlObject,
      etlFieldChanges,
    };
  },

  // document from etlView.middleware
  [SET_ETL_FIELD_CHANGES]: (state, { payload }) => {
    return {
      ...state,
      etlFieldChanges: { ...payload },
      etlViewErrors: [],
    };
  },

  [SET_ETL_VIEW_ERROR]: (state, { payload }) => {
    return {
      ...state,
      etlViewErrors: [payload],
    };
  },
  [RESET_ETL_VIEW_ERROR]: (state) => {
    return {
      ...state,
      etlViewErrors: [],
    };
  },
});

export default reducer;
