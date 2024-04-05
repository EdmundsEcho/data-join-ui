import React from 'react';

import { useSelector } from 'react-redux';
import { useSelect } from 'react-cosmos/client';

// 📖
import {
  selectEtlUnitDisplayConfig,
  selectNodeState,
} from '../../../../../ducks/rootSelectors';

import ValueGridWorkbench from '../ValueGridWorkbench';
import ConsoleLog from '../../../../shared/ConsoleLog';

/* eslint-disable react/prop-types */

/* eslint-disable no-shadow */
const Component = ({ hideConsole }) => {
  const [id] = useSelect('select node', {
    options: ['5', '7'],
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
  /*
            "request": true,
            "qualityName": "q_specialty",
            "displayName": "specialty",
            "palette-name": "specialty",
            "canvas-alias": "specialty",
            "tag": "txtValues",
            "count": 37,
            "values": { "__ALL__": { "value": "__ALL__", "request": true } }
    */
  return (
    <div style={{ margin: '30px' }}>
      <ConsoleLog value={configs} advancedView collapsed={hideConsole} />
      {configs.map(({ tag, identifier, nodeId }) => (
        <ValueGridWorkbench
          key={`${identifier}-${nodeId}`}
          type={tag}
          identifier={identifier}
          nodeId={nodeId}
          instanceOf='quality' // hack testing
        />
      ))}
    </div>
  );
};

export default Component;
