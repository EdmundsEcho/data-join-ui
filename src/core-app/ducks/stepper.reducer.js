// src/ducks/stepper.reducer.js

/**
 * @module ducks/stepper-reducer
 *
 * @description
 * Tracks progress within the Etl configuration process.
 *
 * @todo complete the description
 * How does it control the flow.  Is each reducer (for each phase) respondible
 * for updating the value of this property? If so, what is the mechanism.
 *
 *
 * @category Reducers
 *
 */

import createReducer from '../utils/createReducer';
import { SET_CURRENT_PAGE } from './actions/stepper.actions';
import { RESET } from './actions/project-meta.actions';

// Selector
export const isHidden = (stateFragment) => stateFragment.isHidden;

export const initialState = {
  currentPage: undefined,
};

const reducer = createReducer(initialState, {
  [RESET]: () => initialState,
  RESET_STEPPER: () => initialState,
  [SET_CURRENT_PAGE]: (state, { currentPage }) => ({
    ...state,
    currentPage,
  }),
});

export default reducer;
