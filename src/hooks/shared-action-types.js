// src/hooks/shared-action-types.js

/**
 * shared by hooks that useReducer
 */

import { STATUS } from '../core-app/lib/sum-types';

// -----------------------------------------------------------------------------
// internal interface // consumer STATUS
const START = 'start'; // PENDING
const SUCCESS = 'success'; // RESOLVED
const UNCHANGED = 'unchanged'; // RESOLVED
const ERROR = 'error'; // REJECTED
const IDLE = 'idle'; // UNINITIALIZED
const RESET = 'reset'; // UNINITIALIZED

// other internal actions
const SET_FETCH_ARGS = 'set fetch args';
const SET_REDIRECT_URL = 'set redirect url';
const SET_NOTICE = 'set notice';
// -----------------------------------------------------------------------------
//
export {
  START,
  SUCCESS,
  UNCHANGED,
  ERROR,
  IDLE,
  RESET,
  SET_FETCH_ARGS,
  SET_REDIRECT_URL,
  SET_NOTICE,
  STATUS,
};
