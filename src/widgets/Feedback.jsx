import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import MoodSelector from './feedback/components/MoodSelector';
import Spinner from '../components/shared/Spinner';

import { sendFeedback } from '../services/dashboard.api';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
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
  const [mood, setMood] = useState(() => undefined);
  const [comment, setComment] = useState(() => undefined);
  const [apiState, setApiState] = useState(() => 'idle');
  const onSubmit = onSubmitProp || sendFeedback;
  const validUserInput = mood && validComment(comment);

  const { context, scope } = meta;

  const handleMoodChange = (m) => {
    setMood(m);
  };

  const resetState = () => {
    setMood(undefined);
    setComment(undefined);
    setApiState('idle');
  };

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
      setApiState('busy');
      const response = await onSubmit(feedback);
      callback(feedback, response);
      resetState();
    }
  };

  console.debug('Feedback state ------------\n', {
    mood,
    comment,
    validUserInput,
  });

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

const meta = {
  context: 'mock',
  scope: 'testing',
};

Feedback.propTypes = {
  callback: PropTypes.func,
  onSubmit: PropTypes.func,
  moods: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meta: PropTypes.shape({
    scope: PropTypes.string,
    context: PropTypes.string,
  }),
};
Feedback.defaultProps = {
  callback: noop,
  onSubmit: undefined,
  meta,
};

export default Feedback;
