import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { isUiLoading } from '../../ducks/rootSelectors';

import '../../assets/splash.css';

const LoadingSplash = ({
  title,
  message: messageProp,
  cancel,
  turnOffMessaging,
}) => {
  const { message } = useSelector(isUiLoading);
  return (
    <div className='Luci-splash gears'>
      <div className='center'>
        <div className='cogs' />
        <div>
          <Typography variant='h5'>{title}</Typography>
        </div>
        <div>
          <Typography variant='body1'>{messageProp}</Typography>
          {!turnOffMessaging && message && (
            <Typography variant='body1'>{message}</Typography>
          )}
        </div>
        {cancel && (
          <Button
            className='cancel button'
            variant='contained'
            type='button'
            onClick={cancel}>
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
  turnOffMessaging: PropTypes.bool,
};
LoadingSplash.defaultProps = {
  title: 'Processing',
  message: 'This may take several moments to complete',
  cancel: undefined,
  turnOffMessaging: false,
};

export default LoadingSplash;
