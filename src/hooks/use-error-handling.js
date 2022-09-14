// src/hooks/use-error-api.js

import { useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import {
  ERROR,
  STATUS,
  SUCCESS,
  SET_REDIRECT_URL,
  SET_NOTICE,
  RESET,
} from './shared-action-types';

import { colors } from '../core-app/constants/variables';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * Encapsulate Error handling for the dashboard.
 * See also, use-fetch-api
 *
 * This version does has an optional cache.  This version does *not* process
 * state changes while waiting for the async data call to resolve.
 *
 * The main export = run
 */
const useErrorHandling = ({ consumeDataFn, initialValue, caller, DEBUG }) => {
  // -----------------------------------------------------------------------------
  // initialize the local state
  // (optional default: cache)
  // -----------------------------------------------------------------------------
  const [state, dispatch] = useReducer(statusReducer(DEBUG), {
    status: STATUS.UNINITIALIZED,
    error: null,
    notice: null,
    redirectUrl: null,
    cache: initialValue || null,
  });
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const redirectData = typeof consumeDataFn !== 'undefined';

  /**
   * 💢 response
   *
   *   -> Sends out notices,redirects the user or consumes the data
   *
   *   External effect: consumeDataFn || retrieve from this reducer
   *
   */
  const run = (response) => {
    console.debug('RESPONSE');
    console.dir(response);
    // update reducer based on resopnse
    const { error = false, status } = response.data;
    const is200Error = error && status !== 'Error' && response.status === 200;

    if (DEBUG) {
      console.debug(`%c${caller}`, colors.light.yellow);
      console.debug(
        `%c------------------------ useErrorApi`,
        colors.light.yellow,
      );
      console.dir(response);
    }

    console.assert(
      'status' in response,
      `Unexpected response: Missing status\n${Object.keys(response)}`,
    );

    // enable re-use of the hook within a context
    dispatch({ type: RESET, payload: initialValue || null });
    //
    // 🚧 Encapsulate All error handling
    //
    switch (response.status) {
      case 200: {
        if (is200Error) {
          dispatch({ type: ERROR, payload: error });
          dispatch({
            type: SET_REDIRECT_URL,
            payload: `/error?message=${JSON.stringify(error)}`,
          });
        }
        // -----------------------------
        // 📦 response.data
        // -----------------------------
        if (redirectData) {
          consumeDataFn(response.data);
          dispatch({ type: SUCCESS });
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
        dispatch({ type: SET_REDIRECT_URL, payload: '/login' });
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
  };

  const reset = () => {
    dispatch({ type: RESET, payload: initialValue || null });
  };
  // ----------------------------------------------------------------------------
  // 💢 Run the effects that depend on state
  // 🔖 each link to a global, external context
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (state.notice) {
      enqueueSnackbar(state.notice.message, {
        variant: state.notice.variant,
      });
    }
  }, [enqueueSnackbar, state.notice]);

  useEffect(() => {
    if (state.redirectUrl) {
      navigate(state.redirectUrl);
    }
  }, [navigate, state.redirectUrl]);

  return {
    run,
    reset,
    cache: state.cache,
  };
};

/**
 * status and error reducer
 */
function statusReducer(DEBUG) {
  return (state, action) => {
    if (DEBUG) {
      console.debug(`use-fetch-api service:`);
      console.debug(`%c${action.type}`, 'color:cyan');
    }
    switch (action.type) {
      case SUCCESS: {
        return {
          ...state,
          status: STATUS.RESOLVED,
          cache: action.payload,
        };
      }
      case ERROR: {
        return {
          ...state,
          status: STATUS.REJECTED,
          error: action.payload,
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
      case RESET:
        return {
          status: STATUS.UNINITIALIZED,
          error: null,
          notice: null,
          redirectUrl: null,
          cache: action.payload,
        };

      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  };
}
export { useErrorHandling, STATUS };
