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
 * * install the extension in the browser
 * * configuration is manually performed per the documentation
 *   [see docs](https://github.com/zalmoxisus/redux-devtools-extension)
 *
 * @module configuredStore
 *
 */
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
import { configureStore } from '@reduxjs/toolkit'; // dev only

// persist state
// import localforage from 'localforage';
import createSagaMiddleware from 'redux-saga';

// sagas
import rootSaga from './initSagas';

// the appReducer (a combination of reducers)
import appReducers from './combinedReducer';

// the redux-persist configuration
import { persistConfig } from './redux-persist-cfg';

// core
import actionSplitterMiddleware from './ducks/middleware/core/action-splitter.middleware';
import actionFilterMiddleware from './ducks/middleware/core/action-filter.middleware';
import asyncMiddleware from './ducks/middleware/core/async.middleware';
import pendingRequestsMiddleware from './ducks/middleware/core/pending-requests.middleware';
import normalizeMiddleware from './ducks/middleware/core/normalize.middleware';
import notificationsMiddleware from './ducks/middleware/core/notifications.middleware';
import saveMiddleware from './ducks/middleware/core/save.middleware'; // end of cycle
import initMiddleware from './ducks/middleware/core/init.middleware'; // start of cycle
// import loggerMiddleware from './ducks/middleware/core/logging.middleware';
// feature
import headerViewMiddleware from './ducks/middleware/feature/headerView.middleware';
import etlViewMiddleware from './ducks/middleware/feature/etlView.middleware';
import workbenchMiddleware from './ducks/middleware/feature/workbench.middleware';
import matrixMiddleware from './ducks/middleware/feature/matrix.middleware';

import { devToolsConfiguration } from './dev-tools-cfg';

/* eslint-disable no-console */
const sagaMiddlewareWithPid = (projectId) =>
  createSagaMiddleware({ context: { projectId } });

/**
 * See programming with Actions
 *
 * feature and core middleware
 *
 * feature commands ("talks to") core (which generates events); so, have
 * the feature middleware come before the core middleware.
 *
 */
const featureMiddleware = (projectId) => [
  headerViewMiddleware(projectId),
  etlViewMiddleware,
  workbenchMiddleware(projectId),
  matrixMiddleware,
];
const coreMiddleware = [
  actionSplitterMiddleware, // Array -> single action
  asyncMiddleware, // action:Function -> (dispatch(action))
  actionFilterMiddleware, // sequesters bad actions
  pendingRequestsMiddleware, // sequence dependent
  normalizeMiddleware, // api data -> normalized data
  notificationsMiddleware,
  // loggerMiddleware,
];

// -----------------------------------------------------------------------------
// Production
//
const configureStoreProd = (projectId) => (preloadedState) => {
  console.info(
    `Loading the Prod Version (v2.5) of the store for project: ${projectId}`,
  );

  const sagaMiddleware = sagaMiddlewareWithPid(projectId);

  const middlewares = [
    initMiddleware(projectId), // first
    ...featureMiddleware(projectId), //
    ...coreMiddleware, // processing before document
    sagaMiddleware,
    saveMiddleware(projectId), // ⚠️  must be last in the sequence
  ];

  console.assert(
    typeof appReducers === 'function',
    `appReducers: ${typeof appReducers}`,
  );

  const persistedReducer = persistReducer(persistConfig, appReducers);

  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
        immutableCheck: false,
      }).prepend(middlewares),
    preloadedState,
    devTools: devToolsConfiguration,
  });

  // register as a listener
  const persistor = persistStore(store);

  // fire-up sagas,
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
};

// -----------------------------------------------------------------------------
// Development
//
const configureStoreDev2 = (projectId) => (preloadedState) => {
  console.info(`Loading the Dev Version (v2.6) of the store: ${projectId}`);

  const sagaMiddleware = sagaMiddlewareWithPid(projectId);

  const middlewares = [
    initMiddleware(projectId), // first
    ...featureMiddleware(projectId), //
    ...coreMiddleware, // final processing before document
    sagaMiddleware,
    saveMiddleware(projectId), // ⚠️  must be last in the sequence
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
        serializableCheck: {
          ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
        immutableCheck: false,
      }).prepend(middlewares),
    preloadedState,
    devTools: devToolsConfiguration,
  });

  // register as a listener
  // const persistor = persistStore(store);

  // fire-up sagas,
  sagaMiddleware.run(rootSaga);

  return { store };
};

// fn (projectId) => (initialState) => {..}
export const initStore =
  process.env.REACT_APP_ENV === 'production'
    ? configureStoreProd
    : configureStoreDev2;

// export { initStore };

// END
