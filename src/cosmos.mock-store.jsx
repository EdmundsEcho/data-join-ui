/**
 * This does not work in the latest cosmos
 * Cosmos expects something different it seems.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';

Provider.displayName = 'MockReduxStore-Provider';

/**
 * ReduxMock
 * Creates a mock store using defaultStore
 */
const ReduxMock = ({ children, initialState }) => (
  <Provider store={initialState}>{children}</Provider>
);

ReduxMock.propTypes = {
  children: PropTypes.node.isRequired,
  initialState: PropTypes.shape({}),
};

ReduxMock.defaultProps = {
  initialState: undefined,
};

export default ReduxMock;

/* Usage:
export default (
  <MyReduxMock initialState={myMockedReduxState}>
    <MyConnectedComponent />
  </MyReduxMock>
);
*/
