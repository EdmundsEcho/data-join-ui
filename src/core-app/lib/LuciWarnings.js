/**
 * Use these to track design concerns and other usage of interest.
 */

import LuciError from './LuciErrors';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const WARN = process.env.REACT_APP_DEBUG_LOG_WARNINGS === 'true';
const DEBUG = process.env.NODE_ENV === 'development';
//------------------------------------------------------------------------------
/* eslint-disable no-console, no-param-reassign */

class LuciWarning extends LuciError {
  constructor(input, options = { verbose: DEBUG }) {
    if (options.cause === undefined) {
      const { message, cause } = LuciError.getMessageAndCause(input, 'warning');
      options.cause = cause;
      super(message, options);
    } else {
      super(input, options);
    }
  }

  logMessage(message, cause) {
    if (WARN) {
      if (this.verbose && typeof console !== 'undefined' && console.log) {
        console.debug(
          `%cGENERATING ${this.constructor.name.toUpperCase()}`,
          colors.brown,
        );
        console.debug(`Message: ${message}`, '\nCause:', cause);
      }
    }
  }
}

class AssertionWarning extends LuciWarning {}
class DesignWarning extends LuciWarning {}
class InputWarning extends LuciWarning {}
class LevelsWarning extends LuciWarning {}
class ValueWarning extends LuciWarning {}

export { AssertionWarning, DesignWarning, InputWarning, LevelsWarning, ValueWarning };
