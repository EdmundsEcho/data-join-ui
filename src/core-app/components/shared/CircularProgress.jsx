import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

// props size, thickness
const CircularProgressWithLabel = ({ value, variant, ...props }) => (
  <div className='Luci-Circular-Progress'>
    <CircularProgress variant='determinate' {...{ value, ...props }} />
    <div className='label'>
      <Typography variant={variant} component='div' color='text.secondary'>
        {`${Math.round(value)}%`}
      </Typography>
    </div>
  </div>
);
CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
  /**
   * Typography
   * @default 'caption'
   */
  variant: PropTypes.string,
};
CircularProgressWithLabel.defaultProps = {
  variant: 'caption',
};

export default CircularProgressWithLabel;
