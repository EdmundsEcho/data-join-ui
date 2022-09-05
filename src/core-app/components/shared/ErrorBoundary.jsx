import React from 'react';
import { PropTypes } from 'prop-types';

import Button from '@mui/material/Button';

import { ErrorBoundary as Inner } from 'react-error-boundary';

const ErrorBoundary = ({ children, ...props }) => {
  return <Inner {...props}>{children}</Inner>;
};
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

const Fallback = ({ error, resetErrorBoundary /* componentStack */ }) => {
  return (
    <div>
      <h1>An error occurred: {error.message}</h1>
      <Button type='button' onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
};
Fallback.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }).isRequired,
  componentStack: PropTypes.shape({}),
  resetErrorBoundary: PropTypes.func,
};
Fallback.defaultProps = {
  componentStack: undefined,
  resetErrorBoundary: undefined,
};

export default ErrorBoundary;
export { Fallback, ErrorBoundary };
