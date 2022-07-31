// src/ducks/middleware/normalize.middleware.js

/**
 * @module middleware/normalize.middleware
 *
 */
/* eslint-disable no-console */
import { dataNormalized, NORMALIZE } from '../../actions/data.actions';
// import { colors } from '../../../constants/variables';

/**
 * Action pattern: Transformation
 *
 * Action: Accepts and dispatches the same action.
 * (does not call next(action))
 *
 *     type, payload, meta.normalizer
 *     -> type, payload, normalized: true
 *
 * Scope
 *   document-related actions with a valid normalizer.
 *
 * Interface:
 *
 *     {
 *       type:  includes ADD | SET | INI
 *       payload: any
 *       meta: {
 *         normalizer: function
 *         feature: string
 *       }
 *     }
 *
 * @category Middleware
 *
 */
const normalizeMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    //-----------------------------------------------------------------------------
    const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
    //-----------------------------------------------------------------------------

    if (DEBUG) {
      console.info('loaded normalize.middleware');
    }
    //-----------------------------------------------------------------------------

    // content-aware filter
    // action interface: { payload, meta: {feature, normalizer} }
    if (
      (action.type.includes('SET') ||
        action.type.includes('ADD') ||
        action.type.includes('INI') ||
        action.type.includes(NORMALIZE)) &&
      typeof action.meta?.normalizer === 'function'
    ) {
      const { normalizer, feature } = action.meta;

      dispatch(dataNormalized(feature));

      // dispatch the transformed action
      // change the existing action before dispatching
      next({
        type: action.type,
        payload: normalizer(action.payload),
        meta: { feature, normalized: true },
      });
    } else {
      next(action);
    }
  };

export default normalizeMiddleware;
