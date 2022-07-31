import React from 'react';

import Dialog from './Dialog';

Dialog.displayName = 'RollupDialog/Dialog';

const mkValues = (count) => {
  const values = {};
  for (let i = 0; i < count; i += 1) {
    values[`Value ${i + 1}`] = null;
  }
  return values;
};

const mkGroups = (count) => {
  const groups = [];
  for (let i = 0; i < count; i += 1) {
    groups.push(`Group ${i + 1}`);
  }
  return groups;
};

const Dialog1 = () => {
  return <Dialog open values={mkValues(3)} />;
};
const Dialog2 = () => {
  return <Dialog open values={mkValues(3)} groups={mkGroups(10)} debug />;
};

const fixtures = {
  'no-groups': Dialog1,
  'with-groups': Dialog2,
};
export default fixtures;
