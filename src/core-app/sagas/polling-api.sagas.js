// src/sagas/polling-api.sagas.js

/**
 *
 *  🔖 Dependency injection
 *     This module configures the polling-machine feature.
 *
 *  Part of
 *
 *    👉 polling-api.config.sagas
 *       👉 polling.setup
 *          👉 polling-machine
 *             👉 polling-worker
 *
 * Commands that polling machine responds to the following actions::command
 *
 *    1. fetch
 *    2. resume
 *    3. cancel
 *
 * The machine emits the following actions::event
 *
 *    👉 POLLING START
 *    👉 POLLING END
 *    👉 RESOLVED
 *    👉 ERROR
 *    👉 CANCELLED
 *
 * What gets documented is up to the receiver of the action::events.
 *
 * @module sagas/files.sagas
 */
import { call, put, race, take, takeEvery } from 'redux-saga/effects';
import apiChannel from '../services/polling.setup'; // machine/saga channel
import { channelSpec } from './polling-api.config';

// core api actions for the machine to exploit
import {
  FETCH,
  RESUME,
  CANCEL,
  validateEventInterface,
  getUiKey,
} from '../ducks/actions/api.actions';

// document (output)
import { setNotification } from '../ducks/actions/notifications.actions';

import * as UT from './sagas.helpers';
import { colors } from '../constants/variables';

const COLOR = colors.light.blue;

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_API === 'true' ||
  process.env.REACT_APP_DEBUG_MACHINE === 'true' ||
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
// ------------------------------------------------------------------------------
/* eslint-disable no-console, camelcase, no-underscore-dangle */

/* --------------------------------------------------------------------------- */
if (process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true') {
  console.info('%c👉 loaded polling-api.config.sagas', COLOR);
}

/* --------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------- */
/* Configuration: Reference api functions to the machine
/* --------------------------------------------------------------------------- */
const MAX_TRIES = 15; // number of polling requests

// -----------------------------------------------------------------------------
/**
 * 🔖 Kicks-off the polling api service
 *     Gateway to api fetch request that requires polling
 */
function* _fetch(action) {
  if (DEBUG) {
    yield console.debug(
      '%c************* Command To Machine ***************',
      colors.orange,
    );
    yield console.dir(action);
  }
  const { event: commandEvent } = action;
  try {
    if (!Object.keys(commandEvent?.request).includes('maxTries')) {
      commandEvent.request.maxTries = MAX_TRIES;
    }
    validateEventInterface(commandEvent, false /* jobId */);
    const { uiKey } = commandEvent.meta;

    if (DEBUG) {
      yield console.debug('%c************* Set Channel ***************', colors.orange);
    }

    const channel = yield call(apiChannel, { ...channelSpec, commandEvent });

    yield race([
      call(_streamServiceMessages, channel),
      call(_listenForCancel, { uiKey, channel }),
    ]);
  } catch (e) {
    console.error(e);
    setNotification({ message: e?.message || e });
  }
}

// -----------------------------------------------------------------------------
/**
 * Ends when machine is onDone (or onError?)
 * ongoing thread provided by while(true)
 * closed when take(END) is reached
 */
function* _streamServiceMessages(channel) {
  if (DEBUG) console.log(`%clistening to xstate channel`, colors.orange);
  try {
    while (true) {
      // take(END) will terminate this function
      const action = yield take(channel);
      if (DEBUG) {
        console.debug('%cSagas Channel While', colors.orange);
        console.dir(action);
      }
      yield put(action);
    }
  } finally {
    if (DEBUG) console.log(`%cSagas polling channel closed`, colors.orange);
    // this may cancel a channel that has already closed
    channel.close();
  }
}
/**
 * This thread enables the ability to "cancel" a job.
 * Ends when the machine reports onDone cancelled
 * ongoing thread provided by takeEvery
 * closed when channel.close is reached
 *
 */
function* _listenForCancel({ uiKey, channel }) {
  if (DEBUG) console.log(`%clistening for CANCEL`, colors.orange);

  // sends cancelAction to polling machine (when the uiKey in this closure
  // matches the uiKey in the 'takeEvery' action)
  function tryCancel(action) {
    if (getUiKey(action?.event) === uiKey) {
      if (DEBUG) console.debug(`__ 3️⃣  🦀 cancel ${uiKey}`);
      channel.close();
    }
  }
  yield takeEvery([(action) => action.type.includes(CANCEL)], tryCancel);
}

// -----------------------------------------------------------------------------
// **NOTE** anything exported from this file will be executed by src/initSagas
// -----------------------------------------------------------------------------
/**
 * What needs to happen:
 * 1.1 listen for FETCH
 * 1.2 spawn a machine
 * 1.3 provide the machine a ability to send messages
 * 2.1 fork a spawned thread to listen for CANCEL
 * 2.2 filter for CANCEL events with the same path as machine
 * 2.3 when such an event arrives, cancel the machine
 */

// Watch for command fetch (api fetch)
export function* watchForFetchRequest() {
  UT.log(
    yield takeEvery(
      ({ type }) => type.includes(FETCH) || type.includes(RESUME),
      _fetch,
    ),
    `📁 polling-api.config.sagas: taking every FETCH and RESUME related action`,
  );
}
