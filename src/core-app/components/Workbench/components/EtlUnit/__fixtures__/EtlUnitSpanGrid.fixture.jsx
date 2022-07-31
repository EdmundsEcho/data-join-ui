import React from 'react';
import { useSelector } from 'react-redux';

import EtlUnitSpanGrid from '../EtlUnitSpanGrid';

import ReduxMock from '../../../../../cosmos.mock-store';
import initialState from '../../../../../datasets/store_v4.json';

import ConsoleLog from '../../../../shared/ConsoleLog';
// 📖
import {
  getSpanLevelsFromNode,
  getEtlUnitTimeProp,
} from '../../../../../ducks/rootSelectors';

const Component = () => {
  // 📖
  const { displayName: etlUnitName, value: spanData } = useSelector((state) =>
    getSpanLevelsFromNode(state, 24),
  );
  // retrieve the timeProp to enable data format based on relative data
  const { time: timeProp, formatOut } = useSelector((state) =>
    getEtlUnitTimeProp(state, etlUnitName),
  );

  return (
    <>
      <div style={{ width: '380px', margin: '20px' }}>
        <EtlUnitSpanGrid nodeId={20} />
      </div>
      <p />
      <div style={{ width: '380px', margin: '20px' }}>
        <EtlUnitSpanGrid nodeId={24} />
      </div>
      <p />
      <div style={{ margin: '20px' }}>
        <ConsoleLog value={spanData} advancedView />
        <ConsoleLog value={timeProp} advancedView expanded />
      </div>
    </>
  );
};

const fixtures = (
  <ReduxMock initialState={initialState}>
    <Component />
  </ReduxMock>
);

export default fixtures;
