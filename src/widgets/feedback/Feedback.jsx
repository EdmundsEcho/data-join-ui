import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Fab from '@mui/material/Fab';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SentIcon from '@mui/icons-material/MarkEmailRead';

import MoodSelector, {
  DEFAULT_MOODS_LIST as defaultMoods,
} from './components/MoodSelector';
import Spinner from '../../components/shared/Spinner';
import Modal from './components/ModalContainer';

// 📬  📖
import { useFetchApi, STATUS } from '../../hooks/use-fetch-api';
import { sendFeedback } from '../../services/dashboard.api';

// -----------------------------------------------------------------------------
const DEBUG = process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// augment feedback content
const [contextEnv, scopeEnv] = process.env.REACT_APP_FEEDBACK_META.split(',');
const META = { context: contextEnv, scope: scopeEnv };
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
// -----------------------------------------------------------------------------

// local user-input validation
const validComment = (comment) => {
  if (typeof comment === 'undefined') {
    return false;
  }
  return comment.length <= 550 && comment.length > 10;
};

// -----------------------------------------------------------------------------
// Fab component
export const FeedbackFab = ({ color, className, onClick }) => {
  return (
    <Fab color={color} className={className} onClick={onClick}>
      <FeedbackIcon />
    </Fab>
  );
};
FeedbackFab.propTypes = {
  color: PropTypes.string,
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
FeedbackFab.defaultProps = {
  color: 'secondary',
};

// -----------------------------------------------------------------------------
// Thank You component
const ThankYou = ({ handleClose, apiState }) => (
  <button className={`actor thank-you ${apiState}`} type='button' onClick={handleClose}>
    <div className='stack'>
      <h4 className='heading'>Thank you</h4>
      <SentIcon />
    </div>
  </button>
);
ThankYou.propTypes = {
  handleClose: PropTypes.func.isRequired,
  apiState: PropTypes.string.isRequired,
};

// -----------------------------------------------------------------------------
// Thank You component
const MaybeModal = ({ withModal, title, onClose, children }) => {
  return withModal ? (
    <Modal className='feedback' title={title} onClose={onClose} show showHeader>
      {children}
    </Modal>
  ) : (
    <div className='feedback'>{children}</div>
  );
};
MaybeModal.propTypes = {
  withModal: PropTypes.bool.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
MaybeModal.defaultProps = {
  title: undefined,
};

/**
 * User feedback; all input optional
 * context   string($character varying) from where sent in the app
 * feedback  string($character varying)
 * scope     string($character varying) feedback, bug, feature etc...
 * score     integer($smallint)         normalize to 10, higher is better
 *
 * Feedback has two api driven states
 * 1. idle
 * 2. busy (sending feedback) ... waiting for the api to resolve
 *
 * There are two rendered versions of the component
 * 1. form
 * 2. spinner
 *
 * TODO: Consider how to display a Thank you message.
 *
 * It is up to the parent to setup a container that renders each without
 * having the layout jump around.
 *
 * See how SlidingPopup configures this component
 */
const Feedback = ({
  meta,
  onSubmit: onSubmitProp,
  onDone,
  moods,
  withModal,
  title,
}) => {
  const { pathname } = useLocation();
  const [mood, setMood] = useState(() => undefined);
  const [comment, setComment] = useState(() => undefined);
  const [apiState, setApiState] = useState(() => 'idle');
  const onSubmit = onSubmitProp || sendFeedback;
  const validUserInput = mood && validComment(comment);

  // process feedback
  const { scope } = meta;
  const tmp = pathname.split('/');
  const context = tmp[tmp.length - 1];

  const handleMoodChange = (m) => {
    setMood(m);
  };

  const resetState = () => {
    setMood(undefined);
    setComment(undefined);
    setApiState('idle');
  };

  // fetch
  const {
    execute: send,
    status,
    reset: resetApi,
  } = useFetchApi({
    asyncFn: onSubmit,
    blockAsyncWithEmptyParams: true,
    caller: 'Feedback: sendFeedback',
    equalityFnName: 'equal',
    immediate: false,
    DEBUG,
  });

  const handleShowThankYou = useCallback(() => {
    setApiState(() => 'finished'); // displays thank you
    const timeout1 = setTimeout(() => {
      onDone(); // set transition to exit (rerender)
    }, 3000);
    const timeout2 = setTimeout(() => {
      resetState(); // set state back to idle
    }, 4000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [onDone]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mood) {
      const feedback = {
        score: mood.score,
        feedback: `${mood.id}: ${comment}`,
        context,
        scope,
      };
      if (DEBUG) {
        console.debug('Feedback: ', feedback);
      }
      setApiState(() => 'busy'); // display the spinner
      send(feedback);
    }
  };

  useEffect(() => {
    if (status === STATUS.RESOLVED) {
      handleShowThankYou();
      resetApi();
    }
  }, [handleShowThankYou, status, resetApi]);

  if (DEBUG) {
    console.debug('Feedback state ------------\n', {
      mood,
      comment,
      validUserInput,
      status,
      apiState,
    });
  }

  switch (apiState) {
    case 'idle':
      return (
        <MaybeModal withModal={withModal} title={title} onClose={onDone}>
          <form className='feedback form stack' onSubmit={handleSubmit}>
            <MoodSelector moods={moods} handleChange={handleMoodChange} />
            <textarea
              className='text-area'
              onChange={(e) => {
                setComment(e.target.value);
              }}
              id='form-text'
              placeholder='Tell us your thoughts'
            />
            <button className='button submit' type='submit' disabled={!validUserInput}>
              Submit
            </button>
          </form>
        </MaybeModal>
      );
    case 'busy':
      return <Spinner size='default' />;

    case 'finished':
      return <ThankYou handleClose={onDone} apiState={apiState} />;

    default:
      throw new Error('Feedback: unknown apiState');
  }
};

Feedback.propTypes = {
  onSubmit: PropTypes.func,
  onDone: PropTypes.func.isRequired, // tell the parent to exit
  moods: PropTypes.arrayOf(PropTypes.shape({})),
  meta: PropTypes.shape({
    scope: PropTypes.string,
    context: PropTypes.string,
  }),
  withModal: PropTypes.bool,
  title: PropTypes.string,
};
Feedback.defaultProps = {
  onSubmit: undefined,
  meta: META,
  moods: defaultMoods,
  withModal: false,
  title: undefined,
};

export default Feedback;
