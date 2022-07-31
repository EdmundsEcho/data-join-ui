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
import { MATRIX, FETCH_MATRIX, setMatrix } from '../../actions/matrix.actions';

import { POLLING_RESOLVED, POLLING_ERROR } from '../../actions/api.actions';
import { setLoader } from '../../actions/ui.actions';
import { setNotification } from '../../actions/notifications.actions';
import { ApiResponseError } from '../../../lib/LuciErrors';
import { ServiceConfigs, getServiceType } from '../../../services/api';

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

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

  const { isValid, getData } = ServiceConfigs[getServiceType(MATRIX)].response;

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
    case `${FETCH_MATRIX} 'DISABLE'`: {
      // see matrix.sagas
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
      next([
        setNotification({
          message: `Matrix record count: ${
            getData(action.event.request)?.totalCount || 'unknown'
          }`,
          feature: MATRIX,
        }),

        setMatrix(
          JSON.parse(getData(action.event.request)) || 'error parsing data',
        ),
        setLoader({ toggle: false, feature: MATRIX }),
      ]);
      break;
    }

    // action :: pollingEventError
    // dispatched by sagas
    case `${MATRIX} ${POLLING_ERROR}`: {
      if (!isValid(action?.event?.request)) {
        console.dir(action);
        throw new ApiResponseError(
          `matrix.middleware: unexpected response; require 'event'`,
        );
      }
      console.assert(
        getData(action.event.request)?.error,
        'The response is not an error',
      );
      next([
        setNotification({
          message:
            getData(action.event.request)?.message ||
            'The API polling request failed',
          feature: MATRIX,
        }),
        setLoader({ toggle: false, feature: MATRIX }),
      ]);

      break;
    }
    default:
  }
};

export default middleware;
