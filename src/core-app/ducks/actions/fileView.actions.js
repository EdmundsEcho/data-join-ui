/**
 * Manages the selection of files that get "inspected", using the
 * inspection endpoint.
 *
 * The reducers and sagas that respond to the actions need to line-up accordingly.
 * Similarly, the container/components that bind the callbacks must provide the
 * parameters *set here*, and in the specified order.
 *
 * @module src/ducks/actions/fileView.actions
 *
 */

export { STATUS } from '../../lib/sum-types';

// feature
export const FILEVIEW = '[FileView]';
export const feature = FILEVIEW;

export const READ_DIR_START = `${FILEVIEW} READ_DIR_START`; // command
export const READ_DIR_SUCCESS = `${FILEVIEW} READ_DIR_SUCCESS`; // event
export const READ_DIR_ERROR = `${FILEVIEW} READ_DIR_ERROR`; // event

export const SET_DIR_STATUS = `${FILEVIEW} SET_DIR_STATUS`; // document
export const SHOW_ROOT_FETCH_HIST = `${FILEVIEW} SHOW_ROOT_FETCH_HIST (REQUESTS)`; // document
export const PUSH_FETCH_HIST = `${FILEVIEW} PUSH_FETCH_HIST`; // document
export const POP_FETCH_HIST = `${FILEVIEW} POP_FETCH_HIST`; // document

// action kind :: command
export const fetchDirectoryStart = (request) => {
  return {
    type: READ_DIR_START,
    request,
  };
};
export const pushFetchHistory = (payload) => {
  return {
    type: PUSH_FETCH_HIST,
    payload,
  };
};
export const popFetchHistory = () => {
  return {
    type: POP_FETCH_HIST,
  };
};
export const showRootFetchHistory = (payload) => {
  return {
    type: SHOW_ROOT_FETCH_HIST,
    payload,
  };
};
// action kind :: event -> document
export const setDirStatus = (status) => {
  return {
    type: SET_DIR_STATUS,
    status,
  };
};

// action kind :: event -> document
export const fetchDirectorySuccess = (payload) => {
  return {
    type: READ_DIR_SUCCESS,
    payload,
  };
};
// action kind :: event -> document
export const fetchDirectoryError = (payload) => {
  return {
    type: READ_DIR_ERROR,
    payload,
  };
};
