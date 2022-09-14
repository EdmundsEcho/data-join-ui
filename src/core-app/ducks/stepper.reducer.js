// src/ducks/stepper.reducer.js

/**
 *
 * This reducer is part of the saved project state. It may be
 * useful to help restore the user's location in the process.
 *
 * The StepBar component dispatches change to this reducer.
 *
 * @category Reducers
 * @module ducks/stepper-reducer
 *
 */

import createReducer from '../utils/createReducer';
import { SET_CURRENT_PAGE, SET_BOOKMARK } from './actions/stepper.actions';
import { RESET } from './actions/project-meta.actions';
import { ROUTES } from '../lib/sum-types';

// ----------------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------------
export const isHidden = (stateFragment) => stateFragment.isHidden;
export const getBookmark = (stateFragment) => stateFragment.bookmark;

// ----------------------------------------------------------------------------
// Initial state
// ----------------------------------------------------------------------------
export const initialState = {
  isHidden: false,
  currentPage: undefined,
  bookmark: ROUTES.meta,
};

// ----------------------------------------------------------------------------
// The Reducer
// ----------------------------------------------------------------------------
const reducer = createReducer(initialState, {
  [RESET]: () => initialState,

  RESET_STEPPER: () => initialState,

  [SET_CURRENT_PAGE]: (state, { payload }) => ({
    ...state,
    currentPage: payload,
  }),
  // route name (e.g., meta, files, fields, etc. )
  [SET_BOOKMARK]: (state, { payload }) => ({
    ...state,
    bookmark: payload,
  }),
});

export default reducer;
