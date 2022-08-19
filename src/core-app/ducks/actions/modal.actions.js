// src/ducks/actions/modal.actions.js

import { makeActionCreator } from '../../utils/makeActionCreator';
// import { colors } from '../../constants/variables';

// document
export const SHOW_MODAL = `SHOW_MODAL`;
export const HIDE_MODAL = `HIDE_MODAL`;

export const showModalAction = makeActionCreator(
  SHOW_MODAL,
  'modalType',
  'modalProps',
);

export const hideModalAction = makeActionCreator(HIDE_MODAL);

/**
 * Confirmation modals
 *
 * Sequence:
 * middleware instance:
 * receive an action with modal specs
 * send action to reducer to update the modal props
 * state change -> display modal
 *
 * the modal is configured to send CONFIRM or CANCEL action
 *
 *
 */

interface Action {
  type: string;
  /* other optional props */
}
interface WithClose {
  modalProps: {
    onCancel: {
      type: 'HIDE_MODAL',
    },
    onConfirm: Array<Action>,
  };
}
interface WithModal {
  type: 'SHOW_MODAL';
  modalType: string;
  modalActions: WithClose;
  modalProps: Object;
}

/**
 *
 * caller: ui
 *
 * 💰 Whan an action needs user confirmation prior to being executed,
 *    use withConfirmation(action).
 *
 * 🔑 augments action
 * 1. Document the new modal with the requested action
 * 2. Provide the modal a way to HIDE_MODAL; clear the document accordingly
 *
 * Consumer: modal.reducer
 *
 * @param {Action} action Action to be executed upon confirmation
 * @param {Object} modalProps Options such as confirmation message.
 * @return {ActionWithConfirmation}
 *
 */
export const withConfirmation: WithModal = (action, modalProps) => {
  return {
    type: SHOW_MODAL,
    modalType: `ACTION_ONCE_CONFIRMED`,
    modalProps,
    modalActions: {
      onCancel: hideModalAction(), // :: action
      onConfirm: [action, hideModalAction()], // :: action
    },
  };
};
