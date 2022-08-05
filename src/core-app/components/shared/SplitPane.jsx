// src/components/shared/SplitPane.jsx

import React from 'react';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import SplitPane from 'react-split-pane';

// debug
// import { debug } from '../../constants/variables';
// const DEBUG = process.env.REACT_APP_DEBUG_RENDER_HIGH === 'true';
/* eslint-disable no-console */

const LEFT_SIDE_WIDTH = 440;

/**
 *
 * @component
 *
 */
const SplitPaneWrapper = () => {
  return (
    <SplitPane minSize={240} defaultSize={LEFT_SIDE_WIDTH}>
      <LeftPane />
      <RightPane />
    </SplitPane>
  );
};

function RightPane() {
  return (
    <Card>
      <Typography>Right side pane</Typography>
    </Card>
  );
}

function LeftPane() {
  return (
    <Card>
      <Typography>Left side pane</Typography>
    </Card>
  );
}

export default SplitPaneWrapper;
