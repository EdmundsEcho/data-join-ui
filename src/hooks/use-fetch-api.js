// src/hooks/use-fetch-api.js
/**
 * @module hooks/use-fetch-api
 *
 * Depends on <SnackbarProvider>
 *
 */
import { useCallback, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

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
const SET_NOTICE = 'set notice';

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
  initialValue, // optional
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
    notice: null,
  });

  const isMounted = useMountedState();

  // generic (all consumers benefit) redirect to login when 401
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  //
  // 💢 Called when user updates fetchParams using fetch ref
  //    Updates the local reducer
  //
  useEffect(() => {
    let ignore = false;

    // ------------------------------------------------------------------------
    // 🛡️ guards against calling fetch
    // 🟢 "unlock" the service
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
    //
    // specifiy the effect
    //
    const innerFetch = async () => {
      try {
        if (!ignore) {
          dispatch({ type: START });

          // ⏰ fetch response
          const response = await fetchFn(fetchState.fetchArgs);

          if (DEBUG_PROP) {
            console.debug(`------------------------ useFetchApi response`);
            console.dir(response);
          }

          // proceed only if the calling component is still mounted
          // React sets the value to false when the hook is dismounted
          if (isMounted()) {
            console.assert(
              response?.status ?? false,
              `Unexpected response: Missing status\n${Object.keys(response)}`,
            );
            switch (response.status) {
              case 200:
                dispatch({ type: SUCCESS, data: response.data });
                break;

              case 401:
                dispatch({
                  type: SET_NOTICE,
                  payload: {
                    message: `Unauthorized: Session expired`,
                    variant: 'error',
                  },
                });
                navigate('/login');
                break;

              default:
                dispatch({
                  type: SET_NOTICE,
                  payload: {
                    message: `Error: Api response error`,
                    variant: 'error',
                  },
                });
            } // end swith
          } // end if
        }
      } catch (e) {
        dispatch({
          type: SET_NOTICE,
          payload: {
            message: `Error: Api response error`,
            variant: 'error',
          },
        });
        dispatch({
          type: ERROR,
          error: JSON.stringify(e, null, 2),
        });
      }
    };
    // ------------------------------------------------------------------------
    // Call the function
    // ------------------------------------------------------------------------
    innerFetch();
    // ------------------------------------------------------------------------
    // see react 18 documentation
    return () => {
      ignore = true;
    };
  }, [
    fetchState.fetchArgs,
    fetchState.activated,
    fetchFn,
    navigate,
    isMounted,
    DEBUG_PROP,
  ]);

  useEffect(() => {
    if (fetchState.notice) {
      enqueueSnackbar(fetchState.notice.message, {
        variant: fetchState.notice.variant,
      });
    }
  }, [enqueueSnackbar, fetchState.notice]);

  // external: call fetch by changing the local state (triggering the effect)
  const fetch = useCallback(
    (...args) => {
      dispatch({ type: SET_FETCH_ARGS, fetchArgs: args });
    },
    [dispatch],
  );

  const reset = useCallback(() => {
    // set the status
    dispatch({ type: RESET, data: null });
  }, [dispatch]);

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
    case SET_NOTICE: {
      return {
        ...state,
        message: action.message,
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
