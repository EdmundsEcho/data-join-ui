import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@mui/styles/makeStyles';

import IconButton from '@mui/material/IconButton';
import ErrorIconFilled from '@mui/icons-material/Error';

const useStyles = makeStyles((theme) => ({
  buttonAnimate: (props = {}) => ({
    width: '30px',
    height: '30px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(0),
    marginLeft: theme.spacing(3),
    color: theme.palette.error.main,
    ...props,
  }),
  buttonStatic: (props = {}) => ({
    width: '25px',
    height: '25px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(0),
    marginLeft: theme.spacing(3),
    color: theme.palette.error.main,
    ...props,
  }),
  hidden: {
    display: 'none',
  },
}));

/**
 *
 * @component
 *
 * toggle view if used in combination with another component.
 *
 */
const ErrorFlag = ({ show, animate, style = {}, onClick = () => {} }) => {
  const classes = useStyles(style);

  return animate ? (
    <IconButton
      className={show ? classes.buttonAnimate : classes.hidden}
      onClick={onClick}
      size='large'
    >
      <ErrorIconFilled />
    </IconButton>
  ) : (
    <ErrorIconFilled className={show ? classes.buttonStatic : classes.hidden} />
  );
};

ErrorFlag.propTypes = {
  show: PropTypes.bool,
  animate: PropTypes.bool,
  style: PropTypes.shape({}),
  onClick: PropTypes.func,
};
ErrorFlag.defaultProps = {
  show: true,
  animate: true,
  style: {},
  onClick: () => {},
};

export default ErrorFlag;
