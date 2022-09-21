// src/hooks/use-shared-fetch-api.js

import { useCallback, useReducer, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import {
  STATUS,
  START,
  SUCCESS,
  SUCCESS_NOCHANGE,
  ERROR,
  RESET,
  RESET_ERROR,
  SET_FETCH_ARGS,
  SET_REDIRECT_URL,
  SET_NOTICE,
} from './shared-action-types';

import { DesignError } from '../core-app/lib/LuciErrors';
import { colors, equal } from '../core-app/constants/variables';

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * use-shared-fetch-api hook
 *
 * Feature: unified request/response handling for the dashboard
 *
 * ✅ compares input params to avoid repeat requests
 *
 * ✅ status reporting of async process
 *
 * ✅ error handling
 *
 * 🔑  this module should provide a capacity to consume
 *     *all* errors. 3 options for processing "meta" including errors
 *
 *     meta/error -> redirect to login | error page and/or snackbar
 *
 *     Using: state.notice, state.redirectUrl, state.error
 *
 ----------------------------------------------------------------------------- */

const ERROR_PATHNAME = '/error';
const LOGIN_PATHNAME = '/login';
const AUTHO_PATHNAME = '/authorize';

// Forward to AuthRedirect that reads the search params to redirect
const AUTHO_SEARCH = (provider, projectId) => {
  return `?provider=${provider}&projectId=${projectId}`;
};

// initial state
const initializeWithCache = (cache) => ({
  status: STATUS.UNINITIALIZED,
  cache: cache || null,
  error: null,
  notice: null, // consumed by snackbar { message, variant }
  redirectUrl: null, // consumed by navigate { pathname, search }
  fetchArgs: null, // null value matters
  initialCache: cache || null, // cached cache for reset
});

// -----------------------------------------------------------------------------
/**
 * 📌 useSharedFetchApi specification
 *
 * Two parts to configuring this hook.
 * 1. Instantiate with initial cache value
 * 2. Use the returned middlewareWithDispatch
 *
 * @function
 * @return {React.hook}
 *
 */
const useSharedFetchApi = ({
  blockAsyncWithEmptyParams,
  initialCacheValue, // optional
  caller,
  DEBUG = false,
}) => {
  // -----------------------------------------------------------------------------
  if (DEBUG) {
    console.debug(`%cuseSharedFetchApi loading: ${caller}`, colors.purpleGrey);
  }
  //
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  // -----------------------------------------------------------------------------
  //
  // initialize the local state
  // hosts the status of the fetch and the data
  //
  const [state, dispatch] = useReducer(
    reducer(blockAsyncWithEmptyParams, caller, DEBUG),
    initializeWithCache(initialCacheValue),
  );

  // ---------------------------------------------------------------------------
  // 💢 Effects that consume the output of the middleware
  //   (final state)
  //
  // 🔖 each effect links to a global, external context
  //
  // ⚠️  does not reset state (so consumer must call)
  //
  // ---------------------------------------------------------------------------
  // 🏷️  state.notice -> consume using snackbar
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (state.notice) {
      enqueueSnackbar(state.notice.message, {
        variant: state.notice.variant,
      });
      dispatch({ type: SET_NOTICE, payload: null });
    }
  }, [enqueueSnackbar, state.notice]);
  // ---------------------------------------------------------------------------
  // 🔗  state.redirectUrl -> consume using redirect
  //     Augment the redirect with the fromPathname property
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (state.redirectUrl) {
      navigate(state.redirectUrl, {
        replace: true,
        state: { fromPathname: location.pathname }, // retrieve using useLocation
      });
      dispatch({ type: SET_REDIRECT_URL, payload: null });
    }
  }, [navigate, location.pathname, state.redirectUrl]);
  // ---------------------------------------------------------------------------
  // 🚫  state.error -> consume using redirect with error query
  // -> STATUS.IDLE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (state.error) {
      dispatch({ type: RESET_ERROR });
      navigate({
        pathname: ERROR_PATHNAME,
        search: `?${searchParamsFromError(state.error)}`,
      });
    }
  }, [navigate, state.error]);
  // complete the state-cycle with a fresh cache
  // -> UNINITIALIZED
  const reset = useCallback(() => {
    return dispatch({ type: RESET });
  }, []);

  // access point that enables
  // response -> generate side-effects taht consume errors and other meta
  const middlewareWithDispatch = useCallback(
    (...args) => {
      const partialState = { fetchArgs: state.fetchArgs, cache: state.cache };
      const middlewareClosure = middleware(dispatch, partialState);
      return middlewareClosure(...args);
    },
    [state.fetchArgs, state.cache],
  );
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // debugging effect
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (DEBUG) {
      console.debug(
        `%cuseSharedFetchApi status for caller ${caller}: ${state.status}`,
        'color:orangered',
      );
    }
  }, [DEBUG, state.status, caller]);

  // ---------------------------------------------------------------------------
  // hook API
  //
  // middlewareWithDispatch is a function
  //
  //  return ({
  //    response,
  //    consumeDataFn = undefined, // fn :: (response.data, fetchArgs)
  //    setCacheFn = undefined, // fn ::(response.data, cache)
  //    caller = 'anonymous',
  //    DEBUG = false,
  //  }) => {..}
  //
  // ---------------------------------------------
  return {
    state,
    dispatch,
    middlewareWithDispatch, // fn :: closure with access to dispatch & previous state
    reset,
  };
  // ---------------------------------------------------------------------------
};
/**
 * hosts the status (documentation) of the async call
 *
 */
function reducer(blockAsyncWithEmptyParams, caller, DEBUG) {
  return (state, action) => {
    if (DEBUG) {
      console.debug(
        `%cuseSharedFetchApi action for ${caller}: ${JSON.stringify(
          action,
          (key, value) => {
            if (key === 'payload' && isObject(value)) {
              return Object.keys(value);
            }
            return value;
          },
          2,
        )}`,
        colors.light.yellow,
      );
    }
    switch (action.type) {
      case RESET:
        return initializeWithCache(state.initialCache);

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
      case SUCCESS_NOCHANGE: {
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
      case RESET_ERROR: {
        return {
          ...state,
          status: STATUS.IDLE,
          error: null,
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
        // ✨ Avoid triggering effects that depend on args
        //    when inputs haven't changed
        if (
          changedArgs(
            action.payload,
            state.fetchArgs,
            blockAsyncWithEmptyParams,
            caller,
            DEBUG,
          )
        ) {
          return {
            ...state,
            fetchArgs: action.payload,
          };
        }
        return state;
      }
      default: {
        throw new DesignError(
          `shared-fetch-api: Unhandled action type: ${action.type}`,
        );
      }
    }
  };
}

// -----------------------------------------------------------------------------
// ✨  Where we encapsulate error handling (consume all errors)
//
//     document: response -> dispatch
//
//     to local + optional consumeDataFn
//
// ~ middleware (dispatch -> response -> action)
//
// 🔖  An error object can be written to state for the caller to
//     use when generating an error page.
//
// 🚧  Expand on this to make it the main way to redirect
//     through various errors?
//
// -----------------------------------------------------------------------------
function middleware(dispatch, state) {
  // public interface: fn ({..})
  // partial application occurs at the top of this module
  // (see middlewareWithDispatch)
  return ({
    response,
    consumeDataFn = undefined, // fn :: (response.data, fetchArgs)
    setCacheFn = undefined, // fn ::(response.data, cache)
    caller = 'anonymous',
    DEBUG = false,
  }) => {
    // -----------------------------------------------------------------------------
    if (DEBUG) {
      console.debug(`%c${caller}`, colors.light.blue);
      console.debug(
        `%c------------------------ useSharedFetchApi ${caller} response`,
        'color:orangered',
      );
      console.dir(response);
    }
    console.assert(
      'status' in response,
      `Unexpected response: Missing status\n${Object.keys(response)}`,
    );
    console.assert(
      'data' in response,
      `Unexpected response: Missing status\n${Object.keys(response)}`,
    );

    // Encapsulate all error handling
    switch (response.status) {
      case 200: {
        const maybeErr = is200ResponseError(response);
        if (maybeErr) {
          dispatch({ type: ERROR, payload: maybeErr });
          break;
        }

        if (typeof consumeDataFn !== 'undefined') {
          // -------------------------------------------
          // 💢 📦 response.data
          // 1. avoid writing data to cache
          // 2. avoid being a dependency of an effect
          // -------------------------------------------
          consumeDataFn(response.data, state.fetchArgs);
          dispatch({ type: SUCCESS });
          break;
        }
        const payload =
          typeof setCacheFn === 'function'
            ? setCacheFn(response.data, state.cache)
            : response.data;

        dispatch({
          type: SUCCESS,
          payload,
        });
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
        dispatch({ type: SUCCESS_NOCHANGE });
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
          payload: { pathname: LOGIN_PATHNAME },
        });
        dispatch({
          type: SUCCESS_NOCHANGE,
        });
        break;

      case 403:
        actionsFrom403Error(response, state.fetchArgs).forEach(dispatch);
        dispatch({
          type: SUCCESS_NOCHANGE,
        });
        break;

      case 500:
        actionsFrom500Error(response, state.fetchArgs).forEach(dispatch);
        dispatch({
          type: SUCCESS_NOCHANGE,
        });
        break;

      default:
        console.error('useSharedApi response:', response);
        dispatch({
          type: SET_NOTICE,
          payload: {
            message: `Error: Api response error`,
            variant: 'error',
          },
        });
    }
  };
}

/**
 * Predicate that will "peel-away" at some of the more obvious
 * scenarios where we prevent the args from being updated...
 * preventing a new call to execute.
 *
 * @function
 * @param {Array}
 */
function changedArgs(
  newArgs,
  prevArgs,
  blockAsyncWithEmptyParams,
  caller,
  DEBUG,
) {
  const noValue = (value) =>
    [(v) => v === null, (v) => typeof v === 'undefined'].reduce(
      (acc, predicate) => acc || predicate(value),
      false,
    );

  let changed = true;
  switch (true) {
    // short-circuit when prevArgs can't be used to compare
    case noValue(prevArgs) || noValue(newArgs):
      changed = true;
      break;

    // [] -> [] consider different when not blocked
    case emptyArgs(prevArgs) &&
      emptyArgs(newArgs) &&
      !blockAsyncWithEmptyParams:
      changed = true;
      break;

    default:
      changed = !equal(newArgs, prevArgs);
  }
  if (DEBUG) {
    const color = changed ? 'color:orangered' : 'color:green';
    const msg = changed ? 'Params Changed' : 'Params UNCHANGED';
    console.debug(
      `%cuse-fetch-api ${caller}: ${msg}\n${JSON.stringify(newArgs, null, 2)}`,
      color,
    );
    console.debug(
      `%cuse-fetch-api ${caller}: ${msg}\n${JSON.stringify(prevArgs, null, 2)}`,
      color,
    );
  }
  return changed;
}

/**
 * Predicate
 * 1. Guard for compare response values (use-fetch-api)
 * 2. Used to fork the process when the 200 response is not as expected.
 * @function
 * @param {Object} response
 * @return {Object | bool}
 */
export function is200ResponseError(response) {
  const { error = false, status } = response.data;
  return error && status !== 'Error' && response.status === 200 ? error : false;
}
/**
 * Predicate
 * value === []
 */
function emptyArgs(args) {
  return Array.isArray(args) && args.length === 0;
}

/**
 * error -> search params
 * WIP
 * @function
 * @param {Error}
 * @return {SearchParams}
 */
function searchParamsFromError(error) {
  return `message=${JSON.stringify(error)}`;
}

/**
 * 403 error response -> [actions]
 * Consumer = useEffect state.redirect
 */
function actionsFrom403Error(response, fetchArgs) {
  try {
    const { message, provider } = response.data;
    const [{ project_id: projectId }] = fetchArgs;
    console.assert(
      message.includes('Expired token'),
      'Unexpected 403 response format',
    );
    return [
      {
        type: SET_NOTICE,
        payload: {
          message,
          variant: 'info',
        },
      },
      {
        type: SET_REDIRECT_URL,
        payload: {
          pathname: AUTHO_PATHNAME,
          search: AUTHO_SEARCH(provider, projectId),
        },
      },
    ];
  } catch (e) {
    return [
      {
        type: SET_NOTICE,
        payload: {
          message: '403 Unauthorized',
          variant: 'warning',
        },
      },
    ];
  }
}
function isObject(value) {
  return !Array.isArray(value) && typeof value === 'object' && value !== null;
}

/**
 * 500 error response -> [actions]
 * Consumer = useEffect state.redirect
 */
function actionsFrom500Error(response /* fetchArgs */) {
  try {
    const { message, status } = response.data;
    console.assert(status.includes('Error'), 'Unexpected 500 response format');
    // FYI: fetchArgs has everything required to try again
    return [
      {
        type: SET_NOTICE,
        payload: {
          message: `Error: Api response error`,
          variant: 'error',
        },
      },
      {
        type: SET_REDIRECT_URL,
        payload: {
          pathname: ERROR_PATHNAME,
          search: `?message=Internal Error&longMessage=${message}`,
        },
      },
    ];
  } catch (e) {
    return [
      {
        type: SET_REDIRECT_URL,
        payload: {
          pathname: ERROR_PATHNAME,
          search: `?message=Unexpected error`,
        },
      },
    ];
  }
}
export { useSharedFetchApi };
