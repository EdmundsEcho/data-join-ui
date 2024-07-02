/**
 * @module actions/pending-requests.actions
 *
 * @description
 * api process -> document
 * rehydrate cmd -> api process
 *
 * Documents unresolved api processes.
 * (command found in api actions)
 *
 */

import { ApiCallError } from '../../lib/LuciErrors';
// import { colors } from '../../constants/variables';
/* eslint-disable no-console */

export const PENDING_REQUESTS = '[PendingRequests]'; // core-feature :)
export const ADD = 'ADD PENDING REQUEST'; // document
export const UPDATE = 'UPDATE PENDING STATUS'; // document
export const REMOVE = 'REMOVE PENDING REQUEST'; // document

/**
 * In the app system:
 *   - feature middleware should not know about this service
 *   - document (core command to document)
 *
 * REMOVE, UPDATE: requires action.meta (does not require action.request).
 * ADD sets the matching meta, but also includes `request` to enable
 * restoring the request following a reload, or otherwise needed.
 *
 * This spec is part of the polling-machine event-interface.
 *
 *      {
 *          meta: { uiKey, feature },
 *          request: { Any }
 *      }
 *
 * @function
 * @returns {object} action
 */
const create = (type, action) => {
  if (!action?.event?.meta?.feature) {
    console.error(action);
    throw new ApiCallError('Pending requests action expects { event: meta, request }');
  }
  const { event } = action;
  const { feature } = event.meta;
  return {
    event,
    feature,
    type: `${feature} ${type}`,
  };
};
export const addPendingRequest = (action) => create(ADD, action);
export const updatePendingRequest = (action) => create(UPDATE, action);
export const removePendingRequest = (action) => create(REMOVE, action);

/* --------------------------------------------------------------------------- */
