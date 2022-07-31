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
} from './actions/fileView.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export const initialState = {
  path: null,
  files: [],
  filteredFiles: [],
  filterText: '', // search for filenames
  readdirErrors: [],
  isLoading: false,
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
export const getPath = (stateFragment) => stateFragment.path;
export const getParent = (stateFragment) => stateFragment.parent;
export const getFiles = (stateFragment) => stateFragment?.files ?? [];
export const getReaddirErrors = (stateFragment) => stateFragment?.readdirErrors;
export const getIsLoadingFiles = (stateFragment) => stateFragment?.isLoading;
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
  RESET: () => ({
    ...initialState,
  }),
  // command
  // 🛈  payload required: 'path'
  [READ_DIR_START]: (state) => ({
    ...state,
    files: [],
    readdirErrors: [],
    isLoading: true,
  }),

  // event
  [READ_DIR_SUCCESS]: (state, { path, files, parent }) => ({
    ...state,
    path,
    files,
    parent,
    filteredFiles: files,
    readdirErrors: [],
    isLoading: false,
  }),

  // event
  [READ_DIR_ERROR]: (state, { error }) => ({
    ...state,
    files: [],
    readdirErrors: [...state.readdirErrors, error],
    isLoading: false,
  }),
});
export default reducer;
