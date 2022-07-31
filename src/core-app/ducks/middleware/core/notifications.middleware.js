// src/ducks/middleware/notifications.middleware.js

/**
 * @module middleware/notification.middleware
 *
 * @description
 * A core middleware that augments the document actions.
 * see Programming with Actions
 *
 */
import {
  removeNotification,
  ADD_NOTIFICATION,
  setNotification,
} from '../../actions/notifications.actions';

/* eslint-disable no-console */
/* --------------------------------------------------------------------------- */
/**
 * Receives the notification command from middleware ready to document.
 * It dispatches a notice before removing it using 'setTimeOut'.
 *
 * @middleware
 */
const notificationMiddleware = () => (next) => (action) => {
  //
  if (process.env.REACT_APP_DEBUG_MIDDLEWARE === 'true') {
    console.info('loaded notification.middleware');
  }
  if (action.type.includes(ADD_NOTIFICATION)) {
    const { payload, meta } = action;
    const id = new Date().getMilliseconds();

    // enrich the original payload with the id
    const notification = {
      id,
      message: payload,
    };

    // fire a new action
    next(setNotification({ message: notification, feature: meta.feature }));

    // dispatch an action to clear the notice after a given time
    setTimeout(() => {
      next(removeNotification({ notificationId: id, feature: meta.feature }));
    }, 1000);
  } else {
    next(action);
  }
};

export default notificationMiddleware;
