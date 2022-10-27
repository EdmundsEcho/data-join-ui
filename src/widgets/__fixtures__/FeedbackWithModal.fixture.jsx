import React from 'react';

import ConsoleLog from '../../core-app/components/shared/ConsoleLog';
import Feedback from '../Feedback';
import Modal from '../feedback/components/ModalContainer';
import { DEFAULT_MOODS_LIST as moods } from '../feedback/components/MoodSelector';

/* eslint-disable no-console */

const data = {
  comment: 'Great work',
  scope: 'bug',
  context: 'test-page',
  score: '10',
};

const Component = () => {
  return (
    <div style={{ margin: '20px', width: '400px' }}>
      <Modal show>
        <Feedback onSubmit={() => console.log('submitting :)')} moods={moods} />
      </Modal>
      <p />
      <ConsoleLog value={data} advancedView expanded />
    </div>
  );
};

export default <Component />;
