import React from 'react';
import LevelEditor from '../LevelEditor';
import ConsoleLog from '../shared/ConsoleLog';
import ReduxMock from '../../cosmos.mock-store';

LevelEditor.displayName = 'Generic Components/LevelEditor';

const levels = [
  ['Surgeon', 5],
  ['Surgeone', 6],
  ['Surjin', 8],
  ['Another1', 11],
  ['Another2', 16],
];

const mappedSymbols = {
  'map-source': null,
  domain: null,
  codomain: null,
  arrows: {
    Surjin: 'Surgeon',
    Another1: 'Another',
    Another2: 'Another',
  },
};

const Component = () => {
  return (
    <>
      <LevelEditor
        open
        levels={levels}
        levelIdx={null}
        mappedSymbols={mappedSymbols}
        onCancel={() => {}}
        onSubmit={() => {}}
      />
      <p />
      <ConsoleLog value={levels} advancedView />
      <ConsoleLog value={mappedSymbols} advancedView />
    </>
  );
};

export default (
  <ReduxMock>
    <Component />
  </ReduxMock>
);
