/**
 * @module /src/sagas/sagas.helpers
 * @description
 * A local to sagas module that define general helpers for sagas.  This is not
 * the place to put anything to do with App state.
 */

//------------------------------------------------------------------------------
const DEBUG =
  process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true' ||
  process.env.REACT_APP_DEBUG_SAGAS_ACTIONS === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */
/**
 * @function
 * @description
 * yield log(take(WAIT_FOR_ACTION), "Waiting for action")
 *
 * @param {function} effect sagas effect
 * @param {string} message user message
 * @param {?string} group
 *
 */

export const log = (effect, message, group = null) => {
  if (DEBUG) {
    switch (group) {
      case 'start':
        console.group(`Sagas`);
        console.info(message);
        break;

      case 'end':
        console.info(message);
        console.groupEnd();
        break;

      default:
        console.info(message);
    }
  }

  return effect;
};

export default log;
