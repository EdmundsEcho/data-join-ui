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
// import { createStore, applyMiddleware, compose } from 'redux';
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

// actions to sanitize by the redux devTools extension
//
import { ADD_HEADER_VIEW } from './ducks/actions/headerView.actions';
import { SET_TREE } from './ducks/actions/workbench.actions';
// import { SET_MATRIX } from './ducks/actions/matrix.actions';
import { POLLING_RESOLVED } from './ducks/actions/api.actions';
import { REMOVE as REMOVE_PENDING_REQUEST } from './ducks/actions/pendingRequests.actions';

/* eslint-disable no-console */
const sagaMiddleware = createSagaMiddleware();

const REDUCER_DIR = './combineReducers';

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
// 🚧 Reduce the memory and CPU usage
//    Redux debugging
// -----------------------------------------------------------------------------
const scrubbDown = (action) => ({
  ...action,
  event: {
    ...action.event,
    request: { ...action.event.request, data: '<<LONG_BLOB>>' },
  },
});
const devToolsConfiguration = {
  actionSanitizer: (action) => {
    switch (true) {
      // case action.type.includes('persist/REHYDRATE'):

      case action.type.includes(SET_TREE):
        // case action.type.includes(SET_MATRIX):
        return { ...action, payload: '<<LONG_BLOB>>' };

      case action.type.includes(POLLING_RESOLVED):
      case action.type.includes(REMOVE_PENDING_REQUEST):
        return scrubbDown(action);

      case action.type.includes(ADD_HEADER_VIEW):
        return {
          ...action,
          payload: { ...action.payload, fields: '<<LONG_BLOB>>' },
        };

      default:
        return action;
    }
  },
  stateSanitizer: (state) =>
    state.workbench?.matrix
      ? { ...state, workbench: { ...state.workbench, matrix: '<<LONG_BLOB>>' } }
      : state,

  traceLimit: 20,
  trace: true,
};

// -----------------------------------------------------------------------------
// Production
//
const configureStoreProd = (projectId, initialState) => {
  console.info(
    `Loading the Prod Version (v2.5) of the store for project: ${projectId}`,
  );

  const middlewares = [
    initMiddleware(projectId), // first
    ...featureMiddleware(projectId), //
    ...coreMiddleware, // final processing before document
    sagaMiddleware, // schedule feature reports
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
    preloadedState: initialState,
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
const configureStoreDev2 = (projectId, initialState) => {
  console.info(`Loading the Dev Version (v2.5) of the store: ${projectId}`);

  const middlewares = [
    initMiddleware(projectId), // first
    ...featureMiddleware(projectId), //
    ...coreMiddleware, // final processing before document
    sagaMiddleware, // schedule feature reports
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
        serializableCheck: {
          ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
        immutableCheck: true,
      }).prepend(middlewares),
    preloadedState: initialState,
    devTools: devToolsConfiguration,
  });

  // register as a listener
  const persistor = persistStore(store);

  // fire-up sagas,
  sagaMiddleware.run(rootSaga);

  return { store, persistor };
};

// ⬜ Merge shared codebase
const configuredStore =
  process.env.REACT_APP_ENV === 'production'
    ? configureStoreProd
    : configureStoreDev2;

export default configuredStore;

// END
