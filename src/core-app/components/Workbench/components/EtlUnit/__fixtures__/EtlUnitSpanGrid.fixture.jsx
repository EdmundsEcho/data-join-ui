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

const dummySpanData = {
  tag: 'spanValues',
  reduced: false,
  displayName: 'click-date',
  request: true,
  componentName: 'time',
  timeProp: {
    interval: {
      unit: 'M',
      count: 1,
    },
    reference: {
      idx: 0,
      value: '2012-05',
      isoFormat: 'YYYY-MM',
    },
  },
  values: {
    0: {
      request: true,
      value: { rangeStart: 0, rangeLength: 1, reduced: false },
    },
    1: {
      request: true,
      value: { rangeStart: 2, rangeLength: 1, reduced: false },
    },
  },
};
const Component = () => {
  // 📖
  const { displayName: etlUnitName, value = dummySpanData } = useSelector(
    (state) => getSpanLevelsFromNode(state, 20),
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
        <ConsoleLog value={value} advancedView />
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
