import React, { useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Form } from './components/Form';
import { ModalContainer } from './components/ModalContainer';
import { MoodSelector } from './components/MoodSelector';
import { MOODS_DATA } from './moods';

export const DEFAULT_MOODS_LIST = MOODS_DATA.msFluent;

const Feedback = ({ onSubmit, moods, showForm }) => {
  const [mood, setMood] = React.useState();
  const [comment, setComment] = React.useState('');

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
    <div className='feedback container' onSubmit={handleSubmit}>
      <MoodSelector moods={moods} handleChange={handleMoodChange} />
      <Form showForm={!!mood || showForm} onChange={(v) => setComment(v)} />
    </div>
  );
};

Feedback.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  moods: PropTypes.arrayOf(PropTypes.shape({})),
  showForm: PropTypes.bool,
};

Feedback.defaultProps = {
  showForm: true,
  moods: DEFAULT_MOODS_LIST,
};

export { Feedback, ModalContainer };
