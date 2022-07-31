import React from 'react';
import ReduxMock from '../../cosmos.mock-store';
// import ConsoleLog from '../shared/ConsoleLog';
import Group from './Group';

const Component = () => {
  return (
    <>
      <Group
        handleChange={(change) => console.log(change)}
        groups={['The payer', 'payer', 'group']}
        allowEmpty
      />
      <Group
        handleChange={(change) => console.log(change)}
        groups={['The payer', 'payer', 'group']}
        allowEmpty={false}
      />
    </>
  );
};

export default (
  <ReduxMock>
    <Component />
  </ReduxMock>
);
