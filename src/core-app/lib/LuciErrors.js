// src/lib/LuciErrors.js

/**
 * Class base for custom errors
 *
 * @extends Error
 * A set of custom Errors that should describe all of the errors raised
 * by this application.
 *
 */

// import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
//------------------------------------------------------------------------------
/**
 * Create the custom error
 * @param {Object | string} error
 * @return LuciError
 */
class LuciError extends Error {
  constructor(error, ...params) {
    /* eslint-disable no-console */
    console.debug('%cGENERATING LUCI ERROR', 'color:cyan');
    console.debug(`error type: ${typeof error}`);
    console.dir(error);

    const message =
      typeof error === 'object'
        ? error?.message ?? error?.data?.message ?? 'No error message'
        : error;

    const cause = typeof error === 'object' ? error : undefined;

    console.debug(`message: ${message}\ncause: ${cause}`);

    if (cause) {
      super(message, { cause });
    } else {
      super(message, ...params);
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    this.name = this.constructor.name;
    this.message = message;
    this.cause = cause || error; // host the error as a fix
    this.date = new Date();
  }
}

class ActionError extends LuciError {}
class ApiTncError extends LuciError {}
class ApiCallError extends LuciError {}
class FetchStoreError extends LuciError {}
class ApiResponseError extends LuciError {}
class DesignError extends LuciError {}
class ExpiredSessionError extends LuciError {}
class GqlError extends LuciError {}
class InputError extends LuciError {}
class InputTypeError extends LuciError {}
class InvalidStateError extends LuciError {}
class InvalidTreeStateError extends LuciError {}
class KeyValueError extends LuciError {}
class LevelsError extends LuciError {}
class LookupError extends LuciError {}
class MachineError extends LuciError {}
class MiddlewareError extends LuciError {}
class MissingProjectIdError extends LuciError {}
class ReadWriteError extends LuciError {
  /*
constructor(message, error) {
    super(message, error);
} */
}
class SagasError extends LuciError {}
class TimeoutError extends LuciError {}
class ValueError extends LuciError {}
class WorkbenchError extends LuciError {}

/* Usage
try {
  throw new ActionError('Something went wrong', {
    message: 'Something went wrong',
    fix: 'done',
  });
} catch (e) {
  console.error(e.name); // CustomError
  console.error(e.message); // baz
  console.error(e.error); // object
  console.error(e.error.message); // object
  console.error(e.stack); // stacktrace
}
*/

export {
  ActionError,
  ApiTncError,
  ApiCallError,
  ApiResponseError,
  DesignError,
  FetchStoreError,
  GqlError,
  InputError,
  InputTypeError,
  InvalidStateError,
  InvalidTreeStateError,
  KeyValueError,
  LevelsError,
  LookupError,
  MachineError, // xstate machine
  MiddlewareError,
  MissingProjectIdError,
  ReadWriteError,
  SagasError,
  TimeoutError,
  ValueError,
  WorkbenchError,
  ExpiredSessionError,
};

/**
 * Usage:
 * class MyError = new MyError('Message');
 * myerror.message
 */
