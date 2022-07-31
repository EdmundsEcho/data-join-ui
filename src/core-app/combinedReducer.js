// src/combinedReducer.js

/**
 *
 * Reads in all of the reducers found in the index file of
 * the `ducks` directory. Returns a single reducer.
 *
 * @module reducers/combinedReducer
 */
import { combineReducers } from 'redux'
import * as reducers from './ducks'

export default combineReducers(reducers)
