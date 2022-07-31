// src/components/FileDialog/component.jsx

/**
 *
 * ⬆ container
 * 📖 files, headerViewErrors, others...
 * ⬇ LeftPane (ListOfFiles) & RightPane (SelectedListOfFiles)
 *
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import clsx from 'clsx';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import SplitPane from 'react-split-pane';
import '../../assets/scheme/react-split-pane.css';

import SelectedListOfFiles from './components/SelectedListOfFiles';
// parts to this component
import LeftPane from './LeftPane';

// 📖 data
import { getSelected } from '../../ducks/rootSelectors';

// ☎️  Callbacks to update data
import {
  fetchHeaderView,
  cancelHeaderView,
} from '../../ducks/actions/headerView.actions';
import { withConfirmation } from '../../ducks/actions/modal.actions';
import { filesConfirmRemovingFileText } from '../../constants/strings';

// debug
import { colors } from '../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const leftPaneStyle = {};
const rightPaneStyle = {
  flexGrow: 1,
  height: 'auto',
  overflow: 'auto', // NEW
};

/**
 *
 * @component
 *
 */
const FileDialogComponent = () => {
  if (DEBUG) {
    console.debug(`%crendering FileDialog component`, colors.green);
  }

  // 📖 data (shared left and right side)
  const selectedFiles = useSelector(getSelected, shallowEqual);

  // 📬 remove a headerView/file with confirmation
  const dispatch = useDispatch();

  // guarded/displays a confirmation dialog
  // ☎️  toggle/remove file (shared)
  const handleRemoveFile = useCallback(
    (filename) => {
      dispatch(
        withConfirmation(cancelHeaderView({ path: filename }), {
          stateId: `${filename}`,
          message: filesConfirmRemovingFileText(filename),
        }),
      );
    },
    [dispatch],
  );

  // ☎️  left side
  const handleToggleFile = useCallback(
    (filename, isSelected) => {
      !isSelected
        ? handleRemoveFile(filename)
        : dispatch(fetchHeaderView({ path: filename }));
    },
    [dispatch, handleRemoveFile],
  );

  return (
    <SplitPane
      className={clsx('LuciSplitPane', 'FileDialog')}
      pane1Style={leftPaneStyle}
      pane2Style={rightPaneStyle}
      minSize={240}
      defaultSize={454}
      style={{
        position: 'relative',
      }}
    >
      <LeftPane selectedFiles={selectedFiles} toggleFile={handleToggleFile} />
      <RightPane selectedFiles={selectedFiles} removeFile={handleRemoveFile} />
    </SplitPane>
  );
};

/* selected file view: 📖 headerViewErrors */
function RightPane({ selectedFiles, removeFile }) {
  const title = selectedFiles.length === 1 ? 'file selected' : 'files selected';
  // renders any time the list changes
  return (
    <Card className='Luci-HeaderViews'>
      <CardHeader
        title={`${selectedFiles.length} ${title}`}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent>
        <SelectedListOfFiles selected={selectedFiles} removeFile={removeFile} />
      </CardContent>
    </Card>
  );
}
// SplitPane.RightPane.displayName = 'FileDialog.SplitPane.RightPane';
RightPane.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeFile: PropTypes.func.isRequired,
};

export default FileDialogComponent;
