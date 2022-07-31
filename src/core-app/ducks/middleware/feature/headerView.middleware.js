// src/ducks/middleware/feature/headerView.middleware.js

/**
 * @module middleware/feature/headerView.middleware
 */
import {
  TYPES, // pass-through document
  UPDATE_WIDE_TO_LONG_FIELDS, // command
  setWideToLongFieldsInHv, // document
  HEADER_VIEW, // feature
  FETCH_HEADER_VIEW, // command
  CANCEL_HEADER_VIEW, // command
  addHeaderView, // document
  cancelHeaderView, // command called when error
  removeHeaderView, // document
  addToSelectedList, // document
  addInspectionError, // document
  removeInspectionError, // document
  setFixedHeaderViews, // document
  setHvsFixes, // document
  setHvFieldLevels, // document
} from '../../actions/headerView.actions';
import { tagWarehouseState } from '../../actions/workbench.actions';
import {
  POLLING_RESOLVED,
  POLLING_ERROR,
  apiFetch,
  apiCancel,
  pollingEventError,
  validateEventInterface,
} from '../../actions/api.actions';
import { setNotification } from '../../actions/notifications.actions';
import {
  ServiceConfigs,
  getServiceType,
  getLevels,
} from '../../../services/api';

import { SOURCE_TYPES, PURPOSE_TYPES } from '../../../lib/sum-types';

import { normalizer as fileToHeaderView } from '../../../lib/filesToEtlUnits/file-to-header';
import { updateWideToLongFields } from '../../../lib/filesToEtlUnits/transforms/wide-to-long-fields';

// 📖 data
import {
  getHeaderViewsFixes,
  selectHeaderView,
  selectFieldInHeader,
} from '../../rootSelectors';

// ⚙️  Action makers for fixes presented in the errorContext
import { lazyFixes } from '../../../lib/feedback/fixes/lazy-fixes';
import { ACTION_TYPE as FIX } from '../../../lib/feedback/error-with-lazy-action-fix';

import {
  ApiCallError,
  ApiResponseError,
  InvalidStateError,
} from '../../../lib/LuciErrors';
import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const MAX_TRIES = 15;

/* --------------------------------------------------------------------------- */
/**
 * Receives commands from the ui. Dispatches actions to api. Does not dispatch
 * to redux directly.
 *
 * @middleware
 */
const middleware =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    //
    if (DEBUG) {
      console.info(`%c🟢 Start of middleware cycle`, colors.orange);
      console.info('👉 loaded headerView.middleware');
    }

    if (action.type === 'PING')
      console.log(
        `%cPING recieved by headerView.middleware`,
        colors.light.purple,
      );

    const { isValid, getData } =
      ServiceConfigs[getServiceType(HEADER_VIEW)].response;

    // dispatch the current action in action.type with the closure that is
    // about to be returned.
    next(action);

    switch (action.type) {
      // -------------------------------------------------------------------------
      // Fire-up the api core service
      // -------------------------------------------------------------------------
      // map feature command -> api command
      // ui perspective -> api perspective
      // fetchHeaderView -> apiFetch
      // -------------------------------------------------------------------------
      case FETCH_HEADER_VIEW: {
        try {
          if (!action?.path) {
            throw new ApiCallError(`fetchHeaderView: missing action.path`);
          }

          // uses action-splitter to process multiple actions
          next([
            setNotification({
              message: `${HEADER_VIEW}.middleware: -> polling-api.sagas`,
              feature: HEADER_VIEW,
            }),
            addToSelectedList({ path: action.path }), // document
            /*-----------------------------------------------------------------*/
            apiFetch({
              /*-----------------------------------------------------------------*/
              // ::event
              meta: { uiKey: action.path, feature: HEADER_VIEW },
              request: { path: action.path, maxTries: MAX_TRIES },
            }), // map + translation
          ]);
        } catch (e) {
          // ERROR will have been thrown/catched if deeper
          console.error(e);
          next(
            setNotification({
              message: `${HEADER_VIEW}.middleware: ${e.message}`,
              feature: HEADER_VIEW,
            }),
          );
        }
        break;
      }

      // take ui perspective -> api perspective
      // ::command
      case CANCEL_HEADER_VIEW: {
        try {
          if (!action?.path /* ui perspective */) {
            throw new ApiCallError(`cancelHeaderView: missing action.path`);
          }
          // ⚠️  feature -> core; dispatch is not required
          next([
            setNotification({
              message: `${HEADER_VIEW} middleware: action::feature -> ::api (next: polling-api.sagas)`,
              feature: HEADER_VIEW,
            }),
            apiCancel({
              // ::eventInterface for the polling-machine
              meta: { uiKey: action.path, feature: HEADER_VIEW },
              request: { path: action.path },
            }), // map + translation to core api perspective
            removeHeaderView({ feature: HEADER_VIEW, path: action.path }), // document
          ]);
        } catch (e) {
          next(
            setNotification({
              message: `${HEADER_VIEW} middleware: ${e?.message ?? e}`,
              feature: HEADER_VIEW,
            }),
          );
        }
        break;
      }
      // -------------------------------------------------------------------------
      // Respond to events from the api
      // -------------------------------------------------------------------------
      // api event for this feature -> document feature
      case `${HEADER_VIEW} ${POLLING_RESOLVED}`: {
        if (DEBUG) {
          console.log(`👉 middleware - resolved`);
          console.log(action);
        }
        // expects event
        //
        // 🔑 Dependency on request + machine output structure
        //
        //
        if (!isValid(action?.event?.request)) {
          throw new ApiResponseError(
            `headerView.middleware: unexpected response; see api.ServiceConfigs`,
          );
        }
        dispatch([
          setNotification({
            message: `${HEADER_VIEW}.middleware: documenting headerView (next: reducer)`,
            feature: HEADER_VIEW,
          }),
          // normalizer interface
          addHeaderView({
            payload: getData(action.event.request),
            normalizer: fileToHeaderView,
            startTime: new Date(),
          }),
          tagWarehouseState('STALE'),
        ]);
        break;
      }

      // action :: pollingEventError
      case `${HEADER_VIEW} ${POLLING_ERROR}`: {
        // expects event
        validateEventInterface(action?.event, false /* jobId */);

        /*
        console.assert(
          getData(action.event.request)?.error,
          'The response is not an error',
        );
        */

        dispatch([
          setNotification({
            message: 'Api returned an error',
            feature: HEADER_VIEW,
            error:
              getData(action.event.request) ??
              action.event.request.errorEvent.toString(),
          }),
          cancelHeaderView({ path: action.event.request.path }),
          // ephemeral notice to the user
          addInspectionError({
            filename: action.event.request.path,
            message: 'Api returned an error',
          }),
        ]);
        // dispatch an action to clear the notice after a given time
        setTimeout(() => {
          next(removeInspectionError({ filename: action.filename }));
        }, 5000);
        break;
      }
      // action :: command/compute
      // convert from ui perspective to core service perspective happens *in situ*
      // generate action with payload :: headerView with updated wtlf
      // 👉 schedules a fixes report
      case UPDATE_WIDE_TO_LONG_FIELDS: {
        const state = getState();
        const { filename, ...userInput } = action.payload;
        const { wideToLongFields, ...readOnlyHv } = selectHeaderView(
          state,
          filename,
        );

        try {
          // Throws InvalidStateError when updating with a non-unique factor name
          const updatedWtlf = updateWideToLongFields({
            readOnlyWideToLongFields: wideToLongFields,
            userInput,
            DEBUG,
          });
          if (DEBUG) {
            console.debug(`middleware`);
            console.dir(updatedWtlf);
          }
          next([
            setWideToLongFieldsInHv({
              [filename]: {
                ...readOnlyHv,
                wideToLongFields: updatedWtlf,
              },
            }),
            tagWarehouseState('STALE'),
          ]);
        } catch (error) {
          if (error instanceof InvalidStateError) {
            const { fix } = error; // retrieve ERRORS/fix
            const hvsFixes = getHeaderViewsFixes(state);
            next([
              // 🚧 notify for now; not critical
              setNotification({
                message: error.message,
                feature: HEADER_VIEW,
              }),
              setHvsFixes({
                ...hvsFixes,
                [SOURCE_TYPES.WIDE]: {
                  ...hvsFixes[SOURCE_TYPES.WIDE],
                  [filename]: [
                    fix,
                    ...(hvsFixes[SOURCE_TYPES.WIDE]?.[filename] ?? []),
                  ],
                },
              }),
            ]);
          } else {
            throw error;
          }
        }
        break;
      }
      //
      // action :: document that is
      //
      // 1️⃣  interpreted by headerView.reducer for non-level related props
      // 2️⃣  tracked by headerView-report-fixes.sagas
      // 3️⃣  👉 interpreted here; may map to an action that updates levels
      //
      //
      case TYPES.UPDATE_FILEFIELD: {
        const { filename, fieldIdx, key, value } = action;
        // augment the state with async data; othewise, updates go to the
        // reducer directly to be documented.
        //
        // Any changes here render the hosted warehouse state = STALE
        // ⬜ We can get smarter about the volume of updates
        next(tagWarehouseState('STALE'));
        if (key === 'purpose') {
          //
          // track the current state of the levels to avoid multiple calls
          //
          const levelsCount = selectFieldInHeader(
            getState(),
            filename,
            fieldIdx,
          ).levels.length;

          if (value === PURPOSE_TYPES.MSPAN && levelsCount === 0) {
            dispatch([
              setNotification({
                message: `Fetching the mspan data for the redux-store`,
                feature: HEADER_VIEW,
              }),
              setLevelsAsync(
                filename,
                fieldIdx,
                PURPOSE_TYPES.MSPAN,
                (response) => response.data.levels.edges,
              ),
            ]);
          }
        }
        break;
      }
      // Note: does not process the computed error type
      default:
        //---------------------------------------------------------------------------
        // FIXES for this store branch
        // action types: see lib/feedback/fixes
        // payload: string key to lazy-fixes.js
        //---------------------------------------------------------------------------
        if (action?.type?.includes(`${HEADER_VIEW} ${FIX}`)) {
          // `[HeaderView] [FIX] fixSameAsOtherSubjects`:

          try {
            const state = getState();
            // retrieve the string ref to a function from ⚙️  lazyFixes
            const { [action.lazyFix]: lazyFix = (x) => x } = lazyFixes;
            next(setFixedHeaderViews(lazyFix(state)));
          } catch (e) {
            if (e instanceof InvalidStateError) {
              next(
                setNotification({
                  message: e.message,
                  feature: HEADER_VIEW,
                }),
              );
            } else {
              throw e;
            }
          }
        }
        break;
    }
  };

/**
 *
 * Promise event
 *
 * 🔖 This action gets augmented by async.middleware
 *
 * The normalizer raw api -> edges, where each edge has a node with
 * the level and count props.
 *
 * @function
 * @param {string} filename
 * @param {number} headerIdx
 * @param {string} purpose PURPOSE_TYPES
 * @param {function} normalizer raw api -> edges
 * @return {Object} action picked-up by async.middleware
 */
function setLevelsAsync(filename, headerIdx, purpose, normalizer) {
  return {
    type: 'GO LUCI',
    meta: { feature: HEADER_VIEW },
    payload: (dispatch) => {
      // promise sub-routine
      new Promise((resolve) => {
        // ⏳  call the api
        const response = getLevels({
          sources: [{ filename, 'header-index': headerIdx }],
          purpose,
        });
        resolve(response);
      }).then((response) => {
        if (response.status > 200 || response.data.status === 'Error') {
          dispatch(
            pollingEventError({
              feature: HEADER_VIEW,
              message: response.data?.message ?? `error retrieving levels`,
              uid: `${filename} ${purpose}`,
            }),
          );
          return;
        }

        // transform the api data -> [[value, count]]
        const levels = normalizer(response).map(({ node }) => [
          node.level,
          node.count,
        ]);

        dispatch(setHvFieldLevels(filename, headerIdx, levels));
      });
    },
  };
}
export default middleware;
