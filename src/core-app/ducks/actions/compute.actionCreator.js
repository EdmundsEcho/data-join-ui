// /src/ducks/actions/compute.actionCreator.js

/**
 * @module actions/compute.actions
 *
 * @description
 * Maker for the ui to generate a standard `compute`.  It is not like other
 * action creators in that it serves to facilitate communication within a feature
 * (e.g., between feature ui and feature middleware). This facilitation is what
 * is being reused by definition of the is implementation.
 *
 * Action: ui command --Action made here->  feature middleware -> document
 *
 * These actions do not impact the redux store. The middleware's interpretation
 * of the action does the documenting.
 *
 * Key word: Facilitator
 * Similar to: makeActionCreator
 *
 * Usage: Re-export from feature.actions.js
 *
 */
// import { colors } from '../../constants/variables';

// The interface that is imported by features to facilitate
// command -> compute middleware
export const COMPUTE = 'COMPUTE'; // command
export const ERROR = 'COMPUTE ERROR'; // event
export const TIMED_OUT = 'COMPUTE TIMED_OUT'; // event

//------------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
//------------------------------------------------------------------------------

/**
 *
 * Action :: command
 *
 */
export const makeComputeAction = (feature, type, payload) => {
  return {
    type,
    payload,
    meta: { feature },
  };
};

// event
// caller: middleware
// receiver: feature.middleware
export const computeEventTimedOut = ({ feature, ...args }) => ({
  ...args,
  feature,
  type: `${feature} ${TIMED_OUT}`,
});

// event
// caller: middleware
// receiver: feature.middleware
export const computeEventError = ({ feature, ...args }) => ({
  ...args,
  feature,
  type: `${feature} ${ERROR}`,
});
