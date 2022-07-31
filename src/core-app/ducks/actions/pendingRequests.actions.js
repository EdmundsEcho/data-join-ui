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

// document (core command to document)
// feature middleware should not know about this service
const create = (type, action) => {
  if (!action?.event?.meta?.feature) {
    console.error(action);
    throw new ApiCallError(
      'Pending requests action expects { event: meta, request }',
    );
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
