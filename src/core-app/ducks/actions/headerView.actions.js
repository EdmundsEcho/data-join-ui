/**
 * @module src/ducks/actions/headerView.actions
 *
 * @description
 * Manages the headerView configuration updates.
 *
 * The initializing action receives the results from the api endpoint:
 *
 *     ** inspection **
 *
 */
import { makeActionCreator } from '../../utils/makeActionCreator';
import { makeComputeAction, COMPUTE } from './compute.actionCreator';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
// middleware-related actions
// feature
export const HEADER_VIEW = '[HeaderView]';
export const feature = HEADER_VIEW;

// commands
export const FETCH_HEADER_VIEW = `${HEADER_VIEW} FETCH`; // command
export const CANCEL_HEADER_VIEW = `${HEADER_VIEW} CANCEL`; // command

// document with command
export const ADD_SELECTED = `${HEADER_VIEW} ADD SELECTED`; // document
export const ADD_HEADER_VIEW = `${HEADER_VIEW} ADD`; // document

// document that may or may not involve a command (so, trigger: event)
export const REMOVE_HEADER_VIEW = `${HEADER_VIEW} REMOVE`; // document
export const REMOVE_SELECTED = `${HEADER_VIEW} REMOVE SELECTED`; // document...
export const SET_HVS = `${HEADER_VIEW} SET/headerViews`; // document w/o scheduling error report

// fixes for the user to complete (first in the sequence)
export const SET_HVS_FIXES = `${HEADER_VIEW} SET/headerViewFixes`; // document
// action of fixing previously reported issues that need fixing
export const SET_FIXED_HVS = `${HEADER_VIEW} SET_FIXED/headerViews`; // document w scheduling error report
// set the levels prop (likely mspan only)
export const SET_HV_FIELD_LEVELS = `${HEADER_VIEW} SET/headerView field levels`; // document

// document errors
export const ADD_INSPECTION_ERROR = `${HEADER_VIEW} ADD_INSPECTION_ERROR`; // document
export const REMOVE_INSPECTION_ERROR = `${HEADER_VIEW} REMOVE_INSPECTION_ERROR`; // document

// ui command -> middleware compute action interface
export const UPDATE_WIDE_TO_LONG_FIELDS = `${HEADER_VIEW} ${COMPUTE} WIDE_TO_LONG_FIELDS`;
// document
export const SET_WIDE_TO_LONG_FIELDS_IN_HV = `${HEADER_VIEW} SET/wide-to-long-fields (in HV)`;

// ui command -> middleware compute action interface
export const UPDATE_HEADERVIEW = `${HEADER_VIEW} UPDATE_HEADERVIEW`;
export const UPDATE_FILEFIELD = `${HEADER_VIEW} UPDATE_FILEFIELD`;
export const UPDATE_IMPLIED_MVALUE = `${HEADER_VIEW} UPDATE_IMPLIED_MVALUE`;

export const RESET_FILEFIELDS = `${HEADER_VIEW} RESET_FILEFIELDS`;

export const RUN_FIX_REPORT = `${HEADER_VIEW} RUN_FIX_REPORT`;

// v0.3.11 -- actions::document
export const ADD_UPDATE_SYMBOL_ITEM = `${HEADER_VIEW} ADD_UPDATE_SYMBOL_ITEM`;
export const DELETE_SYMBOL_ITEM = `${HEADER_VIEW} DELETE_SYMBOL_ITEM`;
export const ADD_UPDATE_SYMBOL_ITEM_WIDE_CONFIG = `${HEADER_VIEW} ADD_UPDATE_SYMBOL_ITEM_WIDE_CONFIG`;
export const DELETE_SYMBOL_ITEM_WIDE_CONFIG = `${HEADER_VIEW} DELETE_SYMBOL_ITEM_WIDE_CONFIG`;
//------------------------------------------------------------------------------
// WIP: actions that fix errors in the fix reports
// {feature} FIX/{error fix key}
// 🚧 how extend in a serializable way the options for how to fix
// 🔑 filter-middleware type:string -> action object
// testing: '[HeaderView] FIX/sameAsOtherSubjects'

// move to separate interface
// 🔖 Right now we rely on the feature middleware to know what state fragment
//    to provide.
// User chose to apply the pre-configured lazyFix
//
export const FIX = `[FIX]`;
export const FIXES = `${HEADER_VIEW} ${FIX}`;
export const fixAction = (action) => {
  const result = {
    type: `${FIXES} ${action.lazyFix}`,
    lazyFix: action.lazyFix,
  };
  if (DEBUG) {
    console.group(`ACTION creator`);
    console.dir(action);
    console.dir(result);
    console.groupEnd();
  }

  return result;
};
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// action creators
//------------------------------------------------------------------------------
// middleware-related (async)
//------------------------------------------------------------------------------
const create = (type, { type: _, ...rest }) => ({
  type,
  ...rest,
});
// action kind :: command
export const fetchHeaderView = (action) => create(FETCH_HEADER_VIEW, action);
export const cancelHeaderView = (action) => create(CANCEL_HEADER_VIEW, action);
export const removeHeaderView = (action) => create(REMOVE_HEADER_VIEW, action);
export const addToSelectedList = (action) => create(ADD_SELECTED, action);
export const removeFromSelectedList = (action) => create(REMOVE_SELECTED, action);

/**
 * action kind :: document
 * Utilized by the corresponding middleware
 *
 * 👉 resolved data from the api
 * 👉 normalized :: resolved data -> headerView
 *
 *
 * @function
 * @param {Object} args
 * @param {Object} args.payload raw file result from the api
 * @param {Object} args.normalizer function raw -> headerView
 * @param {Object} args.startTime
 * @return {Object} Action
 */
export const addHeaderView = ({ payload, normalizer, startTime }) => {
  return {
    type: ADD_HEADER_VIEW,
    payload,
    meta: {
      normalizer,
      feature: HEADER_VIEW,
      normalized: false,
      startTime,
    },
  };
};

export const addInspectionError = (payload) => {
  return {
    type: ADD_INSPECTION_ERROR,
    payload,
  };
};
export const removeInspectionError = (payload) => {
  return {
    type: REMOVE_INSPECTION_ERROR,
    payload,
  };
};

/**
 * New version
 * action :: command
 * Appends the compute interface to the feature-specific (wtlf) type.
 *
 * ⚠️  using makeComputeAction (WIP approach)
 *    The interface augments the action with 'COMPUTE'
 *
 */
export const updateWideToLongFields = (payload) =>
  makeComputeAction(HEADER_VIEW, UPDATE_WIDE_TO_LONG_FIELDS, payload);

/**
 * action :: document
 */
export const setWideToLongFieldsInHv = makeActionCreator(
  SET_WIDE_TO_LONG_FIELDS_IN_HV,
  'payload',
);

/**
 * action :: document
 */
export const setHvFieldLevels = makeActionCreator(
  SET_HV_FIELD_LEVELS,
  'filename',
  'headerIdx',
  'levels',
);
//------------------------------------------------------------------------------
// Sync updates using middleware
//------------------------------------------------------------------------------
/**
 * action :: document
 * Utilized by:
 * 👉 etlView editing events: no headerView errors -> no headerView errors
 * 👉 lazyFix editing events: errors in headerView -> maybe errors in headerView
 */
export const setHeaderViews = makeActionCreator(SET_HVS, 'payload');
export const setFixedHeaderViews = makeActionCreator(SET_FIXED_HVS, 'payload');
export const setDisabledFieldStack = setHeaderViews;

//------------------------------------------------------------------------------
// Direct to redux (pure)
// actions :: document
//------------------------------------------------------------------------------
/*--------------------------------------------------------------------------
  Redux in general: The receiver of the payload is the reducer
  Design the keys accordingly.  The callbacks from the UI will
  provide the key values; right now based on the parameter sequence.
---------------------------------------------------------------------------*/

/**
 * @param {Object} { filename, key, value }
 * @return {Object} action UPDATE_HEADERVIEW
 */
export const updateHeaderView = (payload) => ({ type: UPDATE_HEADERVIEW, ...payload });

//export const updateFielField = (payload) => ({ type: UPDATE_FILEFIELD, payload });
export const updateFileField = makeActionCreator(
  UPDATE_FILEFIELD,
  'filename',
  'fieldIdx',
  'key',
  'value',
);
// action :: document
//
// The command that needs documenting is implied anytime changes to the
// headerViews is documented.
//
// The demand is the relatively heavy computation is managed using a saga
// middleware.
//
export const setHvsFixes = (...args) => {
  const action = makeActionCreator(SET_HVS_FIXES, 'headerViewFixes')(...args);
  return action;
};

/**
 * Action creator
 * Once dispatched to the reducer: call lib/setMvalue
 *
 * @function
 * @param {String} filename
 * @param {String} mvalueFieldname
 * @return {{type: String, filename: String, mvalueFieldname: String}}
 */
export const updateImpliedMvalue = makeActionCreator(
  UPDATE_IMPLIED_MVALUE,
  'filename',
  'mvalueFieldname',
);
export const resetFileFields = makeActionCreator(
  RESET_FILEFIELDS,
  'filename',
  'fields', // Array<FileFields>
);

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
/**
 * v0.3.11
 * Update symbol map value for a field in wideToLongFields config
 *
 * const { filename, fieldAlias, left, right } = action.payload;
 */
export const addOrUpdateSymbolItemWideConfig = (payload) => {
  return {
    type: ADD_UPDATE_SYMBOL_ITEM_WIDE_CONFIG,
    payload,
  };
};
/**
 * v0.3.11
 * Delete symbol map value for a field in wideToLongFields config
 *
 * const { filename, headerIdx, left } = action.payload;
 */
export const deleteSymbolItemWideConfig = (payload) => {
  return {
    type: DELETE_SYMBOL_ITEM_WIDE_CONFIG,
    payload,
  };
};

//
export const runFixReport = () => ({ type: RUN_FIX_REPORT });
