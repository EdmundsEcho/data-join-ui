// src/ducks/actions/project-meta.actions

/**
 *
 * @module src/ducks/actions/project-meta.actions
 *
 */
import { PURGE } from 'redux-persist';

import { STATUS } from '../../../hooks/use-status-provider';

export const CACHE_STATUS = STATUS;
export const SAVE_STATUS = {
  idle: 'idle',
  loading: 'loading',
  saving: 'saving',
  error: 'error',
  init: 'new redux state',
};

// feature
export const META = '[Meta]';

// export const SET_PROJECT_ID = `${META} SET_PROJECT_ID`; // never use
export const SET_CACHE_STATUS = `${META} SET_CACHE_STATUS`; // document
export const SET_LAST_SAVED_ON = `${META} SET_LAST_SAVED_ON`; // document
export const SET_SAVE_STATUS = `${META} SET_SAVE_STATUS`; // document

export const RESET = `${META} RESET`; // document
export const CLEAR_INITIALIZING_ACTIONS = `${META} CLEAR_INITIALIZING_ACTIONS`; // document
export const SAVE_PROJECT = `${META} SAVE_PROJECT`; // command consumed by middleware

// actions to ignore in the save now routine
export const Actions = {
  SET_SAVE_STATUS,
  SET_CACHE_STATUS,
  SET_LAST_SAVED_ON,
};

export const reset = () => ({ type: RESET });
export const clearInitializingActions = () => ({
  type: CLEAR_INITIALIZING_ACTIONS,
});

// action kind :: document
export const setLastSavedOn = (value) => ({ type: SET_LAST_SAVED_ON, value });
export const setSaveStatus = (value) => ({ type: SET_SAVE_STATUS, value });

// External Cache
export const setCacheStatus = (value) => ({ type: SET_CACHE_STATUS, value });

export const setCacheStatusStale = () => ({
  type: SET_CACHE_STATUS,
  value: CACHE_STATUS.stale,
});
export const setCacheStatusLoading = () => ({
  type: SET_CACHE_STATUS,
  value: CACHE_STATUS.loading,
});
export const setCacheStatusDone = () => ({
  type: SET_CACHE_STATUS,
  value: CACHE_STATUS.idle,
});
export const setCacheStatusError = () => ({
  type: SET_CACHE_STATUS,
  value: CACHE_STATUS.error,
});
