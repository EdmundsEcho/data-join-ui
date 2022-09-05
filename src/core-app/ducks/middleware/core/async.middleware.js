/**
 * @module middleware/async.middleware
 *
 * @description
 * Action: Function -> action(dispatch)
 * so function: (dispatch, getState) => dispatch (// create an action //)
 *
 * Utilized by: etlView.middleware (and others)
 *
 */

import { setNotification } from '../../actions/notifications.actions';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

const asyncMiddleware =
  ({ getState, dispatch }) =>
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
        message: `Processing an async action: ${action.type}`,
        feature: action?.meta?.feature ?? 'unknown',
      }),
    );
    return action.payload(dispatch, getState);
  };

export default asyncMiddleware;
