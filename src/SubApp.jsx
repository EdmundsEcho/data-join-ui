/**
 * Create a separate Redux state that is isolated from the rest
 * of the application.
 *
 * Features: The component will initialize and isolate the app that uses redux.
 *
 * ✅ uses URL to retrieve project_id (not props)
 *
 * ✅ provide the child the Provider context (redux store)
 *
 * ✅ A new store is fetched whenever the project_id changes
 *
 * ✅ encapsulates logic to ensure access to a store
 *    👉 newStore when savedStore does not exist
 *
 * ✅ isolate the state of the core-app from the rest of the CRA
 *
 * ✅ set the core-app as child to SubApp
 *    👉 <SubApp>{child}</SubApp> where child is the "core-app"
 *
 */
import React, { useEffect, useState, useCallback } from 'react';
import { PropTypes } from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useParams, useNavigate } from 'react-router-dom';

import { useFetchApi } from './hooks/use-fetch-api';
import {
  useStatus as useCacheStatus,
  StatusProvider as CacheStatusProvider,
} from './hooks/use-status-provider';
import { fetchStore as fetchFn } from './services/dashboard.api';
import ErrorPage from './pages/ErrorPage';
import { seedProjectState } from './core-app/ducks/rootSelectors';

// Subapp related
// import loadStore from './core-app/store'
import loadStore from './core-app/configuredStore';

// -----------------------------------------------------------------------------
const DEBUG = false && process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const SubApp = (props) => {
  // project_id is required
  // 💫 causes re-render when changed
  const { projectId } = useParams();

  const { enqueueSnackbar, children } = props;
  //
  // 🚧 tmp until figure out other non 401 errors
  const navigate = useNavigate();

  const {
    status: cacheStatus,
    isStatusEmpty: isCacheStatusEmpty,
    isStatusStale: isCacheStatusStale,
    // isStatusLoaded,
    setStatusLoaded,
  } = useCacheStatus();

  const [loadedProjectId, setLoadedProjectId] = useState(() => undefined);

  const reloadingProject = useCallback(
    () => loadedProjectId === projectId,
    [loadedProjectId, projectId],
  );

  //
  // 📖 data using the fetchApi
  // 💫 🛈
  //
  const {
    fetch,
    cache: initialStore,
    error,
    status: fetchStatus,
    STATUS: FETCH_STATUS,
    reset: resetFetchApi,
  } = useFetchApi({
    fetchFn,
    // 🔖 response includes meta store data:
    // help validate store and/or determine which normalizing function
    // to use (help with managing store versions)
    //
    // The SubApp only needs the project_id to proceed in the event
    // the project does not yet already exist.
    //
    // 🔑 For new projects: minimum store value with project_id, with flag to
    //    save the store.
    //
    normalizer: ({ project_id: storeId, store: maybeStore }) => {
      console.assert(
        storeId === projectId,
        'The store id does not align with the projectId',
      );
      return maybeStore === null ? seedProjectState(projectId) : maybeStore;
    },
    callback: () => {
      console.debug(`****************SubApp updating local fetch status`);
      setStatusLoaded();
      setLoadedProjectId(projectId);
    },
    enqueueSnackbar,
    DEBUG,
  });

  //
  // 💢 Side-effect: loads data into cache
  //    (the state of which determines what gets rendered here)
  //
  //    (1) Only fetch when existing project exists on the server
  //    Only learn about the status when changing project_id
  //    When project_id does not change, treat as (1)
  //
  //    Decides when to call fetch
  //    1. When uninitialized: cached status === empty
  //    2. When the project_id has changed (happens "for free" with this effect)
  //
  useEffect(() => {
    try {
      // guards include implied
      // && project_id !== previous project_id
      switch (true) {
        case !reloadingProject():
          resetFetchApi();
          fetch(projectId);
          console.log(`FETCHING from the server b/c switching projects`);
          break;

        // ⬜ This scenario seems dubious; unsure of value
        case isCacheStatusEmpty():
          fetch(projectId);
          console.log(`FETCHING from the server b/c cache is empty`);
          break;
        // when stale, nothing to fetch, nor update store
        // SO HOW "not render" at this point!! because Provider wants
        // something. THIS IS AL WRONg.
        case reloadingProject() && isCacheStatusStale():
          resetFetchApi();
          fetch(projectId);
          console.log(`FETCHING from the server b/c cache is stale`);
          break;

        default: // callback sets the cache status to loaded
      }
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`);
      console.dir(e);
      navigate('login');
    } finally {
      // anything?
    }

    // ⬜ return something to close out the effect
    // return () => setIsMounted(false)
    //
  }, [projectId, isCacheStatusStale, isCacheStatusEmpty, reloadingProject]); // eslint-disable-line react-hooks/exhaustive-deps

  // rendering guard helper
  const showLoading =
    [FETCH_STATUS.IDLE, FETCH_STATUS.PENDING].includes(fetchStatus) ||
    projectId === 'undefined';

  if (DEBUG) {
    // report on state of the component
    console.debug(`%c📋 SubApp state summary:`, 'color:orange');
    console.dir({
      projectInUrl: projectId,
      nowHostingProjectId: loadedProjectId,
      reloadingProject: reloadingProject(),
      cacheStatus,
      fetchStatus,
      storeNull: initialStore === null || initialStore === undefined,
      storeMinValue: Object.keys(initialStore || {}).length === 1,
      cachedStore: initialStore,
      storeLocation: 'Provider instantiated here',
    });

    const color =
      fetchStatus === FETCH_STATUS.RESOLVED ? 'color:green' : 'color:red';

    console.debug(
      `%cfetchStatus resolved?: ${fetchStatus === FETCH_STATUS.RESOLVED}`,
      color,
    );
  }

  Provider.displayName = 'TncAppStore';

  switch (true) {
    case showLoading:
      return <p>...loading</p>;

    case fetchStatus === FETCH_STATUS.RESOLVED: {
      // use the initialStore (aka initialState), to generate
      // the store and persistor used in the Provider
      const { store, persistor } = loadStore(initialStore);

      //
      // 💰 Provider
      //
      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      );
    }

    case fetchStatus === FETCH_STATUS.REJECTED:
      return (
        // 🚧 WIP parsing through error: first look at keys
        <ErrorPage
          message={error?.message ?? JSON.stringify(Object.keys(error || {}))}
        />
      );

    default:
      throw new Error('Unreachable SubApp fetch state');
  }
};

SubApp.propTypes = {
  enqueueSnackbar: PropTypes.func,
  children: PropTypes.node.isRequired,
};
SubApp.defaultProps = {
  enqueueSnackbar: undefined,
};

/* eslint-disable react/jsx-props-no-spreading */
const WithCacheStatus = (props) => (
  <CacheStatusProvider>
    <SubApp {...props} />
  </CacheStatusProvider>
);
/* eslint-enable react/jsx-props-no-spreading */
export default WithCacheStatus;
