import React from 'react';
import ReduxMock from '../../../cosmos.mock-store';
import RegexMenu from '../RegexMenu';

const fixtures = {
  mcomp: (
    <ReduxMock>
      <RegexMenu
        name='demo'
        purpose='mcomp'
        handleParseCommand={() => {}}
        disabled={false}
      />
    </ReduxMock>
  ),
  mspan: (
    <ReduxMock>
      <RegexMenu
        name='demo'
        purpose='mspan'
        handleParseCommand={() => {}}
        disabled={false}
      />
    </ReduxMock>
  ),
};

export default fixtures;
