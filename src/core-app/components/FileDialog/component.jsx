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
import { useParams } from 'react-router-dom';

import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import clsx from 'clsx';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import SplitPane from 'react-split-pane';

import HeaderViews from './components/HeaderViews';
// parts to this component
import LeftPane from './LeftPane';

// 📖 data
import { getDriveTokenId, getSelected } from '../../ducks/rootSelectors';

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

const style = {
  position: 'relative',
};
const leftPaneStyle = {
  overflow: 'auto',
};
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
  const currentDriveToken = useSelector(getDriveTokenId);
  const { projectId } = useParams();

  // 📬 remove a headerView/file with confirmation
  const dispatch = useDispatch();

  // guarded/displays a confirmation dialog
  // ☎️  toggle/remove file (shared)
  const handleRemoveFile = useCallback(
    (path, displayName) => {
      dispatch(
        withConfirmation(cancelHeaderView({ path }), {
          stateId: `${path}`,
          message: filesConfirmRemovingFileText(displayName),
        }),
      );
    },
    [dispatch],
  );

  // ☎️  left side
  const handleToggleFile = useCallback(
    ({ fileId, path, displayName, isSelected }) => {
      // coordinate state with new isSelected value (FileRowItem)
      return isSelected
        ? dispatch(
            fetchHeaderView({
              projectId,
              tokenId: currentDriveToken,
              fileQuery: fileId,
              path,
              displayName,
            }),
          ) // + add to the selected
        : handleRemoveFile(path, displayName);
    },
    [dispatch, handleRemoveFile, projectId, currentDriveToken],
  );

  return (
    /* ROOT VIEW */
    <SplitPane
      className={clsx('LuciSplitPane', 'FileDialog')}
      style={style}
      pane1Style={leftPaneStyle}
      pane2Style={rightPaneStyle}
      minSize={240}
      defaultSize={454}>
      <LeftPane projectId={projectId} toggleFile={handleToggleFile} />
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
        {/* selected files => HeaderViews */}
        <HeaderViews selectedFiles={selectedFiles} removeFile={removeFile} />
      </CardContent>
    </Card>
  );
}
// SplitPane.RightPane.displayName = 'FileDialog.SplitPane.RightPane';
RightPane.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
    .isRequired,
  removeFile: PropTypes.func.isRequired,
};

export default FileDialogComponent;
