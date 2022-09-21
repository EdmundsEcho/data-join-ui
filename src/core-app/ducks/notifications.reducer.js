// src/ducks/notifications.reducer.js

/**
 * An FYI service.  Compliments a similar service in use-fetch-api.
 *
 * @category Reducers
 *
 * @module ducks/notifications-reducer
 */

import {
  ADD_NOTIFICATION,
  CLEAR_NOTIFICATION,
} from './actions/notifications.actions';
import { RESET } from './actions/project-meta.actions';

const initialState = [];

//------------------------------------------------------------------------------
// Reducer
// state = notifications
//------------------------------------------------------------------------------
// responds to action::document
// Is generic, so ignores feature component of the action type.
// (see Programming with Actions)
//------------------------------------------------------------------------------
const reducer = (state = initialState, action) => {
  const { type } = action;
  switch (true) {
    case type === RESET:
    case type === 'RESET_NOTIFICATIONS':
      return initialState;

    case type.includes(ADD_NOTIFICATION): {
      const { payload: notification } = action;
      return [...state, notification];
    }

    case type.includes(CLEAR_NOTIFICATION): {
      const { payload: id } = action;
      return state.filter((notification) => notification.id !== id);
    }
    default:
      return state;
  }
};

export default reducer;
