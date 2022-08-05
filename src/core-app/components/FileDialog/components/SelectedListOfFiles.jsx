/**
 * @module components/FileDialog/SelectedList
 * @description
 * Lists cards that represent files that have been selected for the current
 * campaign. These files are represented by FileDialogCard components.
 *
 * ⬆ Parent: FileDialog (RightPanel)
 * 📖 list of selected files (uid: path)
 * ⬇ ⬇ HeaderView
 *
 * Mostly local state (toggle show).
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import HeaderView from '../../HeaderView';

import { debug, useTraceUpdate } from '../../../constants/variables';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const SelectedListOfFiles = (props) => {
  const { files, removeFile } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true') {
    console.debug(`%crendering SelectedListOfFiles`, debug.color.green);
  }
  if (DEBUG) {
    console.dir(props);
  }

  // 🔖 selected does not mean ready
  // ...wait for api to retrieve
  //
  return files.length === 0 ? (
    <Container className={clsx('Luci-HeaderViews', 'empty')}>
      <Typography type='p'>
        Select the files to be included in the analysis.
      </Typography>
    </Container>
  ) : (
    <Container className={clsx('Luci-HeaderViews', 'root')}>
      {files.map((file) => (
        <HeaderView
          key={`|${file.pathObj.identifier}|header-view`}
          stateId={`|${file.pathObj.identifier}|header-view`}
          filename={file.pathObj.displayName}
          removeFile={() => removeFile(file.pathObj)}
        />
      ))}
    </Container>
  );
};

SelectedListOfFiles.propTypes = {
  files: PropTypes.arrayOf(PropTypes.shape({})),
  removeFile: PropTypes.func.isRequired,
};

SelectedListOfFiles.defaultProps = {
  files: [],
};

export default SelectedListOfFiles;
