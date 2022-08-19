/**
 * @module /Ducks/apiRequests.reducer
 *
 * @description
 * Captures any pending requests from the API.
 *
 * Each request is tracked using the jobId and the query
 * used to pull the data from the api.
 *
 *   {
 *     jobId:
 *       {
 *          uiKey,         // e.g., filename
 *          feature,       // e.g., headerView
 *          requestType,   // api call e.g., inspection, extraction
 *          query          // e.g., filename
 *       }
 *   }
 *
 *
 * Sets the state branch
 *
 *   ** apiRequests **
 *
 */
import {
  ADD, // document
  UPDATE, // document
  REMOVE, // document
} from './actions/pendingRequests.actions';
import { RESET } from './actions/project-meta.actions';
import { ApiCallError } from '../lib/LuciErrors';
import { getServiceType } from '../services/api';
// import { colors } from '../constants/variables';

/* eslint-disable no-console */

const initialState = {};

// selectors

export const getPendingRequests = (stateFragment) => stateFragment;

/**
 * Return an array of feature branches that have pending data
 * -> [] when there are none.
 */
export const getFeaturesWithPendingDataRequests = (stateFragment = {}) =>
  Object.keys(stateFragment).reduce(
    (acc, featureKey) =>
      Object.keys(stateFragment[featureKey]).length > 0
        ? [...acc, featureKey]
        : acc,
    [],
  );

export const hasPendingDataRequests = (stateFragment) =>
  getFeaturesWithPendingDataRequests(stateFragment)?.length > 0 ?? false;

export const selectPendingRequestWithJobId = (
  stateFragment,
  requestType,
  jobId,
) =>
  Object.values(stateFragment?.[requestType])?.find(
    (req) => req.jobId === jobId,
  ) ?? null;

export const selectPendingRequestWithUiKey = (
  stateFragment,
  requestType,
  uiKey,
) => stateFragment?.[requestType]?.[uiKey] ?? null;

export const getNumberOfPendingRequests = (stateFragment) => {
  if (Object.keys(stateFragment).length === 0) return 0;
  return Object.keys(stateFragment).reduce(
    (total, serviceType) =>
      total + Object.keys(stateFragment[serviceType]).length,
    0,
  );
};

// validate the action for ADD REMOVE UPDATE
// action must have event: { meta, request }
const validate = (action) => {
  try {
    if (!action?.event?.meta?.uiKey || !action?.event?.meta?.feature) {
      throw new ApiCallError(
        `The API Request expects 'event: { meta, request }'`,
      );
    }
  } catch (e) {
    console.error(e);
    console.error(Object.keys(action?.meta));
  }
};
//------------------------------------------------------------------------------
// Reducer
// state = pendingRequests
//------------------------------------------------------------------------------
// responds to action::document
// Is generic, so ignores feature component of the action type.
// (see Programming with Actions)
//------------------------------------------------------------------------------
const reducer = (state = initialState, action) => {
  const { type } = action;

  switch (true) {
    case type === RESET:
    case type === 'RESET_PENDING_REQUESTS':
      return initialState;
    case type === 'SET_PENDING_REQUESTS':
      return action.pendingRequests;

    //--------------------------------------------------------------------------
    // Pending requests
    // Programming with actions
    //
    case type.includes(ADD):
    case type.includes(UPDATE): {
      validate(action);
      const { meta, request } = action.event;
      const serviceType = getServiceType(meta.feature);

      return {
        ...state,
        [serviceType]: {
          ...state[serviceType],
          [meta.uiKey]: { meta, request },
        },
      };
    }
    case type.includes(REMOVE): {
      validate(action);

      const {
        meta: { feature, uiKey },
      } = action.event;

      const serviceType = getServiceType(feature);
      const { [serviceType]: { [uiKey]: _, ...rest } = {} } = state;

      return {
        ...state,
        [serviceType]: { ...rest },
      };
    }

    default:
      return state;
  }
};

export default reducer;
