import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(6),
    },
    width: '100%',
    height: '100%',
  },
}));

export default function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress color='secondary' />
    </div>
  );
}
