import React from 'react';

import Typography from '@mui/material/Typography';
import { Div } from '..';

const Components = () => {
  return (
    <div style={{ margin: '20px' }}>
      <Div className='test'>
        <Typography>Dark theme set in mui</Typography>
      </Div>
      <Div className='test-outside-mui'>
        <Typography>Dark theme outside mui</Typography>
      </Div>
    </div>
  );
};

const fixtures = <Components />;
export default fixtures;
