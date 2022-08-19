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
import { TYPES } from './actions/stepper.actions';
import { RESET } from './actions/project-meta.actions';

// Selector
export const isHidden = (stateFragment) => stateFragment.isHidden;

export const initialState = {
  isHidden: true,
  isPrevDisabled: true,
  isNextDisabled: true,
  registeredNextStep: {},
  steps: [
    {
      route: '/',
      displayName: 'Overview',
      showStepper: false,
      showNavigation: false,
    },
    {
      route: 'files',
      displayName: 'Select Files',
      showStepper: true,
      showNavigation: true,
    },
    {
      route: 'fields',
      displayName: 'Configure Fields',
      showStepper: true,
      showNavigation: true,
    },
    {
      route: 'pending',
      displayName: 'Building ETL',
      canBacktrack: false, // Used to prevent workbench backtracking to this page
      showStepper: true,
      showNavigation: true,
    },
    {
      route: 'workbench',
      displayName: 'Workbench',
      showStepper: true,
      showNavigation: true,
    },
  ],
};

const reducer = createReducer(initialState, {
  [RESET]: () => initialState,
  RESET_STEPPER: () => initialState,
  [TYPES.REGISTER_NEXT_ROUTE]: (state, nextStep) => {
    return {
      ...state,
      registeredNextStep: nextStep,
    };
  },
  [TYPES.ENABLE_NEXT_STEP]: (state) => ({
    ...state,
    isNextDisabled: false,
  }),
  [TYPES.DISABLE_NEXT_STEP]: (state) => ({
    ...state,
    isNextDisabled: true,
  }),
  [TYPES.ENABLE_PREV_STEP]: (state) => ({
    ...state,
    isPrevDisabled: false,
  }),
  [TYPES.DISABLE_PREV_STEP]: (state) => ({
    ...state,
    isPrevDisabled: true,
  }),
  [TYPES.HIDE]: (state) => ({
    ...state,
    isHidden: true,
  }),
  [TYPES.SHOW]: (state) => ({
    ...state,
    isHidden: false,
  }),
});

export default reducer;
