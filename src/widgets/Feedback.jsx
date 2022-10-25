import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import Form from './feedback/components/Form';
import MoodSelector from './feedback/components/MoodSelector';

const Feedback = ({ onSubmit, showForm, moods }) => {
  const [mood, setMood] = useState(() => undefined);
  const [comment, setComment] = useState(() => undefined);

  const handleMoodChange = (m) => {
    setMood(m);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mood) {
      const value = moods.findIndex((m) => m.id === mood.id) + 1;
      const moodData = {
        value,
        total: moods.length,
        label: mood.label,
        id: mood.id,
      };
      onSubmit({
        moodData,
        comment,
      });
    }
  };

  return (
    <form className='feedback form' onSubmit={handleSubmit}>
      <MoodSelector moods={moods} handleChange={handleMoodChange} />
      <Form showForm={!!mood || showForm} onChange={(v) => setComment(v)} />
    </form>
  );
};

Feedback.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  moods: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  showForm: PropTypes.bool,
};
Feedback.defaultProps = {
  showForm: false,
};

export default Feedback;
