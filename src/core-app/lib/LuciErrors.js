// src/lib/LuciErrors.js

/**
 * Class base for custom errors
 *
 * @extends Error
 * A set of custom Errors that should describe all of the errors raised
 * by this application.
 *
 * constructor(message) {
 *   super(message);
 *   Object.setPrototypeOf(this, LuciError.prototype);
 * }
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
    let message;
    let cause;

    if (options.cause === undefined) {
      ({ message, cause } = LuciError.getMessageAndCause(input, 'error'));
    } else {
      // Use provided message and cause
      message = input;
      cause = options.cause;
    }

    super(message);
    this.verbose = options.verbose || false;
    this.cause = cause;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }

    this.date = new Date();
    this.name = this.constructor.name;

    this.logMessage(message, options.cause);
  }

  static getMessageAndCause(input, type /* error or warning */) {
    let message = typeof input === 'string' ? input : `No ${type} message`;
    let cause = null;

    if (input instanceof Error) {
      message = input.message;
      cause = input;
    } else if (typeof input === 'object') {
      message = input?.message ?? input.data?.message ?? `No ${type} message`;
      if (input.data?.cause) cause = input.data.cause;
    }

    return { message, cause };
  }

  logMessage(message, cause) {
    console.debug(
      `%cGENERATING ${this.constructor.name.toUpperCase()}`,
      colors.purpose,
    );
    console.debug(`Message: ${message}`, '\nCause:', cause);
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
        causeStr = `Could not serialize the cause: ${error.message}`;
      }
      result += `\nCaused by: ${causeStr}`;
    }

    return result;
  }
}

class ActionError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ActionError';
  }
}
class ApiTncError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ApiTncError';
  }
}
class ApiCallError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ApiCallError';
  }
}
class FetchStoreError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'FetchStoreError';
  }
}
class ApiResponseError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ApiResponseError';
  }
}
class DesignError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'DesignError';
  }
}
class ExpiredSessionError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ExpiredSessionError';
  }
}
class GqlError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'GqlError';
  }
}
class InputError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'InputError';
  }
}
class InputTypeError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'InputTypeError';
  }
}
class InvalidStateError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'InvalidStateError';
  }
}
class InvalidTreeStateError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'InvalidTreeStateError';
  }
}
class KeyValueError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'KeyValueError';
  }
}
class LevelsError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'LevelsError';
  }
}
class LookupError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'LookupError';
  }
}
class MachineError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'MachineError';
  }
}
class MiddlewareError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'MiddlewareError';
  }
}
class MissingProjectIdError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'MissingProjectIdError';
  }
}
class ReadWriteError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ReadWriteError';
  }
}
class SagasError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'SagasError';
  }
}
class TimeoutError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'TimeoutError';
  }
}
class ValueError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'ValueError';
  }
}
class WorkbenchError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'WorkbenchError';
  }
}
class StoreMigrationError extends LuciError {
  constructor(...args) {
    super(...args);
    this.name = 'StoreMigrationError';
  }
}
/*
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
*/

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

export default LuciError;
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
