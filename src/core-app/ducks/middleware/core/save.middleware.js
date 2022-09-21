/**
 *
 * Single purpose middleware: Save the redux store state to the server
 * anytime the actions::document are called.
 *
 * 🔖 Calls the services/api directory. Does not utilize the more universal
 *    use-fetch-api hook that processes errors and meta.
 *
 * 🚧 Utilizes an the redux state to host a redirect and bookmark url. This
 *    is an untested feature.
 *
 * ✅ Will redirect to login when response is 401.  Otherwise, sends the error
 *    to the console (no error raising).
 *
 * @category middleware
 *
 */
import {
  META,
  SAVE_PROJECT, // flush the save machine
  Actions as MetaActions,
  setInitializingActions,
  saveProject,
  resetMeta,
} from '../../actions/project-meta.actions';
import { UPDATE_FILEFIELD } from '../../actions/headerView.actions';
import {
  ADD_DERIVED_FIELD,
  DELETE_FIELD,
  DELETE_DERIVED_FIELD,
  SET_ETL_VIEW,
  SET_ETL_FIELD_CHANGES,
  UPDATE_ETL_FIELD,
} from '../../actions/etlView.actions';
import { SET_TREE } from '../../actions/workbench.actions';
import { TAG_MATRIX_STATE, SET_MATRIX } from '../../actions/matrix.actions';
import { setNotification } from '../../actions/notifications.actions';
import { redirect } from '../../actions/ui.actions';
import { DesignError } from '../../../lib/LuciErrors';

import { saveStore as saveStoreApi } from '../../../../services/dashboard.api';
import debounce from '../../../utils/debounce';
import { colors } from '../../../constants/variables';

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
  $_projectMeta: saveWithThisUpdated,
  ...saveThis
}) => ({
  ...saveThis,
  $_projectMeta: resetMeta(saveWithThisUpdated),
});

let lastAction;
// -----------------------------------------------------------------------------
//
// ✅ Avoid mutating redux state when saving (e.g., no notifications)
// ✅ When fail to save, redirects to login with next action: save
// ✅ Middleware is the last middleware in the middleware cycle
//
const middleware =
  // ------------------------------
  // singleton for a given project
  // ------------------------------

  ({ getState, dispatch }) => {
    let saveManager;
    return (next) => async (action) => {
      //
      if (DEBUG) {
        console.info(`loaded save.middleware`);
        console.info(`%c🏁 END of middleware cycle`, colors.orange);
      }
      // --------------------------
      next(action);
      // --------------------------
      if (SAVE_PROJECT_ON) {
        switch (true) {
          //
          case typeof saveManager !== 'undefined' &&
            action.type !== SAVE_PROJECT:
            saveManager(action);
            break;

          // dispatched by the saveManager (and StepBar)
          case typeof saveManager !== 'undefined' &&
            action.type === SAVE_PROJECT: {
            const state = getState();
            try {
              if (DEBUG) {
                console.debug(
                  `%csave middleware lastAction: ${lastAction}`,
                  colors.yellow,
                );
              }
              const response = await saveStoreApi({
                projectId: state.$_projectMeta.projectId,
                store: saveThisState(state),
              });
              if (response.status === 401) {
                window.location.replace('/login');
                // next(setInitializingActions([saveProject()])); // only useful if using local persist
                // next(redirect('/login'));
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
          }

          // initialize the saveManager instance
          case typeof saveManager === 'undefined': {
            saveManager = saveReduxManager(() => {
              dispatch(saveProject());
            }, 1000);
            saveManager(action);
            break;
          }
          default:
            throw new DesignError(`🚫 Unreachable save.middleware`);
        }
      }
    };
  };
/**
 * Debounbed save project
 *
 * saves right-away when action type = SAVE_PROJECT.
 * Otherwise, triggered by "saveActions"
 *
 * @function
 * @param {Function} saveFn
 * @param {number} delay ms
 * @return {Function}
 */
function saveReduxManager(saveFn, delay = 1500) {
  const save = debounce(saveFn, delay);
  const saveNow = debounce(saveFn, 500, true /* immediate */);

  const closure = {
    trySave: (action) => {
      if (action?.type === SAVE_PROJECT) {
        lastAction = action.type;
        saveNow();
      } else if (saveAction(action?.type)) {
        lastAction = action.type;
        save();
      }
    },
  };

  return closure.trySave;
}

// selected actions::document
const WHITE_LIST = [
  UPDATE_FILEFIELD,
  UPDATE_ETL_FIELD,
  ADD_DERIVED_FIELD,
  SET_ETL_VIEW,
  SET_ETL_FIELD_CHANGES,
  DELETE_FIELD,
  DELETE_DERIVED_FIELD,
  SET_TREE,
  // TAG_MATRIX_STATE,
  SET_MATRIX,
];
const BLACK_LIST = [...Object.values(MetaActions), '@@INIT'];
const PREFIX = [];

// predicate to filter actions
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

export default middleware;
