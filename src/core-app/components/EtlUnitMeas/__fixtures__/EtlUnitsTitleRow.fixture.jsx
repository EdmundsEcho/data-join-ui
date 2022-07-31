import React from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import MeaUnitTitleRow from '../MeaUnitTitleRow';

const Component = () => {
  return (
    <Table>
      <TableBody>
        <MeaUnitTitleRow />
      </TableBody>
    </Table>
  );
};

const fixtures = <Component />;

export default fixtures;
