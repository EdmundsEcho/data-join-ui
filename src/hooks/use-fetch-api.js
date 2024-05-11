// src/hooks/use-fetch-api.js

import { useCallback, useRef, useEffect } from 'react';
import { PropTypes } from 'prop-types';

import {
  STATUS,
  START,
  SUCCESS_NOCHANGE,
  READING_CACHE,
  RESET,
  SET_FETCH_ARGS,
} from './shared-action-types';

import { colors, areSimilarObjects, equal } from '../core-app/constants/variables';
import { DesignError } from '../core-app/lib/LuciErrors';

import useAbortController from './use-abort-controller';
import { useSharedFetchApi, is200ResponseError } from './use-shared-fetch-api';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * use-fetch-api hook
 *
 * ✅ calls the api with asyncFn
*
 * ✅ cleanup with abortController
 *
 * ✅ optional use of cache (consumeDataFn to prevent use of cache)
 *
 * ✅ prevents cache update with same value
 *
 * ✅ error handling, cache and status using use-shared-fetch-api
 *
 ----------------------------------------------------------------------------- */
/**
 *
 *  return {
 *    execute,
 *    status: state.status,
 *    cache: state.cache,
 *    error: state.error,
 *    fetchArgs: state.fetchArgs,
 *    cancel,
 *    reset,
 *    isReady: [STATUS.RESOLVED, STATUS.REJECTED].includes(state.status),
 *  };
 * @function
 * @return {React.hook}
 *
 *   setCacheFn = undefined, // fn ::(response.data, cache)
 *   consumeDataFn = undefined, // fn :: (response.data, fetchArgs)
 */
const useFetchApi = ({
  asyncFn,
  blockAsyncWithEmptyParams = false,
  setCacheFn = undefined, // fn :: (response.data, cache) -> newCache
  consumeDataFn, // fn :: (response.data, fetchArgs) alternative to using the cache
  immediate = true,
  useSignal = true,
  equalityFnName = 'identity', // cache: avoids updates with same value
  abortController: abortControllerProp = undefined,
  caller = 'anonymous',
  initialCacheValue, // optional, passed to shared-fetch-api
  turnOff = false,
  DEBUG = false,
}) => {
  // -----------------------------------------------------------------------------
  const redirectData = typeof consumeDataFn !== 'undefined';
  validateInput(caller, asyncFn, consumeDataFn, setCacheFn);
  // -----------------------------------------------------------------------------
  const {
    state,
    dispatch,
    middlewareWithDispatch: runMiddleware, // fn :: (dispatch, partial state)
    reset, // passthrough
  } = useSharedFetchApi({
    blockAsyncWithEmptyParams,
    initialCacheValue,
    caller: `useFetchApi c/o: ${caller}`,
    DEBUG,
  });
  // -----------------------------------------------------------------------------
  // other hooks
  const previousCacheRef = useRef(undefined);
  const previousFetchArgsRef = useRef(undefined);
  const abortController = useAbortController(abortControllerProp);
  // -----------------------------------------------------------------------------
  if (DEBUG) {
    const { aborted } = abortController.signal;
    const color = aborted ? colors.purpleDarkGrey : colors.purpleGrey;
    console.debug(`%cuseFetchApi loading: ${caller}      Aborted: ${aborted}`, color);
  }
  // -----------------------------------------------------------------------------
  // 🟢 entry-point: useEffect listens for changes to args
  // -----------------------------------------------------------------------------
  const execute = useCallback(
    (...args) => {
      //
      if (!turnOff) {
        const hasRequiredParams =
          !blockAsyncWithEmptyParams ||
          (blockAsyncWithEmptyParams && !isArgsEmpty(args));

        if (hasRequiredParams) {
          dispatch({ type: SET_FETCH_ARGS, payload: args });
          dispatch({ type: START });
        }
      }
    },
    [dispatch, turnOff, blockAsyncWithEmptyParams],
  );

  // -----------------------------------------------------------------------------
  // 📥 read the cache; set the status to "consumed"
  // -----------------------------------------------------------------------------
  const getCache = useCallback(() => {
    if (state.status === STATUS.RESOLVED) {
      dispatch({ type: READING_CACHE });
    }
    return state.cache;
  }, [dispatch, state.cache, state.status]);
  const cancel = useCallback(() => {
    return () => {
      abortController.abort();
      // dispatch({ type: RESET }); // is this required?
    };
  }, [/* dispatch,*/ abortController]);

  // ---------------------------------------------------------------------------
  // 💢 async api call
  //
  // Triggering this effect:
  // 1. useEffect immediate prop = true
  // 2. useCallback set fetch args
  // 3.
  //
  // 👉 input to the runMiddleware
  //
  // ---------------------------------------------------------------------------
  //
  useEffect(() => {
    //
    const hasRequiredParams =
      !blockAsyncWithEmptyParams ||
      (blockAsyncWithEmptyParams && !isArgsEmpty(state.fetchArgs));

    // this wont' be true when the cache change forces an update to the
    // middleware function in this effect.
    const changedFetchArgs = previousFetchArgsRef.current !== state.fetchArgs;

    const isInitialized = state.fetchArgs !== null;

    // Block the effect when triggered by changes in the cache.
    // Required b/c the middleware function updates with the cache. So yes,
    // re-run the useEffect, but block a repeated fetch.
    if (hasRequiredParams && isInitialized && changedFetchArgs) {
      (async () => {
        //
        const fetchArgs = state.fetchArgs === null ? [] : state.fetchArgs;
        const augmentedArgs = useSignal
          ? [...fetchArgs, abortController.signal]
          : state.fetchArgs;
        try {
          // ---------------------------------------------------------------------
          // ⌛
          const response = await asyncFn(...augmentedArgs);

          if (
            // 👍 avoid changing the cache when possible
            !redirectData &&
            compare(previousCacheRef, response, equalityFnName, caller, DEBUG)
          ) {
            dispatch({ type: SUCCESS_NOCHANGE });
          } else {
            previousCacheRef.current = response.data;

            // update reducer state
            runMiddleware({
              response,
              consumeDataFn,
              setCacheFn,
              caller,
              DEBUG,
            });
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            console.warn(`use-fetch-api call was cancelle: ${caller}`);
          } else if (e.name === 'CanceledError') {
            console.warn(`fetch: ${e.message}`);
          } else throw e;
        }
      })();
      previousFetchArgsRef.current = state.fetchArgs; // used to limit effect that depends on args
    }
    return cancel;
  }, [
    runMiddleware, // guard against running the effect when changes
    asyncFn,
    consumeDataFn,
    blockAsyncWithEmptyParams,
    equalityFnName,
    setCacheFn,
    useSignal,
    caller,
    cancel,
    dispatch,
    state.fetchArgs,
    redirectData, // bool
    abortController, // hook
    DEBUG,
  ]);
  // ---------------------------------------------------------------------------
  // Immediate effect
  // 🔖 cannot accept arguments (use a closure if required)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (immediate) {
      execute(); // change args null -> []
    }
    return cancel;
  }, [execute, cancel, immediate]);
  // ---------------------------------------------------------------------------
  // debuggin effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (DEBUG) {
      console.debug(
        `%cuseFetchApi status: ${caller} - ${state.status}`,
        'color:lightblue',
      );
    }
  }, [DEBUG, state.status, caller]);
  // ---------------------------------------------
  // hook API
  return {
    execute,
    status: state.status, // PENDING, RESOLVED, REJECTED, UNINITIALIZED, IDLE, CONSUMED
    cache: state.cache,
    error: state.error,
    fetchArgs: state.fetchArgs,
    getCache, // will update internal state to CONSUMED
    cancel,
    reset,
    isReady: [STATUS.RESOLVED, STATUS.REJECTED].includes(state.status),
  };
  // ---------------------------------------------
};

useFetchApi.propTypes = {
  abortController: PropTypes.shape({
    signal: PropTypes.shape({
      aborted: PropTypes.bool.isRequired,
      onabort: PropTypes.shape({}),
    }),
  }),
  asyncFn: PropTypes.func.isRequired,
  blockAsyncWithEmptyParams: PropTypes.bool,
  caller: PropTypes.string,
  consumeDataFn: PropTypes.func,
  equalityFnName: PropTypes.string,
  immediate: PropTypes.bool.isRequired,
  initialCacheValue: PropTypes.shape({}),
  setCacheFn: PropTypes.func,
  useSignal: PropTypes.bool.isRequired,
  DEBUG: PropTypes.bool,
};
useFetchApi.defaultProps = {
  abortController: undefined,
  blockAsyncWithEmptyParams: false,
  caller: 'anonymous',
  consumeDataFn: undefined,
  equalityFnName: undefined,
  initialCacheValue: undefined,
  setCacheFn: undefined,
  DEBUG: false,
};
// -----------------------------------------------------------------------------
// ⚙️  map function name -> function
//    Utilized by compare (result values)
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
  equal,
  identity: (x) => x,
};
/**
 * Local predicate
 * Avoid changing cache using configured equalityFnName
 *
 * Prints a warning when the equality function does not align with
 * the values being compared (type mismatch).
 *
 * @function
 * @return {bool}
 */
function compare(cacheRef, response_, equalityFnName, DEBUG = false) {
  //
  if (!('data' in response_)) {
    return false;
  }
  const maybeErr = is200ResponseError(response_); // false | error
  const response = maybeErr ? maybeErr : response_; // eslint-disable-line

  try {
    const cache = cacheRef.current;
    // ---------------------------------------------------------------------
    // Optional optimization to prevent echoed data
    //
    let isEqual = false;
    switch (true) {
      case ['undefined', 'null'].includes(typeof cache):
        isEqual = false;
        break;

      case equalityFnName === 'identity':
        isEqual = cache === response.data;
        break;

      case equalityFnName === 'length': {
        isEqual = equalityFns.length(cache) === equalityFns.length(response.data);
        break;
      }

      case equalityFnName === 'equal':
        isEqual = equalityFns.similarObjects(cache, response.data);
        break;

      case equalityFnName === 'similarObjects':
        isEqual = equalityFns.similarObjects(cache, response.data);
        break;

      // 'functionName, propName'
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
      console.debug('👉 useFetchApi: isEqual cache and response.data', isEqual);
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

function validateInput(caller, asyncFn, consumeDataFn, setCacheFn) {
  const fnWhenDefined = (fn) => {
    return typeof fn === 'undefined' ? true : typeof fn === 'function';
  };
  console.assert(
    typeof asyncFn === 'function',
    `use-fetch-api: ${caller} did not provide asyncFn`,
  );
  console.assert(
    fnWhenDefined(setCacheFn),
    `use-fetch-api: ${caller} did not provide a valid setCacheFn`,
  );
  // -----------------------------------------------------------------------------
  console.assert(
    fnWhenDefined(consumeDataFn),
    `use-fetch-api: ${caller} did not provide a valid consumeDataFn`,
  );
}

function isArgsEmpty(...args) {
  return args.length === 0;
}

/**
 * @function
 * @param {Array} args
 * @param {String} caller
 * @param {String} status
 * @return {String}
 */
function argsDisplayString(args, caller, status) {
  return `fetch status: ${status}\n\n✉️  fetch args for ${caller}: ${JSON.stringify(
    args,
    null,
    2,
  )}`;
}
export { useFetchApi, STATUS, argsDisplayString };
