import React from 'react';

// import { useSelector } from 'react-redux';
// import ReduxMock from '../../../../../cosmos.mock-store';
// import { getSelected } from '../../../ducks/rootSelectors';

import Divider from '@mui/material/Divider';
import Tools from '../Tools';
import ToolProvider from '../ToolContext';

/* eslint-disable no-console */

const dummyCallback = (me) => {
  console.log(`Clicked: ${me}`);
};

/* eslint-disable react/jsx-props-no-spreading */
const Base = (props) => {
  return (
    <Tools
      type='component'
      onClickMenu={() => dummyCallback('Menu')}
      {...props}
    />
  );
};

const Fixture = () => {
  return (
    <div style={{ width: '270px', margin: '20px' }}>
      <Divider />
      <p>
        The initial value of the toggling tools only works when using the
        <code> Provider</code>.
      </p>
      <span>component</span>
      <Base type='component' switchOn showDetail />
      <span>measurement</span>
      <Base type='measurement' />
      <span>spanValues</span>
      <Base type='spanValues' />
      {/* Repeat with provider */}
      <Divider />
      <h5>With the provider</h5>
      <ToolProvider>
        <span>component</span>
        <Base type='component' switchOn />
      </ToolProvider>
      <ToolProvider>
        <span>component</span>
        <span>measurement</span>
        <Base type='measurement' />
      </ToolProvider>
      <ToolProvider>
        <span>component</span>
        <span>spanValues</span>
        <Base type='spanValues' />
      </ToolProvider>
    </div>
  );
};

export default Fixture;
