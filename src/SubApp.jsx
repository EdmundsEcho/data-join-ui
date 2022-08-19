/**
 *
 * 🎉 Gateway to the core-app.
 *
 * 🔑 uses the url paramater to initialize the middleware for a given
 *    project.
 *
 * Create a separate Redux state that is isolated from the rest
 * of the application. The `<Provider>` is instantiated here.
 * 👉 scenario one: server return null for the store -> load with a seeded store
 * 👉 scenario two: server returns a previously saved store -> load existing
 *
 * 🔖 Depends on the store already instantiated and available to fetch from the
 *    backend (by definition of having the project_id in the url; something
 *    that is set-up by the projects context and programatically setting the url).
 *
 * Features: The component will initialize and isolate the app that uses redux.
 *
 * See init.middleware.js
 *
 * ✅ uses URL to retrieve project_id (not props)
 *
 * ✅ provide the child the Provider context (redux store)
 *
 * ✅ New middleware and store is fetched whenever the project_id changes
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
import React, { useEffect, useRef } from 'react';
import { PropTypes } from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useParams } from 'react-router-dom';

import { withSnackbar } from 'notistack';

import {
  // useStatus as useCacheStatus,
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

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

const SubApp = (props) => {
  // used to initialize middleware
  const { projectId } = useParams();
  // used to track when the project id has changed
  const loadedProjectRef = useRef(null);

  const { enqueueSnackbar, children } = props;
  // const { isStale: isCacheStale, setToLoaded } = useCacheStatus();

  //
  // 📖 data using the fetchApi
  // 💫 🛈
  //
  const {
    fetch: fetchStoredRedux,
    cache: initialStore,
    error,
    status: fetchStatus,
    STATUS: FETCH_STATUS,
    // reset: resetFetchReduxStore,
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
    //             v from server
    normalizer: ({ project_id: savedProjectId, store: maybeStore }) => {
      console.assert(
        savedProjectId === projectId,
        'The store id does not align with the projectId',
      );
      // null => newly created project
      return maybeStore === null ? seedProjectState(projectId) : maybeStore;
    },
    // when status.resolved
    callback: (/* data */) => {
      loadedProjectRef.current = projectId;
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
    try {
      if (typeof loadedProjectRef !== 'undefined') {
        fetchStoredRedux(projectId);
        console.log(`FETCHING from the server b/c loading a new project`);
      }
    } catch (e) {
      console.error(`🦀 what is this error; how treat? (display on page)`);
      console.dir(e);
      throw new DesignError(e);
    } finally {
      // anything?
    }

    return () => {
      loadedProjectRef.current = undefined;
    };
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // report on state of the component
  //
  if (DEBUG) {
    console.debug('%c----------------------------------------', 'color:orange');
    console.debug(`%c📋 SubApp loaded state summary:`, 'color:orange');
    const cfg = {};
    if (fetchStatus === FETCH_STATUS.RESOLVED) {
      cfg.color = 'color:green';
      cfg.message = 'Redux is loading - look for middleware';
    } else {
      cfg.color = 'color:grey';
      cfg.message = 'Redux should be empty - no middleware';
    }
    console.debug(`%c${cfg.message}`, cfg.color);
    console.dir({
      projectInUrl: projectId,
      loadedProjectRef: loadedProjectRef.current,
      // reloadingProject: reloadingProject(),
      fetchStatus,
      storeNull: initialStore === null,
      storeMinValue: Object.keys(initialStore || {}).length === 1,
      cachedStore: initialStore,
      storeLocation: 'Provider instantiated here',
    });
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
      // 👉 load middleware instantiated with projectId (e.g., init.middleware)
      //
      const { store, persistor } = loadStore(projectId, initialStore);
      Provider.displayName = 'TncReduxStore-Provider';
      loadedProjectRef.current = projectId;

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
