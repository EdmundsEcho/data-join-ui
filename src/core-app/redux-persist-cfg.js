/**
 *
 * Redux-persist configuration
 *
 * @module
 *
 */
import { purgeStoredState } from 'redux-persist';
import idbStorage from './services/local-storage';
/*
 * configuration for the persistor
  🔧
{
  key: string, // the key for the persist
  storage: Object, // the storage adapter, following the AsyncStorage api
  version?: number, // the state version as an integer (defaults to -1)
  blacklist?: Array<string>, // do not persist these keys
  whitelist?: Array<string>, // only persist these keys
  migrate?: (Object, number) => Promise<Object>,
  transforms?: Array<Transform>,
  throttle?: number, // ms to throttle state writes
  keyPrefix?: string, // will be prefixed to the storage key
  debug?: boolean, // true -> verbose logs
  stateReconciler?: false | StateReconciler, // false -> do not automatically reconcile state
  serialize?: boolean, // false -> do not call JSON.parse & stringify when setting & getting from storage
  writeFailHandler?: Function, // will be called if the storage engine fails during setItem()
}

  🔧
    Configure the devTools extension
    https://redux-toolkit.js.org/api/configureStore
*/

// Set redux-persist to use localforage
export const persistConfig = {
  key: 'root',
  storage: idbStorage,
  version: '0.3.5',
  throttle: 1000,
  serialize: false,
  deserialize: false,
  blacklist: ['workbench.matrix', '_persist'],
};

// -----------------------------------------------------------------------------
/**
 *
 * Utility to purge the stored state of the application. Does not change redux
 * but rather the user agent's local cached copy.
 *
 * @function
 */
export const purgePersistedState = () => purgeStoredState(persistConfig);
