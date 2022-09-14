// src/hooks/use-fetch-api.js

import { useCallback, useReducer, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import {
  STATUS,
  START,
  SUCCESS,
  UNCHANGED,
  ERROR,
  IDLE,
  RESET,
  SET_FETCH_ARGS,
  SET_REDIRECT_URL,
  SET_NOTICE,
} from './shared-action-types';

import { colors, areSimilarObjects } from '../core-app/constants/variables';
import { DesignError } from '../core-app/lib/LuciErrors';

import useAbortController from './use-abort-controller';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * use-fetch-api hook
 *
 * Feature: unified request/response handling for the dashboard
 *
 * ✅ cache data with compare capability
 *
 * ✅ status reporting
 *
 * ✅ cleanup with abortController
 *
 * ✅ error handling, redirect and snackbar service
 *
 * 🔖 this module should handle all errors
 *    error -> reporting, redirecting etc..
*     (see also use-error-handling)
 *
 ----------------------------------------------------------------------------- */
/**
 *
 * @function
 * @return {React.hook}
 *
 */
const useFetchApi = ({
  asyncFn,
  initialValue, // optional
  consumeDataFn, // alternative to using the cache, response.data
  immediate = true,
  useSignal = true,
  caller = 'anonymous',
  equalityFnName = 'identity',
  abortController: abortControllerProp = undefined,
  DEBUG = false,
}) => {
  console.assert(
    typeof asyncFn === 'function',
    `use-fetch-api: ${caller} did not provide asyncFn`,
  );
  // -----------------------------------------------------------------------------
  //
  // initialize the local state
  // hosts the status of the fetch and the data
  //
  const [fetchState, dispatch] = useReducer(fetchReducer(DEBUG), {
    status: STATUS.UNINITIALIZED,
    cache: initialValue || null,
    error: null,
    notice: null,
    fetchArgs: null, // important
  });
  // -----------------------------------------------------------------------------
  const redirectData = typeof consumeDataFn !== 'undefined';
  console.assert(
    !redirectData || (redirectData && typeof consumeDataFn === 'function'),
    `Fetch api consume data fn is not a function`,
  );
  // -----------------------------------------------------------------------------
  const previousCacheRef = useRef(undefined);
  const abortController = useAbortController(abortControllerProp);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // -----------------------------------------------------------------------------
  if (DEBUG) {
    console.debug(`%cfetch hook loading: ${caller}`, colors.purpleGrey);
    console.debug(abortController);
  }
  // -----------------------------------------------------------------------------
  // 🟢 entry-point: useEffect listens for changes to args
  // -----------------------------------------------------------------------------
  const execute = useCallback((...args) => {
    dispatch({ type: SET_FETCH_ARGS, payload: args });
    dispatch({ type: START });
  }, []);

  const reset = () => {
    return () => {
      dispatch({ type: RESET });
    };
  };

  const cancel = useCallback(() => {
    return () => {
      abortController.abort();
      dispatch({ type: RESET });
    };
  }, [abortController]);

  // ---------------------------------------------------------------------------
  // 💢 async api calls augmented with abortController.signal
  // Triggering this effect:
  // 1. immediate = true
  // 2. set fetch args
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (fetchState.status === STATUS.UNINITIALIZED) return cancel;
    if (fetchState.status === STATUS.RESOLVED) return cancel;
    (async () => {
      //
      const augmentedArgs = useSignal
        ? [...fetchState.fetchArgs, abortController.signal]
        : fetchState.fetchArgs;
      if (DEBUG) {
        console.debug(`Fetch api args for caller ${caller}:`, augmentedArgs);
      }
      try {
        // ---------------------------------------------------------------------
        // ⏰
        const response = await asyncFn(...augmentedArgs);

        if (
          compare(equalityFnName, previousCacheRef, response, caller, DEBUG)
        ) {
          dispatch({ type: UNCHANGED });
          return;
        }

        previousCacheRef.current = response.data;

        // update reducer state
        fetchRoutine({
          response,
          dispatch,
          navigate,
          caller,
          DEBUG,
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          console.warn(`use-fetch-api call was cancelle: ${caller}`);
        } else if (e.name === 'CanceledError') {
          console.warn(`fetch: ${e.message}`);
        } else throw e;
      }
    })();
    // effect();
    return cancel;
  }, [
    // props
    useSignal,
    equalityFnName,
    caller,
    asyncFn,
    // local
    previousCacheRef,
    fetchState.fetchArgs,
    fetchState.status,
    cancel,
    navigate, // hook
    abortController, // hook
    DEBUG,
  ]);

  // ----------------------------------------------------------------------------
  // Run the effects that consume the error states
  // 💢 Run the effects that depend on state
  // 🔖 each link to a global, external context
  // ⚠️  does not reset state
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (fetchState.notice) {
      enqueueSnackbar(fetchState.notice.message, {
        variant: fetchState.notice.variant,
      });
    }
  }, [enqueueSnackbar, fetchState.notice]);

  useEffect(() => {
    if (fetchState.redirectUrl) {
      navigate(fetchState.redirectUrl);
    }
  }, [navigate, fetchState.redirectUrl]);

  useEffect(() => {
    if (immediate) {
      execute(); // change args null -> []
    }
    return cancel;
  }, [execute, cancel, immediate]);

  // ---------------------------------------------
  // hook API
  return {
    execute,
    status: fetchState.status,
    cache: fetchState.cache,
    error: fetchState.error,
    cancel,
    reset,
  };
  // ---------------------------------------------
};

/**
 * fetch reducer tracks the status of the async call
 */
function fetchReducer(DEBUG) {
  return (state, action) => {
    if (DEBUG) {
      console.debug(`use-fetch-api service:`);
      console.debug(`%c${action.type}`, 'color:cyan');
    }
    switch (action.type) {
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
          cache: action.payload,
        };
      }
      // SUCCESS retrieving already cached data
      case UNCHANGED: {
        return {
          ...state,
          status: STATUS.RESOLVED,
        };
      }
      case ERROR: {
        return {
          ...state,
          status: STATUS.REJECTED,
          error: action.payload,
        };
      }
      case RESET: {
        return {
          ...state,
          status: STATUS.UNINITIALIZED,
          cache: null,
          fetchArgs: null,
        };
      }
      case SET_NOTICE: {
        return {
          ...state,
          notice: action.payload,
        };
      }
      case SET_REDIRECT_URL: {
        return {
          ...state,
          redirectUrl: action.payload,
        };
      }
      case SET_FETCH_ARGS: {
        if (DEBUG) {
          console.log(
            `✉️  the fetch parameters ${JSON.stringify(
              action.fetchArgs,
              null,
              2,
            )}`,
          );
        }
        return {
          ...state,
          fetchArgs: action.payload,
        };
      }
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  };
}

// -----------------------------------------------------------------------------
// 💢 update reducer (dispatch)
// 🔖 reuse this when retrieving the core-project store
// -----------------------------------------------------------------------------
function fetchRoutine({
  response,
  dispatch,
  consumeDataFn,
  caller = 'anonymous',
  DEBUG = false,
}) {
  // -----------------------------------------------------------------------------
  const { error = false, status } = response.data;
  const is200Error = error && status !== 'Error' && response.status === 200;

  if (DEBUG) {
    console.debug(`%c${caller}`, colors.light.blue);
    console.debug(
      `%c------------------------ useFetchApi response`,
      colors.light.blue,
    );
    console.dir(response);
  }

  console.assert(
    'status' in response,
    `Unexpected response: Missing status\n${Object.keys(response)}`,
  );
  //
  // 🚧 expand on this to make it the main way to navigate
  //    through various errors?
  //
  switch (response.status) {
    case 200: {
      if (is200Error) {
        dispatch({ type: ERROR, payload: error });
        dispatch({
          type: SET_REDIRECT_URL,
          payload: `/error?message=${JSON.stringify(error)}`,
        });
        break;
      }

      // -----------------------------
      // 📦 response.data
      // -----------------------------
      if (typeof consumeDataFn !== 'undefined') {
        dispatch({ type: SUCCESS });
        consumeDataFn(response.data);
        break;
      }
      dispatch({ type: SUCCESS, payload: response.data });
      break;
    }

    case 204:
      dispatch({
        type: SET_NOTICE,
        payload: {
          message: `Success`,
          variant: 'success',
        },
      });
      dispatch({ type: SUCCESS });
      break;

    case 401:
      dispatch({
        type: SET_NOTICE,
        payload: {
          message: `Unauthorized: Session expired`,
          variant: 'info',
        },
      });
      dispatch({
        type: SET_REDIRECT_URL,
        payload: '/login',
      });
      break;

    default:
      dispatch({
        type: SET_NOTICE,
        payload: {
          message: `Error: Api response error`,
          variant: 'error',
        },
      });
  }
}

// -----------------------------------------------------------------------------
// ⚙️  map function name -> function
//    Utilized by compare
//
const equalityFns = {
  length: (value) => {
    if (Array.isArray(value)) {
      return value.length;
    }
    throw new DesignError(
      `use-fetch-api equalityFn: "length" Wrong type for value ${typeof value}`,
    );
  },
  matchProp: (prop, obj) => {
    if (prop in obj) {
      return obj[prop];
    }
    throw new DesignError(
      `use-fetch-api eqalityFn: "matchProp" Missing prop value ${prop}`,
    );
  },
  similarObjects: areSimilarObjects,
  identity: (x) => x,
};
/**
 * Local predicate
 * Avoid changing cache using configured equalityFnName
 *
 * Quietly reports false when the equality function does not align with
 * the values being compared (type mismatch).
 *
 * @function
 * @return {bool}
 */
function compare(equalityFnName, cacheRef, response, caller, DEBUG) {
  try {
    const cache = cacheRef.current;
    // ---------------------------------------------------------------------
    // Optional optimization to prevent echoed data
    //
    let isEqual = false;
    switch (true) {
      case typeof cache === 'undefined':
        isEqual = false;
        break;

      case equalityFnName === 'identity':
        isEqual = cache === response.data;
        break;

      case equalityFnName === 'length': {
        isEqual =
          equalityFns.length(cache) === equalityFns.length(response.data);
        break;
      }

      case equalityFnName === 'similarObjects':
        isEqual = equalityFns.similarObjects(cache, response.data);
        break;

      case equalityFnName.includes('compareProp'): {
        const prop = equalityFnName.split(',')[1];
        isEqual =
          equalityFns.comparedProp(prop, cache) ===
          equalityFns.comparedProp(prop, response.data);
        break;
      }

      default:
        isEqual = false;
    }

    if (DEBUG) {
      console.debug(`EQUALITY fn: ${equalityFnName} - ${isEqual}`);
      console.dir({
        caller,
        cache,
        response: response.data,
        isEqual,
      });
    }
    return isEqual;
  } catch (e) {
    if (e instanceof DesignError) {
      console.warn(`fetch-api equaity function failed (data -> error?)`);
      console.warn(e);
      return false;
    }
    throw e;
  }
}
export { useFetchApi, STATUS };
