// src/hooks/use-fetch-api.js
/**
 * @module hooks/use-fetch-api
 */
import { useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiResponseError } from '../errors';

/* eslint-disable no-console */

// internal interface
const START = 'start';
const SUCCESS = 'success';
const ERROR = 'error';
const IDLE = 'idle';

// consumer interface
const STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};
// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 *
 *
 * @function
 * @return {React.hook}
 *
 */
const useFetchApi = ({
  fetchFn, // how retrieve the raw data
  normalizer = (x) => x, // optional post-processing
  callback = (x) => x, // optional
  enqueueSnackbar = (m) => {
    console.log(`🔖 enqueueSnackbar is not configured: ${m}`);
  }, // optional
  initialValue = undefined, // optional
  DEBUG: debugProp = DEBUG || false,
}) => {
  //
  // initialize the local state
  // hosts the status of the fetch and the data
  //
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    status: STATUS.IDLE,
    cache: initialValue || null,
    error: null,
  });
  //
  // generic (all consumers benefit) redirect to login when 401
  let navigate = useNavigate();

  //
  // 💢 Updates the local reducer
  //
  //    Usage: Consumer to both call fetch and retrieve the cache
  //    (likely within a useEffect)
  //
  //    Sets status to: start | error | success
  //
  const fetch = async (...args) => {
    try {
      dispatch({ type: START });
      // ⏰ fetch response
      const response = await fetchFn(...args);

      console.assert(
        response?.status ?? false,
        `Unexpected response: Missing status\n${Object.keys(response)}`,
      );
      if (response.status === 200) {
        const finalData = normalizer(response.data);
        dispatch({ type: SUCCESS, data: finalData });
        callback(finalData);
      } else {
        throw new ApiResponseError(response);
      }
    } catch (e) {
      // throw a generic error; when caught will get more refined
      console.assert(
        e?.response?.status ?? false,
        `Unexpected Error response: Missing response.status\n${JSON.stringify(
          e,
        )}`,
      );

      // grow the switch statement if/when deal with other status
      // default: let the user of the fetch-api figure out what to do.
      switch (e.response.status) {
        case 401:
          enqueueSnackbar(`Unauthorized: Session expired`, {
            variant: 'error',
          });
          console.debug(`✅ expired session 👉 login`);
          navigate('/login');
          break;

        default:
          enqueueSnackbar(`Error: Api response error`, {
            variant: 'error',
          });
          throw new ApiResponseError(e);
      }
    } finally {
      // dispatch({ type: IDLE, data: undefined })
    }
  };

  const reset = () => {
    // set the status
    dispatch({ type: IDLE, data: undefined });
  };

  // { fetch, status, cache, error }
  return {
    fetch,
    reset,
    STATUS,
    ...fetchState,
  };
};

/**
 * fetch reducer tracks the status of the async call
 *
 * Sets status = rejected | resolved | pending
 *
 */
function fetchReducer(state, action) {
  switch (action.type) {
    case ERROR: {
      return {
        ...state,
        status: STATUS.REJECTED,
        error: action.error,
      };
    }
    case SUCCESS: {
      return {
        ...state,
        status: STATUS.RESOLVED,
        cache: action.data,
      };
    }
    case START: {
      return {
        ...state,
        status: STATUS.PENDING,
      };
    }
    case IDLE: {
      return {
        ...state,
        status: STATUS.IDLE,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
export { useFetchApi };
