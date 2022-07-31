/**
 *
 * A wrapper to define an error boundary.  Errors in rendering the
 * children will be caught here.
 *
 * @component
 *
 * @module components/ErrorBoundary
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

import ErrorIcon from '@mui/icons-material/ErrorOutline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { ErrorBoundary as EB } from 'react-error-boundary';

export { withErrorBoundary } from 'react-error-boundary';

/* eslint-disable no-console */

/**
 * ErrorBoundary
 * Wraps the react-error-boundary component with a capacity to
 * display a custom message and a callback to reset the state of
 * the component.
 *
 * @component
 *
 * @category Components
 *
 */
function ErrorBoundary({ message, resetState, children }) {
  return (
    <EB
      FallbackComponent={
        <ErrorFallback resetState={resetState} message={message} />
      }
      onError={(error, componentStack) => {
        console.error(error, componentStack);
      }}
    >
      {children}
    </EB>
  );
}

ErrorBoundary.propTypes = {
  message: PropTypes.string,
  resetState: PropTypes.func,
  children: PropTypes.node.isRequired,
};
ErrorBoundary.defaultProps = {
  message: '',
  resetState: undefined,
};

function ErrorFallback({ message, resetState }) {
  return (
    <Container>
      <Typography component='p'>
        <ErrorIcon
          color='error'
          style={{ marginRight: '7px', marginBottom: '-5px' }}
        />
        Something went wrong.
      </Typography>
      <Typography component='span'>{message}</Typography>
      {resetState && (
        <button type='button' onClick={resetState}>
          Try again
        </button>
      )}
    </Container>
  );
}

ErrorFallback.propTypes = {
  message: PropTypes.string,
  resetState: PropTypes.func,
};
ErrorFallback.defaultProps = {
  message: `No error message`,
  resetState: undefined,
};
export default ErrorBoundary;
