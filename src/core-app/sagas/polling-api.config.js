// src/sagas/polling-api.config.js

import {
  initApiService,
  statusApiService,
  resultApiService,
  cancelApiService,
  ResponseTypePredicates,
} from '../services/api';

// core api actions for the machine to exploit
import {
  pollingEventStart,
  pollingEventEnd,
  pollingEventResolved,
  pollingEventCancelled,
  pollingEventError,
} from '../ducks/actions/api.actions';
//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_API === 'true' ||
  process.env.REACT_APP_DEBUG_MACINE === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';

// ------------------------------------------------------------------------------
/**
 * Utilized by polling-api.sagas.js
 *
 *  ⚙️  Link the api calls to the machine
 *     Predicate for knowing when the status has changed to resolved
 *     Set the initial command
 *     Set the max number of polling events
 *
 *     services are called with param::eventInterface
 *
 */
export const channelSpec = {
  services: {
    initApiService,
    statusApiService,
    resultApiService,
    cancelApiService,
  },
  actions: {
    pollingEventStart,
    pollingEventEnd,
    pollingEventResolved,
    pollingEventCancelled,
    pollingEventError,
  },
  guards: {
    isResolved: ResponseTypePredicates.RESOLVED,
    isCancelled: ResponseTypePredicates.CANCELLED,
  },
  debug: {
    devTools: DEBUG,
  },
};
