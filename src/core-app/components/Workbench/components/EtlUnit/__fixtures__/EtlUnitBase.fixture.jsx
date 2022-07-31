import React from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import Typography from '@mui/material/Typography';

import EtlUnitBase from '../EtlUnitBase';

import ReduxMock from '../../../../../cosmos.mock-store';
import initialState from '../../../../../datasets/store_v4.json';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}
const Components = () => {
  const ids = [5, 13, 20, 22, 23];

  return ids.map((id, idx) => {
    const context = id < 16 ? 'palette' : 'canvas';
    return (
      <div
        key={`EtlUnitBase-${id}-${idx}`}
        style={{ width: '300px', margin: '20px' }}
      >
        <ErrorBoundary
          key={`ErrorBoundary-${id}-${idx}`}
          FallbackComponent={ErrorFallback}
        >
          <EtlUnitBase nodeId={id} context={context} />
        </ErrorBoundary>
      </div>
    );
  });
};
const fixtures = (
  <ReduxMock initialState={initialState}>
    <div style={{ margin: '20px' }}>
      <Typography variant='body2'>
        Note: requires the graphql server be initialized with the correct data.
      </Typography>
      <Components />
    </div>
  </ReduxMock>
);

export default fixtures;
