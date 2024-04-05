import React from 'react';

import ConsoleLog from '../../core-app/components/shared/ConsoleLog';
import SlidingPopperFeedback from '../SlidingPopperFeedback';

/* eslint-disable no-console */

const data = {
  comment: 'Great work',
  scope: 'bug',
  context: 'test-page',
  score: '10',
};

const css = `
  .Luci-SlidingPopup {
    margin-top: auto;
  }
`;

const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

const Component = () => {
  return (
    <div style={{ margin: '20px', width: '300px' }}>
      <div
        className='feedback-container'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          width: '500px',
          height: '400px',
          border: '1px solid white',
        }}
      >
        <SlidingPopperFeedback />
      </div>
      <p />
      <ConsoleLog value={data} advancedView expanded />
    </div>
  );
};

export default <Component />;
