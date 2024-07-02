/**
 * @module /src/Ducks/actions/matrix.actions
 *
 * @description
 * User actions related to the matrix.
 * Starts with the action dispatched to sagas to manage the api
 * call for the matrix (mms go).
 *
 */

//------------------------------------------------------------------------------
// middleware-related actions
// feature
export const MATRIX = '[Matrix]'; // feature
export const feature = MATRIX;
export const FETCH_MATRIX = `${MATRIX} FETCH`; // command
export const CANCEL_MATRIX = `${MATRIX} CANCEL`; // command
export const FETCH_MATRIX_CACHE = `${MATRIX} FETCH CACHE`; // command
export const SET_MATRIX = `${MATRIX} SET`; // document
export const SET_MATRIX_CACHE = `${MATRIX} SET CACHE`; // document
export const MATRIX_ERROR = `${MATRIX} ERROR`; // document
export const TAG_MATRIX_STATE = `${MATRIX} TAG MATRIX STATE`;
export const UI_KEY = 'request';

// action kind:: command, see matrix.sagas
export const fetchMatrix = (projectId, abortController /* rest from state */) => ({
  type: FETCH_MATRIX,
  projectId,
  abortController,
  payload: UI_KEY,
});

// action kind :: command, see matrix.middleware
export const cancelMatrix = () => ({
  type: CANCEL_MATRIX,
  payload: UI_KEY,
});

// command
export const fetchMatrixCache = (payload) => ({
  type: FETCH_MATRIX_CACHE,
  payload,
});

// event
export const matrixEventError = (payload) => ({
  type: MATRIX_ERROR,
  payload,
});
// action kind :: document
export const setMatrix = (payload) => ({
  type: SET_MATRIX,
  payload,
});

// document
export const tagMatrixState = (payload) => ({
  type: TAG_MATRIX_STATE,
  payload,
});

// action kind :: document
// 🔖 processed by normalizer
export const setMatrixCache = (payload) => ({
  type: SET_MATRIX_CACHE,
  ...payload,
});
