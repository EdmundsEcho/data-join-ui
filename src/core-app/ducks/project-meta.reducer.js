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
  CLEAR_INITIALIZING_ACTIONS,
  SET_INITIALIZING_ACTIONS,
  SAVE_PROJECT,
  RESET,
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
    version: '0.3.5',
    meta: {
      lastSavedOn: undefined,
      // dispatched by the init.middleware
      initializingActions: [
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
});

export default reducer;
