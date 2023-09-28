import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import IconButton from '@mui/material/IconButton';
import ErrorIconFilled from '@mui/icons-material/Error';

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
