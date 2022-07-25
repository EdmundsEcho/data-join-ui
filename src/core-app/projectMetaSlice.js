import { createSlice } from '@reduxjs/toolkit'

export const slice = createSlice({
  name: 'projectMeta',
  initialState: {
    version: '0.3.1',
    meta: {
      projectId: undefined,
      status: 'EMPTY',
      lastSaved: undefined,
      loading: false /* @EC capture when writing to api */,
    },
  },
  reducers: {
    setStatus: (state, action) => {
      state.meta.status = action.payload
    },
    setProjectId: (state, action) => {
      state.meta.projectId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setStatus, setProjectId } = slice.actions

// selectors
export const getProjectId = (state) => state.projectMeta.meta.projectId

export default slice.reducer
