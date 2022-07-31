// src/ducks/modal.reducer.js

/**
 * @module ducks/modal-reducer
 *
 * @description
 *
 * 🔑 Intercept actions that implement the modal interface. Wait for a response.
 *    Only forward the action if the user confirmed.  Otherwise, setNotification
 *    that the action was cancelled.
 *
 * @category Reducers
 *
 */

import {
  SHOW_MODAL, // document
  HIDE_MODAL, // document
} from './actions/modal.actions';

// -----------------------------------------------------------------------------
// const DEBUG = process.env.REACT_APP_DEBUG_REDUCERS === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const initialState = {
  modalType: null,
  modalProps: {},
  modalActions: {},
};

const testModal = {
  modalType: `ACTION_ONCE_CONFIRMED`,
  modalProp: { message: `This is a test modal` },
  modalActions: { onCancel: HIDE_MODAL },
};
//------------------------------------------------------------------------------
// Reducer-specific selectors
//
// These functions should reflect what is defined in the `initialState`.
//------------------------------------------------------------------------------
export const getModalState = (stateFragment) => stateFragment;

//------------------------------------------------------------------------------
// Reducer
// state = modal
//------------------------------------------------------------------------------
// responds to action::document
// (see Programming with Actions)
//------------------------------------------------------------------------------
const modalReducer = (state = initialState, action) => {
  const { type } = action;
  switch (true) {
    case type === 'RESET':
    case type === 'RESET_MODAL':
      return initialState;

    case type === 'TEST_MODAL':
      return testModal;

    case type.includes(SHOW_MODAL): {
      const { type: _, ...newModal } = action;
      return newModal; // { modalActions, modalProps }
    }

    case type.includes(HIDE_MODAL): {
      return initialState;
    }

    default:
      return state;
  }
};

export default modalReducer;
