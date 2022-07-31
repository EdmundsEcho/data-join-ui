/**
 * @module src/sagas/fileView.sagas
 *
 * @description
 * Maintain the list of files in the active directory.
 *
 * 🔖 Critical that it only export the watch function for the sagas
 *    composition to operate as intended.
 *
 * ⬜ Likely change to middleware that leverages the API core
 *
 */
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  READ_DIR_START,
  fetchDirectorySuccess,
  fetchDirectoryError,
} from '../ducks/actions/fileView.actions';

import { readDirectory } from '../services/api';
import * as UT from './sagas.helpers';
import { ApiCallError } from '../lib/LuciErrors';

function* _fetchDirectory(action) {
  try {
    const response = yield call(
      readDirectory,
      action.path,
      action.provider,
      action.project_id,
    );

    if (response.status > 200) {
      throw new ApiCallError(
        `Status: ${response.status} }Could not retrieve directory: ${
          action?.path ?? 'undefined'
        }`,
      );
    }

    // Retain current path across browser refreshes
    localStorage.setItem('last_path', action.path);

    // document
    yield put(
      fetchDirectorySuccess(
        response?.data?.results,
        action.path,
        response?.data?.parent,
      ),
    );
  } catch (e) {
    yield put(fetchDirectoryError(e.toString()));
  }
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
// Watcher
export function* watchFileViewSaga() {
  UT.log(
    yield takeLatest(READ_DIR_START, _fetchDirectory),
    `📁 fileView.sagas: taking ${READ_DIR_START}`,
  );
}
