/**
 *
 * Single purpose middleware: Save the redux store state to the server
 * anytime the actions::document are called.
 *
 * @category middleware
 *
 */
import { saveStore as saveStoreApi } from '../../../../services/dashboard.api';
import { getProjectId, initRedux } from '../../rootSelectors';
import {
  setCacheStatusStale,
  setLastSavedOn,
  setSaveStatus,
  SAVE_STATUS,
} from '../../actions/projectMeta.actions';
import { setNotification } from '../../actions/notifications.actions';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// prefixes that capture the actions::document
const SAVE_PREFIXES = [
  'ADD',
  'DELETE',
  'REMOVE',
  'RESET',
  'SET',
  'UPDATE',
  'SAVE_PROJECT',
  'TAG_WAREHOUSE_STATE',
  'SAVE_REDUX', // saveNow
];
const BLACK_LIST = [];

const middleware =
  ({ getState, persistor }) =>
  (next) =>
  (action) => {
    console.debug(
      `🧮  middleware action: ${action?.type ?? 'action type: undefined'}`,
    );
    // dispatch the action in action.type with the closure

    // about to be returned.
    next(action);

    if (DEBUG) {
      console.info('loaded save.middleware');
      console.info(`%c🏁 END of middleware cycle`, 'color.orange');
    }
    const state = getState();

    if (initRedux(state)) {
      clearAgentCache(persistor);
      // send out a "saveNow" action
      const projectId = getProjectId(state);
      saveStoreApi({ projectId, store: state });
      next(setSaveStatus(SAVE_STATUS.idle));
    }
    //
    // Tasks
    //
    // ✅ Predicate actions that mutate the reducer (action::document)
    // ✅ Set the parent cache flag to stale
    // ✅ Send redux-store to backend (saveProject)
    // ✅ Update projectMeta to reflect the "saving" state
    //
    else if (saveNow(action.type)) {
      try {
        const projectId = getProjectId(state);
        if (typeof projectId === 'undefined') {
          console.dir(state);
          throw new Error(`save-store: Missing projectId: ${projectId}`);
        }

        next(setSaveStatus(SAVE_STATUS.loading));

        // 📬 Send to server
        // ⬜ Broken - does not forward when 401
        const response = saveStoreApi({ projectId, store: state });

        if (response.status === 401) {
          next(setSaveStatus(SAVE_STATUS.error));
          window.location('/login');
          return;
        }

        // dispatch actions to update projectMeta state
        console.debug(`Action --------------`);
        console.dir(setCacheStatusStale());
        next(setCacheStatusStale());
        next(setLastSavedOn());
        next(setSaveStatus(SAVE_STATUS.idle));
      } catch (e) {
        console.error(e);
        setNotification({
          message: e?.message ?? 'Save-store error',
          feature: 'SAVE_STORE',
        });
      }
      // finally { }
    }
  };

function saveNow(actionType) {
  if (typeof actionType === 'undefined') {
    return false;
  }
  // str.includes(substr)
  const guard =
    SAVE_PREFIXES.some((prefix) => actionType.includes(prefix)) &&
    BLACK_LIST.every((prefix) => !actionType.includes(prefix));
  const color = guard
    ? 'color: green; font-weight: bold'
    : 'color: red; font-weight: bold';
  console.log(`%c 🎉 about to save: ${actionType} -> save: ${guard}`, color);
  return guard;
}

function clearAgentCache(persistor) {
  return async (dispatch) => {
    try {
      await persistor.purge();
      dispatch({ type: 'PURGED_AGENT_CACHE' });
    } catch (e) {
      dispatch({ type: 'PURGE_ERROR', error: e });
    }
  };
}

// prettier-ignore
export default middleware;
