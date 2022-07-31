// src/ducks/middleware/core/logging.middleware.js

/**
 * @module middleware/logging.middleware
 *
 */
import { diffObjects, colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
const LOG_ON = process.env.REACT_APP_LOG_REDUX_STATE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const loggingMiddleware = ({ getState }) => (next) => (action) => {
  if (DEBUG) {
    console.info('loaded logging.middleware');
    console.info(`%c🏁 END of middleware cycle`, colors.orange);
  }

  if (LOG_ON) {
    const prevState = getState();
    console.group(`%c${action.type}`, colors.blue);
    console.log('CURRENT STATE:');
    console.dir(prevState);
    console.group(`%cACTION`, colors.blue);
    console.dir(action);
    console.groupEnd();
    console.groupEnd();

    next(action);

    console.group('NEXT STATE *Changes*: ');
    const diff = diffObjects(prevState, getState());
    Object.keys(diff).length === 0
      ? console.log(`%cNo change`, colors.yellow)
      : console.dir(diff);
    console.groupEnd();
  } else {
    next(action);
  }
};

export default loggingMiddleware;
