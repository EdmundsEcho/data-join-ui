// src/hooks/use-fetch-api.js
/**
 * @module hooks/use-fetch-api
 */
import { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiResponseError } from '../core-app/lib/LuciErrors';
import useMountedState from './use-mounted-state';
import { STATUS } from '../core-app/lib/sum-types';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// internal interface
const START = 'start';
const SUCCESS = 'success';
const ERROR = 'error';
const IDLE = 'idle';

const RESET = 'resetting fetch api';
const SET_FETCH_ARGS = 'setting fetch args';
const ACTIVATE_FETCH_API = 'activating fetch api';

// consumer interface
// STATUS

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
  DEBUG: DEBUG_PROP = DEBUG,
}) => {
  //
  // initialize the local state
  // hosts the status of the fetch and the data
  //
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    status: STATUS.IDLE,
    cache: initialValue || null,
    error: null,
    // guard values ensuring fetch is only called when ready
    fetchArgs: undefined,
    activated: false, // latch
  });

  const isMounted = useMountedState();

  // generic (all consumers benefit) redirect to login when 401
  const navigate = useNavigate();

  //
  // 💢 Called when user updates fetchParams using fetch ref
  //    Updates the local reducer
  //
  useEffect(() => {
    //
    // specifiy the effect
    //
    const innerFetch = async () => {
      try {
        dispatch({ type: START });

        // ⏰ fetch response
        const response = await fetchFn(fetchState.fetchArgs);

        if (DEBUG_PROP) {
          console.log(`------------------------ fetch response`);
          console.dir(response);
        }

        // proceed only if the calling component is still mounted
        // React sets the value to false when the hook is dismounted
        if (isMounted) {
          console.assert(
            response?.status ?? false,
            `Unexpected response: Missing status\n${Object.keys(response)}`,
          );
          if (response.status === 200) {
            const finalData = normalizer(response.data);
            dispatch({ type: SUCCESS, data: finalData });
            callback(finalData);
          } else {
            console.debug(`use-fetch-api - throwing an error`);
            console.error(response);
            throw new ApiResponseError(response);
          }
        }
      } catch (e) {
        if (e instanceof ApiResponseError) {
          console.assert(
            e?.cause?.status ?? false,
            `Unexpected error: Missing status\n${JSON.stringify(e)}`,
          );
          // grow the switch statement if/when deal with other status
          // default: let the user of the fetch-api figure out what to do.
          switch (e.cause?.status) {
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
              dispatch({
                type: ERROR,
                error: JSON.stringify(e?.cause, null, 2) || 'malformed error',
              });
          }
        } else {
          enqueueSnackbar(`Error: Unknown error`, {
            variant: 'error',
          });
          dispatch({
            type: ERROR,
            error: JSON.stringify(e, null, 2),
          });
          throw e;
        }
      } finally {
        // dispatch({ type: IDLE, data: undefined })
      }
    };
    // ------------------------------------------------------------------------
    // Call the function
    // ------------------------------------------------------------------------
    // 🛡️ guards against calling fetch
    //
    // 🟢 "unlock" the service
    //
    // ------------------------------------------------------------------------
    if (!fetchState.activated) {
      dispatch({ type: ACTIVATE_FETCH_API });
      return;
    }
    //
    // 📬 fetch when parameters change (per the effect dependency array)
    //    and are defined
    //
    if (fetchState.fetchArgs === undefined) {
      return;
    }
    // ------------------------------------------------------------------------
    innerFetch();
    // ------------------------------------------------------------------------
  }, [
    fetchState.fetchArgs,
    fetchState.activated,
    fetchFn,
    navigate,
    isMounted,
  ]);

  /*
    enqueueSnackbar,
    normalizer,
    fetchFn,
    callback,
    navigate,
    fetchState.fetchArgs,
    isMounted, // needed?
*/
  // external: call fetch by changing the local state (triggering the effect)
  const fetch = (...args) => {
    dispatch({ type: SET_FETCH_ARGS, fetchArgs: args });
  };

  const reset = () => {
    // set the status
    dispatch({ type: RESET, data: null });
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
  if (DEBUG) {
    console.debug(`use-fetch-api service:`);
    console.debug(`%c${action.type}`, 'color:cyan');
  }
  switch (action.type) {
    // latch
    case ACTIVATE_FETCH_API: {
      return {
        ...state,
        activated: true,
      };
    }
    case IDLE: {
      return {
        ...state,
        status: STATUS.IDLE,
      };
    }
    case START: {
      return {
        ...state,
        status: STATUS.PENDING,
      };
    }
    case SUCCESS: {
      return {
        ...state,
        status: STATUS.RESOLVED,
        cache: action.data,
      };
    }
    case ERROR: {
      return {
        ...state,
        status: STATUS.REJECTED,
        error: action.error,
      };
    }
    case RESET: {
      return {
        ...state,
        status: STATUS.IDLE,
        cache: action.data,
        fetchArgs: undefined,
      };
    }
    case SET_FETCH_ARGS: {
      if (DEBUG) {
        console.log(
          ` ✉️  the fetch parameters ${JSON.stringify(
            action.fetchArgs,
            null,
            2,
          )}`,
        );
      }
      return {
        ...state,
        fetchArgs: action.fetchArgs,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
export { useFetchApi };
