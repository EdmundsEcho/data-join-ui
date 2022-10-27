import React from 'react';

// import clsx from 'clsx';
import ConsoleLog from '../../core-app/components/shared/ConsoleLog';
import FeedbackPopup from '../FeedbackPopup';

/* eslint-disable no-console */

const data = {
  comment: 'Great work',
  scope: 'bug',
  context: 'test-page',
  score: '10',
};

const Component = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ border: 'solid 1px grey', width: '100%' }}>
        <div
          className='stage root relative'
          style={{
            border: 'solid 1px blue',
            margin: '20px',
            width: '500px',
            height: '500px',
            position: 'relative',
          }}>
          <FeedbackPopup horizontal='left' vertical='down'>
            <button className='stage button' type='button'>
              feedback
            </button>
          </FeedbackPopup>
          <p />
          <ConsoleLog value={data} advancedView expanded />
        </div>
      </div>
    </div>
  );
};

export default <Component />;
