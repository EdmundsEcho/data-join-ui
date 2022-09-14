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
// local storage
// import { purgePersistedState, clearIdb } from '../../../redux-persist-cfg';
// import { getInitializingActions } from '../../rootSelectors';
//
// loading a new project
import {
  loadProject,
  setLoadProjectStatus,
  LOAD_PROJECT,
} from '../../actions/project-meta.actions';
import { fetchStore as fetchServerStore } from '../../../services/api';
import { apiEventError } from '../../actions/api.actions';
import { STATUS as FETCH_STATUS } from '../../../lib/sum-types';
import { loadStore as loadNewOrSavedStore } from '../../project-meta.reducer';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_DASHBOARD === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const middleware = () => (next) => (action) => {
  //
  if (DEBUG) {
    console.info('%c🟢 start of middleware cycle', 'color:orange');
    console.info(`loaded init.middleware`);
  }
  // 🔖 the action first hosts an object, then a function.  The latter
  //    can pass through this middleware if the thunk middleware dispatches
  //    using dispatch instead of next.
  return action.type === LOAD_PROJECT && typeof action.payload !== 'function'
    ? next(loadProjectThunk(action.payload)) // payload is projectId
    : next(action);
};

//------------------------------------------------------------------------------
/**
 * Loads the store using the projectId supplied by the url.
 * "One of a kind" function in the app. Consumed by thunk.middleware.
 *
 * ✨ The LOAD_PROJECT action :: document is processed by a root reducer
 *    (see combineReducer)
 *
 * 🔑 the loadProject action payload value changes as it goes through
 *    the chain of middleware:
 *
 * 1. the component useParams: route -> projectId
 * 2. init.middleware: projectId -> thunk
 * 3. thunk.middleware: thunk -> store
 *
 * @function
 * @param {string} projectId
 * @return {Thunk}
 *
 */
function loadProjectThunk(projectId) {
  return loadProject(
    /* thunk */
    (dispatch /* getState */) =>
      fetchServerStore({ projectId })
        .then((response) => {
          const loadThisStore = loadNewOrSavedStore(projectId, response.data);
          dispatch(loadProject(loadThisStore));
          dispatch(setLoadProjectStatus(FETCH_STATUS.RESOLVED));
        })
        .catch((error) => {
          dispatch(setLoadProjectStatus(FETCH_STATUS.REJECTED));
          dispatch(apiEventError(error));
        }),
  );
}
export default middleware;

/*
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
*/
