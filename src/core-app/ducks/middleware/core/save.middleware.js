/**
 *
 * Single purpose middleware: Save the redux store state to the server
 * anytime the actions::document are called.
 *
 * @category middleware
 *
 */
import { PERSIST } from 'redux-persist';

import { saveStore as saveStoreApi } from '../../../../services/dashboard.api';

import {
  setCacheStatusStale,
  setLastSavedOn,
  setSaveStatus,
  SAVE_STATUS,
  SAVE_PROJECT, // flush the save machine
  Actions as MetaActions,
} from '../../actions/project-meta.actions';
import {
  SET_HVS_FIXES,
  UPDATE_FILEFIELD,
} from '../../actions/headerView.actions';
import { setNotification } from '../../actions/notifications.actions';
import { redirect } from '../../actions/ui.actions';

import { getSaveStatus } from '../../rootSelectors';

// import { colors } from '../../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_DASHBOARD === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
const SAVE_PROJECT_ON = process.env.REACT_APP_TURN_SAVE_FEATURE_ON === 'true';

// -----------------------------------------------------------------------------
// The parts of the store that we save to the server
export const saveThisState = ({
  _persist,
  notifications,
  modal,
  ui,
  ...saveThis
}) => saveThis;
// -----------------------------------------------------------------------------

// Middleware that is initialized with the projectId
const middleware = (projectId) => {
  let saveManager;

  return ({ getState }) =>
    (next) =>
    async (action) => {
      //
      if (DEBUG) {
        console.info(`loaded save.middleware: ${projectId}`);
        console.info(`%c🏁 END of middleware cycle`, 'color.orange');
      }

      next(action);

      // The rest of the middleware requires project_id
      if (typeof projectId !== 'undefined' && SAVE_PROJECT_ON) {
        //
        if (typeof saveManager !== 'undefined') {
          saveManager(action);
          return;
        }

        saveManager = saveReduxManager(async () => {
          try {
            const state = getState();
            if (getSaveStatus(state) !== SAVE_STATUS.saving) {
              next(setSaveStatus(SAVE_STATUS.saving));
              const response = await saveStoreApi({
                projectId,
                store: saveThisState(getState()),
              });

              if (response.status === 401) {
                next(redirect('/login'));
                return;
              }
              next(setCacheStatusStale());
              next(setSaveStatus(SAVE_STATUS.idle));
              next(setLastSavedOn());

              if (typeof action?.callback === 'function') {
                action.callback(response);
              }
            }
          } catch (e) {
            console.error(e);
            next(
              setNotification({
                message: e?.message ?? 'Save-store error',
                feature: 'SAVE_STORE',
              }),
            );
          }
        }, 10000);

        await saveManager(action);
      }
    };
};

function saveReduxManager(saveRoutine, waitingPeriod = 7000) {
  const states = {
    IDLE: 'IDLE: nothing to do',
    JOB_DONE: 'JOB_DONE: saved the image and nothing new to save',
    WAITING_TO_SAVE: 'WAITING_TO_SAVE: waiting for pause in action activity',
    SAVING: 'SAVING: awaiting completion of the save function',
  };

  let currentState = states.IDLE;
  let delayEngine;

  const save = async (delayEngineInner) => {
    currentState = states.SAVING;
    clearTimeout(delayEngineInner); // turn off the timer
    await saveRoutine();
    currentState = states.JOB_DONE;
  };

  // every action resets the timer
  const machine = {
    [states.IDLE]: () => {
      // next state
      currentState = states.WAITING_TO_SAVE;
      delayEngine = setTimeout(() => save(delayEngine), waitingPeriod);
    },
    [states.WAITING_TO_SAVE]: () => {
      // next state
      currentState = states.WAITING_TO_SAVE;
      delayEngine = setTimeout(() => save(delayEngine), waitingPeriod);
    },
    [states.JOB_DONE]: () => {
      // next state
      currentState = states.WAITING_TO_SAVE;
      delayEngine = setTimeout(() => save(delayEngine), waitingPeriod);
    },
    [states.SAVING]: () => {},
  };

  // function that generates side-effects with each new action
  return (action) => {
    if (action.type === SAVE_PROJECT) {
      save(delayEngine);
    } else if (saveNow(action.type)) {
      machine[currentState](action);
    }
  };
}

// prefixes that capture the actions::document
const WHITE_LIST = [UPDATE_FILEFIELD, 'RESET_PENDING_REQUESTS', SET_HVS_FIXES];
const BLACK_LIST = [Object.values(MetaActions)];
const PREFIX = ['ADD', 'REMOVE', 'SET'];

function saveNow(actionType) {
  if (typeof actionType === 'undefined') {
    return false;
  }
  // str.includes(substr)
  const guard =
    (PREFIX.some((prefix) => actionType.includes(prefix)) ||
      WHITE_LIST.some((whiteListType) => actionType === whiteListType)) &&
    BLACK_LIST.every((blackListType) => actionType !== blackListType);

  if (DEBUG) {
    const color = guard
      ? 'color: green; font-weight: bold'
      : 'color: red; font-weight: bold';
    console.log(`%c 🎉 about to save: ${actionType} -> save: ${guard}`, color);
  }

  return guard;
}

/*

// async functions
export function clearAgentCache(persistor) {
  return async (dispatch) => {
    try {
      await persistor.purge();
      dispatch({ type: 'PURGED_AGENT_CACHE' });
    } catch (e) {
      dispatch({ type: 'PURGE_ERROR', error: e });
    }
  };
}

  'SET_DIR_STATUS',
  'persist/REHYDRATE',
  ...Object.values(apiActions),

  'ADD',
  'DELETE',
  'REMOVE',
  'RESET',
  'SET',
  'UPDATE',
  'TAG_WAREHOUSE_STATE',
*/

export default middleware;
