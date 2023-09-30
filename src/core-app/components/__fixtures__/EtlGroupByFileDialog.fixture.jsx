import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import EtlGroupByFileDialog from '../EtlGroupByFileDialog';

import ReduxMock from '../../../cosmos.mock-store';
import initialState from '../../datasets/store_v6.json';

import ConsoleLog from '../shared/ConsoleLog';

/* <EtlFieldGroupByFileDialog
          key={`${stateId}|newFieldDialog|${newFieldSeedData?.purpose}`}
          stateId={`${stateId}|newFieldDialog`}
          open={openNewFieldDialog}
          files={mkFilesLookup(newFieldSeedData?.etlUnit)}
          seedValues={newFieldSeedData}
          onSave={handleNewFieldSave}
          onCancel={handleEtlFieldCancel}
          error={(newName) => listOfFieldNames.includes(newName)}
        /> */

function Component() {
  const files = useSelector((state) => {
    return state.etlView.etlObject.etlFields['Unit Count'].sources;
  });
  return (
    <div style={{ margin: '20px', width: '300px' }}>
      <EtlGroupByFileDialog
        stateId='xx'
        displayName='Testing'
        files={files}
        open
      />
      <p />
      <ConsoleLog value={files} advancedView />
    </div>
  );
}
const fixtures = (
  <ReduxMock initialState={initialState}>
    <Component />
  </ReduxMock>
);
export default fixtures;
