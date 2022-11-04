import React from 'react';
import { PropTypes } from 'prop-types';

export const Spinner = ({ size }) => {
  return (
    <div className='spinner-root'>
      <i className={`spinner spinner-lucivia ${size}`} />
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['spinner-lg', 'spinner-sm', 'default']),
};
Spinner.defaultProps = {
  size: 'spinner-lg',
};

export default Spinner;
