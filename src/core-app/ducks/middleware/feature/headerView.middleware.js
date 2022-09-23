// src/ducks/middleware/feature/headerView.middleware.js

/**
 * @module middleware/feature/headerView.middleware
 */
import {
  UPDATE_FILEFIELD, // pass-through document
  UPDATE_WIDE_TO_LONG_FIELDS, // command
  setWideToLongFieldsInHv, // document
  HEADER_VIEW, // feature
  FETCH_HEADER_VIEW, // command
  CANCEL_HEADER_VIEW, // command
  addHeaderView, // document
  removeHeaderView, // document
  addToSelectedList, // document
  removeFromSelectedList, // document
  addInspectionError, // document
  removeInspectionError, // document
  setFixedHeaderViews, // document
  setHvsFixes, // document
  setHvFieldLevels,
  updateFileField, // document
} from '../../actions/headerView.actions';
import { tagWarehouseState } from '../../actions/workbench.actions';
import {
  POLLING_RESOLVED,
  POLLING_ERROR,
  apiFetch,
  apiCancel,
  pollingEventError,
  validateEventInterface,
  apiEventError,
  getUiKey,
} from '../../actions/api.actions';
import { setNotification } from '../../actions/notifications.actions';
import {
  ServiceConfigs,
  getServiceType,
  fetchFileLevels,
} from '../../../services/api';

import { SOURCE_TYPES, PURPOSE_TYPES } from '../../../lib/sum-types';
import { camelToSnakeCase } from '../../../utils/common';

import { normalizer as fileToHeaderView } from '../../../lib/filesToEtlUnits/file-to-header';
import { updateWideToLongFields } from '../../../lib/filesToEtlUnits/transforms/wide-to-long-fields';

// 📖 data
import {
  getHeaderViewsFixes,
  getHeaderViews,
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
import { getTimePropValueWithCompoundedKey } from '../../../lib/filesToEtlUnits/transforms/span/span-helper';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const MAX_TRIES = 15;

// retrieve helpers for the headerView response
const { isValid, getData, getApiError } =
  ServiceConfigs[getServiceType(HEADER_VIEW)].response;

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
  async (action) => {
    const state = getState();
    const { projectId } = state.$_projectMeta;
    //
    if (DEBUG) {
      const project = projectId === null ? 'empty' : `${projectId}`;
      console.info(`👉 loaded headerView.middleware: ${project}`);
    }
    if (action.type === 'PING')
      console.log(
        `%cPING recieved by headerView.middleware`,
        colors.light.purple,
      );

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
        console.debug(`%cFETCH_HEADER_VIEW activated`, 'color:pink');
        try {
          if (!action?.path) {
            throw new ApiCallError(`fetchHeaderView: missing action.path`);
          }

          const { type: _, ...request_ } = action;

          // convert keys to snake
          // ⬜ move to the normalizing configuration
          const request = Object.entries(request_).reduce((acc, [k, v]) => {
            acc[camelToSnakeCase(k)] = v;
            return acc;
          }, {});

          // uses action-splitter
          next([
            setNotification({
              message: `${HEADER_VIEW}.middleware: -> polling-api.config.sagas`,
              feature: HEADER_VIEW,
            }),
            addToSelectedList(action), // document
            // -----------------------------------------------------------------
            apiFetch({
              // ---------------------------------------------------------------
              // ::event
              meta: { uiKey: action.path, feature: HEADER_VIEW },
              request: { ...request, maxTries: MAX_TRIES },
            }), // map + translate
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
          // feature -> core
          next([
            setNotification({
              message: `${HEADER_VIEW} middleware: action::feature -> ::api (next: polling-api.config.sagas)`,
              feature: HEADER_VIEW,
            }),
            apiCancel({
              // ::eventInterface for the polling-machine
              meta: { uiKey: action.path, feature: HEADER_VIEW },
              request: { path: action.path },
            }), // map + translation to core api perspective
            removeHeaderView(action), // document
            removeFromSelectedList(action), // document
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
        try {
          // expects event
          //
          // 🔑 Dependency on request + machine output structure
          //
          //
          // check for error (somehow API did not catch this)
          if (!isValid(action?.event?.request)) {
            throw new ApiResponseError(
              `headerView.middleware: unexpected response; see api.ServiceConfigs`,
            );
          }
          next([
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
        } catch (e) {
          next(apiEventError({ feature: HEADER_VIEW, ...e }));
        }
        break;
      }

      // action :: pollingEventError
      case `${HEADER_VIEW} ${POLLING_ERROR}`: {
        if (DEBUG) {
          console.debug(`__ 1️⃣  🦀 did I make it to the middleware?`);
          console.dir(action);
        }
        // expects event
        validateEventInterface(action?.event, false /* jobId */);

        console.assert(
          action.event.request.error,
          'The response is not an error',
        );

        // ⬜ The error parsing is not working as expected
        next([
          setNotification({
            message:
              action.event.request?.data?.message ?? 'Api returned an error',
            feature: HEADER_VIEW,
            error: getApiError(action.event) ?? JSON.stringify(action.event),
          }),
          // convert from action :: event, to ~ ui-agent action type (path)
          removeHeaderView({ type: null, path: getUiKey(action.event) }), // document
          removeFromSelectedList({ type: null, path: getUiKey(action.event) }), // document
          // ephemeral notice to the user
          addInspectionError({
            filename: action.event.request.path,
            message:
              action.event.request?.data?.message ?? 'Api returned an error',
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
      case UPDATE_FILEFIELD: {
        // Any changes here render the hosted warehouse state = STALE
        // ⬜ We can get smarter about the volume of updates
        next(tagWarehouseState('STALE'));
        //
        const { filename, fieldIdx, key, value } = action;
        //
        // tasks:
        // 1. if key === purpose, maybe augment reducer with async, levels data
        // 2. if key === format, maybe generate an update action for other hv
        // ... "guess forward"
        //
        // field: setTime(key)(field, value, DEBUG),
        if (key === 'format') {
          const readOnlyField = selectFieldInHeader(
            getState(),
            filename,
            fieldIdx,
          );
          if (readOnlyField.purpose === PURPOSE_TYPES.MSPAN) {
            // use the value to update other mspan field format if empty
            const maybeNextHv = maybeNextHvInHvs(
              getHeaderViews(state),
              filename,
            );
            const maybeNextField = maybeNextHv
              ? maybeFieldWithMissingValueInHv(
                  maybeNextHv,
                  readOnlyField.purpose,
                  key,
                )
              : undefined;
            if (maybeNextField) {
              dispatch(
                updateFileField(
                  maybeNextHv.filename,
                  maybeNextField['header-idx'],
                  key,
                  value,
                ),
              );
            }
          }
        }
        if (/^time\.+./.test(key)) {
          const readOnlyField = selectFieldInHeader(
            getState(),
            filename,
            fieldIdx,
          );
          const maybeNextHv = maybeNextHvInHvs(getHeaderViews(state), filename);
          const maybeNextField = maybeNextHv
            ? maybeFieldWithMissingValueInHv(
                maybeNextHv,
                readOnlyField.purpose,
                key,
              )
            : undefined;
          if (maybeNextField) {
            dispatch(
              updateFileField(
                maybeNextHv.filename,
                maybeNextField['header-idx'],
                key,
                value,
              ),
            );
          }
        }
        //
        // In the event the purpose === mspan, augment the state with async data.
        //
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
            next([
              setNotification({
                message: `Fetching the mspan data for the redux-store`,
                feature: HEADER_VIEW,
              }),
            ]);
            const response = await fetchFileLevels({
              projectId,
              sources: [{ filename, 'header-index': fieldIdx }],
              purpose: PURPOSE_TYPES.MSPAN,
              signal: undefined,
            });
            // ⬜ integrate into system error and meta processing (use-api-fetch)
            if (response.status > 200 || response.data.status === 'Error') {
              next(
                pollingEventError({
                  feature: HEADER_VIEW,
                  message: response.data?.message ?? `error retrieving levels`,
                  uid: `${filename} ${PURPOSE_TYPES.MSPAN}`,
                }),
              );
            }

            // transform the api data -> [[value, count]]
            const normalized = response.data.levels.edges;
            const levels = normalized.map(({ node }) => [
              node.level,
              node.count,
            ]);

            next(setHvFieldLevels(filename, fieldIdx, levels));
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
 * When updating a key value pair in "one hv", try and find
 * opportunities to update the key value in "another hv".
 *
 */
function maybeFieldWithMissingValueInHv(anotherHv, purpose, key) {
  const maybeField = anotherHv.fields.find(
    (field) => field.purpose === purpose,
  );
  let missingValue = null;
  if (/^time\.+./.test(key)) {
    missingValue =
      getTimePropValueWithCompoundedKey(key, maybeField?.time) ?? undefined;
  } else {
    missingValue = maybeField?.[key] ?? undefined;
  }
  return missingValue == null || missingValue === '' ? maybeField : undefined;
  // case /^format/.test(key):
  // case /^time\.+./.test(key): {
}

/**
 * Return the next index value. Returns undefined if a next
 * cursor does not exist.
 *
 * The caller: move down & up from the currentFilename
 * Next steps:
 *   👉 call this function once
 *   👉 have the function move up
 *   👉 have the function move down
 *
 */
function maybeNextHvInHvs(hvs, currentFilename) {
  const hvsKeys = Object.keys(hvs);
  const cursor = hvsKeys.findIndex((filename) => currentFilename === filename);
  const nextKey = cursor + 1;
  return nextKey < hvsKeys.length ? hvs[hvsKeys[nextKey]] : undefined;
}
export default middleware;
