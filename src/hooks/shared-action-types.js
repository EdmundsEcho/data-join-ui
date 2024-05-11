// src/hooks/shared-action-types.js

/**
 * shared by hooks that useReducer
 */

import { STATUS } from '../core-app/lib/sum-types';

// -----------------------------------------------------------------------------
// internal interface // consumer STATUS
const START = 'start'; // PENDING
const SUCCESS = 'success'; // RESOLVED
const SUCCESS_NOCHANGE = 'success - no update to cache'; // RESOLVED
const ERROR = 'error'; // REJECTED
const IDLE = 'idle'; // UNINITIALIZED
const RESET = 'reset'; // UNINITIALIZED
const READING_CACHE = 'reading cache'; // CONSUMED

// other internal actions
const SET_FETCH_ARGS = 'set fetch args';
const SET_REDIRECT_URL = 'set redirect url';
const SET_NOTICE = 'set notice';
const RESET_ERROR = 'clear error';
// -----------------------------------------------------------------------------
//
export {
  START,
  SUCCESS,
  SUCCESS_NOCHANGE,
  READING_CACHE,
  ERROR,
  IDLE,
  RESET,
  RESET_ERROR,
  SET_FETCH_ARGS,
  SET_REDIRECT_URL,
  SET_NOTICE,
  STATUS,
};
