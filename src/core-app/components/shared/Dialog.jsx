/**
 * @module src/components/NewEtlFieldForm/Dialog.jsx
 *
 * @description
 * Dialog that wraps around the form component
 * Usage: Render prop that provides userHitCancel and userHitSave.
 *
 * @todo Include the etlUnit name in the formData to be included in the
 *       new field props (etl-unit)
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

import useThemeMode from '../../../hooks/use-theme-mode';

const DialogWrapper = (props) => {
  const {
    open,
    activeSaveFeature,
    title,
    instructions,
    children,
    handleSave,
    handleCancel,
  } = props;

  const [themeMode] = useThemeMode();

  return (
    <Dialog
      className={`Luci-Dialog root ${themeMode}-theme-context`}
      open={open}
      fullWidth
      maxWidth='sm'>
      <div className='frame'>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{instructions}</DialogContentText>
          {children}
        </DialogContent>

        <DialogActions className={clsx('actions save')}>
          <Button className='cancel button' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className='save button'
            disabled={!activeSaveFeature}
            color='secondary'
            onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

DialogWrapper.propTypes = {
  activeSaveFeature: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  instructions: PropTypes.string,
  children: PropTypes.node.isRequired,
};

DialogWrapper.defaultProps = {
  instructions: '',
};

export default DialogWrapper;
