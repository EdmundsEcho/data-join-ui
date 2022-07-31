import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import cogs from '../assets/cogs.gif';

const useStyles = makeStyles({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
    background: 'rgba(0,0,0, 0.2)',
    zIndex: 1000,
  },
  center: {
    background: '#FFF',
    borderRadius: 10,
    boxShadow: `
      0px 1px 3px 0px rgba(0,0,0,0.2),
      0px 1px 1px 0px rgba(0,0,0,0.14),
      0px 2px 1px -1px rgba(0,0,0,0.12)`,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    height: 200,
    width: 300,
  },
  cogs: {
    background: `url(${cogs}) no-repeat`,
    backgroundClip: 'padding-box',
    backgroundPosition: '-175px -120px',
    height: 70,
    width: 60,
    margin: '20px auto 5px',
  },
});

const LoadingSplash = (props) => {
  const classes = useStyles();
  const {
    title = 'Processing',
    message = 'This may take several moments to complete',
  } = props;

  return (
    <div className={classes.container}>
      <div className={classes.center}>
        <div className={classes.cogs} />
        <div>
          <Typography variant='h5'>{title}</Typography>
        </div>
        <div>
          <Typography variant='body1'>{message}</Typography>
        </div>
      </div>
    </div>
  );
};

LoadingSplash.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
};
LoadingSplash.defaultProps = {
  title: 'Missing splash title',
  message: 'Missing splash message',
};

export default LoadingSplash;
