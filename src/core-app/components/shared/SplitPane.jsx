// src/components/shared/SplitPane.jsx

import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import SplitPane from 'react-split-pane';
import '../../assets/scheme/react-split-pane.css';

// debug
import { debug } from '../../constants/variables';

/* eslint-disable no-console */

const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: '100%',
  },

  // left pane
  filesView: {
    margin: '0px',
    minHeight: 0,
    borderRadius: 0,
    boxShadow: 'none',
  },
  filesViewHeader: {},
  filesViewContent: {},

  // right pane
  selectedFilesView: {
    margin: '0px 5px 5px 3px',
    minHeight: 0,
    borderRadius: 0,
    overflowBehavior: 'contain',
  },
  selectedFilesViewHeader: {
    paddingLeft: theme.spacing(6),
  },
  selectedFilesViewContent: {
    paddingTop: theme.spacing(0),
  },
  rightPaneStyle: {
    // backgroundColor: "blue",
    flexGrow: 1,
    height: 'auto',
    overflow: 'auto', // NEW
  },
  leftPaneStyle: {},
}));

const leftPaneStyle = {
  // backgroundColor: "black",
};
const rightPaneStyle = {
  // backgroundColor: "blue",
  flexGrow: 1,
  height: 'auto',
  overflow: 'auto', // NEW
};

/**
 *
 * @component
 *
 */
const SplitPaneWrapper = ({ leftSideWidth = 440 }) => {
  if (process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true')
    console.debug(`%crendering FileDialog component`, debug.color.green);
  if (DEBUG) {
    // console.dir(props);
  }

  const classes = useStyles();

  // shared

  return (
    <SplitPane
      className={classes.root}
      pane1Style={leftPaneStyle}
      pane2Style={rightPaneStyle}
      minSize={240}
      defaultSize={leftSideWidth}
    >
      <LeftPane classes={classes} />
      <RightPane classes={classes} />
    </SplitPane>
  );
};

function RightPane({ classes }) {
  return (
    <Card>
      <Typography>Right side pane</Typography>
    </Card>
  );
}

function LeftPane({ classes }) {
  return (
    <Card>
      <Typography>Left side pane</Typography>
    </Card>
  );
}

export default SplitPaneWrapper;
