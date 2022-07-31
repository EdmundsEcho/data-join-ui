// src/utils/promise-timeout.js

import { TimeoutError } from '../lib/LuciErrors';
import { debug } from '../constants/variables';

/* eslint-disable no-console */

/**
 * Wraps a compution into a promise that rejects after a given period of time.
 *
 * @function
 * @param {function} computation
 * @param {integer?} msLimit time out period in ms
 * @return {Promise}
 */
export function computeWithTimeout(computation, msLimit = 300, DEBUG = false) {
  if (DEBUG) {
    console.debug(
      `%cinitiating promise-based computeWithTimeout: ${
        computation.name || 'no-name'
      }`,
      debug.color.blue,
    );
  }

  return new Promise((resolve, reject) => {
    // create a timeout to reject promise if not resolved
    const timer = delayWithSilentCancel(msLimit);
    timer.then(() =>
      reject(
        new TimeoutError(
          `The computation timed-out: ${computation.name || 'no-name'}.`,
        ),
      ),
    );

    // const promise = Promise.resolve(computation);
    const promise = delay(0).then(computation);

    const logFn = DEBUG
      ? () =>
          console.debug(
            `%ccomputeWithTimeout resolved! ${computation.name || 'no-name'}`,
            debug.color.blue,
          )
      : () => {};

    promise
      .then((res) => {
        timer.cancel();
        resolve(res);
      })
      .then(logFn)
      .catch((err) => {
        timer.cancel();
        reject(err);
      });
  });
}

function delayWithSilentCancel(ms) {
  let handle;
  const promise = new Promise((resolve) => {
    handle = setTimeout(resolve, ms);
  });
  promise.cancel = () => clearTimeout(handle);

  return promise;
}

/**
 * Creates a promise with a delay that can be cancelled.
 *
 * @function
 * @param {number?} msDelay
 * @return {Promise} Includes cancel function.
 */
export function delay(msDelay = 0) {
  let ctr;
  let rej;
  const promise = new Promise((resolve, reject) => {
    ctr = setTimeout(resolve, msDelay);
    rej = reject;
  });
  promise.cancel = () => {
    clearTimeout(ctr);
    rej(Error('Cancelled'));
  };
  return promise;
}

export default computeWithTimeout;
