import React from 'react';

import FileFieldVersion from './ValueGridFileLevels.fixture';
import WorkbenchVersion from '../../Workbench/components/EtlUnit/__fixtures__/ValueGridWorkench.fixture';

/* eslint-disable no-shadow, react/prop-types */

//
// A simultaneous view of the two versions of the ValueGrid
//
const Component = () => {
  return (
    <div style={{ margin: '30px' }}>
      <FileFieldVersion hideConsole />
      <WorkbenchVersion hideConsole />
    </div>
  );
};

export default Component;
