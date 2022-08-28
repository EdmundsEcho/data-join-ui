import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@mui/styles/makeStyles';

import IconButton from '@mui/material/IconButton';
import ErrorIconFilled from '@mui/icons-material/Error';

const useStyles = makeStyles((theme) => ({
  buttonAnimate: {
    width: '30px',
    height: '30px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(0),
    marginLeft: theme.spacing(3),
    color: theme.palette.error.main,
  },
  buttonStatic: {
    width: '25px',
    height: '25px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(0),
    marginLeft: theme.spacing(3),
    color: theme.palette.error.main,
  },
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
const ErrorFlag = ({ show, animate, onClick }) => {
  return animate ? (
    <IconButton
      className={clsx('Luci-button', 'error-flag', 'animated', {
        hidden: !show,
      })}
      onClick={onClick}
      size='large'>
      <ErrorIconFilled />
    </IconButton>
  ) : (
    <ErrorIconFilled
      className={clsx('Luci-button', 'error-flag', 'static', {
        hidden: !show,
      })}
    />
  );
};

ErrorFlag.propTypes = {
  show: PropTypes.bool,
  animate: PropTypes.bool,
  onClick: PropTypes.func,
};
ErrorFlag.defaultProps = {
  show: true,
  animate: true,
  onClick: () => {},
};

export default ErrorFlag;
