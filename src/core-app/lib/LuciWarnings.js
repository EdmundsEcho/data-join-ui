class LuciWarning extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class AssertionWarning extends LuciWarning {}
class DesignWarning extends LuciWarning {}
class InputWarning extends LuciWarning {}
class LevelsWarning extends LuciWarning {}
class ValueWarning extends LuciWarning {}

export {
  AssertionWarning,
  DesignWarning,
  InputWarning,
  LevelsWarning,
  ValueWarning,
};
