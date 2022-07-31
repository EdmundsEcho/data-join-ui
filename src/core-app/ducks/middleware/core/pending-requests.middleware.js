// src/ducks/middleware/pending-requests.middleware.js

/**
 * @module middleware/pending-requests
 *
 * @description
 * Responds to the following commands
 *
 * 👉 REHYDRATE (auto-activated on-rehydrate)
 *
 * 👉 REMOVE_PENDING_REQUEST (auto-activated on-error)
 *
 * middleware type: core, but has feature-like qualities
 * e.g., uses the apiResume action
 *
 * ⚠️  Unify with to be deprecated jobs.actions
 *
 */
import { REHYDRATE } from 'redux-persist';
import {
  PENDING_REQUESTS, // pseudo-feature
  addPendingRequest,
  updatePendingRequest,
  removePendingRequest,
} from '../../actions/pendingRequests.actions';

import {
  FETCH,
  CANCEL,
  POLLING_ERROR,
  POLLING_RESOLVED,
  POLLING_CANCELLED,
  POLLING_START, // update the request meta
  POLLING_END,
  apiFetch,
} from '../../actions/api.actions';

import {
  getPendingRequests,
  getNumberOfPendingRequests,
} from '../../rootSelectors';
import { setNotification } from '../../actions/notifications.actions';

import { colors } from '../../../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const pendingRequestsMiddleware =
  ({ getState, dispatch }) =>
  (next) =>
  (action) => {
    //
    //---------------------------------------------------------------------------
    const coreService = PENDING_REQUESTS;
    //---------------------------------------------------------------------------
    //
    if (DEBUG) {
      console.info(`loaded pending-requests.middleware`);
    }

    // ...apply the 'previous' action stored in the closure
    // to generate the latest state
    next(action);

    switch (true) {
      // -------------------------------------------------------------------------
      // Document the api request
      // Requires both uiKey and serviceType plus whatever is required to
      // re-instantiate the request if needed.
      // -------------------------------------------------------------------------
      // fetch event -> document
      case action.type.includes(FETCH):
        next(addPendingRequest(makeEventAction(action)));
        break;

      // update event -> document
      case action.type.includes(POLLING_START):
      case action.type.includes(POLLING_END):
        next(updatePendingRequest(makeEventAction(action)));
        break;

      //
      // ⚠️  🦀 pending requests get stuck in the queue if/when the response returns
      // feature === undefined
      //
      // event -> document
      case action.type.includes(CANCEL):
      case action.type.includes(POLLING_CANCELLED):
      case action.type.includes(POLLING_ERROR):
      case action.type.includes(POLLING_RESOLVED):
        next(removePendingRequest(makeEventAction(action)));
        break;

      // event (REHYDRATE)
      // fire-up incompleted commands: feature command -> api.action
      case action.type === REHYDRATE: {
        // count of incomplted commands
        const resumeCount = getNumberOfPendingRequests(getState());

        if (DEBUG) {
          console.log(
            `%cpending-request.middleware fired-up in response to rehydrate event: ${resumeCount}`,
            colors.orange,
          );
        }

        if (resumeCount > 0) {
          const pendingRequests = getPendingRequests(getState()) || {};
          const message =
            resumeCount === 1
              ? `Resuming a single request (action::apiResume)`
              : `Resuming several (${resumeCount}) requests (action::apiResume)`;

          next(
            setNotification({
              message,
              feature: coreService,
            }), // user-friendly, temp document
          );

          // generate a side effect for each of the pending requests
          const serviceTypes = Object.keys(pendingRequests);
          serviceTypes.forEach((serviceType) =>
            Object.values(pendingRequests[serviceType]).forEach((event) =>
              next(apiFetch(event)),
            ),
          );
        }
        break;
      }

      default:
        break;
    }
  };

function makeEventAction(action) {
  return {
    event: action.event,
    feature: action.event.meta.feature,
  };
}

export default pendingRequestsMiddleware;
