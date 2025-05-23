// src/ducks/actions/etlView.actions.js

import { makeActionCreator } from '../../utils/makeActionCreator';

export const ETL_VIEW = '[EtlView]';
export const feature = ETL_VIEW;

export const UPDATE_ETL_FIELD = `${ETL_VIEW} UPDATE_ETL_FIELD`; // command

export const COMPUTE_ETL_VIEW = `${ETL_VIEW} COMPUTE STATE`; // command
export const SET_ETL_VIEW = `${ETL_VIEW} SET VIEW STATE`; // document

export const MAKE_GROUP_BY_FILE_FIELD = `${ETL_VIEW} MAKE GROUP BY FILE FIEL DFIELD`; // command
export const ADD_GROUP_BY_FILE_FIELD = `${ETL_VIEW} ADD GROUP BY FILE FIELD`; // document

export const REMOVE_ETL_FIELD = `${ETL_VIEW} REMOVE FIELD`; // command
export const DELETE_FIELD = `${ETL_VIEW} DELETE FIELD`; // document
export const DELETE_GROUP_BY_FILE_FIELD = `${ETL_VIEW} DELETE GROUP BY FILE FIELD`; // document

export const RENAME_ETL_FIELD = `${ETL_VIEW} RENAME FIELD`; // command

export const SET_ETL_FIELD_CHANGES = `${ETL_VIEW} SET/etlFieldChanges`;
export const SET_ETL_VIEW_ERROR = `${ETL_VIEW} SET/etlViewErrors`;
export const RESET_ETL_VIEW_ERROR = `${ETL_VIEW} RESET/etlViewErrors`;

// v0.3.11
export const ADD_UPDATE_SYMBOL_ITEM = `${ETL_VIEW} ADD_UPDATE_SYMBOL_ITEM`; // document
export const DELETE_SYMBOL_ITEM = `${ETL_VIEW} DELETE_SYMBOL_ITEM`; // document...

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
  UPDATE_ETL_FIELD,
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
    type: ADD_GROUP_BY_FILE_FIELD,
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
/**
 * @function
 * @param {string} fieldName
 * @param {string} purpose
 * @return {Object} action
 */
export const removeEtlField = makeActionCreator(
  REMOVE_ETL_FIELD,
  'fieldName',
  'purpose',
);

// ::document
export const deleteDerivedField = makeActionCreator(
  DELETE_GROUP_BY_FILE_FIELD,
  'fieldName',
);

// ::command
export const computeEtlView = (startTime) => ({
  type: COMPUTE_ETL_VIEW,
  startTime,
});

// ::document
export const setEtlView = makeActionCreator(
  SET_ETL_VIEW,
  'etlObject',
  'etlFieldChanges',
  'elapsedTime',
);
/*
export const setEtlView = (...args) => {
  const result = makeActionCreator(
    SET_ETL_VIEW,
    'etlObject',
    'etlFieldChanges',
    'elapsedTime',
  )(...args);
  return result;
};
*/

export const makeDerivedField = makeActionCreator(
  MAKE_GROUP_BY_FILE_FIELD,
  'payload',
  'meta',
);

export const renameEtlField = makeActionCreator(
  RENAME_ETL_FIELD,
  'oldValue',
  'newValue',
  'etlFieldNameAndPurposeValues',
);

export const setEtlFieldChanges = makeActionCreator(SET_ETL_FIELD_CHANGES, 'payload');

export const setEtlViewErrors = makeActionCreator(SET_ETL_VIEW_ERROR, 'payload');

export const resetEtlViewErrors = makeActionCreator(RESET_ETL_VIEW_ERROR);

/**
 * v0.3.11
 * Update symbol map value
 *
 * const { filename, headerIdx, left, right } = action.payload;
 */
export const addOrUpdateSymbolItem = (payload) => {
  return {
    type: ADD_UPDATE_SYMBOL_ITEM,
    payload,
  };
};
/**
 * v0.3.11
 * Delete symbol map value
 *
 * const { filename, headerIdx, left } = action.payload;
 */
export const deleteSymbolItem = (payload) => {
  return {
    type: DELETE_SYMBOL_ITEM,
    payload,
  };
};

//------------------------------------------------------------------------------
