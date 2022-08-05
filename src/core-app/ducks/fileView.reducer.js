/**
 * @module /Ducks/fileView.reducer
 *
 * @description
 * Captures user input files -> headerViews
 *
 * Sets the state branch
 *
 *   ** fileView **
 *
 * Displays the user's filesystem.
 * UI Task: Select files to be included in the analysis.
 *
 * Approach: Use local component state to track visual queue (TODO)
 * for what has been selected.  Use the redux-store to document
 * the files to be included.  This documentation occurs using
 * `headerView.reducer`.
 *
 */
import createReducer from '../utils/createReducer';

import {
  READ_DIR_START,
  READ_DIR_SUCCESS,
  READ_DIR_ERROR,
  SET_DIR_STATUS,
  RESET_DIR_REQUEST,
  STATUS,
} from './actions/fileView.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export { STATUS };

export const initialState = {
  count: undefined,
  files: [],
  filteredFiles: [],
  filterText: '', // search for filenames
  readdirErrors: [],
  status: STATUS.idle,
  request: undefined,
};

// -----------------------------------------------------------------------------
//------------------------------------------------------------------------------
/**
 * Reducer-specific selectors
 *
 * These functions should echo what is defined in the
 * `initialState` for this state fragment.
 *
 */
export const getPathQuery = (stateFragment) => stateFragment.pathQuery;
export const getParentPathQuery = (stateFragment) =>
  stateFragment.parentPathQuery;
export const getFiles = (stateFragment) => stateFragment.files;
export const getReaddirErrors = (stateFragment) => stateFragment.readdirErrors;
export const getFilesViewStatus = (stateFragment) => stateFragment.status;
export const getRequest = (stateFragment) => stateFragment.request;
/**
 *
 * selector
 *
 * @function
 * @param {Array.<Object>} files
 * @param {string} filterText
 * @returns {Array.<Object>} filtered files
 */
export const selectFilesF = (stateFragment, filterText) => {
  return filterText === ''
    ? stateFragment.files
    : stateFragment.files.filter((file) =>
        file.display_name.toLowerCase().includes(filterText.toLowerCase()),
      );
};

//------------------------------------------------------------------------------
// Reducer
//------------------------------------------------------------------------------
/**
 *
 * The action types should all be `document` (see Programming with Actions)
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
 *   [ACTION_TYPE]: (state, action) => ({..})
 */
//------------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  RESET: () => ({
    ...initialState,
  }),
  // command (consumed by sagas)
  [READ_DIR_START]: (state) => ({
    ...state,
    files: [],
    count: 0,
    readdirErrors: [],
    status: STATUS.pending,
  }),

  // event -> document
  [READ_DIR_SUCCESS]: (state, { payload }) => ({
    ...state,
    ...payload,
    readdirErrors: [],
    status: STATUS.resolved,
  }),

  // event
  [READ_DIR_ERROR]: (state, { error }) => ({
    ...state,
    files: [],
    count: 0,
    readdirErrors: [...state.readdirErrors, error],
    status: STATUS.rejected,
  }),

  // document
  [SET_DIR_STATUS]: (state, { status }) => {
    if (status === STATUS.pending) {
      return {
        ...state,
        files: [],
        count: 0,
        readdirErrors: [],
        status,
      };
    }
    return {
      ...state,
      status,
    };
  },

  // document
  [RESET_DIR_REQUEST]: (state) => ({
    ...state,
    request: undefined,
    readdirErrors: [],
    status: STATUS.idle,
  }),
});
export default reducer;
