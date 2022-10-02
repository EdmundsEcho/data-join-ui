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
export const FETCH_MATRIX_CACHE = `${MATRIX} FETCH CACHE`; // command
export const SET_MATRIX = `${MATRIX} SET`; // document
export const SET_MATRIX_CACHE = `${MATRIX} SET CACHE`; // document
export const MATRIX_ERROR = `${MATRIX} ERROR`; // document
export const TAG_MATRIX_STATE = `${MATRIX} TAG MATRIX STATE`;

// command
// 🔖 projectId used to assert with matrix.saga context
export const fetchMatrix = (
  projectId,
  abortController /* rest from state */,
) => ({
  type: FETCH_MATRIX,
  projectId,
  abortController,
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
