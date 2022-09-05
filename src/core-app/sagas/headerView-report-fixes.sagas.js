// src/sagas/headerView-fix-report.js

/**
 *
 * @description
 * ⬜ throttle the ability to trigger a report
 *
 * @module sagas/headerView-fix-report.sagas
 *
 */

import { call, put, race, select, take, takeEvery } from 'redux-saga/effects';

import {
  UPDATE_FILEFIELD, // document
  UPDATE_IMPLIED_MVALUE, // document
  RESET_FILEFIELDS, // document
  HEADER_VIEW, // feature
  ADD_HEADER_VIEW,
  REMOVE_HEADER_VIEW,
  SET_WIDE_TO_LONG_FIELDS_IN_HV,
  SET_FIXED_HVS,
  RUN_FIX_REPORT,
  setHvsFixes,
} from '../ducks/actions/headerView.actions';
import {
  TIMED_OUT,
  computeEventTimedOut,
} from '../ducks/actions/compute.actionCreator';
import { setNotification } from '../ducks/actions/notifications.actions';

// ⚠️  returns a timeout promise
import { reportHvsFixesP } from '../ducks/rootSelectors';
import { SagasError, TimeoutError, DesignError } from '../lib/LuciErrors';

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
  UPDATE_FILEFIELD,
  UPDATE_IMPLIED_MVALUE,
  RESET_FILEFIELDS,
  SET_WIDE_TO_LONG_FIELDS_IN_HV, // document
  ADD_HEADER_VIEW, // document
  REMOVE_HEADER_VIEW, // document
  SET_FIXED_HVS, // document updated hvs using lazyAction
  RUN_FIX_REPORT, // command (direct to sagas)
  // (action) => action?.type?.includes(`${HEADER_VIEW} ${FIX}`),
];

function* _report() {
  try {
    const state = yield select();
    // the computation
    const fixes = yield call(reportHvsFixesP, { state, timeout: 200, DEBUG });
    return fixes; // receiver, informs the race condition
  } catch (error) {
    if (error instanceof TimeoutError) {
      yield put(
        // receiver, informs the race condition
        computeEventTimedOut({ message: error.message, feature: HEADER_VIEW }),
      );
    }
    // 🚧 WIP
    throw new SagasError(error);
    // yield put(
    // computeEventError({ message: error.message, feature: HEADER_VIEW }),
    // );
  }
}

function* _scheduleValidation(action = undefined) {
  if (DEBUG) {
    const { type = 'undefined (ok)' } = action;
    console.debug(
      `%cheaderView-report.sagas reset timer with: ${type}`,
      colors.orange,
    );
  }

  try {
    // 👉 The race starts here
    const [report, timedout, nextActionRequest] = yield race([
      call(_report),
      take(`${HEADER_VIEW} ${TIMED_OUT}`),
      take(scheduleFixReportActions),
    ]);

    if (DEBUG) {
      console.debug(
        '%c🏁 headerView-report-fixes.sagas the race is over',
        COLOR,
      );
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
      case typeof nextActionRequest !== 'undefined':
        if (DEBUG) {
          console.debug(`%c 👉 The next request won the race!!!`, COLOR);
        }
        /* just cancel others in the race */
        yield call(_scheduleValidation, nextActionRequest); // restart the process
        break;

      default:
        throw new DesignError(
          'Sagas race condition ended with unexpected state',
        );
    }
  } catch (e) {
    console.error(e);
    throw new SagasError(e);
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
