// src/ducks/headerView.reducer.js

/**
 * @module ducks/headerView-reducer
 *
 * Captures user input headerView -> configured headerView
 *
 * Sets the state branch
 *
 *   ** headerView **
 *
 * Non-pure computations documented here:
 *   👉 feature middleware consumes the API, and COMPUTE commands
 *   👉 fix-report.sagas schedules the error-fix reports
 *
 * @category Reducers
 *
 */
import createReducer from '../utils/createReducer';
// actions :: document
import {
  UPDATE_IMPLIED_MVALUE,
  UPDATE_HEADERVIEW, // prop-specific
  UPDATE_FILEFIELD, // header-idx and prop-specific
  RESET_FILEFIELDS,
  ADD_SELECTED,
  REMOVE_SELECTED,
  ADD_HEADER_VIEW,
  REMOVE_HEADER_VIEW, // CANCEL command -> here
  ADD_INSPECTION_ERROR,
  REMOVE_INSPECTION_ERROR,
  SET_HVS, // document updated hvs
  SET_FIXED_HVS, // document updated hvs (using a lazyAction)
  SET_HVS_FIXES, // document headerViewFixes
  SET_WIDE_TO_LONG_FIELDS_IN_HV,
  SET_HV_FIELD_LEVELS, // document levels (likely only mspan)
  ADD_UPDATE_SYMBOL_ITEM,
  DELETE_SYMBOL_ITEM,
  ADD_UPDATE_SYMBOL_ITEM_WIDE_CONFIG,
  DELETE_SYMBOL_ITEM_WIDE_CONFIG,
} from './actions/headerView.actions';
import { RESET } from './actions/project-meta.actions';

import { updateField } from '../lib/filesToEtlUnits/update-field';
import { getWideToLongFieldsConfig } from '../lib/filesToEtlUnits/transforms/wide-to-long-fields';

import { MVALUE_MODE, SOURCE_TYPES, PURPOSE_TYPES } from '../lib/sum-types';

// ⚠️  This function can generate a new hv reference
import { findAndSeedDerivedFields } from '../lib/filesToEtlUnits/transforms/find-derived-fields';
import * as H from '../lib/filesToEtlUnits/headerview-helpers';
import { setMvalue } from '../lib/filesToEtlUnits/transforms/implied-mvalue';

// Error/fix reporting
import { reportHvsFixes } from '../lib/filesToEtlUnits/headerview-report-fixes';
import { computeWithTimeout } from '../utils/promise-timeout';

// runtime errors
import { InputError, KeyValueError } from '../lib/LuciErrors';
import { colors } from '../constants/variables';
import { trySpanEnabledField } from '../lib/filesToEtlUnits/transforms/span/span-levels';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// initial state for the headerView fragment of state
export const initialState = {
  selected: [], // list of files shared with headerView
  fileInspectionErrors: [], // from the API
  headerViews: {},
  headerViewFixes: Object.values(SOURCE_TYPES).reduce((emptyFixes, sourceType) => {
    emptyFixes[sourceType] = {}; // eslint-disable-line
    return emptyFixes;
  }, {}),
};
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// Reducer-specific selectors
// These functions should reflect what is defined in the `initialState`.
//------------------------------------------------------------------------------
export const getHeaderViews = (stateFragment) => stateFragment.headerViews;
/**
 * @function
 * @return {Array}
 */
export const getSelected = (stateFragment) => stateFragment.selected;

export const isFileSelected = (stateFragment, path) => {
  const flt = (entry) => entry[0] === path;
  return stateFragment.selected.findIndex(flt) !== -1;
};

export const getHasSelectedFiles = (stateFragment) => stateFragment.selected.length > 0;

/**
 * v0.5.0
 * @return {String} mvalueMode enum
 */
export const selectMvalueMode = (stateFragment, filename) =>
  stateFragment.headerViews?.[filename]?.mvalueMode;

/**
 * v0.3.11
 * Object: arrows: Object
 * @return {Object}
 */
export const selectSymbolMap = (stateFragment, filename, headerIdx) =>
  stateFragment.headerViews?.[filename]?.fields[headerIdx]['map-symbols'];

/**
 * returns headerView
 *
 * @param {Object} stateFragment
 * @param {string} filename
 * @return {HeaderView}
 */
export const selectHeaderView = (stateFragment, filename) =>
  stateFragment.headerViews[filename];

export const selectHeader = (stateFragment, filename) =>
  stateFragment.headerViews[filename].header;

export const getHasImpliedMvalue = (stateFragment, filename) =>
  Object.keys(stateFragment.headerViews[filename]).includes('implied-mvalue');

/**
 * HeaderView selectors
 */
export const selectHeaderExFields = (stateFragment, filename) => {
  const hv = stateFragment.headerViews[filename];
  if (typeof hv === 'undefined') {
    return undefined;
  }
  return H.removeProp('fields', hv);
};

/**
 *
 * Debugging utility
 * Creates a new set of pointers excluding levels
 *
 * @function
 */
export const selectHeaderExLevels = (stateFragment, filename) => {
  const hv = stateFragment.headerViews[filename];
  return {
    ...hv,
    fields: hv.fields.map((field) => H.removeProp('levels', field)),
  };
};
/**
 *
 * 🚫 Likely deprecate given the new levels ~ selectionModel and separate api.
 *
 * Scrubb the headerView state levels when transition to etlView
 *
 *      hvs, filename -> hv -> hv
 *
 * @function
 * @param {Object} headerview store fragment
 * @param {string} filename
 * @return {Object} hv
 */
const scrubHeaderView = (stateFragment, filename) => {
  const hv = stateFragment.headerViews[filename];
  return {
    ...hv,
    fields: hv.fields.map((field) => {
      return field.purpose === PURPOSE_TYPES.MSPAN ? field : { ...field, levels: [] };
    }),
  };
};
/**
 *
 * 🚫 Likely deprecate given the new levels ~ selectionModel and separate api.
 *
 * Use this following the pivot to etlView
 *
 *      hvs -> hvs
 *
 * @function
 * @param {Object} headerview store fragment
 * @return {Object} hvs
 */
export const scrubHeaderViews = (stateFragment) => {
  return Object.values(stateFragment.headerViews).reduce((hvs, hv) => {
    /* eslint-disable no-param-reassign */
    hvs[hv.filename] = scrubHeaderView(stateFragment, hv.filename);
    return hvs;
  }, {});
};

/**
 *     state -> hv without fields (including derived)
 *
 * @function
 * @param {Object} stateFragment files slice of store (hosts headerViews)
 * @param {string} filename unique id for a headerView
 * @param {number} fieldIdx unique id for a field (header-idx)
 * @return {Object} headerView
 */
export const selectHeaderViewLean = (stateFragment, filename) => {
  const hv = selectHeaderView(stateFragment, filename);
  return typeof hv === 'undefined'
    ? undefined
    : H.removeProp(['wideToLongFields', 'implied-mvalue', 'fields'], hv);
};

/**
 *     state -> FileField
 *
 * @function
 * @param {Object} stateFragment files slice of store (hosts headerViews)
 * @param {string} filename unique id for a headerView
 * @param {number} fieldIdx unique id for a field (header-idx)
 * @return {FileField}
 */
export const selectFieldInHeader = (stateFragment, filename, fieldIdx) => {
  return stateFragment.headerViews?.[filename].fields[fieldIdx];
};

//------------------------------------------------------------------------------
/**
 *
 *     state -> FileField with specified props
 *
 * Utilized to retrieve a lean heuristic for processing wtlf dervived
 * fields in the headerview.
 *
 * @function
 * @param {Object} stateFragment
 * @param {string} filename
 * @param {Array<string>} fieldProps
 * @return {Array<Object>}
 */
const selectHeaderViewFieldsWithProps = (stateFragment, filename, fieldProps) => {
  /* eslint-disable no-param-reassign */
  return stateFragment?.headerViews?.[filename].fields.map((field) => {
    return Object.keys(field).reduce((newField, fieldKey) => {
      if (fieldProps.includes(fieldKey)) {
        newField[fieldKey] = field[fieldKey];
      }
      return newField;
    }, {});
  });
  /* eslint-enable no-param-reassign */
};

/**
 * Pull a copy of the state required to generate an error report.
 * Minimize the data required to be processed.
 *
 *     hvs -> lean copy of hvs
 *
 * @function
 *
 */
function leanHvsForFixReport(hvs) {
  const leanHvs = H.enabledFieldsInHvs(hvs);
  const result = H.removeLevelsFromHvs(leanHvs);
  return result;
}

//------------------------------------------------------------------------------
/**
 * wideToLongFields selector
 *
 * @function
 */
export const selectWideToLongFields = (stateFragment, filename) => {
  const hv = selectHeaderView(stateFragment, filename);
  return getWideToLongFieldsConfig(hv);
};

/**
 * Return a field from the wideToLongFields configuration
 * 0.3.11
 * @param {Object} stateFragment
 * @param {string} filename
 * @param {string} fieldAlias
 * @return {Object} field
 */
export const selectWideToLongField = (stateFragment, filename, fieldAlias) => {
  const hv = selectHeaderView(stateFragment, filename);
  return getWideToLongFieldsConfig(hv).fields[fieldAlias];
};

export const selectHasWideToLongFields = (stateFragment, filename) => {
  if (typeof stateFragment === 'undefined') return false;
  return Boolean(stateFragment?.headerViews?.[filename]?.wideToLongFields ?? false);
};

//------------------------------------------------------------------------------
/**
 * implied-mvalue selectors
 * @function
 */
export const selectImpliedMvalue = (stateFragment, filename) => {
  const hv = stateFragment.headerViews[filename];

  try {
    if (!Object.keys(hv).includes('implied-mvalue')) {
      throw new KeyValueError(`Missing key: implied-value does not exist: ${filename}`);
    }
    return stateFragment.headerViews[filename]['implied-mvalue'];
  } catch (e) {
    if (e instanceof KeyValueError) {
      if (DEBUG) console.warn(e);
      else console.warn(e.message);
      return {};
    }
    throw e;
  }
};
export const selectHasImpliedMvalue = (stateFragment, filename) => {
  if (typeof stateFragment === 'undefined') return false;
  return Boolean(stateFragment?.headerViews?.[filename]?.['implied-mvalue'] ?? false);
};

//------------------------------------------------------------------------------
// Error and fix reporting
//------------------------------------------------------------------------------
// Api error reports
export const getFileInspectionErrors = (stateFragment) =>
  stateFragment?.fileInspectionErrors;

export const getHasFileInspectionErrors = (stateFragment) =>
  stateFragment?.fileInspectionErrors?.length > 0 ?? false;

//------------------------------------------------------------------------------
// User input error reports
//------------------------------------------------------------------------------
/**
 * note plural headerViews
 * returns for all hvs
 * @function
 * @param {State} stateFragment
 * @param {SourceType} sourceType
 * @return {Object}
 */
export const getHeaderViewsFixes = (stateFragment, sourceType) => {
  if (typeof sourceType === 'undefined') {
    return stateFragment.headerViewFixes;
  }
  return stateFragment.headerViewFixes?.[sourceType] || {};
};

/**
 * Note: plural headerViews
 *
 * @function
 * @return {Boolean}
 */
export const getHasHeaderViewsFixes = (stateFragment /* sourceType */) => {
  if (typeof stateFragment.headerViewFixes === 'undefined') return false;
  if (Object.keys(stateFragment.headerViewFixes).length === 0) return false;

  // look at each RAW, WIDE, IMPLIED
  return Object.values(stateFragment.headerViewFixes).reduce(
    (hasFixes, sourceTypeFixes) => {
      if (Array.isArray(sourceTypeFixes)) {
        return hasFixes || sourceTypeFixes.length > 0;
      }
      return hasFixes || Object.keys(sourceTypeFixes).length > 0;
    },
    false,
  );
};

/**
 * file-specific errors
 *
 * @function
 * @param {State} stateFragment
 * @param {Filename} filename
 * @param {SourceType} sourceType
 * @return {Array<Error>}
 */
export const selectHeaderViewFixes = (stateFragment, filename, sourceType) => {
  if (typeof filename === 'undefined') {
    throw new InputError(`Must provide a filename`);
  }
  if (typeof sourceType === 'undefined') {
    throw new InputError(
      `Must provide a sourceType: ${JSON.stringify(Object.keys(SOURCE_TYPES))}`,
    );
  }
  return getHeaderViewsFixes(stateFragment, sourceType)?.[filename] ?? [];
};

export const selectHasHeaderViewFixes = (stateFragment, sourceType, filename) =>
  selectHeaderViewFixes(stateFragment, filename, sourceType)?.length > 0 ?? false;

/**
 *
 * ⚠️  will cause re-render anytime a field is toggled active/inactive
 *
 * @function
 * @param {Object} stateFragment
 * @param {string} filename
 * @return {number}
 */
export const getActiveFieldCount = (stateFragment, filename) =>
  selectHeaderView(stateFragment, filename)?.fields?.filter(({ enabled }) => enabled)
    .length ?? 0;

//------------------------------------------------------------------------------

/**
 *
 * Interactive Error reporting
 *
 *       hvs -> error report
 *
 *
 *   👉 Generates a report "from scratch"
 *      👍 Pure in that it does not rely on previous state
 *
 *   👉 Called in response to actions that change headerViews
 *
 *   👉 Promise to set a timeout limit
 *
 *   👉 Scans all fields in every headerView
 *      👍 uses memoization for the field-stacking report
 *
 *
 * The caller is a saga middleware that schedules the report generation in
 * context of a race between repeated demands for a report, timeout limit
 * and the report itself.
 *
 * @function
 * @param {Object<Filename,HeaderView>} headerViews
 * @param {Number} timeout in milliseconds
 * @param {Boolean} debug 'debug'
 * @return {Object} errors keyed by source type and filename
 *
 * @throws {Error} Timeout
 *
 */
export const reportHvsFixesP = ({
  headerViews,
  timeout = 150,
  DEBUG /* eslint-disable-line */,
}) => {
  if (DEBUG) {
    console.debug('%cselector promise started', colors.orange);
  }
  console.assert(
    Array.isArray(headerViews),
    `Report Errors: Expecting an Array of hvs`,
  );
  if (headerViews.length === 0) {
    return {};
  }

  const result = computeWithTimeout(
    () =>
      reportHvsFixes(leanHvsForFixReport(headerViews), DEBUG)
        .reportHvs1() // stackable fields?
        .elapsedTime()
        .reportHvs2() // valid etlUnits
        .elapsedTime()
        .reportHvs3() // wideToLongFields
        .elapsedTime()
        .coordinateFixes()
        .elapsedTime()
        .setLazyFixes()
        .elapsedTime()
        .dedupFixes()
        .removeDanglingValues()
        .elapsedTime()
        .return(),
    timeout,
    DEBUG,
    'hvs fix report', // caller tag
  );
  return result;
};

//------------------------------------------------------------------------------
// Reducer
//------------------------------------------------------------------------------
/**
 *
 * The action types should all be `document`
 * (see Programming with Actions)
 *
 * 1. the return type must match the reducer defined here.
 *
 * 2. the caller of the action creator is either in the ui (useDispatch),
 *    `mapDispatchToProps`, or the middleware to 'document' the outcomes
 *    of a command.
 *
 * 3. the action will trickle down from the state root; however, the reducer
 *    defined here points to the stateFragment (so do *not* use rootSelectors)
 *
 */
//------------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  /* Utility to reset all state */
  [RESET]: () => initialState,

  /* Testing */
  RESET_HVS_FIXES: (state) => ({
    ...state,
    headerViewFixes: {},
  }),
  RESET_INSPECTION_ERRORS: (state) => ({
    ...state,
    fileInspectionErrors: [],
  }),
  /* Testing utility && required for etlView.middleware */
  PING: (state) => {
    console.log('PING from redux files.reducer');
    return state;
  },

  // command that we document
  // 🔖 TOGGLE_SELECT_FILE may involve the backend and
  //    is handled by headerView.middleware
  //
  // Two parts to the request:
  // 👉 async update of headerViews (not here)
  // 👉 sync update of selected files (here)
  //
  [ADD_SELECTED]: (state, { path, displayName }) => ({
    ...state,
    selected: [...state.selected, [path, displayName]],
  }),
  [ADD_INSPECTION_ERROR]: (state, { payload: { filename, message } }) => ({
    ...state,
    fileInspectionErrors: [...state.fileInspectionErrors, { [filename]: message }],
  }),
  [REMOVE_INSPECTION_ERROR]: (state, { payload: { filename: removeFilename } }) => ({
    ...state,
    fileInspectionErrors: state.fileInspectionErrors.filter(
      (error) => error.filename !== removeFilename,
    ),
  }),

  // document
  // 👈 middleware normalizes the raw data from the api
  // 👉 triggers a saga fix-report
  [ADD_HEADER_VIEW]: (state, { payload: headerView }) => {
    return {
      ...state,
      fileInspectionErrors: [],
      headerViews: {
        ...getHeaderViews(state),
        [headerView.filename]: headerView,
      },
    };
  },

  //
  // command that we document (from middleware)
  //
  // 👉 triggers a saga fix-report
  //
  // 🗄️ shared-drive update:
  //
  // 🔖 filename in headerView = path
  //    (what identifies files locally on the luci drive)
  //
  //    selected files hosts both the path and displayName.
  //    [[path, displayName]]
  //
  [REMOVE_HEADER_VIEW]: (state, { path: removeFile }) => {
    //
    // two documentation steps:
    //
    // 1. selected: the list that tracks the user request, right away
    // 2. headerViews: the list data retrieved, which can take time
    //
    const updatedHvs = Object.keys(state.headerViews).includes(removeFile)
      ? /* eslint-disable no-param-reassign */
        Object.values(state.headerViews).reduce((updatedHvs_, hv) => {
          if (hv.filename !== removeFile) updatedHvs_[hv.filename] = hv;
          return updatedHvs_;
        }, {})
      : /* eslint-enable no-param-reassign */
        state.headerViews;

    return {
      ...state,
      headerViews: updatedHvs,
    };
  },

  // called by middleware when inspection returns an error || remove headerview
  [REMOVE_SELECTED]: (state, { path: removeFile }) => {
    if (DEBUG) {
      console.debug(`__ 2️⃣  🦀 Reducer with path: ${removeFile}`);
    }
    return {
      ...state,
      selected: state.selected.filter((entry) => entry[0] !== removeFile),
    };
  },

  //----------------------------------------------------------------------------
  // wide-to-long-fields
  // payload :: headerView with updated wtlf
  // Note: the wideToLongFields prop has its own errors prop.
  [SET_WIDE_TO_LONG_FIELDS_IN_HV]: (state, { payload }) => {
    return {
      ...state,
      headerViews: {
        ...state.headerViews,
        ...payload,
      },
    };
  },

  // see SET_HVS
  // [SET_DISABLED_FIELD_STACK]: (state, { fieldAlias }) => {},

  //----------------------------------------------------------------------------
  // 🔖 TYPES.actions are both a command/document type (synced update)
  //    (direct, synced update of the reducer)
  //    Some of them trigger a scheduled report-fixes manged using a saga.
  //----------------------------------------------------------------------------
  [UPDATE_IMPLIED_MVALUE]: (state, { filename, mvalueFieldname: name }) => {
    const headerViews = {
      ...state.headerViews,
      [filename]: {
        ...state.headerViews[filename],
        'implied-mvalue': setMvalue(name, selectImpliedMvalue(state, filename)),
      },
    };

    return {
      ...state,
      headerViews,
    };
  },

  // used to undo changes using xstate
  [RESET_FILEFIELDS]: (state, { filename, fields }) => {
    return {
      ...state,
      [filename]: {
        ...state.headerViews[filename],
        fields,
      },
    };
  },

  // -------------------------------------------------------------------------
  // 1️⃣  update the field value
  // 2️⃣  assess the need to add/remove configuration props
  // 3️⃣  document the headerViews
  //
  // ⚠️  A separate error/fix checking is a side-effect triggered in the saga
  //    Saga will take the array of actions that need to schedule
  //    an error report.
  //
  [UPDATE_FILEFIELD]: (state, { filename, fieldIdx, key, value }) => {
    // value undefined is ok (toggle enable, null is not ok)
    if (value == null) return state;

    // 1️⃣  update the field value
    const { field: newField, staleDerivedFields } = updateField({
      readOnlyField: selectFieldInHeader(state, filename, fieldIdx),
      key,
      value,
      DEBUG,
    });

    // 2️⃣  assess the need to add/remove configuration props
    // headerView analysis
    //
    // 🦀 does not update wtlf errors when a new mvalue is added
    //    ... missing user input.
    //
    const COLOR = staleDerivedFields ? colors.yellow : colors.green;

    if (DEBUG) {
      console.groupCollapsed(
        `%cScan headerView for derived fields? ${staleDerivedFields}`,
        COLOR,
      );
      console.dir(state.headerViews[filename].fields);
    }

    const scanHvFn = staleDerivedFields ? findAndSeedDerivedFields : ({ hv }) => hv;

    // 3️⃣  document the headerViews
    const headerViews = {
      ...state.headerViews,
      [filename]: scanHvFn({
        hv: updateFieldInHeaderView(state.headerViews[filename], fieldIdx, newField),
        previousHvFields: selectHeaderViewFieldsWithProps(state, filename, [
          'enabled',
          'purpose',
          'field-alias',
        ]),
        DEBUG,
        COLOR,
      }),
    };

    if (DEBUG) console.groupEnd();

    return {
      ...state,
      headerViews,
    };
  },
  // 0.5.0
  // Only relevant for mvalueMode (as of 0.5.0)
  [UPDATE_HEADERVIEW]: (state, { filename, key, value }) => {
    if (value == null || key !== 'mvalueMode') return state;

    if (!Object.values(MVALUE_MODE).includes(value)) {
      throw new InputError(`Invalid mvalueMode: ${value}`);
    }

    const newHv = { ...selectHeaderView(state, filename), [key]: value };
    console.debug(newHv);

    return {
      ...state,
      headerViews: {
        ...state.headerViews,
        [filename]: findAndSeedDerivedFields({
          hv: newHv,
          previousHvFields: [], // remove the heuristic to ensure a fresh analysis
          DEBUG,
        }),
      },
    };
  },
  //--------------------------------------------------------------------------------
  // 👍 document the async request for a field's levels
  // 🔖 only relevant for mspan
  //
  [SET_HV_FIELD_LEVELS]: (state, { filename, headerIdx, levels }) => {
    const readOnlyField = state.headerViews[filename].fields[headerIdx];
    // a new interval might enable new spans
    const newField = trySpanEnabledField({
      field: { ...readOnlyField, levels },
      sourceType: 'RAW',
      DEBUG,
    });
    return updateFieldInState(state, filename, headerIdx, newField);
  },

  // 👍 document the results of an async report of fixes/errors
  // 🔗 see sagas.files to learn what actions schedule a error check
  // 🔖 This is fix output for the user; it may contain 'lazyActions' that
  //    provide the user with automated fixes (setFixedHvs)
  [SET_HVS_FIXES]: (state, { headerViewFixes }) => {
    return {
      ...state,
      headerViewFixes, // resolved reportHvsFixes(headerViews)
    };
  },
  [SET_HVS]: (state, { payload }) => {
    return {
      ...state,
      headerViews: payload,
    };
  },
  // same as SET_HVS except this one schedules an error report
  [SET_FIXED_HVS]: (state, { payload }) => {
    return {
      ...state,
      headerViews: payload,
    };
  },

  // v0.3.11
  [ADD_UPDATE_SYMBOL_ITEM]: (state, { payload }) => {
    const { left, right, filename, headerIdx } = payload;
    const readOnlyField = selectFieldInHeader(state, filename, headerIdx);
    const { arrows } = readOnlyField['map-symbols'];
    const newField = {
      ...readOnlyField,
      'map-symbols': {
        ...readOnlyField['map-symbols'],
        arrows: {
          ...arrows,
          [left]: right,
        },
      },
    };
    return updateFieldInState(state, filename, headerIdx, newField);
  },
  // v0.3.11
  [DELETE_SYMBOL_ITEM]: (state, { payload }) => {
    const { left, filename, headerIdx } = payload;
    const readOnlyField = selectFieldInHeader(state, filename, headerIdx);
    const { arrows } = readOnlyField['map-symbols'];
    const { [left]: omit, ...newArrows } = arrows;
    const newField = {
      ...readOnlyField,
      'map-symbols': {
        ...readOnlyField['map-symbols'],
        arrows: newArrows,
      },
    };
    return updateFieldInState(state, filename, headerIdx, newField);
  },
  // v0.3.11
  [ADD_UPDATE_SYMBOL_ITEM_WIDE_CONFIG]: (state, { payload }) => {
    const { left, right, filename, fieldAlias } = payload;
    const readOnlyField = selectWideToLongField(state, filename, fieldAlias);
    const { arrows } = readOnlyField['map-symbols'];
    const newField = {
      ...readOnlyField,
      'map-symbols': {
        ...readOnlyField['map-symbols'],
        arrows: {
          ...arrows,
          [left]: right,
        },
      },
    };
    return updateWideFieldInState(state, filename, fieldAlias, newField);
  },
  // v0.3.11
  [DELETE_SYMBOL_ITEM_WIDE_CONFIG]: (state, { payload }) => {
    const { left, filename, fieldAlias } = payload;
    const readOnlyField = selectWideToLongField(state, filename, fieldAlias);
    const { arrows } = readOnlyField['map-symbols'];
    const { [left]: omit, ...newArrows } = arrows;
    const newField = {
      ...readOnlyField,
      'map-symbols': {
        ...readOnlyField['map-symbols'],
        arrows: newArrows,
      },
    };
    return updateWideFieldInState(state, filename, fieldAlias, newField);
  },
});

//------------------------------------------------------------------------------
// Local reducer mutating functions
//------------------------------------------------------------------------------
/**
 * Swap a field in the state object with a new field (maintains field sequence)
 * @return {Object} store
 */
function updateFieldInState(state, filename, headerIdx, newField) {
  return {
    ...state,
    headerViews: {
      ...state.headerViews,
      [filename]: updateFieldInHeaderView(
        state.headerViews[filename],
        headerIdx,
        newField,
      ),
    },
  };
}
/**
 * Swap a field in a headerView with a new field (maintains field sequence)
 * @param {HeaderView} hv
 * @return {HeaderView} hv
 */
function updateFieldInHeaderView(hv, headerIdx, newField) {
  return {
    ...hv,
    fields: H.deleteReplace(hv.fields, headerIdx, newField),
  };
}
/**
 * Update a wide field in the wideToLongFields configuration
 */
function updateWideFieldInState(state, filename, fieldAlias, newField) {
  return {
    ...state,
    headerViews: {
      ...state.headerViews,
      [filename]: updateWideFieldInHeaderView(
        state.headerViews[filename],
        fieldAlias,
        newField,
      ),
    },
  };
}
function updateWideFieldInHeaderView(hv, fieldAlias, newField) {
  return {
    ...hv,
    wideToLongFields: {
      ...hv.wideToLongFields,
      fields: {
        ...hv.wideToLongFields.fields,
        [fieldAlias]: newField,
      },
    },
  };
}
export default reducer;
