import React from 'react';

// import { useSelector } from 'react-redux';
// import ReduxMock from '../../../../../cosmos.mock-store';
// import { getSelected } from '../../../ducks/rootSelectors';

import CardHeader from '../EtlUnitCardHeader';

const fixtures = () => {
  return (
    <div style={{ width: '270px', margin: '20px' }}>
      <CardHeader
        title='Read-only quality'
        palette
        tag='quality'
        etlUnitType='quality'
      />
      <CardHeader
        title='Read-only measurement'
        palette
        tag='measurement'
        etlUnitType='measurement'
      />
      <CardHeader
        title='quality name'
        palette={false}
        tag='quality'
        etlUnitType='quality'
      />
      <CardHeader
        title='measurement name'
        meta={7}
        palette={false}
        tag='measurement'
        etlUnitType='measurement'
      />
      <CardHeader
        title='component name'
        meta={7}
        palette={false}
        tag='txtValues'
        etlUnitType='measurement'
      />
      <CardHeader
        title='span values'
        palette={false}
        tag='spanValues'
        etlUnitType='measurement'
      />
    </div>
  );
};
export default fixtures;
