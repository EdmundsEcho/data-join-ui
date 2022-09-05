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
import { purgePersistedState, clearIdb } from '../../../redux-persist-cfg';

import { getInitializingActions } from '../../rootSelectors';

// -----------------------------------------------------------------------------
const DEBUG =
  true ||
  process.env.REACT_APP_DEBUG_DASHBOARD === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const middleware = (projectId) => {
  // ------------------------------
  // singleton for a given project
  let initializationLatch = 'OPEN';
  // ------------------------------

  return ({ getState }) =>
    (next) =>
    (action) => {
      //
      if (DEBUG) {
        console.info('%c🟢 start of middleware cycle', 'color:orange');
        console.info(`loaded init.middleware: ${projectId}`);
      }
      if (initializationLatch === 'CLOSED') {
        if (DEBUG) console.info(`%c 📌 CLOSED`, 'color.orange');
        // --------------------------
        next(action);
        // --------------------------
        return;
      }

      console.info(`%c 👉 👉 OPEN`, 'color.orange');

      // Initialize when OPEN
      // clearIdb().then(() => {
      purgePersistedState().then(() => {
        initializationLatch = 'CLOSED';
        console.info(`%cCleared the LOCAL STORAGE`, 'color.yellow');
        // introduce initializing actions (before next state)
        const initializingActions = getInitializingActions(getState()) || [];
        initializingActions.forEach(next);
        // --------------------------
        next(action);
        // --------------------------
      });
    };
};

export default middleware;
