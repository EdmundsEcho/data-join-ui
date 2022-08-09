// /src/ducks/actions/api.actions.js

/**
 * @module actions/api.actions
 *
 * @description
 * Generic API actions that is made specific for each context using
 * the meta feature property.
 *
 * Action kinds: command and event.
 *
 * These actions do not impact the redux store.
 * These actions are for the *polling-api.sagas middleware*
 *
 * see Programming with Actions
 *
 */
import { ApiCallError } from '../../lib/LuciErrors';
// import { colors } from '../../constants/variables';

export const FETCH = 'API FETCH'; // command
export const RESUME = 'API RESUME'; // command
export const CANCEL = 'API CANCEL'; // command
export const POLLING_START = 'API POLLING START'; // event
export const POLLING_END = 'API POLLING END'; // event
export const POLLING_RESOLVED = 'API POLLING RESOLVED'; // event
export const POLLING_CANCELLED = 'API POLLING CANCELLED'; // event
export const POLLING_ERROR = 'API POLLING ERROR'; // event

export const Actions = {
  FETCH,
  RESUME,
  CANCEL,
  POLLING_START,
  POLLING_END,
  POLLING_RESOLVED,
  POLLING_CANCELLED,
  POLLING_ERROR,
};
//------------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_API === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

//------------------------------------------------------------------------------
// Utilized by feature.middleware when want to engage the core api
// 🔑 generic for all features (headerView, workbench, matrix)
//------------------------------------------------------------------------------
// :: command
// receiver: polling-api.sagas
// the machine event:: request, meta
const create = (type, event) => ({
  type: `${event?.meta?.feature} ${type}`,
  event,
});
// :: command
// receiver: polling-api.sagas
// the machine event:: request, meta
export const apiFetch = (event) => create(FETCH, event);
export const apiCancel = (event) => create(CANCEL, event);
export const pollingEventStart = (event) => create(POLLING_START, event);
export const pollingEventEnd = (event) => create(POLLING_END, event);
export const pollingEventResolved = (event) => create(POLLING_RESOLVED, event);
export const pollingEventError = (event) => create(POLLING_ERROR, event);
export const pollingEventCancelled = (event) =>
  create(POLLING_CANCELLED, event);

// Actions for the times when the middleware calls the api directly
// i.e., when does not need to poll
// Actions that do not engage the polling api
export const ERROR = 'API ERROR';
export const apiEventError = ({ feature, ...args }) => ({
  type: `${feature} ${ERROR}`,
  ...args,
});

//------------------------------------------------------------------------------
/**
 * Enforces the eventInterface contract
 * @function
 * @throws ApiCallError
 *
 */
export function validateEventInterface(eventInterface, jobId = true) {
  if (!eventInterface?.request) {
    console.dir(eventInterface);
    throw new ApiCallError('Api call without a valid request');
  }
  if (jobId && !eventInterface?.request?.jobId) {
    console.dir(eventInterface);
    throw new ApiCallError('Api call without request.jobId');
  }
  if (!eventInterface.meta?.uiKey) {
    throw new ApiCallError('Api call without meta.uiKey');
  }
  if (!eventInterface?.meta?.feature) {
    console.dir(eventInterface);
    throw new ApiCallError('Api call without meta.feature');
  }
}
export const getUiKey = (event) => {
  return event.meta.uiKey;
};
//------------------------------------------------------------------------------
