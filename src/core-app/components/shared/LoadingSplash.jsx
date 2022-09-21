import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '../../assets/splash.css';

const LoadingSplash = ({ title, message, cancel }) => {
  return (
    <div className='Luci-splash gears'>
      <div className='center'>
        <div className='cogs' />
        <div>
          <Typography variant='h5'>{title}</Typography>
        </div>
        <div>
          <Typography variant='body1'>{message}</Typography>
        </div>
        {cancel && (
          <Button variant='contained' type='button' onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

LoadingSplash.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  cancel: PropTypes.func,
};
LoadingSplash.defaultProps = {
  title: 'Processing',
  message: 'This may take several moments to complete',
  cancel: undefined,
};

export default LoadingSplash;
