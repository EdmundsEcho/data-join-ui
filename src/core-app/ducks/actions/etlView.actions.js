// src/ducks/actions/etlView.actions.js

import { makeActionCreator } from '../../utils/makeActionCreator';

export const TYPES = {
  UPDATE_ETL_FIELD: 'etlView/UPDATE_ETL_FIELD',
  RENAME_ETL_FIELD: 'etlView/RENAME_ETL_FIELD', // backtrack
};

// middleware-related
export const ETL_VIEW = '[EtlView]';

export const COMPUTE_ETL_VIEW = `${ETL_VIEW} COMPUTE STATE`; // command
export const SET_ETL_VIEW = `${ETL_VIEW} SET VIEW STATE`; // document

export const MAKE_DERIVED_FIELD = `${ETL_VIEW} MAKE FIELD`; // command
export const ADD_DERIVED_FIELD = `${ETL_VIEW} ADD FIELD`; // document

export const REMOVE_ETL_FIELD = `${ETL_VIEW} REMOVE FIELD`; // command
export const DELETE_FIELD = `${ETL_VIEW} DELETE FIELD`; // document
export const DELETE_DERIVED_FIELD = `${ETL_VIEW} DELETE DERIVED FIELD`; // document

export const RENAME_ETL_FIELD = `${ETL_VIEW} RENAME FIELD`; // command

export const SET_ETL_FIELD_CHANGES = `${ETL_VIEW} SET/etlFieldChanges`;
export const SET_ETL_VIEW_ERROR = `${ETL_VIEW} SET/etlViewErrors`;
export const RESET_ETL_VIEW_ERROR = `${ETL_VIEW} RESET/etlViewErrors`;

/**
 * {object} headerViews
 */
export const buildEtlStart = makeActionCreator(
  TYPES.BUILD_ETL_START,
  // 'headerViews', // must function when backtracking
  // ... sagas will access state directly instead of action
);

/**
 * Called by sagas
 */
export const buildEtlSuccess = makeActionCreator(
  TYPES.BUILD_ETL_SUCCESS,
  'computedEtlObject',
  // 'builtAt',
);

/**
 * @function
 * Action creator used to configure the etlObject data.
 * ... derived using pivot(headerViews).
 *
 * @param {string} fieldName Data-level e.g., payer
 * @param {string} key Config-level e.g., purpose
 * @param {any} value
 * @return void
 */
export const updateEtlField = makeActionCreator(
  TYPES.UPDATE_ETL_FIELD,
  'fieldName',
  'key',
  'value',
);

//------------------------------------------------------------------------------
// middleware-related
//------------------------------------------------------------------------------
/**
 * action kind :: document
 * Utilized by the corresponding middleware
 *
 * 👉 resolved data from the api
 * 👉 normalized :: resolved data -> headerView
 *
 * @function
 * @param {Object} args
 * @param {Object} args.payload raw data from the ui
 * @param {Object} args.normalizer function raw -> headerView
 * @param {Object} args.startTime
 * @return {Object} Action
 */
export const addDerivedField = ({ payload, normalizer, startTime }) => {
  return {
    type: ADD_DERIVED_FIELD,
    payload,
    meta: {
      normalizer,
      feature: ETL_VIEW,
      normalized: false,
      startTime,
    },
  };
};

// Receiver: middleware
// action:: command
//
// map a new action based on field type:
//  👉 document derived
//     👉 delete derived etlField
//
//  👉 document non-derived
//     👉 set_hvs
//     👉 async pivot (see middleware)
//
export const removeEtlField = makeActionCreator(
  REMOVE_ETL_FIELD,
  'fieldName',
  'purpose',
);

export const deleteDerivedField = makeActionCreator(
  DELETE_DERIVED_FIELD,
  'fieldName',
);

export const computeEtlView = makeActionCreator(
  COMPUTE_ETL_VIEW,
  'startTime',
  'headerViews', // optional
  'etlFieldChanges', // optional
);

export const setEtlView = (...args) => {
  const result = makeActionCreator(
    SET_ETL_VIEW,
    'etlObject',
    'etlFieldChanges',
    'elapsedTime',
  )(...args);
  return result;
};

export const makeDerivedField = makeActionCreator(
  MAKE_DERIVED_FIELD,
  'payload',
  'meta',
);

export const renameEtlField = makeActionCreator(
  RENAME_ETL_FIELD,
  'oldValue',
  'newValue',
  'etlFieldNameAndPurposeValues',
);

export const setEtlFieldChanges = makeActionCreator(
  SET_ETL_FIELD_CHANGES,
  'payload',
);

export const setEtlViewErrors = makeActionCreator(
  SET_ETL_VIEW_ERROR,
  'payload',
);

export const resetEtlViewErrors = makeActionCreator(RESET_ETL_VIEW_ERROR);

//------------------------------------------------------------------------------
