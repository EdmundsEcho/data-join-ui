import React from 'react';
import { PropTypes } from 'prop-types';
import { ErrorBoundary as Inner } from 'react-error-boundary';

/* See core-app ErrorBoundary */
export const ErrorBoundary = ({ children }) => {
  return <Inner>{children}</Inner>;
};
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export const Fallback = ({
  error,
  resetErrorBoundary /* componentStack */,
}) => {
  return (
    <div>
      <h1>An error occurred: {error.message}</h1>
      <button type='button' onClick={resetErrorBoundary}>
        Try again
      </button>
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
