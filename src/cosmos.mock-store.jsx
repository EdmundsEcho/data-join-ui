import React from 'react';
import { ReduxMock as ReduxMockInternal } from 'react-cosmos-redux';
import { createStore } from 'redux';
import PropTypes from 'prop-types';

import combinedReducer from './core-app/combinedReducer';
import defaultStore from './core-app/datasets/store_v4.json';

/**
 * ReduxMock
 * Creates a mock store using defaultStore
 */
const ReduxMock = ({ children, initialState }) => (
  <ReduxMockInternal
    configureStore={(state) => createStore(combinedReducer, state)}
    initialState={initialState}>
    {children}
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
