// src/services/polling.api.js

/**
 * 📌 Creates a saga channel for the xstate machine
 *
 *    👉 calls polling-machine/maker(config) as apiPollingMachine
 *
 *    📬 dispatches api actions
 *
 * Routine to
 *
 *  Part of
 *
 *    👉 polling-api.config.sagas
 *       👉 polling.setup
 *          👉 polling-machine
 *             👉 polling-worker
 *
 * @module api/polling-api
 */
import { eventChannel, END } from 'redux-saga';
import { interpret } from 'xstate';
import apiPollingMachine, {
  fetchAction,
  cancelAction,
} from '../machines/api/polling-machine';

import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_API === 'true' ||
  process.env.REACT_APP_DEBUG_MACHINE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console, camelcase, no-underscore-dangle */

if (DEBUG) {
  console.info('%cloading polling.api', colors.yellow);
}

/* --------------------------------------------------------------------------- */
/**
 * 📌 Default export
 *
 * Tasks:
 *   1. link emit to machine's dispatch prop machine configuration
 *      (wrapped by apiChannel)
 *
 *   2. Determine which command should be used to instantiate the machine
 *      depending on whether a jobId has already been collected.
 *
 *   3. Return a handle for how to cancel the thread.
 *
 */
const apiChannel = ({ commandEvent, debug: { devTools }, ...restOptions }) => {
  // 📬 specify the callback for the eventChannel
  return eventChannel((emit) => {
    if (DEBUG) {
      console.debug(`__ 5️⃣  🦀 polling.setup: ${DEBUG}`);
    }
    const pollingMachine = apiPollingMachine({ emit, DEBUG, ...restOptions });
    /* ----------------------------------------------------------------------- */
    // xstate interprete generates events
    //  🔧 options for the machine *interpreter*
    //  ✅ specify when to close the channel
    //  🎉 fire-up the machine
    //
    const pollingService = interpret(pollingMachine, {
      devTools: devTools || DEBUG,
      logger: DEBUG
        ? (log) => console.debug(`%c${log}`, colors.grey)
        : () => {},
    })
      .onDone(() => emit(END))
      .start();

    /* ----------------------------------------------------------------------- */
    // 🟢 Send a command to the machine
    // entry-point request depends on information already retrieved
    // event : { meta, request }
    //
    if (DEBUG) {
      console.debug('fetchAction');
      console.dir(fetchAction(commandEvent));
    }
    pollingService.send(fetchAction(commandEvent));

    /* ----------------------------------------------------------------------- */
    // ❌ return a handle to cancel the thread caller is responsible for
    // cancelling only in the event the uiKeys match.
    //
    return () => {
      try {
        pollingService.send(cancelAction(commandEvent));
      } catch (e) {
        console.error(e);
      }
    };
  });
};

export default apiChannel;
