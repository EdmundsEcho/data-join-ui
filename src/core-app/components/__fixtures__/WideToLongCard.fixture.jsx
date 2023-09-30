import React from 'react';

import { useSelector } from 'react-redux';

import WideToLongCard from '../WideToLongCard';

import { getSelected } from '../../ducks/rootSelectors';

import ConsoleLog from '../shared/ConsoleLog';

/* eslint-disable no-shadow */
const Component = () => {
  const filename = useSelector((state) => getSelected(state)).find((filename) =>
    filename.includes('fat_'),
  );
  return (
    <div style={{ margin: '30px' }}>
      <WideToLongCard filename={filename} stateId='wtlf-ok' />
      <ConsoleLog value={filename} />
    </div>
  );
};

export default Component;
