// src/components/Workbench/components/Palette.presentation.jsx

import React from 'react';
// import PropTypes from 'prop-types';
// import clsx from 'clsx';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import Node from './Node';
import { NODE_TYPES } from '../../../lib/sum-types';

function Palette(/* props */) {
  return (
    <Container key='container-[palette]' className='palette-root'>
      {/* single superGroup-root (vs .map for Canvas) */}
      <div className='Node-root superGroup palette'>
        <Typography>Data (Etl-units)</Typography>
        <Node key='node-palette' id={3} type={NODE_TYPES.PALETTE} />
      </div>
    </Container>
  );
}

export default Palette;
