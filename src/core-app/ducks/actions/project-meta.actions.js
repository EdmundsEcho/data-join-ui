// src/ducks/actions/project-meta.actions

/**
 *
 * @module src/ducks/actions/project-meta.actions
 *
 */
export { STATUS as LOAD_PROJECT_STATUS } from '../../lib/sum-types';

// feature
export const META = '[Meta]';
export const feature = META;

// export const SET_PROJECT_ID = `${META} SET_PROJECT_ID`; // never use
export const SET_INITIALIZING_ACTIONS = `${META} SET_INITIALIZING_ACTIONS`; // document
export const SET_LAST_SAVED_ON = `${META} SET_LAST_SAVED_ON`; // document

export const RESET = `${META} RESET`; // document
export const CLEAR_INITIALIZING_ACTIONS = `${META} CLEAR_INITIALIZING_ACTIONS`; // document
export const SAVE_PROJECT = `${META} SAVE_PROJECT`; // command consumed by middleware
export const LOAD_PROJECT = `${META} LOAD_PROJECT`; // command thunk -> document
export const SET_LOAD_PROJECT_STATUS = `${META} SET_LOAD_PROJECT_STATUS`; // command thunk -> document

// actions to ignore in the save now routine
export const Actions = {
  SET_LAST_SAVED_ON,
};

export const saveProject = () => ({ type: SAVE_PROJECT });
export const loadProject = (payload) => ({
  type: LOAD_PROJECT,
  meta: { feature },
  payload,
});
export const setLoadProjectStatus = (payload) => ({
  type: SET_LOAD_PROJECT_STATUS,
  payload,
});

export const setInitializingActions = (actions) => ({
  type: SET_INITIALIZING_ACTIONS,
  payload: actions,
});

export const reset = (caller) => ({ type: RESET, caller });

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
