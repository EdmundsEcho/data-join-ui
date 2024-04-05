import React from 'react';
import { PropTypes } from 'prop-types';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { ErrorBoundary as Inner } from 'react-error-boundary';

const ErrorBoundary = ({ children, FallbackComponent, ...props }) => {
  return (
    <Inner FallbackComponent={FallbackComponent} {...props}>
      {children}
    </Inner>
  );
};
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  FallbackComponent: PropTypes.func,
};
ErrorBoundary.defaultProps = {
  FallbackComponent: Fallback,
};

function Fallback({ error, componentStack, resetErrorBoundary }) {
  return (
    <Container className='Luci-error-boundary'>
      <h2>An error occurred</h2>
      <Typography>{error.message}</Typography>
      <Divider />
      <details>
        <div className='error'>
          <Typography>{error && error.toString()}</Typography>
        </div>
        <Divider />
        <div className='componentStack'>
          <Typography>{componentStack}</Typography>
        </div>
      </details>
      <Divider />
      <Button variant='contained' type='button' onClick={resetErrorBoundary}>
        Try again
      </Button>
    </Container>
  );
}
Fallback.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }).isRequired,
  componentStack: PropTypes.string,
  resetErrorBoundary: PropTypes.func,
};
Fallback.defaultProps = {
  componentStack: undefined,
  resetErrorBoundary: undefined,
};

export default ErrorBoundary;
export { Fallback, ErrorBoundary };
