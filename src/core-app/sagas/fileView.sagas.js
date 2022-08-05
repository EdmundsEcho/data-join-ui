/**
 *
 * Maintain the list of files in the active directory.
 *
 * 🔖 Critical that it only export the watch function for the sagas
 *    composition to operate as intended.
 *
 * ⬜ Likely change to middleware that leverages the API core
 *
 * @module src/sagas/fileView.sagas
 *
 */
import { call, put, takeLatest } from 'redux-saga/effects';

import {
  READ_DIR_START,
  setDirStatus,
  fetchDirectorySuccess,
  fetchDirectoryError,
  STATUS,
} from '../ducks/actions/fileView.actions';

import { readDirectory } from '../services/api';
import * as UT from './sagas.helpers';
import { ApiCallError } from '../lib/LuciErrors';

/* eslint-disable no-console */

function* _fetchDirectory({ type, ...request }) {
  try {
    yield put(setDirStatus(STATUS.pending));
    const response = yield call(readDirectory, request);

    if (response.status !== 200) {
      // caught later to document
      throw new ApiCallError(
        `Status: ${response.status} Could not retrieve directory: ${
          request?.path_id ?? 'undefined'
        }`,
      );
    }

    // Retain current path across browser refreshes
    // localStorage.setItem('last_path', request.path_id);

    // document
    console.assert(
      response?.data && response?.data?.results,
      'Fetch directory API: unexpected response',
    );
    yield put(
      fetchDirectorySuccess({
        ...response.data.results,
        filteredFiles: response.data.results.files,
        request,
      }),
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
