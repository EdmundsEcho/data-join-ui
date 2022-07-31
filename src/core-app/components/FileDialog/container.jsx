// src/components/FileDialog/container.jsx

/**
 *
 * 📌 Parent = App
 *
 * Gateway that combines pending jobs with headerView errors
 * in order to determine if the user can move to the next step.
 *
 * @module containers/FileDialog
 *
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { withSnackbar } from 'notistack';
import { compose } from 'redux';
import { connect } from 'react-redux';

// children
import FileAndHeaderDialog from './component';

import { getFileInspectionErrors } from '../../ducks/rootSelectors';

// debug
import { debug, useTraceUpdate } from '../../constants/variables';
import { getFilenameFromPath } from '../../utils/common';

/* eslint-disable no-console */

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
// -----------------------------------------------------------------------------

/**
 * The purpose of this container is in flux (getting less useful).
 *
 * This component is a container that coordinates various data sources.
 * * surfing file directories
 * * reporting on inspected selected files
 * * snackbar capacity
 *
 * @component
 *
 */
function Container(props) {
  const {
    fileInspectionErrors, // 📖 from redux
    enqueueSnackbar,
  } = props;

  useTraceUpdate(props);

  if (process.env.REACT_APP_DEBUG_RENDER === 'true')
    console.debug(`%crendering FileDialog container`, debug.color.green);

  if (DEBUG) {
    console.dir(props);
  }

  // snackbars
  useEffect(() => {
    if (fileInspectionErrors.length) {
      fileInspectionErrors.forEach((entry) => {
        const [path, error] = Object.entries(entry)[0];
        enqueueSnackbar(`${getFilenameFromPath(path)}: ${error}`, {
          variant: 'warning',
        });
      });
    }
  }, [enqueueSnackbar, fileInspectionErrors]);

  // container + Component used to express state
  return <FileAndHeaderDialog />;
}
Container.propTypes = {
  fileInspectionErrors: PropTypes.arrayOf(PropTypes.shape({})),
  enqueueSnackbar: PropTypes.func.isRequired,
};
Container.defaultProps = {
  fileInspectionErrors: [],
};

const mapStateToProps = (state) => ({
  fileInspectionErrors: getFileInspectionErrors(state),
});

export default compose(connect(mapStateToProps), withSnackbar)(Container);
