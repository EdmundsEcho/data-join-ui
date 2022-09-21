/**
 *
 * Maintain the list of files in the active directory.
 *
 * 🔖 Critical that it only export the watch function for the sagas
 *    composition to operate as intended.
 *
 * ⬜ Likely change to middleware that leverages the API core
 *
 * DEPRECATED - using useFetchApi hook instead
 *
 * @module src/sagas/fileView.sagas
 *
 */
import { call, put, takeLeading } from 'redux-saga/effects';

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
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
// 🗄️ authorization
const DRIVE_AUTH_URL = process.env.REACT_APP_DRIVE_AUTH_URL;
//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
const COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-console */

if (DEBUG) {
  console.info('%c👉 loaded fileView.sagas', COLOR);
}

/**
 * Tasks:
 *
 * 1. Processess the possible return values for the directory search.
 * 2. Appends the original request to the response.
 *
 * ⬜ Part this seems redundant or misplaced.
 *
 */
function* _fetchDirectory({ type, request }) {
  yield console.debug(`%cHEADER_ dir ${type}`, colors.pink);
  try {
    yield put(setDirStatus(STATUS.pending));
    const response = yield call(readDirectory, request);

    if (response.status === 401) {
      yield put(fetchDirectoryError({ error: 'Session expired', request }));
      yield put(setDirStatus(STATUS.idle));
      window.location('/login');
      return;
    }
    if (response.status === 403) {
      if (typeof response?.data?.provider === 'undefined') {
        yield put(setDirStatus(STATUS.rejected));
        throw new ApiCallError(
          `Status: ${response.status} Could not retrieve directory: ${
            request?.path_id ?? 'undefined'
          }`,
        );
      }
      console.assert(
        response?.data?.provider ?? false,
        `Missing drive provider in 403 error: ${JSON.stringify(response)}`,
      );
      console.assert(
        request?.project_id ?? false,
        `The directory request is missing project_id: ${JSON.stringify(
          request,
        )}`,
      );
      yield put(setDirStatus(STATUS.idle));
      // run the authorization process
      window.location.replace(
        `${DRIVE_AUTH_URL}/${response.data.provider}/${request.project_id}`,
      );
      // yield put(fetchDirectoryError({ error: 'Session expired', request }));
      return;
    }
    if (response.status !== 200) {
      // caught later to document
      yield put(setDirStatus(STATUS.rejected));
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

    yield put(setDirStatus(STATUS.resolved));
    yield put(
      // copy into both files and filteredFiles
      // (🦀 need to create singular view)
      fetchDirectorySuccess({
        ...response.data.results,
        filteredFiles: response.data.results.files,
        request,
      }),
    );
  } catch (e) {
    yield put(fetchDirectoryError({ error: e, request }));
  }
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
// Watcher
export function* watchFileViewSaga() {
  UT.log(
    yield takeLeading(READ_DIR_START, _fetchDirectory),
    `📁 fileView.sagas: taking ${READ_DIR_START}`,
  );
}
