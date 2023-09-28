import React from 'react';

import { useSelector } from 'react-redux';

import { ErrorBoundary } from 'react-error-boundary';
import ValueGridFileLevels from '../ValueGridFileLevels';

import { getSelected, selectHeaderView } from '../../../ducks/rootSelectors';

import ReduxMock from '../../../../cosmos.mock-store';
import initialState from '../../../datasets/store_v4.json';

import ConsoleLog from '../ConsoleLog';
import { PURPOSE_TYPES } from '../../../lib/sum-types';

/* eslint-disable react/prop-types */

const Fallback = ({ error /* , componentStack, resetErrorBoundary */ }) => {
  return (
    <div>
      <h1>An error occurred: {error.message}</h1>
    </div>
  );
};
/* eslint-disable no-shadow */
const Component = () => {
  const [inErrorState, toggleErrorState] = React.useState(() => false);

  const filename = useSelector((state) => getSelected(state)).find((filename) =>
    filename.includes('sava'),
  );

  const qualityField = useSelector((state) =>
    selectHeaderView(state, filename),
  ).fields.find(
    (field) =>
      field.purpose === PURPOSE_TYPES.QUALITY &&
      field.enabled &&
      field.nlevels > 100,
  );

  return (
    <div style={{ margin: '30px' }}>
      <ConsoleLog value={qualityField} />
      <ErrorBoundary
        onError={
          (/* error, componentStack */) => {
            toggleErrorState(true);
          }
        }
        FallbackComponent={Fallback}>
        {!inErrorState && (
          <ValueGridFileLevels getValue={(prop) => qualityField[prop]} />
        )}
      </ErrorBoundary>
    </div>
  );
};

const fixtures = (
  <ReduxMock initialState={initialState}>
    <Component />
  </ReduxMock>
);
export default fixtures;
