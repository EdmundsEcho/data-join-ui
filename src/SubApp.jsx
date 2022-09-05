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
import React, { useCallback, useEffect, useRef } from 'react';
import { PropTypes } from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useParams } from 'react-router-dom';

import {
  // useStatus as useCacheStatus,
  StatusProvider as CacheStatusProvider,
} from './hooks/use-status-provider';
import ErrorPage from './pages/ErrorPage';
import { FetchStoreError, InvalidStateError } from './core-app/lib/LuciErrors';

// 📖 data
import { useFetchApi } from './hooks/use-fetch-api';
import { fetchStore as fetchFn } from './services/dashboard.api';
import { seedProjectState } from './core-app/ducks/rootSelectors';

// ⚙️  Redux
import { initStore } from './core-app/redux-store';

// -----------------------------------------------------------------------------
const DEBUG = true || process.env.REACT_APP_DEBUG_DASHBOARD === 'true';
// -----------------------------------------------------------------------------
/* eslint-disable no-console */

// serverResponse and newStore
// requires a valid serverResponse
const initialStore = (serverResponse, newStore) => {
  if (serverResponse === null) {
    return null;
  }
  const { store } = serverResponse;
  return store === null ? newStore : store;
};

const SubApp = ({ children }) => {
  // used to initialize middleware
  const { projectId } = useParams();
  const newProjectStore = seedProjectState(projectId);
  const loadedProjectRef = useRef(undefined);

  //
  // 📖 data using the fetchApi
  // 💫 🛈
  //
  const {
    fetch: fetchServerStore,
    cache: serverResponse,
    error,
    status: fetchStatus,
    STATUS: FETCH_STATUS,
  } = useFetchApi({
    fetchFn,
    DEBUG,
  });

  //
  // 💢 Side-effect: loads data into cache
  //
  // 👍 Use guards to avoid re-fetching the data  when the cache
  //    already has the required Redux state.
  //
  useEffect(() => {
    let ignore = false;
    try {
      if (projectId !== loadedProjectRef.current && !ignore) {
        fetchServerStore(projectId);
        loadedProjectRef.current = projectId;
      }
    } catch (e) {
      throw new FetchStoreError(e);
    }
    return () => {
      ignore = true;
    };
  }, [projectId, fetchServerStore]);

  if (typeof projectId === 'undefined') {
    return null;
  }
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
      fetchStatus,
      serverStoreNull: serverResponse?.store === null ?? 'undefined',
      storeMinValue:
        Object.keys(initialStore(serverResponse, newProjectStore) || {})
          .length === 1,
      cachedStore: serverResponse,
    });
  }

  // ---------------------------------------------------------------------------
  // Render based on redux cache state
  //
  switch (fetchStatus) {
    case FETCH_STATUS.IDLE:
    case FETCH_STATUS.PENDING:
      return (
        <div
          sx={{
            mt: '55px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margins: '10px auto',
          }}>
          <i className='spinner spinner-lucivia spinner-lg' />
        </div>
      );

    case FETCH_STATUS.RESOLVED: {
      //
      // 🎉 Redux Provider
      //
      // use the initialStore function to return
      // serverStore | newProjectStore
      //
      // 🔗 see Main to access rendered child
      // 👉 next: load middleware instantiated with projectId (e.g., init.middleware)
      //
      const { store /* persistor */ } = initStore(
        projectId,
        initialStore(serverResponse, newProjectStore),
      );
      Provider.displayName = 'TncReduxStore-Provider';
      loadedProjectRef.current = projectId;

      return <Provider store={store}>{children}</Provider>;
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
  children: PropTypes.node.isRequired,
};
SubApp.defaultProps = {};

/* eslint-disable react/jsx-props-no-spreading */
const SubAppWithCacheStatus = (props) => (
  <CacheStatusProvider>
    <SubApp {...props} />
  </CacheStatusProvider>
);
/* eslint-enable react/jsx-props-no-spreading */
export default SubAppWithCacheStatus;
