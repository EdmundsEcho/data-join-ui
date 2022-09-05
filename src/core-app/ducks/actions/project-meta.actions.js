// src/ducks/actions/project-meta.actions

/**
 *
 * @module src/ducks/actions/project-meta.actions
 *
 */
import { STATUS } from '../../../hooks/use-status-provider';

export const CACHE_STATUS = STATUS;

// feature
export const META = '[Meta]';
export const feature = META;

// export const SET_PROJECT_ID = `${META} SET_PROJECT_ID`; // never use
export const SET_INITIALIZING_ACTIONS = `${META} SET_INITIALIZING_ACTIONS`; // document
export const SET_LAST_SAVED_ON = `${META} SET_LAST_SAVED_ON`; // document

export const RESET = `${META} RESET`; // document
export const CLEAR_INITIALIZING_ACTIONS = `${META} CLEAR_INITIALIZING_ACTIONS`; // document
export const SAVE_PROJECT = `${META} SAVE_PROJECT`; // command consumed by middleware

// actions to ignore in the save now routine
export const Actions = {
  SET_LAST_SAVED_ON,
};

export const saveProject = () => ({ type: SAVE_PROJECT });

export const setInitializingActions = (actions) => ({
  type: SET_INITIALIZING_ACTIONS,
  payload: actions,
});

export const reset = () => ({ type: RESET });

export const clearInitializingActions = () => ({
  type: CLEAR_INITIALIZING_ACTIONS,
});

// action-like: message that updates store on its way to server
// (by-passes redux)
export const resetMeta = (projectMeta) => {
  return {
    ...projectMeta,
    meta: { ...projectMeta.meta, initializingActions: [] },
  };
};
