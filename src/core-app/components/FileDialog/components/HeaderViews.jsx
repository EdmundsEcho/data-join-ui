/**
 * @module components/FileDialog/SelectedList
 * @description
 * Lists cards that represent files that have been selected for the current
 * campaign. These files are represented by FileDialogCard components.
 *
 * ⬆ Parent: FileDialog (RightPanel)
 * 📖 HeaderViews ~ list of selected files (uid: filename/path)
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

const HeaderViews = (props) => {
  const {
    selectedFiles, // [[path, displayName]]
    removeFile,
  } = props;

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
  return selectedFiles.length === 0 ? (
    <Container className={clsx('Luci-HeaderViews', 'empty')}>
      <Typography type='p'>
        Select the files to be included in the analysis.
      </Typography>
    </Container>
  ) : (
    <Container className={clsx('Luci-HeaderViews', 'root')}>
      {selectedFiles.map(([path, displayName]) => (
        <HeaderView
          key={`|${path}|header-view`}
          stateId={`|${path}|header-view`}
          displayName={displayName}
          filename={path}
          removeFile={() => removeFile(path, displayName)}
        />
      ))}
    </Container>
  );
};

HeaderViews.propTypes = {
  selectedFiles: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  removeFile: PropTypes.func.isRequired,
};

HeaderViews.defaultProps = {
  selectedFiles: [],
};

export default HeaderViews;
