// src/lib/LuciFixableError.js

/**
 * Class base for custom errors
 *
 * @extends Error
 * Errors the user can fix.
 *
 * ⬜ Make this a single purpose error (for fixable)
 *
 */

//------------------------------------------------------------------------------
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
//------------------------------------------------------------------------------
/**
 * Create the custom error
 * @param {Object | string} error
 * @return LuciError
 */
class LuciFixableError extends Error {
  constructor(error, ...params) {
    const message =
      typeof error === 'object' && 'message' in error
        ? error.message
        : error || '';
    super(message, ...params);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    this.name = this.constructor.name;
    this.message = message;
    this.fix = error; // host the error as a fixable
    this.date = new Date();
  }
}

class InvalidStateInput extends LuciFixableError {}

export { InvalidStateInput };
