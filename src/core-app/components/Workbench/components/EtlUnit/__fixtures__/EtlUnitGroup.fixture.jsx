import React from 'react';
import { useSelector } from 'react-redux';
import { useSelect } from 'react-cosmos/fixture';

import EtlUnitGroupBase from '../EtlUnitGroupBase';
import EtlUnit from '../EtlUnit';
import ConsoleLog from '../../../../shared/ConsoleLog';

import ReduxMock from '../../../../../cosmos.mock-store';
import initialState from '../../../../../datasets/store_v4.json';
import { selectNodeState } from '../../../../../ducks/rootSelectors';

/*
      nodeId={config.nodeId}
      type={context === 'palette' ? 'shell' : config.type}
      version={1}
*/

//
// WIP
// const config = { etlUnits: [20], derivedField: {} };

const Component = () => {
  const [NODE_ID] = useSelect('select group node', {
    options: ['21', '19', '5'],
  });
  const nodeState = useSelector((state) => selectNodeState(state, +NODE_ID));
  return (
    <>
      <div style={{ width: '280px', margin: '20px' }}>
        <h5>Version 1 - shell</h5>
        <EtlUnitGroupBase type='shell' version={1} nodeId={NODE_ID}>
          <EtlUnit nodeId={nodeState.childIds[0]} />
        </EtlUnitGroupBase>
        <p />
        <h5>Version 1 - empty</h5>
        <EtlUnitGroupBase type='empty' version={1} nodeId={NODE_ID}>
          <EtlUnit nodeId={nodeState.childIds[0]} />
        </EtlUnitGroupBase>
        <p />
        <h5>Version 2 - subject universe</h5>
        <EtlUnitGroupBase type='subjectUniverse' version={2} nodeId={NODE_ID}>
          <EtlUnit nodeId={nodeState.childIds[0]} />
        </EtlUnitGroupBase>
        <p />
        <h5>Version 1 - empty</h5>
        <EtlUnitGroupBase type='derivedField' version={1} nodeId={NODE_ID}>
          <EtlUnit nodeId={nodeState.childIds[0]} />
        </EtlUnitGroupBase>
      </div>
      <p />
      <ConsoleLog value={nodeState} advancedView />
    </>
  );
};
export default (
  <ReduxMock initialState={initialState}>
    <Component />
  </ReduxMock>
);
