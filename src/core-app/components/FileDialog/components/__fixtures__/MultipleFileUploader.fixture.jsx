import React from 'react';

import ConsoleLog from '../../../shared/ConsoleLog'
import MultipleFileUploader from '../MultipleFileUploader';

/* eslint-disable no-console */

const data = {
  Name: 'upload_this.csv',
  Type: 'text/csv',
  Size: '3000 bytes',
};

const Component = () => {
  return (
    <div style={{ margin: '20px', width: '300px' }}>
      <MultipleFileUploader />
      <p />
      <ConsoleLog value={data} advancedView expanded />
    </div>
  );
};

export default <Component />;
