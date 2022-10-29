import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import MoodSelector from './feedback/components/MoodSelector';
import Spinner from '../components/shared/Spinner';

import { useFetchApi, STATUS } from '../hooks/use-fetch-api';
import { sendFeedback } from '../services/dashboard.api';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// augment feedback content
const [contextEnv, scopeEnv] = process.env.REACT_APP_FEEDBACK_META.split(',');
const META = { context: contextEnv, scope: scopeEnv };

// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const validComment = (comment) => {
  if (typeof comment === 'undefined') {
    return false;
  }
  return comment.length <= 550 && comment.length > 10;
};

/**
 * User feedback; all input optional
 * context   string($character varying) from where sent in the app
 * feedback  string($character varying)
 * scope     string($character varying) feedback, bug, feature etc...
 * score     integer($smallint)         normalize to 10, higher is better
 */
const Feedback = ({ meta, callback, onSubmit: onSubmitProp, moods }) => {
  const { pathname } = useLocation();
  const [mood, setMood] = useState(() => undefined);
  const [comment, setComment] = useState(() => undefined);
  const [apiState, setApiState] = useState(() => 'idle');
  const onSubmit = onSubmitProp || sendFeedback;
  const validUserInput = mood && validComment(comment);

  const { scope } = meta;

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (mood) {
      const feedback = {
        score: mood.score,
        feedback: `${mood.id}: ${comment}`,
        context: pathname,
        scope,
      };
      if (DEBUG) {
        console.debug('Feedback: ', feedback);
      }
      setApiState('busy'); // display the spinner
      send(feedback);
    }
  };

  useEffect(() => {
    if (status === STATUS.RESOLVED) {
      callback();
      resetState();
      resetApi();
    }
  }, [callback, status, resetApi]);

  if (DEBUG) {
    console.debug('Feedback state ------------\n', {
      mood,
      comment,
      validUserInput,
      status,
    });
  }

  return apiState === 'idle' ? (
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
      <button
        className='button submit'
        type='submit'
        disabled={!validUserInput}>
        Submit
      </button>
    </form>
  ) : (
    <Spinner size='default' />
  );
};

const noop = () => {};

Feedback.propTypes = {
  onSubmit: PropTypes.func,
  callback: PropTypes.func,
  moods: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meta: PropTypes.shape({
    scope: PropTypes.string,
    context: PropTypes.string,
  }),
};
Feedback.defaultProps = {
  onSubmit: undefined,
  callback: noop,
  meta: META,
};

export default Feedback;
