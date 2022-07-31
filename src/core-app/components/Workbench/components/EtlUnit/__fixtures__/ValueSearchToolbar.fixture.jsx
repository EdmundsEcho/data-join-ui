import React from 'react';

// import { useSelector } from 'react-redux';
// import ReduxMock from '../../../../../cosmos.mock-store';
// import { getSelected } from '../../../ducks/rootSelectors';

import ValueSearchToolbar, { Paging } from '../ValueSearchToolbar';

const fixtures = () => {
  return (
    <>
      <div style={{ width: '270px', margin: '20px' }}>
        <ValueSearchToolbar toggleAll />
        <p />
        <ValueSearchToolbar toggleAll={false} />
        <p />
      </div>
      <div style={{ width: '370px', margin: '20px' }}>
        <Paging
          rowCount={15}
          rowsPerPage={5}
          page={2}
          handleChangePage={() => {}}
          handleChangeRowsPerPage={() => {}}
        />
      </div>
    </>
  );
};
export default fixtures;
