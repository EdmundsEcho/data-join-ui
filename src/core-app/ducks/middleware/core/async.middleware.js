/**
 * @module middleware/async.middleware
 *
 * @description
 * Action: Function -> action(dispatch)
 * so function: (dispatch) => dispatch (// create an action //)
 *
 */

import { setNotification } from '../../actions/notifications.actions';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const asyncMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    //
    if (DEBUG) {
      console.info('loaded async.middleware');
    }

    //---------------------------------------------------------------------------
    if (typeof action.payload !== 'function') return next(action);
    //---------------------------------------------------------------------------

    // ...notify and process the action:function
    dispatch(
      setNotification({
        message: `Processing an async action`,
        feature: action?.meta?.feature ?? `unknown`,
      }),
    );
    return action.payload(dispatch);
  };

export default asyncMiddleware;
