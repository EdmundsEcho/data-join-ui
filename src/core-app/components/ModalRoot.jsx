// src/components/ModalRoot.jsx

/**
 * @module components/ModalRoot
 *
 * @description
 * Render the modal using an instance of the ReactDOM.portal
 *
 * Provides the capacity for a pop-up form or dialog. It renders on
 * the DOM node 'modal-root'.
 *
 * 🔑 When the store.modal state includes a value, this component
 *    will render the modal on the DOM node rootModal.  The app can
 *    use this functionality by wrapping an action with the `withModal`
 *    function defined in the 'use-modal' module. Theses wrapped actions
 *    will update the store and trigger this module to render accordingly.
 *
 * 🔖 What component will render is specified here in the object map
 *    action type -> component. As of now, there is only one 'ConfirmModal'.
 *
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getModalState } from '../ducks/rootSelectors';
import ConfirmModal from './shared/ConfirmModal';
import { colors } from '../constants/variables';

//------------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_MODAL === 'true';
//------------------------------------------------------------------------------
/* eslint-disable no-console */

/**
 * ⚙️  Inventory of supported modal components
 *
 *     modal type -> modal to be rendered
 *
 *  🔑 modalProps must implement the WithClose interface
 *     🔗 src/components/use-modal
 *
 */
const MODAL_COMPONENTS = {
  ACTION_ONCE_CONFIRMED: ConfirmModal,
  /* other modals as needed */
};

/**
 * Single mission
 * 1. listen for a non-null value in the modal stateFragment
 * 2. augment action handlers with access to dispatch
 * 3. render whatever is on the non-null modal stateFragment
 */
const ModalRoot = () => {
  // 📖 data
  const { modalType, modalProps, modalActions } = useSelector(getModalState);

  // 📬
  const dispatch = useDispatch();

  if (!modalType) {
    return null;
  }
  if (DEBUG) {
    console.debug(`${modalType}`);
    console.debug(`ModalRoot props`);
    console.dir(modalProps);
    console.debug(`ModalRoot actions`);
    console.dir(modalActions);
  }

  // ☎️  callbacks
  const actionsWithDispatch = Object.keys(modalActions).reduce(
    /* eslint-disable no-shadow, no-param-reassign */
    (actionsWithDispatch, name) => {
      actionsWithDispatch[name] = () => {
        if (DEBUG) {
          console.log(
            `%c${name} Action with dispatch... dispatched`,
            colors.red,
          );
        }
        dispatch(modalActions[name]);
      };
      return actionsWithDispatch;
    },
    /* eslint-enable no-shadow, no-param-reassign */
    {},
  );

  // modal type -> modal implementation
  const ActiveModal = MODAL_COMPONENTS[modalType];

  /* eslint-disable react/jsx-props-no-spreading */
  const modal = (
    <ActiveModal
      className='Luci-Modal-node active'
      open
      {...modalProps}
      {...actionsWithDispatch}
    />
  );

  // render on the DOM
  return ReactDOM.createPortal(modal, document.getElementById('modal-root'));
};

export default ModalRoot;
