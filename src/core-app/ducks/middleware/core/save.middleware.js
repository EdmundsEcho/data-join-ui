/**
 *
 * Single purpose middleware: Save the redux store state to the server
 * anytime the actions::document are called.
 *
 * @category middleware
 *
 */
import { FLUSH } from 'redux-persist';

import { saveStore as saveStoreApi } from '../../../../services/dashboard.api';
import debounce from '../../../utils/debounce';

import {
  META,
  SAVE_PROJECT, // flush the save machine
  Actions as MetaActions,
  setInitializingActions,
  saveProject,
  resetMeta,
} from '../../actions/project-meta.actions';
import {
  SET_HVS_FIXES,
  UPDATE_FILEFIELD,
} from '../../actions/headerView.actions';
import {
  ADD_DERIVED_FIELD,
  DELETE_FIELD,
  DELETE_DERIVED_FIELD,
  SET_ETL_VIEW,
  SET_ETL_FIELD_CHANGES,
  UPDATE_ETL_FIELD,
} from '../../actions/etlView.actions';
import { setNotification } from '../../actions/notifications.actions';
import { redirect } from '../../actions/ui.actions';

import { DesignError } from '../../../lib/LuciErrors';

import { colors } from '../../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_DASHBOARD === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
const SAVE_PROJECT_ON =
  false && process.env.REACT_APP_TURN_SAVE_FEATURE_ON === 'true';

// -----------------------------------------------------------------------------
// The parts of the store that we save to the server
export const saveThisState = ({
  _persist,
  notifications,
  modal,
  ui,
  $_projectMeta: saveWithThisUpdated,
  ...saveThis
}) => ({
  ...saveThis,
  $_projectMeta: resetMeta(saveWithThisUpdated),
});

let lastAction;
let saveManager;
// -----------------------------------------------------------------------------
//
// ✅ Initialized with projectId to ensure data integrity
// ✅ Avoid mutating redux state when saving (e.g., no notifications)
// ✅ When fail to save, redirects to login with next action: save
// ✅ Middleware is the last middleware in the middleware cycle
//
const middleware =
  // ------------------------------
  // singleton for a given project
  // ------------------------------


    ({ getState, dispatch }) =>
    (next) =>
    async (action) => {
      //
      if (DEBUG) {
        console.info(`loaded save.middleware`);
        console.info(`%c🏁 END of middleware cycle`, colors.orange);
      }
      // --------------------------
      next(action);
      // --------------------------

      // The rest of the middleware requires project_id
      if (typeof projectId !== 'undefined' && SAVE_PROJECT_ON) {
        //
        switch (true) {
          //
          case typeof saveManager !== 'undefined' &&
            action.type !== SAVE_PROJECT:
            await saveManager(action);
            break;

          // dispatched by the saveManager (and StepBar)
          case typeof saveManager !== 'undefined' &&
            action.type === SAVE_PROJECT:
            try {
              if (DEBUG) {
                console.debug(
                  `%csave middleware lastAction: ${lastAction}`,
                  colors.yellow,
                );
              }
              const state = getState();
              const response = await saveStoreApi({
                projectId: state.$_projectMeta.projectId,
                store: saveThisState(state),
              });

              if (response.status === 401) {
                next(setInitializingActions([saveProject()]));
                next(redirect('/login'));
              }
            } catch (e) {
              console.error(e);
              dispatch(
                setNotification({
                  message: e?.message ?? 'Error: save store',
                  feature: META,
                }),
              );
            }
            break;

          //
          case typeof saveManager === 'undefined': {
            saveManager = saveReduxManager(() => {
              dispatch(saveProject());
            }, 1000);
            await saveManager(action);
            break;
          }
          default:
            throw new DesignError(`🚫 Unreachable save.middleware`);
        }
      }
    };

function saveReduxManager(saveFn, delay = 7000) {
  const save = debounce(saveFn, delay);

  const closure = {
    trySave: (action) => {
      if (saveAction(action?.type)) {
        lastAction = action.type;
        save();
      }
    },
  };

  return closure.trySave;
}

// prefixes that capture the actions::document
const WHITE_LIST = [
  UPDATE_FILEFIELD,
  UPDATE_ETL_FIELD,
  ADD_DERIVED_FIELD,
  SET_ETL_VIEW,
  SET_ETL_FIELD_CHANGES,
  DELETE_FIELD,
  DELETE_DERIVED_FIELD,
  // `${ETL_VIEW} ${SET_LOADER} done`,
];
const BLACK_LIST = [...Object.values(MetaActions), '@@INIT'];
// const PREFIX = ['ADD', 'REMOVE'];
const PREFIX = [];

function saveAction(actionType) {
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
      ? `${colors.green}; font-weight: bold`
      : `${colors.red}; font-weight: bold`;
    console.debug(
      `%c 📋 About to save: ${actionType} -> save: ${guard}`,
      color,
    );
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
