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
import { makeActionCreator } from '../../utils/makeActionCreator';

// feature
export const FILEVIEW = '[FileView]';

export const READ_DIR_START = `${FILEVIEW} GET_READ_DIR_START`; // command
export const READ_DIR_SUCCESS = `${FILEVIEW} GET_READ_DIR_SUCCESS`; // event
export const READ_DIR_ERROR = `${FILEVIEW} GET_READ_DIR_ERROR`; // event

// action kind :: command
export const fetchDirectoryStart = makeActionCreator(
  READ_DIR_START,
  'path',
  'provider',
  'project_id',
);

// action kind :: event
export const fetchDirectorySuccess = makeActionCreator(
  READ_DIR_SUCCESS,
  'files',
  'path',
  'parent',
);
// action kind :: event
export const fetchDirectoryError = makeActionCreator(READ_DIR_ERROR, 'error');
