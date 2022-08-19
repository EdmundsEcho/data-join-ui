/**
 *
 * Middleware initialized with the projectId
 *
 * Runs only when the store is first loaded.  The store may or may not be
 * a new or existing project.  It will retrieve and dispatch the initializing
 * actions read from the redux state.
 *
 * It will also purge the user-agent local state of any prior, now stale state.
 *
 * @category middleware
 *
 */
import { purgeStoredState } from 'redux-persist';
import { persistConfig } from '../../../redux-persist-cfg';

import { getInitializingActions } from '../../rootSelectors';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_DASHBOARD === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const middleware = (projectId) => {
  // ------------------------------
  let initializationLatch = 'OPEN';
  // ------------------------------
  return ({ getState }) =>
    (next) =>
    async (action) => {
      //
      if (DEBUG) {
        console.info('%c🟢 start of middleware cycle', 'color:orange');
        console.info(`loaded init.middleware: ${projectId}`);
      }

      if (initializationLatch === 'CLOSED') {
        console.info(`%c 📌 CLOSED`, 'color.orange');
        next(action);
        return;
      }

      console.info(`%c 👉 👉 OPEN`, 'color.orange');
      initializationLatch = 'CLOSED';

      // clear the user-agent's persisted state
      try {
        await purgeStoredState(persistConfig);
        await purgeStoredState(persistConfig);
      } catch (e) {
        console.error(`Failed to purge local state`);
        console.dir(e);
      }

      const initializingActions = getInitializingActions(getState()) || [];
      initializingActions.forEach(next);
      next({ type: 'PING' });

      next(action);
    };
};

export default middleware;
