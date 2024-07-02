// src/lib/LuciErrors.js

/**
 * Class base for custom errors
 *
 * @extends Error
 * A set of custom Errors that should describe all of the errors raised
 * by this application.
 *
 */
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.NODE_ENV === 'development';
//------------------------------------------------------------------------------
/* eslint-disable no-console, no-param-reassign */

//------------------------------------------------------------------------------
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
//------------------------------------------------------------------------------
/**
 * Create the custom error
 * @param {Object | string} error
 * @return LuciError
 */
class LuciError extends Error {
  constructor(input, options = { verbose: DEBUG }) {
    //
    // Derive the message depenenton the input type.
    // Include cause when the input::Error.
    //
    let message = typeof input === 'string' ? input : 'No error message'; // first guess message
    if (input instanceof Error) {
      message = input.message; // second guess message
      options.cause = input;
    } else if (typeof input === 'object') {
      message = input?.message ?? input.data?.message ?? 'No error message'; // alternative second guess message
      if (input.data?.cause) options.cause = input.data.cause;
    }

    if (options.verbose && typeof console !== 'undefined' && console.log) {
      // const color = colors.red.match(/color:\s*(#\w+);?/);
      console.debug('%cGENERATING LUCI ERROR', colors.purple);
      console.debug(`Message: ${message}`, '\nCause:', options.cause);
    }

    super(message, options);
    this.verbose = options.verbose || false;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }

    this.name = 'LuciError';
    this.date = new Date();
  }

  toString() {
    let result = `${this.name}: ${this.message}`;

    if (this.verbose && this.cause) {
      let causeStr;
      try {
        causeStr =
          typeof this.cause === 'object'
            ? JSON.stringify(this.cause, null, 2)
            : this.cause.toString();
      } catch (error) {
        causeStr = `Could not serialize the cause prop: ${error.message}`;
      }
      result += `\nCaused by: ${causeStr}`;
    }

    return result;
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
class ReadWriteError extends LuciError {}
class SagasError extends LuciError {}
class TimeoutError extends LuciError {}
class ValueError extends LuciError {}
class WorkbenchError extends LuciError {}
class StoreMigrationError extends LuciError {}

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

throw new LuciError('Migration failed', {
        cause: error,
        details: {
          fromVersion: path.from,
          toVersion: path.to,
        },
      });
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
  StoreMigrationError,
};

/**
 * Usage:
 * class MyError = new MyError('Message');
 * myerror.message
 */
