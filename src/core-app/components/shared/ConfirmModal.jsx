// src/components/shared/ConfirmModal.jsx

/**
 * @module components/shared/ConfirmModal
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function ConfirmModal({ open, onCancel, onConfirm, message }) {
  return (
    <Dialog className='Luci-Dialog root' key='ConfirmModalRoot' open={open}>
      <DialogTitle id='alert-dialog-title'>Please confirm.</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          {message ||
            'Please confirm that you would like to remove this component.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions className={clsx('actions confirm')}>
        <Button onClick={onCancel} color='primary'>
          Cancel
        </Button>
        <Button onClick={onConfirm} color='primary' autoFocus>
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmModal.propTypes = {
  message: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  open: PropTypes.bool,
};
ConfirmModal.defaultProps = {
  message: 'Please confirm or cancel.',
  open: false,
};

export { ConfirmModal };
export default ConfirmModal;
