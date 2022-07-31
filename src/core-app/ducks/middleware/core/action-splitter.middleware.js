/**
 * Core middleware to convert an array of actions into individual
 * messages.
 */

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const actionSplitterMiddleware = ({ dispatch }) => (next) => (action) => {
  if (DEBUG) {
    console.info(`%c🚧 Start of core-middleware array`, colors.light.purple);
    console.info('loaded action-splitter.middleware');
  }

  if (Array.isArray(action)) {
    action.forEach((action_) => dispatch(action_));
  } else {
    next(action);
  }
};

export default actionSplitterMiddleware;
