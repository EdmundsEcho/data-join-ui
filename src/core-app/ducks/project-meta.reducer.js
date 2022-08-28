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

import { PURGE } from 'redux-persist';

import { MissingProjectIdError } from '../lib/LuciErrors';
import createReducer from '../utils/createReducer';

import {
  CLEAR_INITIALIZING_ACTIONS,
  SET_REDUX_TO_SAVED,
  SET_LAST_SAVED_ON,
  SET_CACHE_STATUS,
  SET_SAVE_STATUS,
  SAVE_PROJECT,
  SAVE_STATUS,
  RESET,
  CACHE_STATUS,
  setSaveStatus,
} from './actions/project-meta.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// used by subApp to initialize the state with a projectId
const initialState = (projectId) => {
  if (typeof projectId === 'undefined') {
    throw new MissingProjectIdError(
      'Cannot initialize redux: Missing project id',
    );
  }
  return {
    projectId,
    version: '0.3.9',
    meta: {
      cacheStatus: CACHE_STATUS.empty, // server supplied cache
      saveStatus: SAVE_STATUS.init, // occurs once with a new project
      lastSavedOn: undefined,
      // dispatched by the init.middleware
      initializingActions: [
        { type: PURGE },
        { type: RESET },
        { type: CLEAR_INITIALIZING_ACTIONS },
        { type: SAVE_PROJECT },
      ],
    },
  };
};

//------------------------------------------------------------------------------
//
// selectors
//
export const getProjectId = (stateFragment) => stateFragment.projectId;

export const getSaveStatus = (stateFragment) => stateFragment.meta.saveStatus;

export const isCacheStale = (stateFragment) =>
  stateFragment.meta?.cacheStatus === CACHE_STATUS.stale;

export const getCacheStatus = (stateFragment) =>
  stateFragment.meta?.cacheStatus ?? CACHE_STATUS.empty;

export const getInitializingActions = (stateFragment) =>
  stateFragment.meta?.initializingActions;

// maker: initial state object
export const seedProjectState = (projectId) => ({
  $_projectMeta: initialState(projectId),
});

//------------------------------------------------------------------------------
// Reducer
//------------------------------------------------------------------------------
/**
 *
 * The action types should all be `document` (see Programming with Actions)
 *
 */
//------------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  // do not change meta data
  RESET: (state) => state,
  [CLEAR_INITIALIZING_ACTIONS]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      initializingActions: [setSaveStatus(SAVE_STATUS.idle)],
    },
  }),
  [SET_REDUX_TO_SAVED]: (state) => ({
    ...state,
    meta: {
      ...state.meta,
      saveStatus: SAVE_STATUS.idle,
      cacheStatus: CACHE_STATUS.stale,
      lastSavedOn: Date.now(),
    },
  }),
  [SET_CACHE_STATUS]: (state, { value }) => ({
    ...state,
    meta: { ...state.meta, cacheStatus: value },
  }),
  [SET_LAST_SAVED_ON]: (state) => ({
    ...state,
    meta: { ...state.meta, lastSavedOn: Date.now() },
  }),
  [SET_SAVE_STATUS]: (state, { value }) => ({
    ...state,
    meta: { ...state.meta, saveStatus: value },
  }),
});

export default reducer;
