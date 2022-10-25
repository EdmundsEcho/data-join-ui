import React from 'react';
import { PropTypes } from 'prop-types';
import clsx from 'clsx';

/**
 * Core form components. Used by Feedback.jsx.
 */
export const Form = ({ showForm, onChange }) => {
  return (
    <div className={clsx('feedback root', { show: showForm })}>
      <textarea
        className='text-area'
        onChange={(e) => {
          onChange(e.target.value);
        }}
        id='form-text'
        placeholder='Tell us your thoughts'
      />
      <button className='button submit' type='submit'>
        Submit
      </button>
    </div>
  );
};

Form.propTypes = {
  showForm: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};
Form.defaultProps = {
  showForm: false,
};
export default Form;
