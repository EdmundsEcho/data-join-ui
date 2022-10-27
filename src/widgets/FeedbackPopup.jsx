import React from 'react';
import { PropTypes } from 'prop-types';

import clsx from 'clsx';

import SentIcon from '@mui/icons-material/MarkEmailRead';

import Feedback from './Feedback';
import Modal from './feedback/components/ModalContainer';
import { DEFAULT_MOODS_LIST as moods } from './feedback/components/MoodSelector';

const FeedbackPopup = ({ horizontal, vertical, children }) => {
  // ensure there is only one child (throws error otherwise)
  React.Children.only(children);

  const animationClass = `${horizontal}-${vertical}`;

  // idle, enter, exit
  const [transition, setTransition] = React.useState(() => 'idle');
  // idle, submit
  const [submitted, setSubmitted] = React.useState(() => 'idle');

  const resetState = () => {
    setTransition(() => 'idle');
    setSubmitted(() => 'idle');
  };

  // used by the child component with an onClick prop
  const handleOpenFeedback = () => {
    setTransition(() => 'enter');
  };
  const handleCloseFeedback = () => {
    setTransition(() => 'exit');
    setTimeout(resetState, 300);
  };
  const handleSubmit = (/* formData, response */) => {
    setSubmitted(() => 'submit');
    setTimeout(handleCloseFeedback, 3000);
  };

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onClick: handleOpenFeedback,
        }),
      )}
      <div
        className={clsx(
          'feedback',
          'stage',
          'stage-root',
          animationClass,
          transition,
        )}>
        <div className='single-grid'>
          <div className='single-grid-child on-stage'>
            <Modal
              className={`actor feedback ${submitted}`}
              title='What are your thoughts?'
              onClose={handleCloseFeedback}
              show>
              <Feedback callback={handleSubmit} moods={moods} />
            </Modal>
            <button
              className={`actor thank-you ${submitted}`}
              type='button'
              onClick={handleCloseFeedback}>
              <div className='frame stack'>
                <h4 className='heading'>Thank you</h4>
                <SentIcon />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

FeedbackPopup.propTypes = {
  children: PropTypes.element.isRequired,
  horizontal: PropTypes.oneOf(['left', 'right']).isRequired,
  vertical: PropTypes.oneOf(['up', 'down']).isRequired,
};
export default FeedbackPopup;
