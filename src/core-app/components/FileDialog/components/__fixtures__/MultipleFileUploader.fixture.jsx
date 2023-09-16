import React from 'react';

import ConsoleLog from '../../../shared/ConsoleLog'
import MultipleFileUploader from '../MultipleFileUploader';

/* eslint-disable no-console */

const data = {
  comment: 'Great work',
  scope: 'bug',
  context: 'test-page',
  score: '10',
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
