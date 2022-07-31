/**
 * @module src/ducks/actions/notification.actions
 *
 * @description
 * Message to message action
 * setNotification changes the reducer.
 *
 * Programming with Actions
 *
 */
// ⚠️ make sure the includes filter can differentiate the two
export const ADD_NOTIFICATION = '++ NOTICE ++';
export const CLEAR_NOTIFICATION = 'CLEAR NOTICE';

export const setNotification = ({ message, feature }) => ({
  type: `${feature} ${ADD_NOTIFICATION}`,
  payload: message,
  meta: { feature },
});

export const removeNotification = ({ notificationId, feature }) => ({
  type: `${feature} ${CLEAR_NOTIFICATION}`,
  payload: notificationId,
  meta: { feature },
});
