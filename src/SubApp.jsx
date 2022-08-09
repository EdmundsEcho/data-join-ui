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
import React, { useCallback, useEffect, useRef } from 'react';
import { PropTypes } from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useParams } from 'react-router-dom';

import { withSnackbar } from 'notistack';

import { purgePersistedState } from './core-app/redux-persist-cfg';

import {
  useStatus as useCacheStatus,
  StatusProvider as CacheStatusProvider,
} from './hooks/use-status-provider';
import ErrorPage from './pages/ErrorPage';
import { DesignError } from './core-app/lib/LuciErrors';

// 📖 data
import { useFetchApi } from './hooks/use-fetch-api';
import { fetchStore as fetchFn } from './services/dashboard.api';
import { seedProjectState } from './core-app/ducks/rootSelectors';

// ⚙️  Redux
import loadStore from './core-app/configuredStore';
import { clearAgentCache } from './core-app/ducks/middleware/core/save-store.middleware';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const SubApp = (props) => {
  // 💫 causes re-render when changed
  const { projectId } = useParams();
  const { enqueueSnackbar, children } = props;

  // 🔖 does not trigger a re-render;
  // 1. set the projectId value when loaded
  // 2. use the value to determine when to fetch new data
  const loadedProjectRef = useRef(null);
  // redux cache status with "stale" flag
  const { isStale: isCacheStale, setToLoaded } = useCacheStatus();

  const reloadingProject = useCallback(
    () => loadedProjectRef.current === projectId,
    [projectId],
  );
  const newProject = () => !reloadingProject();

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
    // when status.resolved
    callback: (/* data */) => {
      setToLoaded();
      // loadedProjectRef.current = projectId;
      // purgePersistedState();
    },
    enqueueSnackbar,
    DEBUG,
  });

  //
  // 💢 Side-effect: loads data into cache
  //
  // 👍 Use guards to avoid re-fetching the data  when the cache
  //    already has the required Redux state.
  //
  useEffect(() => {
    /* eslint-disable no-fallthrough */
    try {
      switch (true) {
        case newProject():
          resetFetchApi();
          purgePersistedState();
          fetch(projectId);
          loadedProjectRef.current = projectId;
          console.log(`FETCHING from the server b/c switching projects`);
          break;
        case reloadingProject() && isCacheStale():
          resetFetchApi();
          purgePersistedState();
          fetch(projectId);
          console.log(`FETCHING from the server b/c redux state is stale`);
          break;

        default: // callback sets the cache status to loaded
      }
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`);
      console.dir(e);
      throw new DesignError(e);
    } finally {
      // anything?
    }

    return () => {
      loadedProjectRef.current = null;
      purgePersistedState();
    };
  }, [projectId, isCacheStale, reloadingProject]); // eslint-disable-line react-hooks/exhaustive-deps
  /* eslint-enable no-fallthrough */

  // ---------------------------------------------------------------------------
  // report on state of the component
  //
  if (DEBUG) {
    console.debug(`%c📋 SubApp state summary:`, 'color:orange');
    console.dir({
      projectInUrl: projectId,
      loadedProjectRef: loadedProjectRef.current,
      reloadingProject: reloadingProject(),
      fetchStatus,
      storeNull: initialStore === null,
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
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Render based on redux cache state
  //
  switch (fetchStatus) {
    case FETCH_STATUS.IDLE:
    case FETCH_STATUS.PENDING:
      return <p>...loading</p>;

    case FETCH_STATUS.RESOLVED: {
      //
      // 🎉 Redux Provider
      //
      // use the initialStore (aka initialState), to generate
      // the store and persistor used in the Provider
      //
      // 🔗 see Main to access rendered child
      //
      const { store, persistor } = loadStore(initialStore);
      Provider.displayName = 'TncReduxStore-Provider';

      return (
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        </Provider>
      );
    }

    case FETCH_STATUS.REJECTED:
      return (
        // 🚧 WIP
        <ErrorPage message={error?.message ?? JSON.stringify(error)} />
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

const SubAppWithSnack = withSnackbar(SubApp);

/* eslint-disable react/jsx-props-no-spreading */
const SubAppWithCacheStatus = (props) => (
  <CacheStatusProvider>
    <SubAppWithSnack {...props} />
  </CacheStatusProvider>
);
/* eslint-enable react/jsx-props-no-spreading */
export default SubAppWithCacheStatus;
