/**
 *
 * ✨ Core middleware that converts known strings to action objects.
 *
 * Also, ensures all actions in the app system have a type value.
 *
 */
import { actionError } from '../../actions/error.actions';
import { ActionError } from '../../../lib/LuciErrors';
import { FIXES } from '../../actions/headerView.actions';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

if (DEBUG) {
  console.info('loaded action-filter.middleware');
}

const actionFilterMiddleware = () => (next) => (action) => {
  try {
    switch (true) {
      case Object.values(FIXES).includes(action):
        next({ type: action });
        break;

      case !Object.keys(action).includes('type'): {
        throw new ActionError(
          `Malformed action - missing a type value: ${JSON.stringify(action)}`,
        );
      }

      default:
        next(action);
    }
  } catch (e) {
    if (e instanceof ActionError) {
      next(
        actionError({
          feature: action?.feature ?? '[unknown]',
          error: e.message,
        }),
      );
    } else {
      throw e;
    }
  }
};

export default actionFilterMiddleware;
