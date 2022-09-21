// src/ducks/project-meta.reducer.js

/**
 *
 * Hosts the project-specific meta data
 *
 *
 * @module ducks/projectMeta-reducer
 * @category Reducers
 *
 */

// import { PURGE } from 'redux-persist';

import { MissingProjectIdError } from '../lib/LuciErrors';
import createReducer from '../utils/createReducer';

import {
  LOAD_PROJECT_STATUS as LOAD_STATUS,
  SET_LOAD_PROJECT_STATUS,
  CLEAR_INITIALIZING_ACTIONS,
  SET_INITIALIZING_ACTIONS,
  SAVE_PROJECT,
  RESET,
} from './actions/project-meta.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
//
// selectors
//
export const getProjectId = (stateFragment) => stateFragment.projectId;
export const getLoadingProjectStatus = (stateFragment) =>
  stateFragment.meta.loadingStatus;
export const getInitializingActions = (stateFragment) =>
  stateFragment.meta?.initializingActions;

// -----------------------------------------------------------------------------
// Utility functions
/** ----------------------------------------------------------------------------
 * Return either the serverResponse or newStore
 * ... newStore when server store is null.
 *
 * @function
 * @param {String} projectId
 * @param {Object} serverResponse
 * @return {Object}
 */
export const loadStore = (serverResponse) => {
  // process server response
  if (serverResponse === null) {
    return null;
  }
  const { project_id: projectId, store } = serverResponse;

  // default for a new project
  const newStore = {
    $_projectMeta: {
      projectId,
      version: '0.3.6',
      meta: {
        loadingStatus: LOAD_STATUS.EMPTY,
        lastSavedOn: undefined,
        // dispatched by the init.middleware
        initializingActions: [
          { type: RESET },
          { type: CLEAR_INITIALIZING_ACTIONS },
          { type: SAVE_PROJECT },
        ],
      },
    },
  };
  return store === null ? newStore : store;
};
//------------------------------------------------------------------------------
const resetState = {
  projectId: null,
  version: '0.3.6',
  meta: { loadingStatus: LOAD_STATUS.UNINITIALIZED },
};
//------------------------------------------------------------------------------
// Reducer
// action types :: document
//------------------------------------------------------------------------------
const reducer = createReducer(resetState, {
  // do not change meta data
  RESET: () => resetState,
  [CLEAR_INITIALIZING_ACTIONS]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      initializingActions: [],
    },
  }),
  [SET_INITIALIZING_ACTIONS]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      initializingActions: payload,
    },
  }),
  [SET_LOAD_PROJECT_STATUS]: (state, { payload }) => ({
    ...state,
    meta: {
      ...state.meta,
      loadingStatus: payload,
    },
  }),
});

export default reducer;
