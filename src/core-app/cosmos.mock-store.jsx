import React from 'react';
import { ReduxMock as ReduxMockInternal } from 'react-cosmos-redux';
import { createStore } from 'redux';
import PropTypes from 'prop-types';
import ThemeProvider from './cosmos.theme-provider';

import combinedReducer from './combinedReducer';
import defaultStore from './datasets/store_v4.json';

/**
 * ReduxMock
 * Creates a mock store using defaultStore
 */
const ReduxMock = ({ children, initialState }) => (
  <ReduxMockInternal
    configureStore={(state) => createStore(combinedReducer, state)}
    initialState={initialState}
  >
    <ThemeProvider>{children}</ThemeProvider>
  </ReduxMockInternal>
);

ReduxMock.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({}),
};

ReduxMock.defaultProps = {
  initialState: defaultStore,
};

export default ReduxMock;

/* Usage:
export default (
  <MyReduxMock initialState={myMockedReduxState}>
    <MyConnectedComponent />
  </MyReduxMock>
);
*/
