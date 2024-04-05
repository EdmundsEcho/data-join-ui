import React from 'react';

/*
import { useSelector } from 'react-redux';
import { useSelect } from 'react-cosmos/client';
*/

import ReduxMock from '../../../../../cosmos.mock-store';
import DerivedFieldConfig from '../DerivedFieldConfig';
import initialState from '../../../../../datasets/store_v5.json';

/* eslint-disable no-console */

const Components = () => {
  return (
    <div style={{ width: '350px', margin: '20px' }}>
      <DerivedFieldConfig nodeId={21} />
    </div>
  );
};

const fixtures = (
  <ReduxMock initialState={initialState}>
    <Components />
  </ReduxMock>
);
export default fixtures;
