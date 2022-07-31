import React from 'react';
import { useSelector } from 'react-redux';
import { useSelect } from 'react-cosmos/fixture';

import Typography from '@mui/material/Typography';

import ConsoleLog from '../../../../shared/ConsoleLog';
import ReduxMock from '../../../../../cosmos.mock-store';
import initialState from '../../../../../datasets/store_v4.json';

import { EtlUnitParameter } from '../EtlUnitBase';

// 📖
import {
  selectEtlUnitDisplayConfig,
  selectNodeState,
} from '../../../../../ducks/rootSelectors';

const EtlUnitParameterFix = () => {
  const [id] = useSelect('select node', {
    options: ['5', '20', '22', '23', '24'],
  });

  const { data: nodeData, id: nodeId } = useSelector((state) =>
    selectNodeState(state, +id),
  );

  const identifier =
    nodeData.type === 'etlUnit::quality'
      ? nodeData.value.qualityName
      : nodeData.value.measurementType;

  const configs = useSelector((state) =>
    selectEtlUnitDisplayConfig(state, nodeId, identifier),
  );

  return nodeData ? (
    <div style={{ margin: '20px', width: '300px' }}>
      <EtlUnitParameter nodeId={nodeId} palette={false} configs={configs} />
      <p />
      <h5>Configs</h5>
      <ConsoleLog value={configs} advancedView />
      <h5>Node data</h5>
      <ConsoleLog value={nodeData} advancedView />
    </div>
  ) : (
    <Typography>{`No data for ${id}`}</Typography>
  );
};

const fixture = (
  <ReduxMock initialState={initialState}>
    <EtlUnitParameterFix />
  </ReduxMock>
);

export default fixture;
