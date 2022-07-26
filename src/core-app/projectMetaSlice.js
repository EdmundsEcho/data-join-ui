import { createSlice } from '@reduxjs/toolkit'
import { STATUS as CACHE_STATUS } from '../hooks/use-status-provider'

export const SAVE_STATUS = {
  idle: 'idle',
  loading: 'loading',
  error: 'error',
}

export const slice = createSlice({
  name: 'projectMeta',
  initialState: {
    version: '0.3.2',
    meta: {
      projectId: undefined,
      cacheStatus: CACHE_STATUS.empty,
      lastSavedOn: undefined,
      saveStatus: SAVE_STATUS.idle,
    },
  },
  reducers: {
    setCacheStatus: (state, action) => {
      state.meta.cacheStatus = action.payload
    },
    setProjectId: (state, action) => {
      state.meta.projectId = action.payload
    },
    setSaveStatus: (state, action) => {
      state.meta.saveStatus = action.payload
    },
    setLastSavedOn: (state, action) => {
      state.meta.lastSavedOn = Date.now()
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  setCacheStatus,
  setProjectId,
  setLastSavedOn,
  setSaveStatus,
  setCacheStatusStale = () => {
    return setCacheStatus(CACHE_STATUS.stale)
  },
  setSaveStatusLoading = () => setSaveStatus(SAVE_STATUS.loading),
  setSaveStatusDone = () => setSaveStatus(SAVE_STATUS.idle),
  setSaveStatusError = () => setSaveStatus(SAVE_STATUS.error),
} = slice.actions

// selectors
export const getProjectId = (state) => state.projectMeta.meta.projectId
export const getSaveStatus = (state) => state.projectMeta.meta.saveStatus
export const getCacheStatus = (state) => state.projectMeta.meta.cacheStatus

export default slice.reducer
