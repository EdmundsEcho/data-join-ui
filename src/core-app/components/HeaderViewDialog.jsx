/**
 * @module /components/HeaderViewDialog
 *
 * @deprecate - likely just use back arrow
 *
 * @description
 * HeaderViewDialog
 * A pop-up used to update a headerView from another part of the process (e.g.,
 * etlView)
 *
 * 📖 Data source: redux useSelector(filename)
 * ⬆ parent: EtlFieldView/component
 * ⬇ State is expressed by: HeaderView_v2
 *
 * This is a Dialog wrapper for the HeaderView component and maintains a
 * temporary state of changes until the user cancels (resets) or saves
 * the changes (does not reset changes saved on-the-fly).
 *
 * 🚨 This design is wrong.
 * ⬜ Leverage the generic Dialog under shared.
 *
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

// redux
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

// material-ui
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import HeaderView from './HeaderView';

// machine
import { useFormMachine } from '../hooks/use-form-machine';

// action creators
import {
  resetFileFields,
  updateFileField,
  // updateWideToLongFields,
  // updateImpliedMvalue,
  // excludeField,
} from '../ducks/actions/headerView.actions';
// state-store selectors
import {
  selectHeaderView,
  // selectHeaderErrors,
} from '../ducks/rootSelectors';

import { debug, useTraceUpdate } from '../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

/**
 * Delegates when and what to save to redux to machine-form.
 * Pulls all of the hv value into the machine.
 *
 * @component
 *
 */
function HeaderViewDialog(props) {
  const { filename, handleClose } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering HeaderViewDialog`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  const dispatch = useDispatch();

  const headerView = useSelector(
    (stateStore) => selectHeaderView(stateStore, filename),
    shallowEqual,
  );
  // extract hv meta for display
  const { nrows /* filename */ } = headerView;

  console.debug('%crendering: DIALOG HeaderViewDialog', debug.color.green, filename);
  console.dir(headerView);

  // retrieve features from useFormMachine
  // 🚨 re-render issue?
  const {
    // output
    formState: { state, saveState }, // errorState
    formCallbacks: { reset, save }, // send
    fieldMachines,
  } = useFormMachine({
    // input
    update: useCallback((...args) => dispatch(updateFileField(...args)), [dispatch]),
    reset: useCallback((...args) => dispatch(resetFileFields(...args)), [dispatch]),
    data: headerView,
    dataId: headerView.filename,
    fieldId: 'header-idx',
    debug: true,
  });

  // callbacks that require ref to machine
  const onSave = () => {
    save();
    handleClose();
  };
  const onCancel = (e) => {
    reset(e);
    handleClose();
  };
  const isReadyToSave = () => saveState(state); // machine state

  console.assert(headerView, 'the hv data is missing');

  return (
    <Dialog className='Luci-HeaderViews dialog' open fullWidth maxWidth='md'>
      <DialogTitle>
        <Typography>{filename}</Typography>
        <IconButton
          aria-label='Close'
          className='closeButton'
          onClick={onCancel}
          size='large'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <div>
          <HeaderView
            filename={filename}
            nrows={nrows}
            canClose={false}
            fieldMachines={fieldMachines}
            headerView={headerView} /* temp */
          />
        </div>
      </DialogContent>

      <DialogActions>
        <Typography>{JSON.stringify(state.value)}</Typography> {/* debug */}
        <Button onClick={onCancel}>Cancel</Button>
        <Button disabled={!isReadyToSave()} color='secondary' onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

HeaderViewDialog.propTypes = {
  filename: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default HeaderViewDialog;
