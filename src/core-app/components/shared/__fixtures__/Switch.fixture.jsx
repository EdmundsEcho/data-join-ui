import React from 'react';

// import { useSelector } from 'react-redux';
// import ReduxMock from '../../../../../cosmos.mock-store';
// import { getSelected } from '../../../ducks/rootSelectors';

import Switch from '../Switch';

/* eslint-disable no-console */
const fixtures = () => {
  return (
    <>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked
          onChange={(value) => console.log(`Clicked: ${value}`)}
        />
      </div>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked={false}
          onChange={(value) => console.log(`Clicked: ${value}`)}
        />
      </div>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked={false}
          onChange={(value) => console.log(`Clicked: ${value}`)}
          disabled
        />
      </div>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked
          labelPlacement='start'
          onChange={(value) => console.log(`Clicked: ${value}`)}
        />
      </div>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked
          labelPlacement='end'
          fontSize='medium'
          onChange={(value) => console.log(`Clicked: ${value}`)}
        />
      </div>
      <div style={{ width: '270px', margin: '20px' }}>
        <Switch
          labelOne='series'
          labelTwo='rollup'
          checked
          labelPlacement='end'
          fontSize='small'
          onChange={(value) => console.log(`Clicked: ${value}`)}
        />
      </div>
    </>
  );
};
export default fixtures;
