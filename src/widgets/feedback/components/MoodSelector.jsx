import React from 'react';
import { PropTypes } from 'prop-types';

import { MOODS_DATA } from '../moods';

export const DEFAULT_MOODS_LIST = MOODS_DATA.msFluent;

const MoodSelector = ({ moods, handleChange }) => {
  const onChange = (e) => {
    const mood = moods.find((m) => m.id === e.target.value);
    if (!mood) {
      throw new Error(`Could not find mood with id ${e.target.value}`);
    }
    handleChange(mood);
  };

  return (
    <div className='feedback mood-container'>
      {moods.map(({ id, src, label }) => (
        <label className='mood-label' htmlFor={id} key={id}>
          <input
            type='radio'
            name='mood-selector'
            id={id}
            onChange={onChange}
            value={id}
          />
          <div className='mood-tooltip'>{label}</div>
          <div className='mood-icon'>
            <img src={src} alt={label} />
          </div>
          <div className='glowing-background' />
        </label>
      ))}
    </div>
  );
};

MoodSelector.propTypes = {
  moods: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default MoodSelector;
