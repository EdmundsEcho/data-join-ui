// src/combinedReducer.js

/**
 *
 * Reads in all of the reducers found in the index file of
 * the `ducks` directory. Returns a single reducer.
 *
 * The ability to reset the store is not yet utilized.
 * See save-middleware for current approach.
 *
 *
 * @module reducers/combinedReducer
 */
import { combineReducers } from 'redux';

import * as reducers from './ducks';
import { purgePersistedState } from './redux-persist-cfg';

// Add a root reducer to enable a full reset
// see https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/35641992#35641992
//
// 1️⃣  combine the app reducers
//
const appReducer = combineReducers(reducers);
//
// 2️⃣  add a root reducer
//
const rootReducer = (state, action) => {
  if (action.type === 'CLOSE_PROJECT') {
    purgePersistedState();
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
