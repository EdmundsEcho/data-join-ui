// src/sagas/headerView-fix-report.js

/**
 * @module sagas/headerView-fix-report.sagas
 *
 * @description
 * ⬜ throttle the ability to trigger a report
 *
 */

import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';

import {
  TYPES, // document direct to reducer
  HEADER_VIEW, // feature
  ADD_HEADER_VIEW,
  REMOVE_HEADER_VIEW,
  SET_WIDE_TO_LONG_FIELDS_IN_HV,
  SET_FIXED_HVS,
  setHvsFixes,
} from '../ducks/actions/headerView.actions';
import {
  TIMED_OUT,
  computeEventTimedOut,
} from '../ducks/actions/compute.actionCreator';
import { setNotification } from '../ducks/actions/notifications.actions';

// ⚠️  returns a timeout promise
import { reportHvsFixesP } from '../ducks/rootSelectors';
import { TimeoutError } from '../lib/LuciErrors';

import * as UT from './sagas.helpers';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true' ||
  process.env.REACT_APP_DEBUG_ERROR_FIX === 'true';

const COLOR = colors.light.blue;
//------------------------------------------------------------------------------
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

if (DEBUG) {
  console.info('%c👉 loaded headerView-report-fixes.sagas', COLOR);
}

/**
 * Describe which actions map to generating a report.
 * (actions :: document)
 */
const scheduleFixReportActions = [
  TYPES.UPDATE_FILEFIELD,
  TYPES.UPDATE_IMPLIED_MVALUE,
  SET_WIDE_TO_LONG_FIELDS_IN_HV, // document
  ADD_HEADER_VIEW, // document
  REMOVE_HEADER_VIEW, // document
  SET_FIXED_HVS, // document updated hvs using lazyAction
  // (action) => action?.type?.includes(`${HEADER_VIEW} ${FIX}`),
];

function* _report() {
  const state = yield select();
  try {
    // the computation
    const fixes = yield call(reportHvsFixesP, { state, DEBUG });
    return fixes; // receiver, informs the race condition
  } catch (error) {
    if (error instanceof TimeoutError) {
      yield put(
        // receiver, informs the race condition
        computeEventTimedOut({ message: error.message, feature: HEADER_VIEW }),
      );
    }
    // 🚧 WIP
    throw error;
    // yield put(
    // computeEventError({ message: error.message, feature: HEADER_VIEW }),
    // );
  }
}

function* _scheduleValidation(action) {
  if (DEBUG) {
    console.debug(
      '%cheaderView-report.sagas received an action',
      colors.orange,
    );
    console.dir(action);
  }

  // 👉 The race starts here
  const [report, timedout, nextRequest] = yield race([
    call(_report),
    take(`${HEADER_VIEW} ${TIMED_OUT}`),
    take(scheduleFixReportActions),
  ]);

  if (DEBUG) {
    console.debug('%c🏁 headerView-report-fixes.sagas the race is over', COLOR);
  }
  // 🏁 The race finish line
  switch (true) {
    // when the report wins the race, document the result
    case typeof report !== 'undefined':
      if (DEBUG) {
        console.debug(`%c✅ Report won the race!!!`, COLOR);
      }
      yield put(setHvsFixes(report));
      break;

    // when the report times out, notify (no other change)
    case typeof timedout !== 'undefined':
      if (DEBUG) {
        console.debug(`%c⌛ The request timeout won the race!!!`, COLOR);
      }
      yield put(
        setNotification({
          message: timedout.message || 'Error report timedout',
          feature: `headerView user-feedback`,
        }),
      );
      break;

    // when another request is recieved,
    // 👉 start the race over.
    case typeof nextRequest !== 'undefined':
      if (DEBUG) {
        console.debug(`%c⬜ The next request won the race!!!`, COLOR);
      }
      /* just cancel others in the race */
      yield call(_scheduleValidation); // restart the process
      break;

    default:
      break;
  }
  // scrappy fix to deal with async timing
  console.groupEnd();
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
// Watcher
export function* watchForUpdateField() {
  UT.log(
    yield takeEvery(scheduleFixReportActions, _scheduleValidation),
    `📋 headerView-fixes.sagas: taking every field change-related event`,
  );
}
