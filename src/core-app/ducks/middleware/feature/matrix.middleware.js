// src/ducks/middleware/feature/matrix.middleware.js

/**
 * @module middleware/feature/matrix.middleware
 *
 * @description
 *
 * 🚧 This is feature specific and not fully implemented
 *    Part of standardizing the messaging system using middleware
 *
 */
import {
  MATRIX,
  FETCH_MATRIX,
  CANCEL_MATRIX,
  setMatrix,
  tagMatrixState,
} from '../../actions/matrix.actions';

import { POLLING_RESOLVED, POLLING_ERROR, apiCancel } from '../../actions/api.actions';
import { bookmark } from '../../actions/stepper.actions';
import { setUiLoadingState, addError } from '../../actions/ui.actions';
import { setNotification } from '../../actions/notifications.actions';
import { ApiResponseError } from '../../../lib/LuciErrors';
import { ServiceConfigs, getServiceType } from '../../../services/api';

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
// Global values
// const MAX_TRIES = 20;
const { isValid, isError, getData, isValidError, getError } =
  ServiceConfigs[getServiceType(MATRIX)].response;
//------------------------------------------------------------------------------

/* --------------------------------------------------------------------------- */
const middleware = (/* { dispatch  getState } */) => (next) => (action) => {
  //
  if (DEBUG) {
    console.info('👉 loaded matrix.middleware');
  }

  if (action.type === 'PING')
    console.log(`%cPING recieved by matrix.middleware`, colors.light.purple);

  if (action.type === 'MIDDLE')
    console.log(`%cMIDDLE recieved by matrix.middleware`, colors.light.purple);

  // dispatch the current action in action.type with the closure that is
  // about to be returned.
  next(action);

  switch (action.type) {
    // -------------------------------------------------------------------------
    // Fire-up the api core service
    // -------------------------------------------------------------------------
    // map feature command -> api command
    // ui perspective -> api perspective
    // fetchMatrix -> apiFetch
    // -------------------------------------------------------------------------
    case `${FETCH_MATRIX} 'SEE matrix.sagas'`: {
      // delegates to: matrix.sagas
      // The saga builds the spec (required for the request)
      // using a series of repeated calls to the graphql server.
      break;
    }
    // -------------------------------------------------------------------------
    // Respond to events from the api
    // -------------------------------------------------------------------------
    // api event for this feature -> document feature
    // dispatched by sagas
    case `${MATRIX} ${POLLING_RESOLVED}`: {
      // expects event
      //
      // 🔑 Dependency on request + machine output structure
      //
      if (!isValid(action?.event?.request)) {
        throw new ApiResponseError(
          `matrix.middleware: unexpected response; see ServiceConfigs`,
        );
      }
      const recordCount = getData(action.event.request)?.totalCount || 'unknown';
      next([
        setNotification({
          message: `Matrix record count: ${recordCount}`,
          feature: MATRIX,
        }),

        // 🔖 this is just the first 100 or so records used to configure/seed
        //    Subsequent records are served using a pagination strategy.
        setMatrix(JSON.parse(getData(action.event.request)) || 'error parsing data'),

        setUiLoadingState({
          toggle: false,
          feature: MATRIX,
          message: `Now hosting a matrix with ${recordCount} records`,
        }),
        tagMatrixState('CURRENT'),
      ]);
      break;
    }

    // action :: pollingEventError
    // dispatched by sagas
    case `${MATRIX} ${POLLING_ERROR}`: {
      console.debug('POLLING ERROR');
      console.debug(action);

      if (!isValidError(action?.event?.request)) {
        console.dir(action);
        throw new ApiResponseError(
          `matrix.middleware: unexpected polling-error response; see ServiceConfigs`,
        );
      }
      // see polling-worker failed to see how sends error
      console.assert(action.event.request.error, 'The response is not an error');

      next([
        setNotification({
          message: action.event.request?.data?.message ?? 'Api returned an error',
          feature: MATRIX,
          error: getError(action.event.request) ?? JSON.stringify(action.event),
        }),
        setUiLoadingState({
          toggle: false,
          feature: MATRIX,
          message: 'Done matrix with error',
        }),
        addError({
          feature: MATRIX,
          message: action.event.request?.data?.message ?? 'Api returned an error',
        }),
        // display the workbench
        bookmark('workbench'),
      ]);
      break;
    }

    // take ui perspective -> api perspective
    // ::command
    case CANCEL_MATRIX: {
      try {
        // feature -> core
        next([
          setNotification({
            message: `${MATRIX} middleware: action::feature -> ::api (next: polling-api.config.sagas)`,
            feature: MATRIX,
          }),
          apiCancel({
            // ::eventInterface for the polling-machine
            meta: { uiKey: action.payload, feature: MATRIX },
          }),
        ]);
      } catch (e) {
        next(
          setNotification({
            message: `${MATRIX} middleware: ${e?.message ?? e}`,
            feature: MATRIX,
          }),
        );
      } finally {
        next(
          setUiLoadingState({
            toggle: false,
            feature: MATRIX,
            message: 'Done cancel matrix',
          }),
        );
        next(tagMatrixState('STALE'));
      }
      break;
    }
    default:
  }
};

export default middleware;
