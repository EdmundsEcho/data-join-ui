// src/components/use-modal.jsx

/**
 * @module components/use-modal
 *
 * @description
 * Wraps an *action* with the modal functionality.  The modal component
 * hosts the actions for cancel and proceed. Proceed is an array of actions.
 * Both cancel and proceed first hide the modal.
 *
 * exports useModal
 * default: import WithModal
 *
 */
import React, { useContext, useRef, createContext, useState } from 'react';
import PropTypes from 'prop-types';

/* eslint-disable no-console */

// create the context...
const ModalServiceContext = createContext();

// ...pass the context to useContext
export const useModal = () => useContext(ModalServiceContext);
// ✨ get the useConfirmation value in the context

const WithModal = ({ ModalComponent, children }) => {
  return (
    <ModalServiceProvider ModalComponent={ModalComponent}>
      {children}
    </ModalServiceProvider>
  );
};
WithModal.propTypes = {
  ModalComponent: PropTypes.elementType.isRequired, // unresolved JSX fn
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
};

/**
 * 🔑 The context provider
 */
function ModalServiceProvider({ ModalComponent, children }) {
  // 📖 show/hide modal and user-specified modal props
  const [showModal, setShowModal] = useState(() => false);
  const [modalProps, setModalProps] = useState();

  // 🗑️  clear state
  const cleanup = () => {
    setShowModal(undefined);
    setModalProps(undefined);
  };

  // 📖 DOM ref to store the promise
  const awaitingPromiseRef = useRef();

  // 💰 ref to the context value
  // ::function that returns a Promise
  // props depend on the modal. e.g., {message, stateId}
  const openModalP = (props /* modalProps */) => {
    setShowModal(true);
    setModalProps(props);
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    }).finally(() => cleanup());
  };

  // ✅ resolve when cancel
  const handleCancel = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }
  };

  // ✅ resolve when confirm
  const handleConfirm = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve();
    }
  };

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <>
      <ModalServiceContext.Provider value={openModalP}>
        {children}
      </ModalServiceContext.Provider>

      <ModalComponent
        open={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...modalProps}
      />
    </>
  );
  /* eslint-enable react/jsx-props-no-spreading */
}
ModalServiceProvider.propTypes = {
  ModalComponent: PropTypes.elementType.isRequired, // unresolved JSX fn
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]).isRequired,
};

export default WithModal;
