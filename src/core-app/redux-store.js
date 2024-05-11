/**
 *
 * @description
 * Initializes the `redux store`.  If building a development and production
 * version, be sure only to import what is required conditionally on the
 * environment setting.
 * [see reference](https://redux.js.org/api/applymiddleware)
 *
 * Other concepts:
 * * middleware
 * * enhancers; use `compose` to combine multiple
 *
 * ### Middleware
 * Wraps dispatch with additional capacity such as dealing with asynch.
 *
 * ### Enhancers
 * Are more powerful than middleware.  Examples include
 * * applyMiddleware
 * * redux-devtools
 *
 * ### redux-devtools-extension
 * * @redux-devtools/extension
 *
 * @module configuredStore
 *
 */
/*
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
*/
import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from '@redux-devtools/extension'; // dev only
import { createStore, applyMiddleware } from 'redux';

// persist state
// import localforage from 'localforage';
import createSagaMiddleware from 'redux-saga';

// sagas
import rootSaga from './initSagas';

// the appReducer (a combination of reducers)
// uses an enhancer to load project state
import appReducers from './combinedReducer';

// core
import actionSplitterMiddleware from './ducks/middleware/core/action-splitter.middleware';
import actionFilterMiddleware from './ducks/middleware/core/action-filter.middleware';
import thunkMiddleware from './ducks/middleware/core/thunk.middleware';
import pendingRequestsMiddleware from './ducks/middleware/core/pending-requests.middleware';
import normalizeMiddleware from './ducks/middleware/core/normalize.middleware';
import notificationsMiddleware from './ducks/middleware/core/notifications.middleware';
import saveMiddleware from './ducks/middleware/core/save.middleware'; // end of cycle
// import initMiddleware from './ducks/middleware/core/init.middleware'; // start of cycle
// import loggerMiddleware from './ducks/middleware/core/logging.middleware';
// feature
import headerViewMiddleware from './ducks/middleware/feature/headerView.middleware';
import etlViewMiddleware from './ducks/middleware/feature/etlView.middleware';
import workbenchMiddleware from './ducks/middleware/feature/workbench.middleware';
import matrixMiddleware from './ducks/middleware/feature/matrix.middleware';

// the redux-persist configuration
// import { persistConfig } from './redux-persist-cfg';
import { options as devToolOptions } from './redux-tools-cfg';

/* eslint-disable no-console */

const APP_VERSION = process.env.REACT_APP_VERSION;

/**
 * See programming with Actions
 *
 * feature and core middleware
 *
 * feature commands ("talks to") core (which generates events); so, have
 * the feature middleware come before the core middleware.
 *
 */
const featureMiddleware = [
  headerViewMiddleware,
  etlViewMiddleware,
  workbenchMiddleware,
  matrixMiddleware,
];
const coreMiddleware = [
  actionSplitterMiddleware, // Array -> single action
  thunkMiddleware, // action:Function -> (dispatch(action))
  actionFilterMiddleware, // sequesters bad actions
  pendingRequestsMiddleware, // sequence dependent
  normalizeMiddleware, // api data -> normalized data
  notificationsMiddleware,
  // loggerMiddleware,
];

// -----------------------------------------------------------------------------
// Production
//
const configureStoreProd = (preloadedState) => {
  console.info(`Loading the Prod Version (v${APP_VERSION}) of the store`);

  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [
    ...featureMiddleware,
    ...coreMiddleware, // processing before document
    sagaMiddleware,
    saveMiddleware, // ⚠️  must be last in the sequence
  ];

  console.assert(
    typeof appReducers === 'function',
    `appReducers: ${typeof appReducers}`,
  );

  // const persistedReducer = persistReducer(persistConfig, appReducers);

  const store = configureStore({
    reducer: appReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
        immutableCheck: false,
      }).prepend(middlewares),
    preloadedState,
  });

  // register as a listener
  // const persistor = persistStore(store);

  // fire-up sagas,
  sagaMiddleware.run(rootSaga);

  return { store /* persistor */ };
};

// -----------------------------------------------------------------------------
// Development
//
const configureStoreDev2 = (preloadedState) => {
  console.info(`Loading the Dev Version (v${APP_VERSION}) of the store`);

  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [
    ...featureMiddleware, //
    ...coreMiddleware, // final processing before document
    sagaMiddleware,
    saveMiddleware, // ⚠️  must be last in the sequence
  ];

  console.assert(
    typeof appReducers === 'function',
    `appReducers: ${typeof appReducers}`,
  );

  const store = createStore(
    appReducers,
    preloadedState,
    composeWithDevTools(devToolOptions)(applyMiddleware(...middlewares)),
  );

  // add loging actions
  // store.dispatch = addActionLogging(store);

  // fire-up sagas,
  sagaMiddleware.run(rootSaga);

  // 👍 enable access to the store from window
  window.coreAppStore = store;

  return { store /* persistor */ };
};

// fn (projectId) => (initialState) => {..}
export const storeWithoutState =
  process.env.REACT_APP_ENV === 'production' ? configureStoreProd : configureStoreDev2;

// export { initStore };

// END
