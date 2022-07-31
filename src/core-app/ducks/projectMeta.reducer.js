// src/ducks/projectMeta.reducer.js
/**
 *
 * Hosts the project-specific meta data
 *
 * Constructed using redux-tools slice maker
 *
 * @module ducks/projectMeta-reducer
 *
 * @category Reducers
 *
 */
import { createSlice } from '@reduxjs/toolkit';
import { STATUS as CACHE_STATUS } from '../../hooks/use-status-provider';

export const SAVE_STATUS = {
  idle: 'idle',
  loading: 'loading',
  error: 'error',
  init: 'new redux state',
};

// used by subApp to initialize the state with a projectId
const initialState = (projectId = undefined) => ({
  projectId,
  version: '0.3.9',
  meta: {
    cacheStatus: CACHE_STATUS.empty,
    lastSavedOn: undefined,
    saveStatus: SAVE_STATUS.init, // occurs once with a new project
  },
});
export const slice = createSlice({
  name: '_projectMeta',
  initialState: initialState(),
  /* eslint-disable no-param-reassign  */
  reducers: {
    setCacheStatus: (state, action) => {
      state.meta.cacheStatus = action.payload;
    },
    setProjectId: (state, action) => {
      state.projectId = action.payload;
    },
    setSaveStatus: (state, action) => {
      state.meta.saveStatus = action.payload;
    },
    setLastSavedOn: (state) => {
      state.meta.lastSavedOn = Date.now();
    },
  },
  /* eslint-enable no-param-reassign  */
});

// Action creators are generated for each case reducer function
// see actions
export const {
  setCacheStatus,
  setProjectId,
  setLastSavedOn,
  setSaveStatus,
  setCacheStatusStale = () => {
    return setCacheStatus(CACHE_STATUS.stale);
  },
  setSaveStatusLoading = () => setSaveStatus(SAVE_STATUS.loading),
  setSaveStatusDone = () => setSaveStatus(SAVE_STATUS.idle),
  setSaveStatusError = () => setSaveStatus(SAVE_STATUS.error),
} = slice.actions;

//------------------------------------------------------------------------------
//
// selectors
// 🔖 For now not using the global selectors to signal the line between
//    the dashboard and the project (core-app).
//
export const getProjectId = (stateFragment) => stateFragment.projectId;
export const getSaveStatus = (stateFragment) => stateFragment.meta.saveStatus;
export const initRedux = (stateFragment) =>
  stateFragment.meta.saveStatus === SAVE_STATUS.init;
export const getCacheStatus = (stateFragment) =>
  stateFragment.meta?.cacheStatus ?? CACHE_STATUS.empty;
export const seedProjectState = (projectId) => ({
  _projectMeta: initialState(projectId),
});
//------------------------------------------------------------------------------

export default slice.reducer;
