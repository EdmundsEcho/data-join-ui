import React from 'react';

// import { useSelector } from 'react-redux';
import ReduxMock from '../../../cosmos.mock-store';
// import { getSelected } from '../../../ducks/rootSelectors';

import FileDialog from '../FileDialog';

const fixture = (
  <ReduxMock>
    <FileDialog />
  </ReduxMock>
);
export default fixture;
