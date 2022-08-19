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
  CLEAR_FETCH_HISTORY,
  PUSH_FETCH_HIST,
  POP_FETCH_HIST,
  SET_DIR_STATUS,
  STATUS,
} from './actions/fileView.actions';
import { RESET } from './actions/project-meta.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

export { STATUS };

export const initialState = {
  count: 0,
  files: [],
  filteredFiles: [],
  filterText: '', // search for filenames
  readdirErrors: [],
  status: STATUS.idle,
  requests: undefined,
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
export const getFiles = (stateFragment) => stateFragment.files;
export const getReaddirErrors = (stateFragment) => stateFragment.readdirErrors;
export const getFilesViewStatus = (stateFragment) => stateFragment.status;
export const getRequestHistory = (stateFragment) =>
  stateFragment?.requests ?? undefined;
export const getPathQuery = (stateFragment) => stateFragment.request.path_query;
export const getParentPathQuery = (stateFragment) =>
  stateFragment.parent_path_query;
export const peekRequestHistory = (stateFragment, emptyValue) =>
  peekLastRequest(stateFragment.requests, emptyValue);

export const peekParentRequestHistory = (stateFragment, emptyValue) =>
  peekParentRequest(stateFragment.requests, emptyValue);
export const hasRequestHistory = (stateFragment) =>
  stateFragment?.requests !== undefined && stateFragment?.requests?.length > 0;

// I'm not sure how robbust this approach is
export const getDriveTokenId = (stateFragment) =>
  stateFragment?.token_id ?? undefined;

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
  [RESET]: () => ({
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
  // (state, action : {type, payload})
  [READ_DIR_SUCCESS]: (state, { payload: { request, ...rest } }) => ({
    ...state,
    ...rest,
    readdirErrors: [],
    status: STATUS.resolved,
  }),

  // event
  [READ_DIR_ERROR]: (state, { payload: { error } }) => ({
    ...state,
    files: [],
    count: 0,
    readdirErrors: [...state.readdirErrors, error],
    status: STATUS.rejected,
  }),

  // document
  [SET_DIR_STATUS]: (state, { status }) => {
    return {
      ...state,
      status,
    };
  },

  // document
  [PUSH_FETCH_HIST]: (state, { payload: newRequest }) => ({
    ...state,
    requests: pushRequest(state?.requests ?? [], newRequest),
  }),
  // document
  [POP_FETCH_HIST]: (state) => ({
    ...state,
    requests: popRequest(state.requests)[1],
  }),

  // document
  [CLEAR_FETCH_HISTORY]: (state) => ({
    ...state,
    requests: undefined,
    readdirErrors: [],
    status: STATUS.idle,
  }),
});

// used in two situations:
// 1. read the last request (without setting state)
// 2. set state with the tail
function popRequest(requests) {
  if (requests === undefined) {
    return [undefined, undefined];
  }
  if (requests?.length === 0) {
    return [undefined, []];
  }
  const [head, ...tail] = requests;
  return [head, tail];
}
function peekLastRequest(requests, emptyValue = {}) {
  const maybeValue = popRequest(requests)[0];
  return maybeValue === undefined ? emptyValue : maybeValue;
}
function peekParentRequest(requests, emptyValue = {}) {
  const maybeTail = popRequest(requests)?.[1] ?? [];
  const maybeValue = popRequest(maybeTail)[0];
  return maybeValue === undefined ? emptyValue : maybeValue;
}
function pushRequest(requests, newRequest) {
  return [newRequest, ...requests];
}
export default reducer;
