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
    console.debug(
      `is this value true: ${typeof error === 'object' && 'message' in error}`,
    );

    const [message, cause] =
      typeof error === 'object' && 'message' in error
        ? [error.message, error]
        : [error || '', undefined];

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
class ApiResponseError extends LuciError {}
class DesignError extends LuciError {}
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
class ReadWriteError extends LuciError {}
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
  ReadWriteError,
  SagasError,
  TimeoutError,
  ValueError,
  WorkbenchError,
};

/**
 * Usage:
 * class MyError = new MyError('Message');
 * myerror.message
 */
