// src/components/Workbench/components/MatrixDialog

/**
 * @module components/Workbench/MatrixDialog
 *
 * @description
 * Modal that replaces .presentation
 *
 * ⚠️  Uses a virtual windowing system: react-window.
 * ... uncertain how the display toggles between a table and the virtual window.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import Button from '@mui/material/Button';

import MatrixGrid from '../Workbench/components/MatrixGrid';

// -----------------------------------------------------------------------------
// ⬜ Put this in the .env
const SAVE_MATRIX_ENDPOINT = process.env.REACT_APP_SAVE_MATRIX_ENDPOINT;

// -----------------------------------------------------------------------------

const MatrixDialog = (props) => {
  const { matrix, open, handleClose } = props;

  return (
    <Dialog
      className='MuiMatrix-Dialog'
      open={open}
      onClose={handleClose}
      maxWidth='lg'
      fullWidth>
      <DialogTitle>
        Matrix
        <IconButton
          data-testid='closable-card-close-button'
          onClick={() => handleClose()}
          size='large'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className='MuiMatrix-Dialog'>
        <MatrixGrid matrix={matrix} />
      </DialogContent>
      {Object.keys(matrix).length > 0 && (
        <DialogActions>
          <Button href={SAVE_MATRIX_ENDPOINT}>Export File</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

MatrixDialog.propTypes = {
  matrix: PropTypes.objectOf(PropTypes.shape({})).isRequired,
  open: PropTypes.bool,
  handleClose: PropTypes.func.isRequired,
};

MatrixDialog.defaultProps = { open: false };

export default MatrixDialog;
